from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse
from django.views.generic import TemplateView


def welcome_view(request):
    return HttpResponse("Welcome To My Custom Made Bookings-System API!")


urlpatterns = [
    path("", TemplateView.as_view(template_name="index.html")),
    path("secure-admin/", admin.site.urls),  # Admin Panel
    path("api/accounts/", include("accounts.urls")),  
    path("api/auth/", include("dj_rest_auth.urls")),  
    path(
        "api/auth/registration/", include("dj_rest_auth.registration.urls")
    ),
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

handler404 = TemplateView.as_view(template_name='index.html')
