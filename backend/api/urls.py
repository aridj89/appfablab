from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, NotificationListView, user_profile, 
    hello_world, lab_check_in, lab_check_out, LabSessionListView,
    get_active_session, MyTokenObtainPairView,
    StudentListView, toggle_student_access, admin_reset_password,
    google_login
)

urlpatterns = [
    path('hello/', hello_world),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('google-login/', google_login, name='google_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', user_profile, name='user_profile'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('lab/check-in/', lab_check_in, name='lab_check_in'),
    path('lab/check-out/', lab_check_out, name='lab_check_out'),
    path('lab/sessions/', LabSessionListView.as_view(), name='lab_sessions'),
    path('lab/active-session/', get_active_session, name='active_session'),
    
    # Management
    path('admin/students/', StudentListView.as_view(), name='admin_students'),
    path('admin/students/<int:pk>/toggle-access/', toggle_student_access, name='admin_toggle_access'),
    path('admin/students/<int:pk>/reset-password/', admin_reset_password, name='admin_reset_password'),
]
