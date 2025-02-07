from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User  # Import your custom User model
from .serializers import SignupSerializer, LoginSerializer

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
