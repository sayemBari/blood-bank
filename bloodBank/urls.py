"""
    Created by Sayem on 27 January, 2019

"""
import importlib

from django.conf import settings
from django.conf.urls import url

from bloodBank.decorators.decorators import get_models_with_decorator
from bloodBank.views import LoginAPIView, RegistrationAPIView

__author__ = "Sayem"

"""BloodBank URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
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

urlpatterns = []
INSTALLED_APPS = settings.PROJECT_APPS

all_models = get_models_with_decorator('expose_api', INSTALLED_APPS, include_class=True)
for _model in all_models:
    _view_cls = getattr(
        importlib.import_module(_model._meta.app_label + ".views", _model._registry.get("api_view")),
        _model._registry.get("api_view")
    )
    urlpatterns.append(
        url(
            regex=r'^api/' + _model._registry.get("api_url_postfix") + "/$",
            view=_view_cls.as_view({'get': 'list', 'post': 'create'}),
            name=_model.__name__
        )
    )
urlpatterns += [
    url(
        regex=r'^api/login/$',
        view=LoginAPIView.as_view({'get': 'list', 'post': 'create'}),
        name="Login"
    ),
    url(
        regex=r'^api/register/$',
        view=RegistrationAPIView.as_view({'get': 'list', 'post': 'create'}),
        name="Registration"
    )
]
