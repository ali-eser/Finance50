from django.contrib import admin

from .models import Asset, Theme, Transaction, User, UserSetting

# Register your models here.
admin.site.register(Asset)
admin.site.register(Transaction)
admin.site.register(Theme)
admin.site.register(User)
admin.site.register(UserSetting)
