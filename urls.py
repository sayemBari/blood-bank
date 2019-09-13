import importlib

from django.conf import settings

urlpatterns = list()
INSTALLED_APPS = settings.PROJECT_APPS

for _app in INSTALLED_APPS:
    try:
        _url_module = importlib.import_module(_app + '.urls')
        _app_urls = getattr(_url_module, 'urlpatterns')
        urlpatterns += _app_urls
    except ImportError as exp:
        pass
# ------------------------- general routes end -----------------------------------------

# urlpatterns += static(settings.STATIC_UPLOAD_URL, document_root=settings.STATIC_UPLOAD_ROOT)

# ------------------------- upload directory shortcut url --------------------------------------------
