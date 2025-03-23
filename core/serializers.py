from rest_framework import serializers
from .models import Task, User, Friendship


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


# Serializer for User Login
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']  # Include necessary fields

class FriendshipSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Friendship
        fields = ['id', 'user', 'friend', 'sender_username', 'status', 'created_at']


# Serializer for the Task model
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'