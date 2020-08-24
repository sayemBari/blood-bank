"""
    Created by Sayem on 14 September, 2019
"""
import inspect
import os
import re

from django.conf import settings
from django.core.management.base import BaseCommand

__author__ = "Sayem"


INSTALLED_APPS = settings.PROJECT_APPS
PROJECT_PATH = settings.BASE_DIR


class Command(BaseCommand):
    def __init__(self, *args, **kwargs):
        super(Command, self).__init__(*args, **kwargs)
        self.requires_model_validation = False

    def pred(self, c):
        return inspect.isclass(c) and c.__module__ == self.pred.__module__
        # fetch all members of module __name__ matching 'pred'

    def check_subdir(self, path, **options):
        for x in os.listdir(path):
            npath = os.path.abspath(os.path.join(path, x))
            if x != 'migrations':
                if os.path.isdir(npath):
                    self.check_subdir(npath, **options)
            else:
                self.stdout.write('Cleaning migration for ... ... .... ' + npath.lstrip(os.path.abspath(PROJECT_PATH)))
                for d in os.listdir(npath, ):
                    if re.match(r'\d+_([_\d\w\s]*)', d):
                        self.stdout.write('Deleting migration ... ... .... ' + d)
                        os.remove(os.path.join(npath, d))

    def handle(self, *args, **options):
        for x in INSTALLED_APPS:
            if os.path.exists(x.replace('.', os.sep)):
                self.stdout.write('Cleaning migration for ... ... .... ' + x)
                v = os.path.join(x.replace('.', os.sep), 'migrations')
                if os.path.isdir(v) and os.path.exists(v):
                    for d in os.listdir(v, ):
                        if re.match(r'\d+_([_\d\w\s]*)', d):
                            self.stdout.write('Deleting migration ... ... .... ' + d)
                            os.remove(os.path.join(v, d))
        self.stdout.write('Migrations deleted.')
