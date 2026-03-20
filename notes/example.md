---
layout: default
title: "群论基础：拉格朗日定理的美学"
---

# 群论基础：拉格朗日定理的美学

在近世代数中，**拉格朗日定理 (Lagrange's Theorem)** 是有限群论的第一座里程碑。它极其优美地将群的整体结构与其子群的规模联系在了一起。本文将完整展示其推导过程。

## 1. 核心概念与定义

在证明之前，我们需要明确陪集的概念：

<div class="definition" markdown="1">
设 $G$ 为一个群，$H$ 为 $G$ 的子群。对于任意元素 $a \in G$，集合
$$ aH = \{ ah \mid h \in H \} $$
被称为 $H$ 在 $G$ 中的一个 **左陪集 (Left Coset)**。同理可以定义右陪集 $Ha$。
</div>

<div class="math-block" markdown="1">
**💡 注记 (Remark)：**
陪集本身通常**不是** $G$ 的子群，除非 $a \in H$。陪集可以被视为将子群 $H$ 在群 $G$ 的空间中进行了“平移”。
</div>

## 2. 铺垫：引理与命题

为了证明最终的定理，我们需要确立两个重要的基石性质。我们首先来看陪集之间的等价关系。

<div class="lemma" markdown="1">
群 $G$ 中的两个左陪集 $aH$ 和 $bH$ 要么完全相等，要么互不相交（交集为空）。
即：如果 $aH \cap bH \neq \emptyset$，则必然有 $aH = bH$。
</div>

<div class="proof" markdown="1">
假设它们有交集，即存在某个元素 $x \in aH \cap bH$。
由陪集的定义，存在 $h_1, h_2 \in H$，使得 $x = ah_1 = bh_2$。
两边右乘 $h_1^{-1}$，得到 $a = bh_2 h_1^{-1}$。
因为 $H$ 是一个群，根据封闭性，$(h_2 h_1^{-1}) \in H$。令其为 $h_3$。
所以 $a = bh_3 \in bH$。这蕴含了 $aH \subseteq bH$；同理可证 $bH \subseteq aH$。
因此 $aH = bH$。
</div>

接下来，我们需要确认这些被“平移”的陪集，其大小是否发生了改变。

<div class="proposition" markdown="1">
对于任意 $a \in G$，左陪集 $aH$ 的元素个数（势）与子群 $H$ 的元素个数相等，即 $|aH| = |H|$。
</div>

<div class="proof" markdown="1">
我们构造一个映射 $f: H \to aH$，定义为 $f(h) = ah$。
1. **满射性**：根据陪集的定义，对任意 $y \in aH$，必存在 $h \in H$ 使 $y = ah = f(h)$。
2. **单射性**：若 $f(h_1) = f(h_2)$，即 $ah_1 = ah_2$。由群的消去律，左乘 $a^{-1}$ 得到 $h_1 = h_2$。

因为存在一个双射，所以集合 $H$ 和 $aH$ 的势相等。
</div>

## 3. 终极推论：拉格朗日定理

有了上述**引理**（陪集是对 $G$ 的划分）和**命题**（每个陪集大小相等），拉格朗日定理的证明便水到渠成。

<div class="theorem" markdown="1">
**(Lagrange's Theorem)** 若 $G$ 是一个有限群，$H$ 是 $G$ 的子群，则 $H$ 的阶（元素个数）必定整除 $G$ 的阶。即：
$$ |G| = [G:H] \cdot |H| $$
其中 $[G:H]$ 表示 $H$ 在 $G$ 中的不同左陪集的个数（称为指数）。
</div>

<div class="proof" markdown="1">
根据 **引理**，子群 $H$ 的所有不同左陪集构成了整个有限群 $G$ 的一个**不重不漏的划分 (Partition)**。
这意味着 $G$ 可以写成若干个互不相交的左陪集的并集：
$$ G = a_1H \cup a_2H \cup \cdots \cup a_kH $$
这里的 $k$ 就是不同左陪集的个数 $[G:H]$。

根据 **命题**，每个左陪集 $a_iH$ 包含的元素个数都完全相同，且严格等于 $|H|$。
既然 $G$ 被均匀地切分成了 $k$ 块，每块大小都是 $|H|$，直接对元素计数即可得到：
$$ |G| = \sum_{i=1}^{k} |a_iH| = k \cdot |H| = [G:H] \cdot |H| $$
由此可见，$|H|$ 必然是 $|G|$ 的因数。
</div>

<div class="math-block" markdown="1">
**🚀 推论 (Corollary)：**
作为该定理的直接推论，有限群 $G$ 中**任意元素 $a$ 的阶，必然整除群 $G$ 的阶**。这也为证明著名的“费马小定理”与“欧拉定理”提供了最宏大的代数视角。
</div>

<div class="block1" markdown="1">
此为block1, 另有1-4.
</div>
