"""
    Created by Sayem on 02 February, 2019

"""
from decimal import Decimal

from django.db import models

from bloodBank.models.domain_entity.domain_entity import DomainEntity

__author__ = "Sayem"


class Location(DomainEntity):
    latitude = models.DecimalField(max_digits=16, decimal_places=9, default=Decimal("0.00"), null=True)
    longitude = models.DecimalField(max_digits=16, decimal_places=9, default=Decimal("0.00"), null=True)
    accuracy = models.DecimalField(max_digits=16, decimal_places=9, default=Decimal("0.00"), null=True)
    battery = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"), null=True)

    class Meta:
        app_label = "bloodBank"

    @classmethod
    def prepare_location_data(cls):
        from django.db.models import Q, Case, When, Value, F, CharField
        from django.db.models.functions import Concat
        annotated_case_query = {
            "location": Case(
                When(Q(latitude__isnull=False, longitude__isnull=False),
                     then=Concat(Value("<a class='inline-link' href='https://maps.google.com/maps?z=17&q="),
                                 F("latitude"), Value(","), F("longitude"), Value("' target='_blank'>"), F("latitude"),
                                 Value(", "), F("longitude"), Value("</a>"))
                     ),
                default=Value("N/A"), output_field=CharField()
            )
        }
        return [loc for loc in cls.objects.annotate(**annotated_case_query).values("location", "accuracy", "battery")]
