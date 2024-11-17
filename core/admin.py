from django.contrib import admin
from .models import User, Hobby, UserHobby, Routine, UserRoutine, Task, Message, UserSetting, UserStatus, RoutineFeedback, Notification

# Register models here
admin.site.register(User)
admin.site.register(Hobby)
admin.site.register(UserHobby)
admin.site.register(Routine)
admin.site.register(UserRoutine)
admin.site.register(Task)
admin.site.register(Message)
admin.site.register(UserSetting)
admin.site.register(UserStatus)
admin.site.register(RoutineFeedback)
admin.site.register(Notification)