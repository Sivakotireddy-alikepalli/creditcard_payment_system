from django.contrib import admin
from .models import Transaction, AdminLog

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['reference_id', 'user', 'amount', 'currency', 'merchant_name', 'status', 'created_at']
    list_filter = ['status', 'currency']
    search_fields = ['reference_id', 'merchant_name', 'user__email']
    readonly_fields = ['reference_id', 'created_at', 'updated_at']

@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display = ['admin', 'action', 'target_model', 'target_id', 'timestamp']
    list_filter = ['action', 'target_model']
    readonly_fields = ['timestamp']
