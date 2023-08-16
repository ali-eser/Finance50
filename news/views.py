import json
import requests

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from news.models import Asset, Theme, Transaction, User, UserSetting

# NEWS_KEY = ...
# STOCK_KEY = ...


def index(request):
    if request.user.is_authenticated:
        assets = Asset.objects.filter(User=request.user)
        return render(request, "news/finance.html", {
            "assets": assets
        })
    else:
        return render(request, "news/greetings.html")


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "news/login.html", {
                "message": "Invalid credentials!"
            })
    else:
        return render(request, "news/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        password_confirmation = request.POST["confirmation"]
        email = request.POST["email"]

        if password != password_confirmation:
            return HttpResponse("Passwords don't match!")
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            user_id = User.objects.get(username=username)
            theme = Theme(User=user_id, is_dark=False)
            theme.save()
        except IntegrityError:
            return HttpResponse("Username taken!")

        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "news/register.html")


@login_required
def change_settings(request):
    if request.method == "POST":
        country_setting = request.POST.getlist("country")
        category_setting = request.POST.getlist("category")
        language_setting = request.POST.getlist("language")

        if len(country_setting) > 1:
            country_setting = ",".join(country_setting)
        else:
            country_setting = country_setting[0]

        if len(category_setting) > 1:
            category_setting = ",".join(category_setting)
        else:
            category_setting = category_setting[0]

        if len(language_setting) > 1:
            language_setting = ",".join(language_setting)
        else:
            language_setting = language_setting[0]

        try:
            settings = UserSetting.objects.get(User=request.user)
            settings.country = country_setting
            settings.category = category_setting
            settings.language = language_setting
            settings.save()
        except ObjectDoesNotExist:
            settings = UserSetting(User=request.user, country=country_setting, category=category_setting,
                                   language=language_setting)
            settings.save()

        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "news/settings.html")


@login_required
def news(request, next_page):
    try:
        settings = UserSetting.objects.get(User=request.user)
        if next_page == "0":
            response = requests.get(
                f"https://newsdata.io/api/1/news?apikey={NEWS_KEY}&country={settings.country}&category={settings.category}&language={settings.language}")
            response = response.json()
            if response["status"] == "success":
                results = response["results"]
                return render(request, "news/index.html", {
                    "results": results,
                    "next_page_id": response["nextPage"]
                })
            elif response["status"] == "error":
                return HttpResponse("Failed to fetch news data.")
        elif not next_page == "0":
            response = requests.get(
                f"https://newsdata.io/api/1/news?apikey={NEWS_KEY}&country={settings.country}&category={settings.category}&language={settings.language}&page={next_page}")
            response = response.json()
            if response["status"] == "success":
                results = response["results"]
                return render(request, "news/index.html", {
                    "results": results,
                    "next_page_id": response["nextPage"]
                })
            elif response["status"] == "error":
                return HttpResponse("Failed to fetch news data.")
    except ObjectDoesNotExist:
        return HttpResponseRedirect(reverse("change_settings"))


@login_required
def quote_view(request, quote):
    response = requests.get(f"https://www.alphavantage.co/query?function=OVERVIEW&symbol={quote.upper()}&apikey={STOCK_KEY}")
    response = response.json()
    news = requests.get(f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers={quote.upper()}&apikey={STOCK_KEY}")
    news = news.json()
    for item in news["feed"]:
        print(item["url"])
    try:
        asset = Asset.objects.get(User=request.user, symbol=quote.upper())
        return render(request, "news/quote.html", {
            "asset": asset,
            "exchange": response["Exchange"],
            "news": news["feed"],
            "symbol": quote.upper(),
            "dividendPerShare": response["DividendPerShare"],
            "dividendYield": response["DividendYield"],
            "yearHigh": response["52WeekHigh"],
            "yearLow": response["52WeekLow"],
            "marketCap": f'{round(float(response["MarketCapitalization"]), 2):,}',
            "EPS": response["EPS"],
            "PERatio": response["PERatio"],
            "PEGRatio": response["PEGRatio"],
            "name": response["Name"],
            "address": response["Address"],
            "summary": response["Description"],
            "trailingPE": response["TrailingPE"],
            "forwardPE": response["ForwardPE"],
            "targetPrice": response["AnalystTargetPrice"],
            "dividendDate": response["DividendDate"],
            "exDividendDate": response["ExDividendDate"]
        })
    except (ObjectDoesNotExist, TypeError):
        return render(request, "news/quote.html", {
            "symbol": quote.upper(),
            "exchange": response["Exchange"],
            "news": news["feed"],
            "dividendPerShare": response["DividendPerShare"],
            "dividendYield": response["DividendYield"],
            "yearHigh": response["52WeekHigh"],
            "yearLow": response["52WeekLow"],
            "marketCap": f'{round(float(response["MarketCapitalization"]), 2):,}',
            "EPS": response["EPS"],
            "PERatio": response["PERatio"],
            "PEGRatio": response["PEGRatio"],
            "name": response["Name"],
            "address": response["Address"],
            "summary": response["Description"],
            "trailingPE": response["TrailingPE"],
            "forwardPE": response["ForwardPE"],
            "targetPrice": response["AnalystTargetPrice"],
            "dividendDate": response["DividendDate"],
            "exDividendRate": response["ExDividendDate"]
        })


@login_required
def buy(request, symbol):
    if request.method == "POST":
        response = requests.get(f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol.upper()}&apikey={STOCK_KEY}")
        response = response.json()
        amnt = float(request.POST["amount"])
        current_price = float(response["Global Quote"]["05. price"])
        cost = round(amnt * current_price, 2)
        try:
            asset = Asset.objects.get(User=request.user, symbol=symbol)
            old_amount = asset.amount
            new_amount = old_amount + amnt
            asset.amount = new_amount
            asset.cost = asset.cost + cost
            asset.save()
        except ObjectDoesNotExist:
            asset = Asset(User=request.user, symbol=symbol, amount=amnt, cost=cost)
            asset.save()
        transaction = Transaction(User=request.user, symbol=symbol, amount=amnt, price=round(current_price, 2),
                                  type="Bought")
        transaction.save()
    return HttpResponseRedirect(reverse("index"))


@login_required
def sell(request, symbol):
    if request.method == "POST":
        response = requests.get(f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol.upper()}&apikey={STOCK_KEY}")
        response = response.json()
        amnt = float(request.POST["amount"])
        current_price = float(response["Global Quote"]["05. price"])
        if Asset.objects.get(User=request.user, symbol=symbol).amount - amnt <= 0:
            Asset.objects.get(User=request.user, symbol=symbol).delete()

        else:
            asset = Asset.objects.get(User=request.user, symbol=symbol)
            asset.cost = round(asset.cost - ((asset.cost / float(asset.amount)) * amnt), 2)
            asset.amount = asset.amount - amnt
            asset.save()
        transaction = Transaction(User=request.user, symbol=symbol, amount=amnt, price=round(current_price, 2),
                                  type="Sold")
        transaction.save()
    return HttpResponseRedirect(reverse("index"))


def get_asset(request, username):
    user_id = User.objects.get(username=username).id
    asset = serializers.serialize("json", Asset.objects.filter(User=user_id), fields=("symbol", "amount", "cost"))
    asset_data = json.loads(asset)
    return JsonResponse(asset_data, safe=False)


def get_transaction(request, username):
    user_id = User.objects.get(username=username).id
    transaction = serializers.serialize("json", Transaction.objects.filter(User=user_id),
                                        fields=("symbol", "amount", "price", "type", "timestamp"))
    transaction_data = json.loads(transaction)
    return JsonResponse(transaction_data, safe=False)


@csrf_exempt
def get_theme(request, username):
    theme = Theme.objects.get(User=User.objects.get(username=username))

    if request.method == "GET":
        return JsonResponse(theme.serialize())
    elif request.method == "PUT":
        data = json.loads(request.body)
        theme.is_dark = data["is_dark"]
        theme.save()
        return HttpResponse(status=204)


@login_required
def quote_box(request):
    if request.method == "POST":
        quote = request.POST["quote-box"]
        return HttpResponseRedirect(reverse("quote_view", kwargs={"quote": quote}))
