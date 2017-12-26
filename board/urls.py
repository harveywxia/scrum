# -*- coding:utf-8 -*-
# --author:'xiawei'
# --date: '2017/12/20'
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'sprints', views.SprintViewSet)
router.register(r'tasks', views.TaskViewSet)
router.register(r'users', views.UserViewSet)
