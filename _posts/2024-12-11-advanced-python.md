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

> 整理自be better coder微信公众号与Fluent Python, Second Edition。

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
```Python
def func(a, b, *, c):
    pass

func(1, 2, c=3)
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

上下文管理器基于__enter__()和__exit__(exc_type, exc_value, traceback)两个特殊方法。

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

```Python
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

Python提供3种协程：原生协程async def、经典协程yield、基于生成器的协程@types.coroutine

最主流的是由asyncio模块支持的原生协程。

**事件循环Event Loop**负责管理异步任务的调度和执行。

**协程Coroutine**是一种可以暂定和恢复的函数。通过`async def`定义协程函数，在执行过程中使用`await`挂起。

协程比线程更加轻量级，开销更低，在大规模并发场景下表现更好。

**任务Task**是封装协程的执行，通过`asyncio.create_task`创建。

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
