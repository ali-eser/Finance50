from django.contrib.auth.models import AbstractUser
from django.db import models

from datetime import datetime

from django.db.models import BooleanField


class User(AbstractUser):
    pass


class UserSetting(models.Model):
    country = models.CharField(max_length=2)
    category = models.CharField(max_length=13)
    language = models.CharField(max_length=2)
    User = models.ForeignKey(User, on_delete=models.CASCADE)

    def serialize(self):
        return {
            "country": self.country,
            "category": self.category,
            "language": self.language
        }


class Asset(models.Model):
    symbol = models.CharField(max_length=10)
    amount = models.FloatField()
    cost = models.FloatField()
    User = models.ForeignKey(User, on_delete=models.CASCADE)

    def serialize(self):
        return {
            "symbol": self.symbol,
            "amount": self.amount,
            "cost": self.cost
        }


class Transaction(models.Model):
    symbol = models.CharField(max_length=10)
    amount = models.FloatField()
    price = models.FloatField()
    type = models.CharField(max_length=4)
    timestamp = models.DateTimeField(auto_now=True)
    User = models.ForeignKey(User, on_delete=models.CASCADE)


class Theme(models.Model):
    is_dark: BooleanField = models.BooleanField(default=False)
    User = models.ForeignKey(User, on_delete=models.CASCADE)

    def serialize(self):
        return {
            "is_dark": self.is_dark
        }
