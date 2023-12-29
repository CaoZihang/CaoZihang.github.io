---
layout:       post
title:        "【笔记】Django-Rest-Framework"
author:       "Cao Zihang"
header-style: text
catalog:      true
status:		  Done
mathjax: 	true
tags:
    - 日常
    - 学习笔记


---

# Django-Rest-Framework框架

## 安装

```python
pip install djangorestframework
pip install markdown       # Markdown support for the browsable API.
pip install django-filter  # Filtering support
```

其他可选库：

- [Pygments](https://pypi.org/project/Pygments/) (2.4.0+) - Add syntax highlighting to Markdown prosing.

### 配置

在Django框架安装的APPS中注册REST-Framework

```python
# setting.py
INSTALLED_APPS=[
    ...
    'rest_framework',
]
```

### REST框架配置

所有的设置在REST_FRAMEWORK字典中

例：使用Django标准权限

```python
# setting.py
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ]
}
```

## 前置

正常搭建Django脚手架及数据库，完成model模型

模型migrate

## Serializers定义API表示

### 原理

- 提供serializing和deserializing的方法 （原始方法）

  - 与Django表单高度类似

    - ```python
      class AaSerializer(serializers.Serializer):
          # 序列化与反序列化的项
          id = serializers.IntegerField(read_only=True)
          ...
          
          def create(self, validated_data):
              # 创建
              ...
          
          def updarte(self, instance, validated_data):
              # 更新
              ...
              instance.save()
              ...
      ```
      
    - 字段参数可以控制在不同情况（如HTML）下的序列化显示方式
    
    - many=Ture参数指序列化一个查询集，而非模型实例
  
- ModelSerializers （初步封装）

  - ```python
    class [Snippet]Serializer(serializers.ModelSerializer):
        class Meta:
            model = [snippet]
            fields = ['id', 'title', 'code', 'linenos', 'language', 'style']
    ```

  - 本质上就是原始方法的简单封装：自动设置模型fields，默认执行created()和update()方法

    - 查看：

    ```python
    # 在py manage.py shell中
    from [app].serializers import [app]Serializer
    serializer = [app]Serializer()
    print(repr(serializer))
    # 结果与原始方法一致
    ```


### 实际封装（关系与超链接API）

前文API中的关系是使用主键表示的，此处改用超链接替代关系，提供API的内聚性和可扩展性

- HyperlinkedModelSerializer默认不包含id
- 包含使用HyperlinkedIdentifyField的url
- 关系使用HyperlinkRelatedField

```python
# [project]/[app]/serializers.py
# 导入模型
from django.contrib.auth.models import User
from rest_framework import serializers

class SnippetSerializer(serializers.HyperlinkModelSerializer):
    # 关系，接受一个或多个参数指定如何查找和呈现资源，可与lookup_field等参数共同使用自定义如何查找资源
    snippets = serializers.HyperlinkedRelatedField(many=True, view_name='snippet-detail', read_only=True)
    class Meta:
        # 定义了要暴露的字段，含自定义
        model = User
        fields = ['url', 'username', 'email', 'is_staff']

class UserSerializer(serializers.HyperlinkedModelSerializer):
    # 可以自定义一些属性？ 如机器学习的输出？
    owner = serializers.ReadOnlyField(source='owner.username')
    # url 为当前对象提供身份链接（通常指向Detail视图）
    # 这里进行了命名转化[app]-highlight对应AppHightlightSerializer
    # 输出格式为HTML
    highlight = serializer.HyperlinkedIdentityField(view_name='[app]-highlight', format='html')

    class Meta:
        model = User
        fields = ['url', 'id', 'username', 'snippets', 'owner']
```

## ViewSets定义视图行为

### 原理

#### 原始方法

```python
# [app]/views.py
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from [app].models import [app]
from [app].serializers import [app]Serializer

@csrf_exempt
def [app]_list(request):
    """
    列表视图
    """
    if request.method == 'GET':
        snippets = [app].objects.all()
        serializer = [app]Serializer([app], many=True)
        return JsonResponse(srializer.data, safe=False)
    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = [app]Serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)

@csrf_exempt
def [app]_detail(request, pk):
    """
    详情视图，获取、更新、删除
    pk为主键
    """
    try:
        [app] = [app].objects.get(pk=pk)
    except [app]t.DoesNotExist:
        return HttpResponse(status=404)
   
	if request.method == 'GET':
        serializer = [app]Serializer([app])
        return JsonResponse(serializer.data)
    
	elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = [app]Serializer([app], data=data)
        if serializer.is_valid():
            serializre.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)
    
	elif request.method == 'DELETE':
        snippet.delete()
        return HttpResponse(status=204)
```

#### 初步封装（api_view）

与原始方法相比封装程度不高

**基本概念**

- Request对象

  - Django HttpRequest的扩展
  - 核心方法
    - request.POST 可以处理POST方法
    - request.data 可以处理POST PUT PATCH方法

- Response对象

  - 是一种TemplateResponse，接受未render内容，通过内容协商确定返回给客户端的正确内容类型

  - ```python
    return Response(data)
    ```

- 状态码

  - 对数字HTTP状态码提供了标识符，辅助识别问题

- 包装API视图

  - @api_veiw装饰器用于基于函数的视图
  - APIView类提供类基于类视图

```python
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from [app].models import [app]
from [app].serializers import [app]Serializer

@api_view(['GET', 'POST'])
def [app]_list(request):
    if request.method == 'GET':
        [app] = [app].obejcts.all()
        serializer = [app]Serializer([app], many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = [app]Serializer(data=request.data)
        if serializer.is_valide():
            serilaizer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
@api_veiw(['GET', 'PUT', 'DELETE'])
def [app]_detail(request, pk):
    try:
        [app] = [app].objects.get(pk=pk)
    except [app].DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
   
	if request.method == 'GET':
        serializer = [app]Serializer([app])
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = SnippetSerializer(snippet, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        snippet.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

#### 再封装（基于类视图）

```python
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from [app].models import [app]
from [app].serializers import [app]Serializer

class [app]List(APIView):
    def get(self, request, format=None):
        # get方法，无格式（内容自动分派）
        [app] = [app].objects.all()
        serializer = [app]Serializer([app], many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = [app]Serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class [app]Detail(APIView):
    def get_object(self, pk):
        try:
            return [app].objects.get(pk=pk)
        except [app].DoesNotExist:
            raise Http404
    def get(self, request, pk, format=None):
        [app] = self.get_object(pk)
        serializer = [app]Serializer([app])
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        [app] = self.get_object(pk)
        serializer = [app]Serializer([app], data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTPP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        [app] = self.get_object(pk)
        [app].delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

调整URL设置

```python
# [app]/urls.py
from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from [app] import views

urlpatterns = [
    path('[app]/', views.[app]List.as_view()),
    path('[app]/<int:pk>/', views.[app]Detail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
```

##### 使用混入类Mixins

基于类视图最大的优势是可以使用混入类，简化重复组件

```python
# [app]/views.py
from rest_framework import mixins
from rest_framework import generics
from [app].models import [app]
from [app].serializers import [app]Serializer

class [app]List(generics.GenericAPIView,
                mixins.CreateModelMixin,
                mixins.ListModelMixin):
    queryset = [app].objects.all()
    serializer_class = [app]Serializer
    
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class [app]Detail(generics.GenericAPIView,
                 mixins.RestriveModelMixin,
                 mixins.UpdateModelMixin,
                 mixins.DestroyModelMixin):
    queryset = [app].objects.all()
    serializer_class = [app]Serializer
    
    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)
   
	def put(self, request, *args, **kwargs):
        return self.destory(request, *args, **kwargs)
    
	def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)
```

##### 混入类再封装（通用基于类视图）

REST框架提供一组已经混合好的通用视图

```python
from rest_framework import generics
from [app].models import [app]
from [app].serializers import [app]Serializer

class [app]List(generics.ListCreateAPIView):
    queryset = [app].objects.all()
    serializer_class = [app]Serializer

class [app]Detail(generics.RetrieveUpdateDestoryAPIView):
    queryset = [app].objects.all()
    serializer_class = [app]Serializer
```

### 实际封装（视图集ViewSets）

如果需要细致操作，也可以使用之前封装程度没有这么高的方法，不要死板

ViewSets将List和Detail两个类二合一

viewsets.ModelViewSet默认支持读写，viewsets.ReadOnlyModelViewSet仅支持读

```python
# [project]/[app]/views.py
from django.contrib.auth.models import User
from rest_framework import permissions, viewsets
from [project].[app].serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
	"""
	允许用户查看/编辑的API端点
	"""
    queryset = User.objectes.all()
    serializer_class = UserSerializer
    permission_classes = [paermission...]
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, renderer_classes=[renderers.StaticHTMLRenderer])
    def highlight(self, request, *args, **kwargs):
        snippet = self.get_object()
        return Response(snippet.highlighted)
```

@action装饰器是自定义行为，它区别于create/update/delete

默认@action响应GET请求，但可以通过methods参数指定POST请求

默认@action URL依据方法名字，但可以通过url_path参数修改

detail=True指应用于单个值，False应用于整个Set

## Routers自动注册URL

### 原理

```Python
# [app]/urls.py
from django.urls import path
from [app] import views

urlpatterns = [
    path('[app]/', views.[app]_list, name='[app]-list'),
    path('[app]/<int:pk>', views.[app]_detail, name='[app]-detail'),
]
```

#### 基于api_view的注册

```python
from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from snippets import views

# API endpoints
urlpatterns = format_suffix_patterns([
    path('', views.api_root),
    path('snippets/',
        views.SnippetList.as_view(),
        name='snippet-list'),
    path('snippets/<int:pk>/',
        views.SnippetDetail.as_view(),
        name='snippet-detail'),
    path('snippets/<int:pk>/highlight/',
        views.SnippetHighlight.as_view(),
        name='snippet-highlight'),
    path('users/',
        views.UserList.as_view(),
        name='user-list'),
    path('users/<int:pk>/',
        views.UserDetail.as_view(),
        name='user-detail')
])
```

#### 基于ViewSets注册

```python
from rest_framework import renderers

from snippets.views import api_root, SnippetViewSet, UserViewSet

snippet_list = SnippetViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
snippet_detail = SnippetViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})
snippet_highlight = SnippetViewSet.as_view({
    'get': 'highlight'
}, renderer_classes=[renderers.StaticHTMLRenderer])
user_list = UserViewSet.as_view({
    'get': 'list'
})
user_detail = UserViewSet.as_view({
    'get': 'retrieve'
})

urlpatterns = format_suffix_patterns([
    path('', api_root),
    path('snippets/', snippet_list, name='snippet-list'),
    path('snippets/<int:pk>/', snippet_detail, name='snippet-detail'),
    path('snippets/<int:pk>/highlight/', snippet_highlight, name='snippet-highlight'),
    path('users/', user_list, name='user-list'),
    path('users/<int:pk>/', user_detail, name='user-detail')
])
```

### 实际封装

ViewSets支持自动化注册

```python
# [project]/urls.py
from django.urls import include, path
from rest_framework import routers
from [project].[app] import views

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='snippet')
```

## 设置URL

### 原理

基本一致，间接改直接include

### 实际封装

```python
# [project]/urls.py
urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
```

## 分页Pagination

```python
# [project]/settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10 # 每页大小
}
```

在视图中取消分页

```python
# [app]/views.py
class AaViewSet(viewsets.ModelViewSet):
    ...
    pagination_class = None
```

## 认证与权限

### 用户认证

- 创建用户序列化

```python
# serializers.py
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    [app] = [app].PrimiaryKeyRelatedFeild(many=True, queryset=Snippet.objects.all())
    class Meta:
        model = User
        fields = ['id', 'username', 'snippets']
```

> 反向关系不会自动添加到模型之中，需要显式地引入

- 使用只读视图 ListAPIView RetrieveAPIView

```python
# user/views.py
from django.contrib.auth.models import User
from [app].serializers import UserSerializer

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
```

- 配置URL

```python
path('users/', views.UserList.as_view())
path('users/<int:pk>/', views.UserDetail.as_view())
```

- 关联用户与应用

通过覆写应用视图的.perform_create()方法，修改实例的存储方法，处理传入请求或请求URL的信息

```python
# views.py
class [app]List(generics.ListCreateAPIView):
    queryset = [app].objects.all()
    serializer_class = [app]Serializer
    
    def perform_create(self, serializer):
        serializer.save([owner]=self.request.user)
```

序列化的create()方法会将user传递给一个[owner]

- 更新serializer

```python
class UserSerializer(serializers.ModelSerializer):
    [app] = [app].PrimiaryKeyRelatedFeild(many=True, queryset=Snippet.objects.all())
    [owner] = serializer.ReadOnlyField(source='owner.username') # 等价于read_only=True
    class Meta:
        model = User
        fields = ['id', 'username', 'snippets', 'owner']
```

- 更新应用视图

确定只有权限的用户才能操作

```python
from rest_framework import permissions

class [app]List(...):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class [app]Detail(...):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
```

- 创建登录视图

```python
# [project]\urls.py
urlpatterns += [
    path('[api-auth]/', include('rest_framework.urls')),
]
```

已经有了，[api-auth]可以替换为任意路径

### 对象级权限

- 应用app中配置权限

```python
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # 仅允许拥有者
        return obj.owner == request.user
```

SAFE_METHODS指包含'GET'`, `'OPTIONS'，'HEAD'的不改变数据的安全方法

- 在app Detail视图中添加自定义权限

```python
class [app]Detail(...):
    ...
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                         IsOwnerOrReadOnly]
```

权限会按顺序检查：必须登录或只能查看——登录者必须是拥有者否则只能查看；若不写第一个则未登录者不能查看

## 数据导出

- [djangorestframework-csv](https://github.com/mjumbewu/django-rest-framework-csv)
- drf-renderer-xlsx

## 接口文档

- coreapi

自动生成继承自APIView及其子类的视图
