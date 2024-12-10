---
layout:       post
title:        "Advanced Python"
author:       "Cao Zihang"
header-style: text
catalog:      true
status:		  "working"
tags:
    - python
---

# Advanced Python
## 数据处理
### \*拆包与强制关键字参数
#### 拆包
```Python
a, *b, c = [1, 2, 3, 4, 5]

sum(*b)

list = [1, *b, 5]

def func(*args):
    for arg in args:
        pass

# 关键字参数拆包
def func(**kwargs):
    for key, value in kwargs.items():
        pass

def display(name, age):
    print(f"name: {name}, age: {age}")

display(**{"name": "Cao", "age": 24})

```

#### 强制关键字参数
```Python
def func(a, b, *, c):
    pass

func(1, 2, c=3)
```

## 函数
### 高阶函数
接受函数作为参数，或把函数作为结果返回的函数即为高阶函数。

```Python
sorted(list, key=lambda x: x[1])

map(lambda x, y: x * 2 + y * 2, list)

filter(lambda x: x % 2 == 0, list)

from functools import reduce

reduce(lambda x, y: x + y, list, start_value)


```

## 类型提示

> “小型程序，动态类型就够了，而大型程序则需要更规范的方式。” —— Fluent Python

### 容器类型
```Python
from typing import List, Dict, Set, Tuple

def func(a: List[int], b: Dict[str, int], c: Set[str], d: Tuple[int, str]) -> None:
    pass
```

### 可选类型

`Optional`表示一个值可以是指定类型或`None`。

```python
from typing import Optional

def func(param: int) -> Optional[Dict[str, int]]:
    pass
```

### 泛型
`T = TypeVar('T')`会创建类型变量`T`，当使用时会被绑定特定类型，保证所有使用`T`的地方类型一致。

主要用于元编程。

```python
from typing import TypeVar, List

T = TypeVar('T')

def func(param: List[T]) -> T:
    pass
```

TypeVar可以添加限制。
