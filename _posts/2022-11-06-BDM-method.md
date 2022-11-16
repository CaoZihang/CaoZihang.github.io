---
layout:       post
title:        "识别消费者支付意愿：The Becker-DeGroot-Marschak Mechanism 1964"
author:       "Cao Zihang"
header-style: text
catalog:      true
status:		  Done
tags:
    - 研究方法
---
# BDM机制

## 一、简介
1964年由Gordon M. **Becker**，Morris H. **DeGroot**，Jacob **Marschak**三人于Behavioral Science发表的论文《**Measuring utility by a single‐response sequential method**》提出[^1] 。

BDM是用于识别消费者愿意接受的**最低报价**的一种激励相容机制（incentive-compatible procedure）

*【复习】激励相容：通过机制设计，使行为人追求个人利益最大化的行为，恰好与实现集体利益最大化的行为一致*

目前是行为经济学测量支付意愿的常用手段之一。

2002年BDM首次被用于市场营销领域。[^2]

## 二、操作方法
### （一）常用程序
1. 要求被试进行一次出价（Bid）
2. 由实验员从服从某一分布的随机发生器中抽取一个价格（Price）
3. 若出价（Bid）高于随机抽取价格（Price），则消费者可以以**抽取的价格**（Price）购买商品；否则不能购买商品

```
输入Bid
随机抽取Price
If Bid ≥ Price：
	以Price购买
else：
	拍卖失败，终止【不得重新报价】
```

### （二）变体
1. 向被试呈现一系列递增/随机排列的货币数量
2. 被试选择金钱OR商品
3. 随机/由实验员指定呈现一个价格
4. 若该价格低于被试选择物品的最低价格，被试必须以该价格购买商品

```
生产一系列价格Bundle
Bid = MAX(Bundle)+1
for i in Bundle：
	flag = 被试选择 i OR Item
	if flag == i And flag < Bid:
		Bid = flag
生成Price
If Bid ≥ Price：
	以Price购买
else：
	终止拍卖
```

## 三、本质
本质上是Vickrey auction的变体，支付最高价者以第二高价格获取商品。
当且仅当竞拍者以自己对商品的真实估值进行报价，是Vickrey拍卖博弈中唯一的占优策略。

**当消费者支付意愿存在不确定时，拍卖的激励相容性不再成立**

----

[^1]:Becker, G. M., DeGroot, M. H., & Marschak, J. (1964). Measuring utility by a single‐response sequential method. _Behavioral science_, _9_(3), 226-232.
[^2]: Wertenbroch, K., & Skiera, B. (2002). Measuring consumers' willingness to pay at the point of purchase. _Journal of marketing research_, _39_(2), 228-241.
