"""
    Created by Sayem on 02 February, 2019

"""
from django.db import models

from bloodBank.decorators.decorators import decorate, expose_api
from bloodBank.enums.blood_bank_enums import BloodGroupEnum, BloodDonationTransactionStatus
from bloodBank.models import DomainEntity

__author__ = "Sayem"


@decorate(expose_api(api_url_postfix="request-blood", api_view="RequestBloodView"))
class RequestBlood(DomainEntity):
    blood_requester = models.ForeignKey("bloodBank.ConsoleUser", default=None, null=True, on_delete=models.SET_NULL)
    on_spot_request_time = models.BigIntegerField(default=0)
    requested_blood_group = models.CharField(max_length=3, choices=BloodGroupEnum.get_choices())
    on_spot_request_location = models.ForeignKey("bloodBank.Location", default=None, null=True,
                                                 on_delete=models.SET_NULL)
    donation_transaction_status = models.IntegerField(choices=BloodDonationTransactionStatus.get_choices())

    class Meta:
        app_label = "bloodBank"
