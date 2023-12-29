---
layout:       post
title:        "【笔记】前后端跨域通信"
author:       "Cao Zihang"
header-style: text
catalog:      true
status:		  Done
mathjax: 	true
tags:
    - 日常
    - 学习笔记


---

后端采用REST框架

前后端跨域通信有两种方案：

- 前端配置代理：将/api地址的前端请求转发到设置端口的后端服务器

  - ```js
    // vue.config.js
    module.exports = {
        devServer: {
            proxy: {
                '/api': {
                    target: `http://127.0.0.1:8000/api`,
                    changeOrigin: true,
                    pathRewrite: {
                        '^/api': ''
                    }
                }
            }
        }
    };
    ```

  - （尝试没成功）

- 后端允许前端服务器访问

  - Django框架中通过django-cors-headers解决

    - ```cmd
      pip install django-cors-headers
      ```

    - 注册Settings.py INSTALLD_APPS

      ```python
      INSTALLED_APPS = [
          'corsheaders'
      ]
      ```

    - 添加到中间件

      ```python
      MIDDLEWARE = [
          'corsheaders.middleware.CorsMiddleware',
          'django.middleware.csrf.CsrfViewMiddleware',
          #一定要在csrf前面
      ]
      ```

    - 添加白名单

      ```python
      CORS_ALLOWED_ORIGINS = [
              "https://example.com",
              "https://sub.example.com",
              "http://localhost:3080", #允许访问的域名（前端）
              "http://127.0.0.1:9000",
          ]
      ```

    - 设置cors携带cookie

      ```python
      CORS_ALLOW_CREDENTIALS = True
      ```
