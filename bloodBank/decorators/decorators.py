"""
    Created by Sayem on 26 January, 2019

"""
from django.apps import apps

__author__ = "Sayem"


def decorate(*decorators):
    def register_wrapper(func):
        if '_decorators' not in dir(func):
            func._decorators = tuple()
        for deco in decorators[::-1]:
            func = deco(func)
        func._decorators = decorators
        return func

    return register_wrapper


def get_models_with_decorator_in_app(_app, decorator_name='', app_name=False, include_class=False, **kwargs):
    app = apps.get_app_config(_app)
    m = list()
    for model in app.get_models():
        if hasattr(model, "_decorators"):
            for decorator in model._decorators:
                if decorator.__name__ == decorator_name:
                    if include_class:
                        _m = model
                    else:
                        _m = model.__name__

                    if app_name:
                        m.append((_app, _m))
                    else:
                        m.append(_m)
                    break
    return m


def get_models_with_decorator(decorator_name, apps, app_name=False, include_class=False, **kwargs):
    m = list()
    for app in apps:
        appname = app[app.rfind(".") + 1:]
        m += get_models_with_decorator_in_app(appname, decorator_name, app_name=app_name,
                                              include_class=include_class, **kwargs)
    return m


def expose_api(**kwargs):
    def expose_api(original_class):
        if "_registry" in dir(original_class):
            original_class._registry.update(**kwargs)
        else:
            original_class._registry = dict(**kwargs)
        return original_class

    return expose_api
