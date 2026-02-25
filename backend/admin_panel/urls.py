from django.urls import path
from .views import (
    AdminUserListView, AdminUserDetailView,
    AdminCardListView, AdminTransactionListView,
    AdminDailySummaryView, AdminExportTransactionsCSV,
    AdminLogListView
)

urlpatterns = [
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('cards/', AdminCardListView.as_view(), name='admin-card-list'),
    path('transactions/', AdminTransactionListView.as_view(), name='admin-transaction-list'),
    path('transactions/export/csv/', AdminExportTransactionsCSV.as_view(), name='admin-export-csv'),
    path('summary/daily/', AdminDailySummaryView.as_view(), name='admin-daily-summary'),
    path('logs/', AdminLogListView.as_view(), name='admin-logs'),
]
