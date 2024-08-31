from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("secure-admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
]
