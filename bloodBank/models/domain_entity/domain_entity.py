"""
    Created by Sayem on 02 February, 2019

"""
from django.db import models, transaction
from django.db.models import Manager

from bloodBank.enums.blood_bank_enums import BloodGroupEnum, BloodDonationStatus
from bloodBank.mixin.generic_class_mixin import CodedModelMixin, Clock, Model2DictMixin, DomainEntityModelManager

__author__ = "Sayem"


class MaxSequence(models.Model):
    context = models.CharField(max_length=1000)
    value = models.BigIntegerField(default=1)

    class Meta:
        app_label = "bloodBank"


class DomainEntity(models.Model, Model2DictMixin, CodedModelMixin):
    code = models.CharField(default="", max_length=200)
    created_on = models.BigIntegerField(default=0)
    last_updated_on = models.BigIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    """Overriding the model manager based on `is_active` and `is_deleted` value"""
    objects = DomainEntityModelManager()
    all_objects = Manager()

    class Meta:
        app_label = "bloodBank"

    def save(self, *args, **kwargs):
        with transaction.atomic():
            self.clean()
            if not self.pk:
                _max_seq = MaxSequence.objects.filter(context=self.max_sequence_context_name).first()
                if not _max_seq:
                    _max_seq = MaxSequence(context=self.max_sequence_context_name)
                    _max_seq.save()

                self.code = self.code_prefix + self.code_separator + str(_max_seq.value).zfill(5)
                _max_seq.value += 1
                _max_seq.save()

            _now = Clock.timestamp()
            self.created_on, self.last_updated_on = _now, _now + 1
            self.is_active = kwargs.get("is_active", True)
            self.is_deleted = kwargs.get("is_deleted", False)
            super(DomainEntity, self).save()


class ConsoleUser(DomainEntity):
    user = models.OneToOneField("auth.User", default=None, null=True, blank=True, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, default=None, null=True, blank=True)
    blood_group = models.CharField(max_length=3, choices=BloodGroupEnum.get_choices(), null=False)
    date_of_birth = models.DateField(default=None, null=True, blank=True)
    last_donated_on = models.BigIntegerField(default=0)
    donation_status = models.IntegerField(choices=BloodDonationStatus.get_choices())

    class Meta:
        app_label = "bloodBank"


class SessionKey(DomainEntity):
    ses_key = models.CharField(max_length=300, null=False)
    user = models.ForeignKey(ConsoleUser, default=None, on_delete=models.CASCADE)

    class Meta:
        app_label = "bloodBank"
