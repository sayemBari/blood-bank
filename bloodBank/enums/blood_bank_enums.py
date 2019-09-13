"""
    Created by Sayem on 19 January, 2019

"""
from bloodBank.mixin.generic_class_mixin import GenericEnumMethods

__author__ = "Sayem"


class BloodGroupEnum(GenericEnumMethods):
    APos = "A+"
    ANeg = "A-"
    BPos = "B+"
    BNeg = "B-"
    ABPos = "AB+"
    ABNeg = "AB-"
    OPos = "O+"
    ONeg = "O-"


class BloodDonationStatus(GenericEnumMethods):
    GREEN = 0
    YELLOW = 1
    RED = 2


class BloodDonationTransactionStatus(GenericEnumMethods):
    PENDING = 0
    COMPLETE = 1
