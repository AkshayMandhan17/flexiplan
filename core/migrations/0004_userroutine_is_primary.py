# Generated by Django 5.1.3 on 2025-04-14 10:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_delete_message'),
    ]

    operations = [
        migrations.AddField(
            model_name='userroutine',
            name='is_primary',
            field=models.BooleanField(default=False),
        ),
    ]
