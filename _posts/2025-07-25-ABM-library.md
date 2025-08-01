---
layout: post
title:  "ABM丨复现模型库 - 未完待续"
author: "Cao Zihang"
header-style: text
catalog: true
status: "Done"
mathjax: true
tags:
  - ABM
  
  
---
 <font style="font-weight: bold;">目录</font>

* 目录
{:toc}

# Party Model
> 一场鸡尾酒聚会，参与者会聚成给定数量的团体

## 模型设定
与会者若发现团体中有过多的异性就会感到不开心，进而转入其他团体

## 参数
- number: 参加者数量
- group: 聚成的团体数量
- tolerance：允许的异性比例

## 观测指标
- number happy: 开心的参与者数量
- single sex group: 单性别团体数量

## 拓展
- 增加属性类别，如年龄、职业等
- 异质个体容忍度
- 复杂的容忍规则
- 允许子群组存在
- 增加对群组的规模限制

# Traffic Basic
> 该模型模拟高速公路上的车辆，每辆汽车看到前方有车则会减速，看到前方没有车就会加速。该模型模拟了在没有交通事故等情况下如何导致堵车的。

## 模型设定

道路被设定为环路，每辆车到达右端后会从左端重新出现。每辆车会被初始化一个随机位置和随机速度，一些车会有较小的初速度，它们成为堵车的种子。
每辆汽车看到前方有车则会减速，看到前方没有车就会加速。初始速度比较慢的车会导致后面的车随之降速，进而发生拥堵。

## 参数
- number of cars 车辆数量
- acceleration 加速度
- deceleration 减速度

## 观测指标
- 当前最快的车速
- 当前最慢的车速
- 指定车（0号车 - 标红）的实时车速

## 拓展
- 复杂的加减速规则
	- 不同车辆有异质的速度规则
	- 非对称的加速和减速规则
- 多车道

## 相关模型
- Traffic Basic Utility 为每辆车添加效用函数
- Traffic Basic Adaptive 加速规则要求所有汽车尝试保持流畅的交通
- Traffic Basic Adaptive Individuals 加速规则要求每辆汽车单独尝试保持流畅的交通
- Traffic 2 Lanes 采用双车道
- Traffic Intersection 通过单个十字路口的车流
- Traffic Grid 车流在城市网络中流动，每个十字路口具有红绿灯
- Traffic Grid Goal 在Traffic Grid基础上，让每辆车具有行动目的地
- Gridlock HubNet 允许学生们实时控制交通信号灯的Traffic Grid
- Gridlock Alternate HubNet 允许学生进入代码并绘制自定义指标的Gridlock HubNet

# Wolf Sheep Predation
> 该模型旨在探索捕食者-猎物生态系统的稳定性。
> 若该系统中存在一个或多个物种灭绝，则称该系统不稳定。

## 模型设定

### Sheep-Wolves版本
狼和羊在陆地上随意漫游，狼狩猎羊。狼每个时间步都会消耗能量，它必须捕猎羊来补充能量，否则就会被饿死。
狼和羊在每个时间步有固定的概率繁殖后代。
在Sheep-Wolves版本中，假设羊具有无限的食物，即不受能量限制。
> 该模型环境是不稳定的。

### Sheep-Wolves-Grass版本
该版本额外建模了Grass作为羊的能量。
羊必须通过吃草来保持自身的能量，否则就会被饿死。
草被吃掉后会在固定时间步间隔后重新生长。
该版本比Sheep-Wolves版本更加复杂，但是一般会产生一个稳定的生态系统。
该模型很接近经典的[[学术/研究方法/微分方程模型/Lotka Volterra Population Oscillation Models|Lotka Volterra Population Oscillation Models]]，但LV模型在小种群模拟中通常会低估种群灭绝的发生，而ABM模型不会。

## 参数
- model-version：选择模型版本
- initial-number-sheep: 羊群初始规模
- initial-number-wolves: 狼群初始规模
- sheep-gain-from-food: 羊每次吃草时获取的能量
- wolf-gain-from-food: 狼每次吃羊时获取的能量
- sheep-reproduce: 每个时间步羊的繁殖概率
- wolf-reproduce: 每个时间步狼的繁殖概率
- grass-regrowth-time: 草的生长间隔
- show-energy: 是否显示每个个体的能量值
- wolf-deduce-energy: 狼每个时间步扣除的能量（1个单位）
- sheep-deduce-energy: 羊每个时间步扣除的能量（1个单位）

## 观测指标
- sheep-population: 羊群数量
- wolves-population: 狼群数量
- grass-population: 草的数量

## 拓展
- 复杂化繁殖规则
- 羊会聚集
- 狼会追羊

# Boids Flockers model

## Agents
Cohesion - Separation - ALignment
- Boid
    - model: 智能体的模型实例
    - space: Boid所处的连续空间
    - speed: 每步的移动距离
    - direction: Boid移动方向的numpy向量
    - vision: Boid的视野范围
    - separation: Boid与邻居保持的距离
    - cohere: 匹配邻居位置的重要性
    - separate: 避免近邻的重要性
    - match: 匹配邻居朝向的重要性

# Model
- Boid Flockers
    - population_size: 鸟的数量
    - width: 空间宽度
    - height: 空间高度
    - speed: 移动速度
    - vision: 视野
    - separation: 鸟间最小距离
    - cohere: cohesion behavior权重
    - separate: separation behavior权重
    - match: alignment behavior权重
    - seed: 随机数种子

# Boltzmann Wealth Model

## Agents
- MoneyAgent
    - move
    - give_money

## Model
- BoltzmannWealth
    - compute_gini

# Conways Game of Life

## Agents
- Cell
    - is_alive
    - neighbors
    - determine_state
    - assume_state

## Model
- ConwaysGameOfLive

# Demographic Prisoners Dilemma On A Grid

## Agents
- PDAgent
    - is_coorperating
    - step
    - advance
    - increment_score

## Model
- 损益矩阵

# Epstein Civil Violence Model

## Agents

- CitizenState 公民状态枚举类
    - 叛乱 正常 被捕
- EpsteinAgent 公民基础行为类
    - update_neighbors
    - move
- Citizen
    - 社区内一般公民行为法则
    - hardship: 感知困难度，外生，服从U(0,1)
    - regime_legitimacy: 智能体感知政权合法性，外生，模型内一致
    - risk_aversion: 风险厌恶，外生，服从U(0,1)
    - thredhold: (grievance - (risk_aversion*arrest_probability)) > threshold叛乱
    - vision: 视野距离
    - condition: 状态
    - grievance: hardship和regime_legitimacy的函数
    - arrest_probability: 给定叛乱程度下，智能体对被捕概率的评估
- Cop
    - 警察被是定位永远忠诚的
    - 行为准则：检查视野的居民，从中随机捕获一个智能体
    - unique_id: 警号
    - x, y: 坐标
    - vision: 视野
    - max_jail_term: 最大刑期

## Model
- EpsteinCivilViolence

# Schelling Segregation Model
## Agents
- SchellingAgent
    -step

## Model
- Schelling
    - density: 网络中智能体密度
    - minority_pc: 少数族裔比例
    - radius: 邻居检索半径

# Virus On A Network

## Agents
- State 智能体状态枚举类
    - 正常人 - 感染者 - 免疫者
- VirusAgent
    - initial_state: 初始状态
    - virus_spread_chance: 传染概率
    - virus_check_frequency: 感染者状态检查频率
    - recovery_chance: 恢复概率
    - gain_resistance_chance: 获得免疫概率

## Model
- VirusOnNetwork
    - num_nodes: Number of nodes in the network
    - avg_node_degree: Average number of connections per node
    - prob: 节点之间存在边的概率
    - initial_outbreak_size:Number of nodes initially infected

# Sugarscape Constant Growback Model With Traders

## Agent
- Resource: 资源智能体每时间步会生长一单位糖或香料，直到达到最大量
    - Resource可以被收获或交易
- Traders: 具有5个属性1.糖消耗2.香料消耗3.视野4.初始糖禀赋5.初始香料禀赋
    - 若它们耗尽了糖或香料会死亡
- Traders移动规则M
    - Traders的行为是搜索未占领的区域-识别这些区域中产出最大的（使用柯布道格拉斯函数）
    - 移动并收集资源
- Traders交易规则T
    - 智能体与潜在交易者计算它们的边际替代率MRS_(糖，香料)，若相等则终止交易
    - 香料从高边际替代率的智能体流向低边际替代率的智能体，糖反向交易
    - 价格p使用智能体MRS的几何平均
    - 若p>1则使用p单位的香料交易1单位的糖；若p<1使用1/p单位的糖交易1单位的香料
    - 交易的条件是对双方均有益（增加MRS），且双方MRS不会交叉（即至多交易到相等）
    - 交易会不断持续，直到所有条件被满足

## Model
- SugarscapeModel
