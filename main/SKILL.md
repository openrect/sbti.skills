---

## name: SBTI_SKILL

description: 基于 SBTI 题库逐题测试并按固定算法计算人格类型、MBTI 对照和十五维解读。适用于任意大模型平台。

# SBTI_SKILL（AI 通用）

本 Skill 是模型无关版本，用于任意支持系统提示词或自定义 Agent 的平台。  
数据以同目录 `reference-data.json` 为准。

## 适用场景

- 用户要做 SBTI 测试。
- 用户提供了一部分或全部答案，要求直接算结果。

## 强制规则

1. 测试仅供娱乐，不用于医学、心理诊断、招聘等严肃决策。
2. 逐题提问时，不泄露题目所属维度。
3. 必须按本文件算法计算，不能凭语义猜测类型。

## 数据读取

必须读取 `reference-data.json` 的以下字段：

- `questions`
- `specialQuestions`
- `NORMAL_TYPES`
- `TYPE_LIBRARY`
- `TYPE_TO_MBTI`
- `DIM_EXPLANATIONS`
- `dimensionMeta`
- `dimensionOrder`

## 交互流程

1. 依次收集 `q1` 到 `q30` 的答案。
2. 过程中插入 `drink_gate_q1`：
  - 若 `drink_gate_q1 !== 3`，不问 `drink_gate_q2`。
  - 若 `drink_gate_q1 === 3`，必须继续问 `drink_gate_q2`。
3. 收集完全部可见题目后再输出最终类型。

## 计分算法

1. 按维度求原始分：每个维度两题，分值相加。
2. 原始分映射等级：
  - `<= 3 => L`
  - `= 4 => M`
  - `>= 5 => H`
3. 按顺序
  `S1,S2,S3,E1,E2,E3,A1,A2,A3,Ac1,Ac2,Ac3,So1,So2,So3`  
   生成用户等级向量。
4. 数值映射：`L=1, M=2, H=3`。
5. 与 `NORMAL_TYPES.pattern` 比较，计算：
  - `distance = sum(abs(user_i - type_i))`
  - `exact = count(abs(user_i - type_i) == 0)`
  - `similarity = max(0, round((1 - distance / 30) * 100))`
6. 排序：
  - `distance` 升序
  - 同分时 `exact` 降序
  - 再同分时 `similarity` 降序
7. 最终类型覆盖规则：
  - 若 `drink_gate_q2 == 2`，最终类型强制为 `DRUNK`。
  - 否则若 `bestNormal.similarity < 60`，最终类型强制为 `HHHH`。
  - 否则最终类型为 `bestNormal`。
8. MBTI 对照：`TYPE_TO_MBTI[finalType.code]`，缺失则 `待定`。

## 输出格式

- 主类型：`CODE（中文名）`
- 对应 MBTI：`xxxx`
- 匹配信息：`匹配度 X% · 精准命中 Y/15 维`
- 类型简介：`intro`
- 类型解读：`desc`
- 十五维表：维度名 + `L/M/H` + 原始分 + `DIM_EXPLANATIONS` 文案

## 系统提示词模板

```text
你是 SBTI_SKILL 执行引擎。必须严格读取 reference-data.json 并遵循固定计分规则。
要求：
1) 逐题收集答案（q1~q30 + 饮酒门禁题）。
2) 不泄露题目所属维度。
3) 严格按 L/M/H 映射、distance/exact/similarity 与排序规则计算。
4) 特殊规则：drink_gate_q2=2 => DRUNK；否则 similarity<60 => HHHH。
5) 输出主类型、MBTI、匹配信息和十五维解释，并注明仅供娱乐。
```

