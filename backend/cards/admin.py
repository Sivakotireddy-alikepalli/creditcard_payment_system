from django.contrib import admin
from .models import Card

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ['user', 'card_holder_name', 'masked_number', 'card_type', 'expiry_month', 'expiry_year', 'is_default']
    list_filter = ['card_type', 'is_default']
    search_fields = ['card_holder_name', 'user__email', 'last_four_digits']
    readonly_fields = ['masked_number', 'last_four_digits', 'created_at', 'updated_at']
