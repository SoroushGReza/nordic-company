from django.db import models
from django.conf import settings
from cloudinary_storage.storage import MediaCloudinaryStorage


class Media(models.Model):
    title = models.CharField(max_length=100)
    file = models.FileField(storage=MediaCloudinaryStorage())
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )

    def __str__(self):
        return self.title
