from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from .models import User, Notification, LabSession
from .serializers import UserSerializer, NotificationSerializer, LabSessionSerializer, MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class NotificationListView(generics.ListAPIView):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAdminUser,)

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        if 'password' in request.data:
            request.user.set_password(request.data['password'])
            request.user.save()
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Lab Views ---
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def lab_check_in(request):
    now = timezone.localtime()
    if now.hour < 8 or now.hour >= 17:
        return Response({"error": "Lab is closed. Opening hours are 08:00 - 17:00."}, status=status.HTTP_403_FORBIDDEN)

    active_session = LabSession.objects.filter(user=request.user, exit_time__isnull=True).first()
    if active_session:
        return Response({"error": "You already have an active session."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = LabSessionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def lab_check_out(request):
    active_session = LabSession.objects.filter(user=request.user, exit_time__isnull=True).first()
    if not active_session:
        return Response({"error": "No active session found."}, status=status.HTTP_400_BAD_REQUEST)

    active_session.exit_time = timezone.now()
    active_session.save()
    return Response({"message": "Checked out successfully."})

class LabSessionListView(generics.ListAPIView):
    queryset = LabSession.objects.all().order_by('-entry_time')
    serializer_class = LabSessionSerializer
    permission_classes = (permissions.IsAdminUser,)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_active_session(request):
    active_session = LabSession.objects.filter(user=request.user, exit_time__isnull=True).first()
    if active_session:
        serializer = LabSessionSerializer(active_session)
        return Response(serializer.data)
    return Response(None)

# --- Admin Management Views ---
class StudentListView(generics.ListAPIView):
    queryset = User.objects.filter(is_staff=False).order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def toggle_student_access(request, pk):
    try:
        student = User.objects.get(pk=pk, is_staff=False)
        student.is_active = not student.is_active
        student.save()
        return Response({"message": f"Student access {'granted' if student.is_active else 'revoked'}.", "is_active": student.is_active})
    except User.DoesNotExist:
        return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_reset_password(request, pk):
    try:
        student = User.objects.get(pk=pk, is_staff=False)
        new_password = request.data.get('password')
        if not new_password:
            return Response({"error": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)
        student.set_password(new_password)
        student.save()
        return Response({"message": "Password updated successfully."})
    except User.DoesNotExist:
        return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from Django!"})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_login(request):
    token = request.data.get('token')
    if not token:
        return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Verify the token with Google
        # Note: In production, you'd use settings.GOOGLE_CLIENT_ID
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)

        # ID token is valid. Extract user info
        email = idinfo['email']
        full_name = idinfo.get('name', '')
        
        # Get or create user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # If user doesn't exist, create one with a placeholder student ID
            # This is a fallback; usually students should register first or we take their info
            user = User.objects.create(
                email=email,
                full_name=full_name,
                student_card_number=f"G-{email.split('@')[0]}", # Temporary ID
                is_active=True # Google users are verified
            )
            user.set_unusable_password()
            user.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'email': user.email,
            'is_staff': user.is_staff,
        })
    except ValueError as e:
        # Invalid token
        return Response({"error": f"Invalid token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
