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

{:toc}

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

#### 枚举的高级特性

**确保唯一值 & 自动分配值**

```python
from enum import Enum, auto, unique

@unique # 确保枚举值唯一
class Color(Enum):
    RED = auto()    # 自动分配值
    GREEN = auto()
    BLUE = auto()

    def is_warm(self):
        return self in (Color.RED,)

    @property
    def rgb(self):
        _rgb_values = {
            Color.RED: (255, 0, 0),
            Color.GREEN: (0, 255, 0),
            Color.BLUE: (0, 0, 255)
        }
        return _rgb_values[self]

print(Color.RED.rgb)
```

使用函数式创建枚举：`Animal = Enum('Animal', ['DOG', 'CAT', 'RAT])`

使用字典创建枚举
```python
Status = Enum('Status', {
    'ACTIVE': 1,
    'INACTIVE': 2,
    'DELETED': 3
})
```

**整数值枚举**

```python
from enum import IntEnum

# 要求所有成员都是整数
class Color(IntEnum):
    RED = 1
    GREEN = 2
    BLUE = 3
```

**支持位运算（逻辑门）**

```python
from enum import Flag

class Permission(Flag):
    READ = auto()
    WRITE = auto()
    DELETE = auto()

user_permission = Permission.READ | Permission.WRITE
if Permission.READ in user_permission: ...
```

枚举常用于配置管理、状态机、数据库模型。

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

#### TypedDict

允许开发者定义字典的结构，推荐使用类定义语法。

与NamedTuple相比，TypedDict键值可变，无需创建新的示例。

与dataclass相比，TypedDict更适合处理JSON/字典数据，dataclass提供了更多面相对象的特性。

```python
from typing import TypedDict

class User(TypedDict):
    name: str
    age: int
    email: str
```

**所有键默认设为可选**

```python
class Employee(TypedDict, total=False):
    # 只影响在类中定义的键，不影响继承键
    name: str # 可选键
    age: int # 可选键
    email: str # 可选键
    salary: float # 必选键

# 创建只包含部分键的字典也合法
my_employee: Employee = {
    "name": "John"
    "age": 25
}
```

**限定特定键**

```python
from typing import TypedDict, NotRequired, Required

class Project(TypedDict, total=False):
    name: Required[str] # 显示标记为必需
    description: str # 默认为可选 (total=False)
    deadline: NotRequired[str] # 显示标记为可选
```

**继承TypedDict**

```python
from typing import TypedDict

class PersonBase(TypedDict):
    name: str
    age: int

class Employee(PersonBase, total=False):
    salary: float
    department: str

my_employee: Employee = {
    "name": "John",
    "age": 25,
    "salary": 100000
}
```

**组合TypedDict**

```python
from typing import TypedDict

class Address(TypedDict):
    street: str
    city: str
    state: str

class Contact(TypedDict):
    phone: str
    email: str

class Person(TypedDict):
    name: str
    address: Address # 组合TypedDict
    contact: Contact # 组合TypedDict

# 使用组合TypedDict
person: Person = {
    "name": "John",
    "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA"
    },
    "contact": {
        "phone": "(555) 555-5555",
        "email": "john@example.com"
    }
}
```

**类型合并**

```python
from typing import TypedDict

class UserBase(TypedDict):
    id: int
    name: str

class UserContact(TypedDict):
    email: str
    phone: str

# 合并两个TypedDict
class UserProfile(UserBase, UserContact):
    age: int
    address: str

user: UserProfile = {
    "id": 1,
    "name": "John",
    "age": 25,
    "address": "123 Main St",
    "email": "john@example.com",
    "phone": "(555) 555-5555"
}