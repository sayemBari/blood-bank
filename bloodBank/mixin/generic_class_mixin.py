"""
    Created by Sayem on 20 January, 2019

"""
import re
import time
from datetime import datetime
from enum import Enum

from crequest.middleware import CrequestMiddleware
from django.apps import apps
from django.db.models import ManyToManyField, Manager
from rest_framework.authentication import TokenAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

__author__ = "Sayem"


class TokenAuthenticationMixin(TokenAuthentication):
    """
    This class is for authenticating the token from the client side during an API request.
    """

    def authenticate(self, request):
        """
        Here the `authenticate` method has been overriden due to check the token requested by the user
        in order to identify whether the token is valid for the requested user or not.
        :param request: The WSGI request sent from the client/mobile side.
        :return: It returns the authenticated user and its token to the django rest framework if valid.
        """
        auth = get_authorization_header(request=request).split()

        if not auth or len(auth) == 0 or auth[0].lower() != b'token':
            return None

        if len(auth) <= 1:
            raise AuthenticationFailed(detail="Invalid token header. No credentials provide.")
        elif len(auth) > 2:
            raise AuthenticationFailed(detail="Invalid token header. Token string should not contain spaces.")

        """Retrieve the `User` by authenticating the received `Token` in auth[1]"""
        _token = self.get_model().objects.filter(key=auth[1].decode(encoding="utf-8")).first()
        if not _token:
            raise AuthenticationFailed(detail="Invalid Token")
        elif not (_token and _token.user and _token.user.is_active):
            raise AuthenticationFailed(detail="User inactive or deleted.")
        ConsoleUser = apps.get_model(app_label="bloodBank", model_name="ConsoleUser")
        c_user = ConsoleUser.objects.get(user=_token.user)

        request.c_user = c_user

        CrequestMiddleware.set_request(request=request)
        return _token.user, _token.key


class DomainEntityModelManager(Manager):
    def get_queryset(self):
        _queryset = super(DomainEntityModelManager, self).get_queryset()
        return _queryset.filter(is_active=True, is_deleted=False)


class Model2DictMixin(object):
    def to_dict(self):
        if not self.pk:
            return []
        _fields = self._meta.concrete_fields + self._meta.many_to_many
        _data = {}
        for _field in _fields:
            if "_ptr" in _field.name:
                continue
            elif isinstance(_field, ManyToManyField):
                _data[_field.name] = list(_field.value_from_object(obj=self).values_list("id", flat=True))
            _data[_field.name] = _field.value_from_object(obj=self)
        return _data


class CodedModelMixin(object):
    @classmethod
    def prefix(cls):
        return re.sub(r'[a-z\d]+|(?<=[A-Z])[A-Z\d]+', r'', cls.__name__)

    @classmethod
    def get_class_name(cls):
        return cls.__name__

    @property
    def max_sequence_context_name(self):
        return self.__class__.__name__

    @property
    def code_prefix(self):
        return self.__class__.prefix()

    @property
    def code_separator(self):
        return "-"


class GenericEnumMethods(Enum):
    @classmethod
    def get_choice_name(cls, value):
        for _tag in cls:
            if _tag.value == value:
                return _tag.name
        return None

    @classmethod
    def get_choice_value(cls, name):
        for _tag in cls:
            if _tag.name == name:
                return _tag.value
        return None

    @classmethod
    def get_choices(cls):
        return [(_tag.name, _tag.value) for _tag in cls]


class Clock(object):
    @staticmethod
    def timestamp(_format='ms'):
        if _format == 'ms':
            return int(time.time() * 1000)
        return int(time.time())

    @staticmethod
    def convert_str_to_date_obj(date_str="", fmt="%d-%m-%Y"):
        _datetime_obj = datetime.strptime(date_str, fmt)
        return _datetime_obj.date()
