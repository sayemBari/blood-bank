"""
    Created by Sayem on 02 February, 2019

"""
from django.db import models

from bloodBank.decorators.decorators import decorate, expose_api
from bloodBank.models.domain_entity.domain_entity import DomainEntity

__author__ = "Sayem"


@decorate(expose_api(api_url_postfix="donate-blood", api_view="BloodDonationTransactionView"))
class BloodDonationTransaction(DomainEntity):
    request_blood = models.OneToOneField("bloodBank.RequestBlood", default=None, null=True, on_delete=models.SET_NULL)
    blood_donor = models.ForeignKey("bloodBank.ConsoleUser", default=None, null=True, on_delete=models.SET_NULL)
    on_spot_donation_time = models.BigIntegerField(default=0)
    on_spot_donation_location = models.ForeignKey("bloodBank.Location", default=None, null=True,
                                                  on_delete=models.SET_NULL)

    class Meta:
        app_label = "bloodBank"
