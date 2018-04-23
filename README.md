# 基于Django-rest-api构建的rest服务
该工程基于scrum（敏捷开发）的业务流程，其中sprint为一个迭代周期，task对应sprint中的任务。
### 依赖项
1. python==3.6.3
2. Django==1.11.4
3. django-filter==1.1.0
4. djangorestframework==3.7.3
5. Markdown==2.6.10
6. pytz==2017.3

### 用户
1. superuser
**username**: scrum
**password**: scrum123456

2. user
**username**: xiawei
**password**: xiawei123456


### 问题
1. 请求http://127.0.0.1:8000/api/sprints
返回
{
    "detail": "Authentication credentials were not provided."
}
解决:
利用postman请求，需要添加basicauth（添加用户名密码）
