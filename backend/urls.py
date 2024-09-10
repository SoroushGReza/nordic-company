from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse


def welcome_view(request):
    return HttpResponse("Welcome To My Custom Made Bookings-System API!")


urlpatterns = [
    path("secure-admin/", admin.site.urls),  # Admin panelen
    path("api/accounts/", include("accounts.urls")),  # Konto relaterade endpoints
    path("api/auth/", include("dj_rest_auth.urls")),  # Inloggning / Logout / Token
    path(
        "api/auth/registration/", include("dj_rest_auth.registration.urls")
    ),  # Registrering
    path(
        "api/auth/token/obtain/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),  # JWT Token obtain
    path(
        "api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),  # JWT Token refresh
    path("api/", include("bookings.urls")),
    path("", welcome_view),
]
