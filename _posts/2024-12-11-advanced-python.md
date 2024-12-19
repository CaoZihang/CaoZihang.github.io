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

> 整理自be better coder微信公众号、Fluent Python, Second Edition与码农高天。

## 数据处理
### \*拆包与强制关键字参数
#### 拆包

```python
a, *b, c = [1, 2, 3, 4, 5]

sum(*b)

list = [1, *b, 5]

def func(*args):
    for arg in args:
        pass

# 元组自动打包
coordinates = x, y

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

```python
def func(a, b, *, c):
    pass

func(1, 2, c=3)
```

### 海象运算符
即赋值表达式，允许在表达式内部进行变量赋值。

```python
if (n := func(x)) > 10:
    # 无需单独创建n=func(x)
    print(n)
```

### 推导式与生成器
列表推导式通常更快，生成器在处理大数据时更节省内存。

```python
[x * 2 for x in list] # 列表推导式更快
(x * 2 for x in list) # 生成器节省内存
```

#### 生成器

```python
# 生成器函数
def gen_func():
    yield 1

# 生成器表达式
gen_expr = (x for x in range(10))

# 通过可迭代对象转换成生成器
```

**生成器作为上下文管理器**

```python
from contextlib import contextmanager

@contextmanager # 该装饰器允许with语句使用该生成器
def file_manager(file_path):
    try:
        f = open(file_path, 'r')
        yield f
    finally:
        f.close()

with file_manager("file.txt") as f:
    content = f.read()
```

**接收外部数据**

```python
def counter():
    i = 0
    while True:
        val = (yield i)
        if val is not None:
            i = val
        else:
            i += 1

c = counter()
print(next(c)) # 0
# send会取代yield的值
print(c.send(10)) # 10
print(next(c)) # 11
```

**子生成器**

```python
def sub_generator():
    yield 1
    yield 2
    yield 3

def main_generator():
    yield 'a'
    # 委托给子生成器
    yield from sub_generator()
    yield 'b'

for item in main_generator():
    print(item) # a, 1, 2, 3, b
```

生成器可用于大文件、大数据处理。

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

### with上下文管理

上下文管理器基于`__enter__()`和`__exit__(exc_type, exc_value, traceback)`两个特殊方法。

当执行`with`语句时，Python解释器会调用上下文管理器的`__enter__()`方法，将`__enter__()`方法的返回值赋值给`as`子句的变量，之后执行`with`语句体中的代码，最后调用上下文管理器的`__exit__()`方法。

上下文管理器常用于文件操作，数据库，网络，线程锁，临时目录操作，计时器，环境变量修改等。

#### 自定义上下文管理器

```python
# 基于类的实现
class MyContextManager:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print(f"Entering context: {self.name}")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print(f"Exiting context: {self.name}")
        if exc_type:
            print(f"Exception: {exc_type}, {exc_value}")
        return False

# 基于装饰器的实现
from contextlib import contextmanager

@contextmanager
def my_context_manager(name):
    print(f"Entering context: {name}")
    try:
        yield
    finally:
        print(f"Exiting context: {name}")
```

`contextlib`模块提供了多个上下文管理相关的工具：
- `@contextmanager`装饰器，用于创建上下文管理器
- `closing()`自动调用对象的close()方法
- `suppress()`忽略特定异常
- `ExitStack`动态管理一组上下文管理器

```python
from contextlib import contextmanager

def process_files(file_list):
    with ExitStack() as stack:
        files = [stack.enter_context(open(file_name)) for file_name in file_list]
        # 所有的文件都打开
        for file in files:
            print(file.read())
        # 退出with语句后，所有文件会自动关闭
```

### 高效Pandas
#### 数据读取
```python
# 优化读取
df = pd.read_csv('data.csv',
    usecols=['A', 'B', 'C'], # 读取指定列
    dtype={'A': int, 'B': float}, # 指定列的数据类型
    nrows=10000, # 限制读取行数
    parse_dates=['date'], # 将指定列转换为日期类型
)

# 分块读取大文件
chunks = pd.read_csv('data.csv', chunksize=10000)
# 对每个块进行处理并合并
result = pd.DataFrame()
for chunk in chunks:
    processed_chunk = process(chunk)
    result = pd.concat([result, processed_chunk])

# 并行读取多个文件
from concurrent.futures import ThreadPoolExecutor

def read_file(file_path):
    return pd.read_csv(file_path)

files = ['file1.csv', 'file2.csv', 'file3.csv']
with ThreadPoolExecutor(max_workers=3) as executor:
    dfs = list(executor.map(read_file, files))

# 使用专门格式加快读取速度
df = pd.read_parquet('data.parquet') # parquet格式读取更快
df = pd.read_feather('data.feather') # Feather格式更适合 pandas

# 基于SQL引擎读取数据库
from sqlalchemy import create_engine
engine = create_engine('sqlite:///data.db')
df = pd.read_sql('SELECT * FROM table', engine)
```

#### 数据筛选
```python
# 使用query进行复杂条件筛选
df.query("age > 18 and gender == 'M'")

# isin过滤
cities = ['New York', 'Los Angeles', 'Chicago']
df[df['city'].isin(cities)]

# 组合条件
mask1 = df['age'] > 18
mask2 = df['gender'] == 'M'
df[mask1 & mask2]

# between范围筛选
df[df['age'].between(18, 30)]

# 模糊匹配
df[df['city'].str.contains('New', na=False)]
```

#### 数据清洗
```python
# 数据类型转换
df['data'] = df['data'].astype('category') # category类型节省内存
df['data'] = pd.to_datetime(df['data'], format='%Y-%m-%d', errors='coerce')

# 批量替换值
mapping = {'男': 1, '女': 0, 'N/A': -1}
df['gender'] = df['gender'].map(mapping)

# 填充缺失值
df['data'] = df['data'].fillna({
    'age': df['age'].mean(),
    'gender': 'N/A',
    'income': df['income'].median()',
    'city': df['city'].mode()[0] # 取众数
})

# 删除重复数据
df = df.drop_duplicates(subset=['name', 'age'], keep='first')

# 异常值
def remove_outlier(series):
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    return series[~((series < (Q1 - 1.5 * IQR)) | (series > (Q3 + 1.5 * IQR)))]

df['income'] = remove_outlier(df['income'])
```

#### 分组

```python
def top_n_mean(x, n=3):
    return x.nlargest(n).mean()

result = df.groupby(['city', 'gender']).agg({
    'age': ['count', 'mean', 'median', 'std', top_n_mean],
    'income': 'sum',
}).round(2)

df['salary'] = df.groupby('city').transform(lambda x: x.mean())
df['salary'] = df.groupby('department')['salary'].rank(method='dense')
```

### 魔术方法

- `__new__`建立对象时触发，需要返回obj，使用不多
- `__del__`释放对象，不太好用
  - 与`del obj`不同，`del`是停止引用，不触发`__del__`

- `__str__`人类更可读，通常是简略版本，print会优先调用
- `__repr__`通常信息比较全面
- `__format__`使用频率很低，用于打印时处理format

- `__eq__`通常返回bool型，但其实可以返回任意值；没有实现的话默认使用`is`比较
  - 在没有定义`__ne__`的情况下，`!=`运算默认会对`__eq__`取反
- `__gt__`和`__lt__`当一个缺乏定义时会调用另一个取反
  - 调用`__gt__`或`__lt__`并不是由`>`或`<`决定的
  - 若两个比较对象A，B不是由同一个类定义的
    - 默认优先调用左边对象拥有的比较方法rich comparison
    - 若B是A的衍生类定义的，则优先调用B的比较方法
- python中`>=`与`> and =`不等价，需要单独定义`__ge__`和`__le__`
- python对每个自定义的数据结构都默认了`__eq__`和`__hash__`
  - 当自定义了`__eq__`，默认`__hash__`就会被自动注释，导致unhashable错误
  - `__hash__`要求若两个对象相等，它们的哈希值也必须相等，修改`__eq__`后默认的`__hash__`就不成立了
  - `__hash__`必须返回一个整数，且相等对象hash必须相等

- `__bool__`所有自定义对象的bool都默认若`__len__ !=0`为True，除非修改`__bool__`

- `__getattr__`当调用不存在属性时执行的内容，默认`raise AttributeError`
- `__getattribute__`当读取任意属性时触发（无论是否存在）
  - 需要返回默认操作时，应`return super().__getattribute__(name)`避免无限递归
  - 注意，每一次读取属性都会调用，很容易产生无限递归问题
- `__setattr__`写属性，通常会通过`super().__setattr(name, val)`来保持默认行为
- `__delattr__`尝试删除Object属性时才会调用

- `__dir__`可以自定义返回内容

描述器是一个实现了描述器协议的类，它允许自定义对象属性的访问方式。

只要实现了`__get__`、`__set__`、`__delete__`方法之一，就可以成为描述器。

实现了`__get__`和`__set__`方法的描述器可以称为数据描述器，它对属性的读写都有完全控制权。

数据描述器的优先级较高，会覆盖实例字典中的同名属性。

```python
class DataDescriptor:
    def __get__(self, obj, objtype=None):
        # obj为使用描述器的对象
        return self.value

    def __set__(self, obj, value):
        # 添加一些验证逻辑
        if not isinstance(value, int):
            raise TypeError("Value must be an integer")
        self._value = value

class A:
    x = DataDescriptor()
```

非数据描述器只实现了`__get__`方法，只能控制属性的读取操作，它的优先级较低，若实例字典中存在同名属性，则会优先使用实例字典中的属性
raise TypeError("Value must be an integer")
        self._value = value

，它的优先级较低，若实例字典中存在同名属性，则会优先使用实例字典中的属性。

- `__get__`当获取属性时调用
- `__set__`当设置属性时调用
- `__delete__`当删除属性时调用
- `__set_name__(self, owner, name)`创建类时调用，用于获取描述器在类中的名称

- `__slots__`非魔术方法，但具有特殊含义，类似于白名单机制，指明对象可以自定义的属性。

- `__init_subclass__(cls)`用于基类，创建衍生类时自动初始化

- `__call__`像函数一样使用对象
- `__getitem__`方括弧索引读取值
- `__setitem__`方括弧索引设置值
- `__delitem__`del删除值
- `__reversed__` reversed内置函数调用
- `__contains__` in内置函数调用

- `__missing__`仅适用于继承dict的衍生类，当键不存在时的操作

### NumPy
#### 读取数据

- `np.genfromtxt('file.csv', dtype='float' ,delimiter=',', skip_header=1, usecols=(1, 2, 3), encoding='utf-8', missing_values=['NA', ''], filling_values=0)
  - 用于读取csv
- `np.loadtxt('data.txt')读取文本文件，默认按空格分隔

## 函数
### 高阶函数
接受函数作为参数，或把函数作为结果返回的函数即为高阶函数。

高阶函数适合对大量数据进行过滤、映射和聚合，能够减少代码冗余。

高阶函数可能带来额外的性能开销，应主要使用生成器表达式代替推导式节省内存；对于频繁调用的函数使用lru_cache缓存结果。
```python
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

```python
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

### 闭包

#### 变量作用域与global

在函数中赋值时，如果希望把变量作为全局变量，修改全局变量的值，需要使用global声明。

```python
b = 6
def foo(a):
    global b
    print(a)
    print(b) # 声明global后可以正常执行
    b = 9
```

#### 闭包

闭包就是延伸了作用域的函数，包括函数主体中引用的非全局变量和局部变量，这些变量必须来自包含该函数的外部函数和局部作用域。

内部函数可以访问外部函数的局部变量，在内部作为自由变量与其绑定。

但是，当变量是数值或其他不可变类型，对其进行操作实质上会隐式创建局部变量，导致器不再是自由变量保留在闭包中。

对这类变量需要使用`nonlocal`关键字将变量标记为自由变量。

```python
def make_average(x):
    series = [x]
    count = 0
    total = x

    def average(new_value):
        nonlocal count, total
        count += 1
        total += new_value
        series.append(new_value)
        return total / count

    return average

avg = make_average(100)
avg(10)
avg(20)
```

包含多个方法

```python
def create_counter():
    count = 0

    def increment():
        nonlocal count
        count += 1
        return count

    def get_count():
        return count

    return {
        "increment": increment,
        "get_count": get_count
    }

counter = create_counter()
print(counter["increment"]())
print(counter["get_count"]())
```

## 类
### 抽象基类ABC

抽象基类主要用于定义接口规范。

`@abstractmethod`抽象方法装饰器，用于标记必须被子类实现的方法，且子类实现该抽象方法时，方法的名称和参数必须与抽象方法定义完全一致。

`register()`方法将类注册为抽象基类的虚拟子类进行类型检查，且该类无需显式地继承抽象基类。

```python
from abc import ABC, abstractmethod

class Vehicle(ABC):
    # 抽象方法
    @abstractmethod
    def move(self):
        pass

    # 抽象属性
    @property # 将方法声明为属性
    @abstractmethod
    def wheels(self):
        pass

@Vehicle.register
class Car:
    def move(self):
        return "Car is moving"

    @property
    def wheels(self):
        return 4

# 检查类型关系
print(issubclass(Car, Vehicle)) # True
print(isinstance(Car(), Vehicle)) # True
```

abc模块是通过元类metaclass实现抽象基类的。

### Protocol
Python 3.8引入了Protocol，它与抽象基类基本一致，但无需显式地继承抽象基类。

它更符合鸭子类型的概念，只要实现Protocol规定的方法，就可以实现类型检查。

它适用于存在复杂继承关系的场景，避免了ABC需要显式继承导致的复杂性。

```python
from typing import Protocol, runtime_checkable

@runtime_checkable # 启动运行时类型检查（只检查方法是否存在）
class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle: # 实现Drawable接口，无需显式继承
    def draw(self) -> None:
        print("Drawing a circle")

def render(shape: Drawable) -> None:
    shape.draw()

render(Circle())
```

### 元类metaclass

元类就是类的类（工厂），它定义了创建类时的规则。

当使用`class`关键字定义类的时候，python会使用默认元类（`type`）来创建类，当使用自定义元类时，元类会接管创建类和`type`之间的过程。

元类通常会重写`type`默认元类的`__new__`（类创建时调用）、`__init__`（类创建后初始化）、`__call__`（实例化时调用）三个魔术方法。

```python
class MyMeta(type):
    def __new__(cls, name, bases, attrs):
        if 'required_method' not in attrs:
            raise TypeError('Missing required method')
        return super().__new__(cls, name, bases, attrs)

    def __init__(cls, name, bases, attrs):
        super().__init__(name, bases, attrs)
        # 为创建的类添加一个属性，记录创建时间
        cls.created_at = datetime.now()

    def __call__(cls, *args, **kwargs):
        print("Calling", cls.__name__)
        return super().__call__(*args, **kwargs)

class A(metaclass=MyMeta):
    pass

obj = A()
```

### TypedDict

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
```

### dataclass

`@dataclass`装饰器会自动为类生成多个魔术方法
- `__init__`
- `__repr__`
- `__eq__`
- `__hash__`
  - 仅当`@dataclass(frozen=True)`时
- sorted方法
  - 仅当`@dataclass(order=True)`时
  - 自动生成`__lt__`、`__le__`、`__gt__`、`__ge__`方法
  - 若希望自定义排序规则，可以使用dataclasses.field控制或单独定义排序字段

```python
@dataclass(
    init=True,
    repr=True,
    eq=True,
    frozen=False,
    order=False,
    match_args=True, # 参数名称匹配
    kw_only=False, # 关键字参数
    slots=False,
    weakref_slot=False
)
class Customer:
    name: str
    age: int
```

## 控制流
### 模式匹配match-case
与if-else相比，模式匹配除了能匹配简单数据类型外，还可以根据复杂数据结构进行匹配。

```python
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
```python
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

### 迭代
可迭代对象Iterable是指实现了__iter__()方法的对象。

迭代器Iterator是指实现了__iter__()和__next__()方法的对象。

迭代器通过__next__()方法逐个返回序列中的元素，当没有更多元素时抛出`StopIteration`异常。

迭代对象支持多次迭代，迭代器一旦迭代完成即耗尽。

迭代器维护迭代状态，记录当前遍历位置。

迭代对象可以通过调用iter(记录当前遍历位置。

迭代对象可以通过调用`iter()`方法转换为迭代器。

```python
from collection.abc import Iterable, Iterator

print(isinstance([1, 2, 3], Iterable)) # True
print(isinstance([1, 2, 3], Iterator)) # False

my_iterator = iter([1, 2, 3])
print(next(my_iterator))
my_iterator = iter([1, 2, 3])
print(next(my_iterator))
```

#### 特殊迭代器

`itertools`提供了几个特殊迭代器：`cycle`, `islice`, `chain`。

`cycle`会将可迭代对象无限循环。

```python
from itertools import cycle

colors = cycle(["red", "green", "blue"])

for _ in range(10):
    print(next(colors)) # red green blue red green blue red green blue red
```

`islice`类似于`slice`，可用于任何迭代器，返回的是新的迭代器。

```python
from itertools import islice

sliced = itertools.islice(range(10), 3, 6)

for i in sliced:
    print(i)
```

`chain`可以将多个可迭代对象串连起来，形成新的迭代器。

```python
from itertools import chain

iterable = chain(range(3), range(5, 8), other_iterable)
```

多线程环境下使用迭代器需要特别注意。

长期运行的迭代器可能导致内存泄漏问题。

### 包和模块管理

3.3+版本后，python现代包结构不再强制要求`__init__.py`。

`__init__.py`用于包级别初始化、控制导入等功能。

```python
# package/__init__.py

# 定义包相关变量
__version__ = "1.0"
__name__ = "package"

# 提供包的显示索引
# 用于引入包时，from package import *导入的模块
__all__ = ["func1", "func2"]

from .module1 import func1
from .module2 import func2

# 包初始化
# 在import包时执行

def init():
    pass

init()
```

#### 动态导入模块

即基于代码，在程序运行中导入模块。

```python
import importlib

module = importlib.import_module("module_name")
```

### 状态机
状态机（亦称有限状态机，Finite State Machine, FSM）用于处理对象在不同状态下切换。

状态机包含3个核心要素：
- 状态State
- 事件Event：触发状态转换的条件
- 转换Transition: 从一个状态到另一个状态的过程

> Moore状态机：输出只依赖当前状态。

> Mealy状态机：输出依赖当前状态和输入。

e.g.订单状态机

```python
from enum import Enum
from typing import Dict, List, Optional

class OrderState(Enum):
    """订单状态枚举类"""
    CREATED = "created"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderStateMachine:
    """
    订单状态机
    负责管理订单在不同状态之间的转换
    """
    def __init__(self) -> None:
        # 状态转换规则表
        self.state_transitions: Dict[OrderState, List[OrderState]] = {
            OrderState.CREATED: [OrderState.PAID, OrderState.CANCELLED],
            OrderState.PAID: [OrderState.SHIPPED, OrderState.CANCELLED],
            OrderState.SHIPPED: [OrderState.DELIVERED],
            OrderState.DELIVERED: [],
            OrderState.CANCELLED: []
        }
        # 初始化状态
        self.current_state = OrderState.CREATED

    def transition_check(self, target_state: OrderState) -> bool:
        """检查状态转换是否合法"""
        return target_state in self.state_transitions[self.current_state]

    def transition(self, target_state: OrderState) -> bool:
        if self.transition_check(target_state):
            # 可以添加钩子函数对业务逻辑进行验证，before_transition
            self.current_state = target_state
            # 钩子函数after_transition
            print(f"{self.current_state} -> {target_state}"))
            return True
        else:
            print(f"{self.current_state} -x-> {target_state} is invalid")
            return False

# 使用状态机
order = OrderStateMachine()
order.transition(OrderState.PAID) # 成功：created -> paid
order.transition(OrderState.SHIPPED) # 成功：paid -> shipped
order.transition(OrderState.CANCELLED) # 失败：shipped -x-> delivered
order.transition(OrderState.DELIVERED) # 成功：shipped -> delivered
```

实践经验：

- 清晰定义状态
- 配置状态转换规则
- 异常处理
- 状态测试
- 日志记录

### 异步编程

异步编程不影响计算速度，是在调度上的优化。

协程比线程更加轻量级，开销更低，在大规模并发场景下表现更好。

Python提供3种协程：原生协程async def、经典协程yield、基于生成器的协程@types.coroutine

最主流的是由asyncio模块支持的原生协程。

**事件循环Event Loop**负责管理异步任务的调度和执行，代码上可以视作`while True`，是异步的核心。

**协程Coroutine**是一种可以暂定和恢复的函数。通过`async def`定义协程函数，在执行过程中使用`await`挂起。

`async def`创建的是一个Coroutine Object，需要进入异步模式(即托管给Event Loop)，并封装成Task才能运行。

**任务Task**是封装协程的执行，通过`asyncio.create_task`创建。

`await`也可以将协程变成Task，但它会导致所有Event Loop的控制权都是显式指定的，无法调度，必须等待await交回控制权。

```python
import asyncio

# 定义一个协程函数
async def coroutine_func():
    print("Hello World!")
    await asyncio.sleep(1)
    print("Goodbye World!")

async def coroutine_func_2():
    # 使用await 将其他协程函数变成Task，不能发挥协程优势
    print("Hello World!")
    await coroutine_func()
    await coroutine_func()
    print("Goodbye World!")

async def coroutine_fun_2_real():
    # 使用create_task，可以发挥协程优势
    task1 = asyncio.create_task(coroutine_func())
    task2 = asyncio.create_task(coroutine_func())
    print("Hello World!")
    # await的对象是task，不会抢夺Event Loop的控制权
    return1 = await task1 # 获取协程函数的返回值
    await task2
    print("Goodbye World!")

async def coroutine_fun_2_real_clean():
    # 使用gather简化代码
    # gather可以同时注册多个任务，并获取返回值
    # gather可以接收Task和Coroutine Object，它会自动将协程函数封装成Task
    print("Hello World!")
    # 返回值是一个列表
    return1 = await asyncio.gather(coroutine_func(), coroutine_func())
    print("Goodbye World!")

# 异步模式入口函数asyncio.run(coroutine)
asyncio.run(coroutine_fun_2())
# asyncio.run会自动将运行的协程封装成Task，并运行
```

#### Asyncio.Queue

生产者-消费者模式是用于解决两个或多个实体（线程、协程等）之间的数据共享和协作问题。

生产者主要是生产数据，消费者对生产者提供的数据进行处理。

生产者和消费者之间需要一个数据存储缓冲区，它在一定程度上容纳生产者生产的数据，避免由生产者和消费者速度不匹配导致的数据丢失或堵塞。

`asyncio.Queue`主要用于协调多个协程之间的数据流动和任务分发，常用于生产者-消费者模式。

`asyncio.Queue`具有流量控制机制和任务同步的功能。

```python
async def producer_consumer_task():
    queue = asyncio.Queue(maxsize=5)

    # 生产者
    async def producer():
        for i in range(10):
            await queue.put(f"item{i}")
            print(f"producer put item{i}")
            await asyncio.sleep(1)

    async def consumer():
        while True:
            item = await queue.get()
            print(f"consumer get item{item}")
            queue.task_done()
            await asyncio.sleep(1)

    producer_task = asyncio.create_task(producer())
    consumer_task = asyncio.create_task(consumer())

    # 等待生产者任务完成
    await producer_task
    # 等待队列处理完成
    await queue.join()
    # 取消消费者
    consumer_task.cancel()
```


#### 异步迭代器 & 协程

异步迭代器Async Iterator需要实现`__aiter__()`和`__anext__()`方法。

`__aiter__()`返回异步迭代器对象本身return self`，无需是异步方法

异步迭代器需要实现`__aiter__()`和`__anext__()`方法。

`__aiter__()`返回异步迭代器对象本身`return self`，无需是异步方法

`__anext__()`必须是异步方法，返回序列中的下一个值，当没有更多元素时抛出`StopAsyncIteration`异常。

```python
class AsyncDataFetcher:
    def __init__(self, data_source):
        self.data_source = data_source
        self.index = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.index < len(self.data_source):
            raise StopAsyncIteration
        await asyncio.sleep(1) # 模拟异步操作
        self.index += 1
        return self.data_source[self.index - 1]

async def main():
    # 异步循环，async for必须在协程中使用
    async for item in AsyncDataFetcher([1, 2, 3, 4, 5]):
        print(item)

asyncio.run(main())
```

异步可迭代对象Async Iterable只需要实现`__aiter__()`方法，该方法返回一个异步迭代器。

异步可迭代对象可以迭代多次，每次获取新的迭代器。

### 多线程threading

> 3.13引入了free threaded build Cpython进入No GIL模式的开关，但距离实际实现No GIL并发挥多核优势还有距离。
> 因此这里不考虑No GIL。

由于`GIL`的存在，在CPU密集型任务中，多线程反而会降低性能，但在IO密集型任务中，多线程可以发挥一定的优势。

多线程概念出现的主要目的是：“在不显式地切换任务的情况下，让CPU可以同时处理多个任务”。

目前，异步编程，即协程比多线程更轻，且在单线程中完成没有竞争问题，在IO问题中被更多的应用。

但是协程必须显式地放权给Event Loop，适用于多个能够频繁放权的任务，不能很好的处理同时具有一个CPU密集型任务和多个小任务的场景。

这类任务多线程或协程`asyncio.run_in_executor`（本质上就是多线程/多进程）更适合。

```python
import threading
import time

# 检查当前激活的线程
def check_thread():
    # 获取当前线程
    print(threading.active_count())
    print(threading.enumerate())
    # 当前运行的线程
    print(threading.current_thread())

def thread_job(sleep_time):
    print("thread 1 job")
    time.sleep(sleep_time)
    print("thread 1 end")

def thread_job_2(sleep_time):
    print("thread 2 job")
    for i in range(20):
        time.sleep(sleep_time)
    print("thread 2 end")

def main():
    check_thread()
    # 创建线程
    add_thread = threading.Thread(target=thread_job, args=(5,))
    add_thread_2 = threading.Thread(target=thread_job_2, args=(2,))
    # threading.Thread其他参数：kwargs关键字参数；name线程名，常用于日志；daemon守护线程，当主程序退出，守护线程也会强制退出。
    # 启动线程
    add_thread.start()
    add_thread_2.start()
    print("不等待add_thread结束")
    # 等待线程结束再继续执行
    add_thread.join()
    print("等待add_thread_1结束")
    add_thread_2.join()
    print("All Done")

if __name__ == "__main__":
    main()
```

也可以继承`threading.Thread`类并重写`run()`方法来创建线程。

`is_alive()`判断线程是否还在运行。

#### Lock互斥锁

当多个线程访问共享资源时，可能出现多个线程同时修改相同变量的竞争问题，导致结果可能偏离预期。

使用Lock可以解决这个问题，保证当一个进程访问共享资源时，其他进程必须等待。

```python
import threading

def job1():
    global A, lock
    with lock:
        for i in range(10):
            A += 1
            print(f'job1: {A}')

def job2():
    global A, lock
    lock.acquire()
    for i in range(10):
        A += 10
        print(f'job2: {A}')
    lock.release()

if __name__ == '__main__':
    lock = threading.Lock()
    A = 0
    t1 = threading.Thread(target=job1)
    t2 = threading.Thread(target=job2)
    t1.start()
    t2.start()
    t1.join()
    t2.join()
```

#### 可重入锁RLock

`RLock`允许同一个线程多次获取同一个锁，但其他线程必须等待当前线程完全释放锁后才能获取。

主要应用于在递归函数中需要重复获取锁，或者同一个线程的不同方法中需要获取相同的锁的场景。

```python
import threading

rlock = threading.RLock()

def recursive_lock(count):
    with rlock:
        print(f'获取锁: {count}')
        if count > 0:
            recursive_lock(count - 1)
        print(f'释放锁: {count}')

if __name__ == '__main__':
    thread = threading.Thread(target=recursive_lock, args=(5,))
    thread.start()
    thread.join()
```

#### Condition

条件变量Condition是一种基于锁构建的线程同步机制，允许线程之间基于特定条件进行互动，主要应用于“生产者-消费者”模式。

它适用于线程需要等待特定条件才能继续执行，或多个线程需要按特定顺序激活的情况，它无需被激活线程持续检查状态。

- `Condition.wait()`会让线程释放锁并进入堵塞等待状态，直至被其他线程唤醒
- `Condition.notify()`唤醒一个等待的线程
- `Condition.notify_all()`唤醒所有等待的线程

```python
import threading
condition = threading.Condition()

def consumer():
    with condition:
        print("消费者等待被唤醒")
        condition.wait()  # 等待通知
        print("消费者被唤醒")

def producer():
    with condition:
        print("生产者开始生产")
        condition.notify()  # 发送通知
        print("生产者发送通知")

if __name__ == "__main__":
    t1 = threading.Thread(target=consumer)
    t2 = threading.Thread(target=producer)
    t1.start()
    t2.start()
    t1.join()
    t2.join()

# 消费者等待被唤醒
# 生产者开始生产
# 生产者发送通知
# 生产者被唤醒
```

### queue.Queue线程通讯
与`asyncio.Queue`使用基本一致，但它是线程安全的，多个线程可以同时访问同一个队列。

Queue默认使用FIFO先进先出策略。

- `put(itme)`将item添加到队列尾部，若队列已满，则阻塞直至队列有空间
- `get()`从队列头部获取一个item，若队列为空，则阻塞直至队列有数据
- `empty()`判断队列是否为空
- `full()`判断有界队列是否已满
- `qsize()`返回队列中item的个数，对于无界队列可能返回`None`
- `get_nowait()`get的非阻塞方法，若队列为空，则抛出`queue.Empty`异常
- `put_nowait(item)`put的非阻塞方法，若队列已满，则抛出`queue.Full`异常

#### 线程池

线程的创建和销毁开销较大，因此可以利用线程池来复用线程。

线程池预先创建一定数量的线程，当有任务需要处理时，线程池会自动从池中获取一个空闲线程执行任务，执行完毕后不销毁线程，返回线程池等待下一个任务。

- `ThreadPoolExecutor(max_workers=n)`创建线程池
  - `max_workers`指定线程池中最大线程数，数值过大会带来不必要开销，数值过小会降低整体性能
- `submit(job, args...)`向线程池提交任务，会返回一个Future对象用于跟踪任务的执行状态和结果
- `as_completed()`遍历已完成的任务，接收Future对象，返回一个迭代器

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

def func(arg):
    return arg

with TheadPoolExecutor(max_workers=3) as executor:
    futures = []
    for i in range(5):
        future = executor.submit(func, i)
        futures.append(future)
    for future in as_completed(futures):
        try:
            result = future.result()
            print(result)
    except Exception as e:
        print(e)
```

### 多进程multiprocessing

```python
```
## 类型提示

> “小型程序，动态类型就够了，而大型程序则需要更规范的方式。” —— Fluent Python

### 容器类型
```python
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

#### 型变
**不变**：无论A与B之间是否存在（超类或子类）关系，若泛型L是不变的，则L[A]就既不是L[B]的超类型，也不是L[B]的子类型，即L[A与L[B]不兼容。

不变类型可以保证类型安全，对于同时支持读写操作时，不变是最安全的选择。

```python
from typing import TypeVar, Generic

class Beverage:
    """任何饮料类"""
    pass

class Juice(Beverage):
    """果汁类"""
    pass

class OrangeJuice(Juice):
    """橙汁类"""
    pass

# 默认泛型类型为不变
T = TypeVar('T')

class BeverageDispenser(Generic[T]):
    def __init__(self, beverage: T) -> None:
        self.beverage = beverage

    def dispense(self) -> T:
        return self.beverage

def install(dispenser: BeverageDispenser[Juice]) -> None:
    """安装饮料机"""

# 有效
juice_dispenser= BeverageDispenser(Juice())
install(juice_dispenser)

# 对超类和子类无效
beverage_dispenser = BeverageDispenser(Beverage())
install(beverage_dispenser) # incompatible type
orange_juice_dispenser = BeverageDispenser(OrangeJuice())
install(orange_juice_dispenser) # incompatible type
```

**协变**：兼容子类，但不兼容超类。

适合只读操作。

```python
# _co后缀是typeshed项目的协变类型参数命名约定
T_co = TypeVar('T_co', covariant=True)

class BeverageDispenser(Generic[T_co]):
    def __init__(self, drink: T_co) -> None:
        self.beverage = beverage

    def dispense(self) -> T_co:
        return self.beverage

# install函数保持不变

# 有效
juice_dispenser= BeverageDispenser(Juice())
install(juice_dispenser)
orange_juice_dispenser = BeverageDispenser(OrangeJuice())
install(orange_juice_dispenser)

# 超类无效
beverage_dispenser = BeverageDispenser(Beverage())
install(beverage_dispenser) # incompatible type
```

**逆变**：兼容超类，但不兼容子类。

适合只写操作场合。

```python
# _contra后缀是typeshed项目的逆变类型参数命名约定
T_contra = TypeVar('T_contra', covariant=True)

class BeverageDispenser(Generic[T_contra]):
    def __init__(self, drink: T_contra) -> None:
        self.beverage = beverage

    def dispense(self) -> T_contra:
        return self.beverage

# install函数保持不变

# 有效
juice_dispenser= BeverageDispenser(Juice())
install(juice_dispenser)
beverage_dispenser = BeverageDispenser(Beverage())
install(beverage_dispenser)

# 超类无效
orange_juice_dispenser = BeverageDispenser(OrangeJuice())
install(orange_juice_dispenser) # incompatible type
```

### self类型提示

方法链式调用是一种常见的编程模式，其核心在于方法需要返回对象本身，即self。

Python 3.11+引入了`Self`类型提示。

```python
from typing import Self

class MyClass:
    def __init__(self) -> None:
        self._data: dict = {}

    def set_field(self, key: str, value: str) -> Self:
        self._data[key] = value
        return self

    def validate(self) -> Self:
        pass
        return self

    def save(self) -> None:
        if self.validate():
            print("saving:", self._data)

# 链式调用方法
user = (MyClass()
    .set_field("name", "John")
    .set_field("age", "30")
    .save())
```

## 日志系统

Python标准库`logging`模块提供了非常强大的日志记录功能。

该模块包含Logger日志记录器，Handler日志处理器，Filter日志过滤器，Formatter日志格式化器。

### Logger

支持层次结构，通过点号分割创建父子关系（如app.ui）。

提供不同级别的日志记录方法，如debug，info，warn，error等。

可以同时像多个目标输出日志。

```python
# 创建日志记录器
root_logger = logging.getLogger() # 创建根日志记录器 (默认存在)
app_logger = logging.getLogger("app") # 创建具有名字的日志记录器（推荐）
named_logger = logging.getLogger(__name__) # 创建与模块同名的日志记录器

# 创建层次化日志记录器，通过.分隔层级)
logger = logging.getLogger('app.ui.me')
# 通过logging.getLogger('app').getChild('ui.me')返回子记录器
# 通过logging.getLogger('app').getChildren()获得所有(直接)次级记录器名称

# 设定日记记录器阈值级别，当记录低于阈值时不作处理，高于阈值则调用处理函数
logger.setLevel(logging.DEBUG)
# 子记录器默认继承父记录器的阈值

# 日志记录（从低到高排序）
logger.debug("debug message")
logger.info("info message")
logger.warning("warning message")
logger.error("error message")
logger.critical("critical message")

# 为日志记录添加额外上下文信息
extra = {'user_id': '123', 'ip': '127.0.0.1'}
logger.info('用户操作', extra=extra)
```

### Handler

常用的处理器：

- FileHandler：将日志记录写入文件
- StreamHandler：将日志记录输出到标准输出
- RotatingFileHandler：将日志记录写入文件，当文件达到一定大小时，自动创建新的日志文件，并删除旧的
- SMTPHandler：将日志记录发送到邮件服务器
- SysLogHandler：将日志记录发送到系统日志

每个Handler都可以有自己的日志级别和格式化器。

```python
# 文件处理器
file_handler = logging.FileHandler('app.log')
file_handler.setLevel(logging.DEBUG)

# 标准输出处理器
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# 轮转文件处理器
rotating_handler = RotatingFileHandler(
    'app.log',
    maxBytes = 1024 * 1024, # 文件大小上限 1MB
    # 超过此大小时，自动创建新的日志文件
    backupCount = 5 # 保留5个日志文件，超出的自动删除
)

# 邮件处理器
smtp_handler = SMTPHandler(
    mailhost=('smtp.example.com', 587),
    fromaddr='logger@example.com',
    toaddrs=['admin@example.com'],
    subject='日志告警',
    credentials=('username', 'password')
)
smtp_handler.setLevel(logging.ERROR)
```

### Filter

可以基于日志记录的属性（如模块名，函数名）、自定义业务逻辑、特定日志模式过滤日志。

```python
class UserFilter(logging.Filter):
    """只记录特定用户的日志"""
    def __init__(self, user_id):
        super().__init__()
        self.user_id = user_id

    def filter(self, record):
        if not hasattr(record, 'user_id'): return True
        return record.user_id == self.user_id

class SensitiveFilter(logging.Filter):
    """过滤敏感信息"""
    def filter(self, record):
        sensitive_words = ['password', 'secret']
        return not any(word in record.getMessage().lower() for word in sensitive_words)

logger.addFilter(UserFilter('123'))
logger.addFilter(SensitiveFilter())
logger.addFilter(UserFilter('123'))
logger.addFilter(SensitiveFilter())
```

### Formatter

常用的格式化属性：

- %(asctime)s:时间戳
- %(name)s:日志记录器名称
- %(levelname)s:日志级别
- %(message)s:日志消息
- %(pathname)s:完整路径名
- %(filename)s:文件名
- %(module)s:模块名
- %(funcName)s:函数名
- %(lineno)d:行号
- %(process)d:进程ID
- %(thread)d:线程ID

```python
# 创建格式化器
basic_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'basic_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# JSON格式化器
class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage()class JsonFormatter(logging.Formatter):
        })

# 应用格式化器
file_handler.setFormatter(basic_formatter)
```

### 自定义日志级别

- DEBUG 10
- INFO 20
- WARNING 30
- ERROR 40
- CRITICAL 50

```python
定义介于INFO和WARNING之间的日志级别
TRACE_LEVEL = 25
logging.addLevelName(TRACE_LEVEL, 'TRACE')

def trace(self, message, *args, **kws):
    self.log(TRACE_LEVEL, message, *args, **kws)

logging.Logger.trace = trace
```

## TOML配置文件

TOML是常用的配置文件格式，文件拓展名为.toml。

TOML的基本语法是键值对，支持嵌套。

```toml
title = "Python 配置文件"

[author]
name = "zzz"
date = "2024-01-01"
pi = 3.14
is_enable = true

[app]
version = "1.0.0"

[app.dependency]
libs = ["tomllib", 'tomli']
data = [['delta', 'phi'], [3.14]]
temp_targets = { cpu = 79.5, case = 65.5 }
```

Python中`tomllib`为3.11+版本的内置库，仅支持读取TOML文件，不支持写入。

`tomli-w`为写入库。

```python
# 读取TOML文件
import tomllib

def read_toml(path):
    with open(path, 'rb') as f:
        config = tomllib.load(f)
    return config

# 写入TOML文件
import tomli_w

def write_toml(path, config_dict):
    with open(path, 'wb') as f:
        tomli_w.dump(config_dict, f)

# config_dict示例
config = {
    "app": {
        "name": "demo",
        "version": "1.0.0",
        "debug": True
    },
    "logging": {
        level: "DEBUG",
        file_path: "app.log"
    }
}
```

## Pydantic数据验证

Pydantic是基于Python类型注解的数据验证库。

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class sub(BaseModel):
    app: str
    version: str

class User(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    create_at: datetime = datetime.now()
    # 嵌套数据结构
    sub: List[sub]

# 创建实例
user = User(
    id=1,
    username='zzz',
    email='zzz@example.com',
    sub=[
        {'app': 'demo', 'version': '1.0.0'},
        {'app': 'demo2', 'version': '2.0.0'}'
    ])
# 若示例不合法，程序会抛出ValidationError异常

# 访问数据
print(user.id)

# 模型转换为字典
user_dict = user.model_dump()
# 模型转JSON
user_json = user.model_dump_json(indent=4) # 带缩进
# JSON转模型
user_obj = User.model_validate_json(user_json)
```

Pydantic验证规则：`Field`类是Pydantic提供的字段定义工具，允许为字段添加字段的约束条件、默认值和描述信息。

```python
from pydantic import Field, BaseModel, EmailStr, HttpUrl, constr, List, field_validator, model_validator

class User(BaseModel):
    name: str = Field(..., min_length=3, max_length=10) # 限制长度3-10
    username: str = Field(..., pattern ='^[a-zA-Z0-9_-]{3,10}$')
    age: int = Field(..., ge=0, le=120) # 限制范围0~120
    email: EmailStr # 邮箱格式
    url: HttpUrl # URL格式
    description: str | None = Field(None, max_length=100) # 可选

    items: List[str] = Field(..., min_items=1, max_items=5) # 限制列表长度
    tags: List[str] = Field(..., unique_items=True) # 唯一性验证
    prices: List[Float] = Field(..., gt=0) # 必须为正数

    # 字段级验证
    @field_validator('var_name')
    def validate_var_name(cls, v):
        # cls为类本身
        if not v.startswith('ORD-'):
            # return ValueError('Invalid order number')
            # 将不合法的订单号转换为合法的订单号
            return f'ORD-{v}'
        return v

    # 模型级验证：验证多个字段
    @model_validator(mode='after')
    # mode='after'：在实例化对象之后执行
    def validate_total(self):
        if self.price * self.quantity > 1000:
            raise ValueError('Total price too high')
        return self
```
