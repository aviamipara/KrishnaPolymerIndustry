import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'krishna_polymer.settings')

application = get_wsgi_application()
app = application

