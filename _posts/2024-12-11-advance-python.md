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

# 字典合并
dec1 = {'a': 1}
dec2 = {'b': 2}
result = {**dec1, **dec2}
```

#### 强制关键字参数
```Python
def func(a, b, *, c):
    pass

func(1, 2, c=3)
```

### 推导式与生成式
列表推导式通常更快，生成式在处理大数据时更节省内存。

```python
[x * 2 for x in list] # 列表推导式更快
(x * 2 for x in list) # 生成式节省内存
```

### 枚举enum
python中，枚举enum时一种特殊类，它提供了一种将一组相关常量定义为一个单一类型的方式。

枚举能增强代码的可读性，减少因使用硬编码带来的错误。

枚举类每一个成员都是唯一的，不可变的。

创建枚举类需要集成enum.Enum。

```python
from enum import Enum


class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3

# 访问枚举成员
print(Color.RED)
print(Color.RED.value)

for color in Color:
    print(color.name, color.value)

# 通过值获取枚举成员
print(Color(1))

# 比较枚举成员
print(Color.RED is Color(1))

```
## 函数
### 高阶函数
接受函数作为参数，或把函数作为结果返回的函数即为高阶函数。

高阶函数适合对大量数据进行过滤、映射和聚合，能够减少代码冗余。

高阶函数可能带来额外的性能开销，应主要使用生成器表达式代替推导式节省内存；对于频繁调用的函数使用lru_cache缓存结果。
```Python
sorted(list, key=lambda x: x[1])

map(lambda x, y: x * 2 + y * 2, list)

filter(lambda x: x % 2 == 0, list)
```

#### reduce规约

```python
from functools import reduce

reduce(lambda x, y: x + y, list, start_value)

query_params = {"name": "Cao", "age": 24}
query_params_str = reduce(
    lambda x, y: f"{x} -> {y}",
    map(lambda x: f"{x[0]}={x[1]}", query_params.items())
)

# 使用reduce链式处理数据
def process_pipeline(data):
    transformations = [
        lambda x: x.strip(),
        lambda x: x.lower(),
        lambda x: x.replace(" ", "-")
    ]
    return reduce(lambda x, y: y(x), transformations, data)

def process_data(data):
    steps = [
        lambda x: map(str.strip, x),
        lambda x: filter(None, x),
        lambda x: map(str.lower, x)
        lambda x: list(x)
    ]
    return reduce(lambda x, y: y(x), steps, data)
```

#### functools.partial冻结参数
它可以根据提供的可调用对象产生一个新的可调用对象，并为原可调用对象的指定参数绑定预设值。

它可以将接收一个或多个参数的函数改造成接收更少参数的回调的API。

```Python
from functools import partial

def power(base: int, exponent: int) -> int:
    return base ** exponent

square = partial(power, exponent=2)
print(square(5))
```

#### 自定义高阶函数
```python
def high_order_func(func, arg: Iterable):
    return [func(x) for x in arg]
```

### 缓存
#### functools.lru_cache
```python
from functools import lru_cache

@lru_cache(maxsize=32)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(40))
```

### 装饰器
#### functools.wraps保留被装饰函数元数据
```python
from functools import wraps

def myDecorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"{func.__name__} is called")
        return func(*args, **kwargs)
    return wrapper

@myDecorator
def example():
    """This is an example function."""
    print("example() is called")
```
## 控制流
### 模式匹配match-case
与if-else相比，模式匹配除了能匹配简单数据类型外，还可以根据复杂数据结构进行匹配。

```Python
def match_example(value):
    match value:
        case [x, y]:
            print(f"x: {x}, y: {y}")
        case (a, b, c):
            print(f:"a: {a}, b: {b}, c: {c}")
        case {'name': name, 'age': age}:
            print(f"name: {name}, age: {age}")
        case _:
            print("unknown value")
```

递归匹配特别适合处理树形或图状数据，如解析嵌套JSON数据。

ex. 命令行参数解析
```Python
def process_command(command):
    match command.split():
        case ["quit" | "exit"]:
            return "quit"
        case ["help"]:
            return "help"
        case ["add", *items]:
            return f"add {items}"
        case ["search", *keywords] if keywords:
            return f"search {' '.join(keywords)}"
        case _:
            return "unknown command"
```

模式匹配的内存使用略高于简单条件句，因此对于复杂的模式推荐使用if-else。

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
