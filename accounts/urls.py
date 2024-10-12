from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserProfileView,
    ChangePasswordView,
    DeleteAccountView,
    UserListView
)

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("login/", UserLoginView.as_view(), name="login"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),  # noqa: E501
    path("delete-account/", DeleteAccountView.as_view(), name="delete-account"),  # noqa: E501
    path("users/", UserListView.as_view(), name="user-list"),
]
