# -*- coding:utf-8 -*-
# --author:'xiawei'
# --date: '2017/12/20'
from rest_framework.routers import DefaultRouter

from . import views
# Backbone创建的url不需要最后的斜杠，而Django需要。通过以下语句来添加结尾斜杠
router = DefaultRouter(trailing_slash=False)
# router = DefaultRouter()
router.register(r'sprints', views.SprintViewSet)
router.register(r'tasks', views.TaskViewSet)
router.register(r'users', views.UserViewSet)
