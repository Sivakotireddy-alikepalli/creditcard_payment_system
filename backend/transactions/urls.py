from django.urls import path
from .views import TransactionListView, TransactionDetailView, TransactionCreateView, TransactionUpdateStatusView

urlpatterns = [
    path('', TransactionListView.as_view(), name='transaction-list'),
    path('create/', TransactionCreateView.as_view(), name='transaction-create'),
    path('<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),
    path('update-status/<str:reference_id>/', TransactionUpdateStatusView.as_view(), name='transaction-update-status'),
]
