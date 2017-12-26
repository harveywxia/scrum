from django.contrib import admin

# Register your models here.
from board.models import Sprint, Task

admin.site.register(Sprint)
admin.site.register(Task)
