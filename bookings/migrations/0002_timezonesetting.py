# Generated by Django 4.2.15 on 2024-11-11 19:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="TimezoneSetting",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "timezone",
                    models.CharField(default="Europe/Istanbul", max_length=50),
                ),
            ],
        ),
    ]
