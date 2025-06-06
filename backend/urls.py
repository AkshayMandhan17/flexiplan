"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

def home_view(request):
    return HttpResponse("<h1>Welcome to FlexiPlan Backend</h1>")

urlpatterns = [
    path('', home_view),  # Default route for /
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/', include('routine_setup.urls')),
    path('api/', include('hobbies.urls')),
    path('api/', include('social.urls')),
    path('api/', include('chat.urls')),
    path('api/agent/', include('agent.urls')),
]



if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)