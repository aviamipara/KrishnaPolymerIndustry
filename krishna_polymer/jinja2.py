from jinja2 import Environment
from django.urls import reverse
from django.templatetags.static import static

def environment(**options):
    env = Environment(**options)
    env.globals.update({
        'url_for': url_for,
    })
    return env

def url_for(view_name, **kwargs):
    if view_name == 'static':
        return static(kwargs.get('filename'))
    return reverse(view_name, kwargs=kwargs)
