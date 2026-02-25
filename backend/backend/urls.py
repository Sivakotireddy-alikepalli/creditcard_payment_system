from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Credit Card Payment System API",
        default_version='v1',
        description="Full-stack Credit Card Payment System REST API",
        contact=openapi.Contact(email="admin@creditcard.com"),
        license=openapi.License(name="MIT"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # API Docs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # API Routes
    path('api/auth/', include('accounts.urls')),
    path('api/cards/', include('cards.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/admin-panel/', include('admin_panel.urls')),
]
