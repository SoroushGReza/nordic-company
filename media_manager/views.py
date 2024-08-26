from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Media
from .serializers import MediaSerializer


class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [IsAdminUser]  # Only Admin has access
