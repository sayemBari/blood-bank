"""
    Created by Sayem on 02 February, 2019

"""
from decimal import Decimal

from django.db import models

from bloodBank.models.domain_entity.domain_entity import DomainEntity

__author__ = "Sayem"


class Location(DomainEntity):
    latitude = models.DecimalField(max_digits=16, decimal_places=9, default=Decimal("000.00"), null=True)
    longitude = models.DecimalField(max_digits=16, decimal_places=9, default=Decimal("000.00"), null=True)

    class Meta:
        app_label = "bloodBank"
