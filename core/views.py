from datetime import date, timedelta
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Routine, Task, User, UserRoutine  # Import your custom User model
from .serializers import SignupSerializer, LoginSerializer, TaskSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import serializers

# Signup View
class SignupView(APIView):
    permission_classes = []  # Allow unauthenticated access

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
   # permission_classes = []  # Allow unauthenticated access

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        # Authenticate the user using the provided username and password
        user = authenticate(username=username, password=password)

        if user:
            # Generate refresh and access tokens for the authenticated user
            refresh = RefreshToken.for_user(user)

            # Return the response with tokens and user data
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {  # Include user-specific details here
                    "id": user.id,
                    "email": user.email,
                    "username": user.username
                }
            }, status=status.HTTP_200_OK)

        # If authentication fails, return an error message
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


# API for user-specific tasks
class UserTasksView(APIView):
    authentication_classes = [JWTAuthentication]  # Enforce JWT authentication
    permission_classes = [IsAuthenticated]  # Require authentication

    def get(self, request, user_id):
        """Get all tasks of a specific user."""
        try:
            tasks = Task.objects.filter(user_id=user_id)
            serializer = TaskSerializer(tasks, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, user_id):
        """Add a new task for the user."""
        try:
            request.data["user"] = user_id  # Ensure task is assigned to the correct user
            serializer = TaskSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserTaskDetailView(APIView):
    authentication_classes = [JWTAuthentication]  # Enforce JWT authentication
    permission_classes = [IsAuthenticated]  # Require authentication

    def put(self, request, user_id, task_id):
        """Update a specific task for the user."""
        try:
            task = Task.objects.get(id=task_id, user_id=user_id)
            serializer = TaskSerializer(task, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Task.DoesNotExist:
            return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, user_id, task_id):
        """Delete a specific task for a user."""
        try:
            task = Task.objects.get(id=task_id, user_id=user_id)
            task.delete()
            return Response({"message": "Task deleted successfully."}, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserRoutineView(APIView):
    authentication_classes = [JWTAuthentication]  # Enforce JWT authentication
    permission_classes = [IsAuthenticated]  # Require authentication

    def get(self, request):
        """Returns the current week's routine for the logged-in user."""
        user = request.user
        today = date.today()

        # Calculate start and end of the current week (Monday to Sunday)
        start_date = today - timedelta(days=today.weekday())  # Monday
        end_date = start_date + timedelta(days=6)  # Sunday

        try:
            # Find the routine for the current week
            routine = Routine.objects.filter(
                start_date__lte=end_date,  # Routine start date is before or on this week's end
                end_date__gte=start_date   # Routine end date is after or on this week's start
            ).first() # Assuming only one routine is active per week

            if routine:
                # Check if the routine is associated with the user using UserRoutine
                user_routine = UserRoutine.objects.filter(user=user, routine=routine).exists()
                if user_routine:
                    return Response({"routine_data": routine.routine_data}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "No routine found for this user for the current week."}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"error": "No routine found for the current week."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
