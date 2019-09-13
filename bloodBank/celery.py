"""
    Created by Sayem on 17 March, 2019

"""

__author__ = "Sayem"

import os

from celery import Celery
from django.conf import settings

"""Set the default Django settings module for the 'celery' program."""
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
app = Celery("bloodBank")

"""Using a string here means the worker will not have to pickle the object when using Windows."""
app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.PROJECT_APPS)

app.conf.update(
    CELERY_RESULT_BACKEND='djcelery.backends.database:DatabaseBackend',
)


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
