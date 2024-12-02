from rest_framework import serializers
from django.contrib.auth import get_user_model

CustomUser = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ("email", "password", "name", "surname", "phone_number")

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            name=validated_data.get("name"),
            surname=validated_data.get("surname"),
            phone_number=validated_data.get("phone_number"),
            profile_image=validated_data.get(
                "profile_image",
                CustomUser._meta.get_field("profile_image").get_default(),
            ),
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)


class UserProfileSerializer(serializers.ModelSerializer):
    is_superuser = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    profile_image = serializers.ImageField(required=False)

    class Meta:
        model = CustomUser
        fields = (
            "email",
            "name",
            "surname",
            "phone_number",
            "profile_image",
            "is_superuser",
            "is_staff",
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.profile_image:
            representation["profile_image"] = instance.profile_image.url
        else:
            representation["profile_image"] = None
        return representation


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "name", "surname"]
