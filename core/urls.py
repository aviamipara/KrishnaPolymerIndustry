from django.urls import path
from core import views

urlpatterns = [
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('products/', views.products, name='products'),
    path('manufacturing/', views.manufacturing, name='manufacturing'),
    path('contact/', views.contact, name='contact'),
    path('api/rfq/', views.submit_rfq, name='submit_rfq'),
    path('api/reviews/', views.submit_review, name='submit_review'),
    path('api/newsletter/', views.submit_newsletter, name='submit_newsletter'),
    path('admin/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/logout/', views.admin_logout, name='admin_logout'),
    path('admin/delete/', views.delete_entry, name='admin_delete_entry'),
]
