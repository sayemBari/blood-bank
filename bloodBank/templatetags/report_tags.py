"""
    Created by Sayem on 29 April, 2019
"""

from django import template

__author__ = "Sayem"

register = template.Library()


@register.filter(name='is_datetime')
def filter_datetime(field):
    return 'date-time-picker' in field.field.widget.attrs.get('class', '').split(' ')


@register.filter(name="is_multiple_choice")
def is_multiple_choice(field):
    if field.field.widget.attrs["multiple"] == "multiple":
        return True
    return False
