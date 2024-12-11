import re
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User  # Import your custom User model
from .serializers import SignupSerializer, LoginSerializer


def validate_password(password):
    """
    Custom password validation function.
    Ensures that the password meets the following criteria:
    - Minimum length of 12
    - Contains at least one uppercase letter
    - Contains at least one number
    - Contains at least one special character
    """
    if len(password) < 12:
        raise ValueError("Password must be at least 12 characters long.")
    if not any(char.isupper() for char in password):
        raise ValueError("Password must contain at least one uppercase letter.")
    if not any(char.isdigit() for char in password):
        raise ValueError("Password must contain at least one number.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("Password must contain at least one special character.")


# Signup View
class SignupView(APIView):
    permission_classes = []  # Allow unauthenticated access

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            password = serializer.validated_data.get("password")
            try:
                # Validate the password manually
                validate_password(password)
            except ValueError as e:
                # Return validation errors
                return Response({"password": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            # Save the user if the password is valid
            serializer.save()
            return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
        
        # Return other validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Login View
class LoginView(APIView):
    permission_classes = []  # Allow unauthenticated access

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