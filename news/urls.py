
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login_view"),
    path("logout", views.logout_view, name="logout_view"),
    path("register", views.register_view, name="register_view"),
    path("settings", views.change_settings, name="change_settings"),
    path("news/<str:next_page>", views.news, name="news"),
    path("<str:symbol>/buy", views.buy, name="buy"),
    path("<str:symbol>/sell", views.sell, name="sell"),
    path("quotes/<str:quote>", views.quote_view, name="quote_view"),
    path("quote_box", views.quote_box, name="quote_box"),


    # API Routes
    path("assets/<str:username>", views.get_asset, name="get_asset"),
    path("transactions/<str:username>", views.get_transaction, name="get_transaction"),
    path("theme/<str:username>", views.get_theme, name="get_theme")
]
