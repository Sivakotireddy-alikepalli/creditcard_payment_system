from django.urls import path
from .views import CardListCreateView, CardDetailView

urlpatterns = [
    path('', CardListCreateView.as_view(), name='card-list-create'),
    path('<int:pk>/', CardDetailView.as_view(), name='card-detail'),
]
