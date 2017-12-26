from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, authentication, permissions, filters

from board.models import Sprint, Task
from board.serializers import SprintSerializer, TaskSerializer, UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class DefaultMixin(object):
    """default setting for view authentication, permission, filtering and pagination"""
    authentication_class = (
        authentication.BasicAuthentication,
        authentication.TokenAuthentication,
    )
    permission_classes = (
        permissions.IsAuthenticated,
    )
    paginate_by = 25
    paginate_by_param = 'page_size'
    max_paginate_by = 100

    # 添加过滤器 下面保存了一个所有可用的filter_backends列表，通过已有的ViewSet启用这些过滤器。
    # 对应views.py中的代码
    filter_backends = (
        # filters.BaseFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    )


class SprintViewSet(DefaultMixin, viewsets.ModelViewSet):
    """API endpoint for listing and creating sprint"""
    queryset = Sprint.objects.order_by('end')
    serializer_class = SprintSerializer

    # 使用过滤器
    search_fields = ('name',)
    ordering_fields = ('end', 'name',)


class TaskViewSet(DefaultMixin, viewsets.ModelViewSet):
    """API endpoint for listing and creating task."""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    # 使用过滤器
    search_fields = ('name', 'description')
    ordering_fields = ('name', 'order', 'started', 'due', 'completed')


class UserViewSet(DefaultMixin, viewsets.ReadOnlyModelViewSet):
    """API endpoint for listing users"""
    lookup_field = User.USERNAME_FIELD
    lookup_url_kwarg = User.USERNAME_FIELD

    queryset = User.objects.order_by(User.USERNAME_FIELD)
    serializer_class = UserSerializer

    # 使用过滤器
    search_fields = (User.USERNAME_FIELD,)
