from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
import logging
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.authtoken.models import Token
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    DeleteAccountSerializer,
)

logger = logging.getLogger(__name__)

CustomUser = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        login(self.request, user)  # Logga in användaren

        # Generera en JWT-token
        refresh = RefreshToken.for_user(user)
        # Spara eller skapa en token om du använder den också (valfritt beroende på ditt behov)
        token, created = Token.objects.get_or_create(user=user)

        # Spara JWT-token för att skicka den i post metoden
        self.jwt_refresh = refresh

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(
            {
                "refresh": str(self.jwt_refresh),
                "access": str(self.jwt_refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )


class UserLoginView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is not None:
            login(request, user)  # Logga in användaren
            # Generera en JWT-token
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"message": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,  # noqa
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not self.object.check_password(serializer.data.get("old_password")):
            return Response(
                {"old_password": "Wrong password."},
                status=status.HTTP_400_BAD_REQUEST,  # noqa
            )

        self.object.set_password(serializer.data.get("new_password"))
        self.object.save()

        return Response({"message": "Password updated successfully"})


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = request.user
        serializer = DeleteAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data["password"]):
            return Response(
                {"password": "Incorrect password"},
                status=status.HTTP_400_BAD_REQUEST,  # noqa
            )

        user.delete()
        return Response(
            {"message": "Account deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )
