"""
    Created by Sayem on 16 February, 2019

"""
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from bloodBank.models import ConsoleUser

__author__ = "Sayem"


class LoginAPIView(ModelViewSet):
    def create(self, request, *args, **kwargs):
        _data = request.data
        if not (_data.get("username") and _data.get("password")):
            return Response(
                data={
                    "message": "Must include \"username\" and \"password\".",
                    "success": False
                },
                status=status.HTTP_401_UNAUTHORIZED,
                content_type="application/json"
            )
        _user = authenticate(request=request, username=_data.get("username"), password=_data.get("password"))
        if not _user:
            return Response(
                data={
                    "message": "Unable to log in with provided credentials",
                    "success": False
                },
                status=status.HTTP_401_UNAUTHORIZED,
                content_type="application/json"
            )
        _c_user_queryset = ConsoleUser.objects.filter(user=_user)
        if _c_user_queryset.count():
            _token, _created = Token.objects.get_or_create(user=_c_user_queryset.first().user)
            return Response(
                data={
                    "message": "Request processed successfully.",
                    "success": True,
                    "token": _token.key,
                    "result": [_c_user_queryset.first().to_dict()]
                },
                status=status.HTTP_200_OK,
                content_type="application/json"
            )
        return Response(
            data={
                "message": "User is either inactive or deleted.",
                "success": False
            },
            status=status.HTTP_404_NOT_FOUND,
            content_type="application/json"
        )
