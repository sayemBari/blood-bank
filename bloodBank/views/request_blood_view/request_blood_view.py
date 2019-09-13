"""
    Created by Sayem on 17 February, 2019

"""
from django.apps import apps
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from bloodBank.mixin.generic_class_mixin import TokenAuthenticationMixin

__author__ = "Sayem"


class RequestBloodView(ModelViewSet):
    authentication_classes = (TokenAuthenticationMixin,)
    permission_classes = (IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        """
        This method is to create the requested blood and its requested user related information
        sent from the mobile/client side into the database , so that, the server can send notification
        to all of the valid donors about the blood requester.
        :param request: Request data sent from the mobile application.
        :param args: Sent arguments paired value in tuple format.
        :param kwargs: Sent keyword argument paired value in dictionary format.
        :return: Returns response based on success/failure.
        """
        _data = request.data
        if _data:
            _one_month_diff_timestamp_in_ms = 30 * 24 * 60 * 60 * 1000
            RequestBlood = apps.get_model(app_label="bloodBank", model_name="RequestBlood")
            if not RequestBlood.objects.filter(
                    blood_requester=request.c_user,
                    on_spot_request_time__gte=_data.get("on_spot_request_time") - _one_month_diff_timestamp_in_ms,
                    on_spot_request_time__lte=_data.get("on_spot_request_time")).first():
                """Creating instance and inserting Location data - Start"""
                Location = apps.get_model(app_label="bloodBank", model_name="Location")
                _location = Location(**_data.get("on_spot_request_location"))
                _location.save()
                """Creating instance and inserting Location data - End"""

                """Creating instance and inserting RequestBlood data by updating data JSON body - Start"""
                _data.update({
                    "blood_requester": request.c_user,
                    "on_spot_request_location": _location
                })
                _request_blood = RequestBlood(**_data)
                _request_blood.save()
                """Creating instance and inserting RequestBlood data by updating data JSON body - End"""
                return Response(
                    data={
                        "message": "Request processed successfully.",
                        "success": True,
                        "result": _request_blood.to_dict()
                    },
                    status=status.HTTP_200_OK,
                    content_type="application/json"
                )
            return Response(
                data={
                    "message": "No more request is accepted within one month.",
                    "success": False
                },
                status=status.HTTP_400_BAD_REQUEST,
                content_type="application/json"
            )
        return Response(
            data={
                "message": "No content found.",
                "success": False
            },
            status=status.HTTP_400_BAD_REQUEST,
            content_type="application/json"
        )
