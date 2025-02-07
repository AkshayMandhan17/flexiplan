from django.db import models
from django.contrib.auth.models import AbstractUser


# Custom User model
class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.username


# Hobbies Table
class Hobby(models.Model):
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=150)

    def __str__(self):
        return self.name


# Junction Table: UserHobbies
class UserHobby(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="hobbies")
    hobby = models.ForeignKey(Hobby, on_delete=models.CASCADE, related_name="users")
    added_on = models.DateTimeField(auto_now_add=True)


# Routines Table
class Routine(models.Model):
    start_date = models.DateField()
    end_date = models.DateField()
    routine_data = models.JSONField()  # Storing routine details in JSON
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Routine from {self.start_date} to {self.end_date}"


# Junction Table: UserRoutines
class UserRoutine(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_routines")
    routine = models.ForeignKey(Routine, on_delete=models.CASCADE, related_name="user_routines")
    shared_on = models.DateTimeField(auto_now_add=True)
    permission = models.CharField(max_length=10, choices=[('View', 'View'), ('Edit', 'Edit')])

    class Meta:
        unique_together = ('user', 'routine')  # Prevent duplicate entries


# Messages Table
class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_messages")
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)


class UserSetting(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings")
    off_day_toggle = models.BooleanField(default=False)
    notifications_enabled = models.BooleanField(default=True)
    day_start_time = models.TimeField(null=True, blank=True)
    day_end_time = models.TimeField(null=True, blank=True)  # New field


class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    routine = models.ForeignKey(Routine, on_delete=models.CASCADE, related_name="tasks", null=True, blank=True)
    task_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    time_required = models.DurationField(blank=True, null=True)
    days_associated = models.JSONField(default=list)
    priority = models.CharField(max_length=50, choices=[('High', 'High'), ('Medium', 'Medium'), ('Low', 'Low')])
    created_at = models.DateTimeField(auto_now_add=True)
    
    # New fields
    is_fixed_time = models.BooleanField(default=False)  # Marks if task is fixed-time
    fixed_time_slot = models.TimeField(null=True, blank=True)  # Time slot for fixed tasks

    def __str__(self):
        return self.task_name


# UserStatus Table
class UserStatus(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="statuses")
    status_date = models.DateField()
    energy_level = models.CharField(max_length=50, choices=[('High', 'High'), ('Medium', 'Medium'), ('Low', 'Low')])
    mood = models.CharField(max_length=50, choices=[('Happy', 'Happy'), ('Neutral', 'Neutral'), ('Stressed', 'Stressed')])
    created_at = models.DateTimeField(auto_now_add=True)


# RoutineFeedback Table
class RoutineFeedback(models.Model):
    routine = models.OneToOneField(Routine, on_delete=models.CASCADE, related_name="feedback")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="routine_feedbacks")
    followable = models.BooleanField(default=True)
    suggestions = models.TextField(blank=True, null=True)
    feedback_date = models.DateTimeField(auto_now_add=True)


# Notifications Table
class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
