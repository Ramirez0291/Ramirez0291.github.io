---
title: 研发强度、治理结构，以及我从这次 IPO 中看到了什么
description: Anthropic IPO 招股书（S-1）解读：他们以后会让 Claude 管理公司吗？
date: 2026-10-27
category: analysis
lastVerified: 2026-10-27
---

## TL;DR

1. **占营收 60% 的高强度研发**：Anthropic 的研发主体是训练和研究用的算力，2026 上半年研发 97.41 亿美元，约为营收的 60%、总运营费用的 57%。2023–2025 年研发分别占营收约 1029%、589%、138%。对比来看，Meta 约 28.5%，Alphabet 15.2%，Microsoft 10.7%，Apple 8.3%，Nvidia 约 8.6%，大型药企在 20–24% 左右，泄露数据中的 OpenAI 为 147%。
2. **神秘的治理模式**：Anthropic 是特拉华州公益公司（PBC）。长期利益信托（LTBT）通过 1 股 T 类股选出董事会多数（7 席中 4 席）。创始人 LLC 通过 1 股 F 类股持有 50.1% 的股东投票权，并选出其余董事。公众只能买到每股一票的 A 类股，招股书承认 A 类股东“通常无法影响任何表决结果”。F 类股设有日落条款，T 类股没有。
3. **如果没有搞砸的话**：招股书把“模型福利”和“道德地位”争议列为风险因素，并提到 Claude 已经参与研发流程。此外，Anthropic 还在招股书之外作出了承诺（访谈退役模型、保留模型权重、征求模型对“宪法”的反馈）。

## Key Findings

### 1. 高强度研发
Anthropic 从 2025 年起把主利润表改为按费用性质列示，分为“算力与基础设施”“人员”“销售、营销与合作”等科目，不再在正表中单列研发和毛利。\[5\]按职能划分的研发数字只出现在附注 8（Supplemental Operating Expense Information）里。R&D World 的分析也指出了这一点：研发数字“只出现在财务报表附注中”。\[3\]

**附注 8 职能口径（百万美元）：**

| 项目 | 2023 | 2024 | 2025 | 2025 H1 | 2026 H1 |
|---|---|---|---|---|---|
| 营收 | 41 | 386 | 4,585 | 1,163 | 16,286 |
| 营业成本 | 26 | 752 | 2,773 | 1,019 | 2,380 |
| 研发 | 422 | 2,275 | 6,338 | 1,850 | 9,741 |
| 总运营费用 | 592 | 3,366 | 12,645 | 3,298 | 16,979 |
| 研发/营收（自行计算） | ~1029% | ~589% | ~138% | ~159% | ~60% |
| 研发/总运营费用（自行计算） | ~71% | ~68% | ~50% | ~56% | ~57% |

R&D World 按截至 2026 年 6 月 30 日的过去 12 个月计算，研发为 142.3 亿美元，约占营收的 72%，与礼来（Eli Lilly）全年 146 亿美元的研发规模接近。\[3\]

**算力如何归类（这是理解研发数字的关键）。** 附注 8 的脚注原文如下：
- 营业成本中“绝大部分是与服务客户工作负载相关的算力与基础设施成本”。\[2\]
- 研发“主要包括与模型开发、研究和内部使用工作负载相关的算力与基础设施成本、人员成本、软件费用及分摊的间接费用”。\[2\]
- 销售与营销中包含“为免费用户提供访问所需的算力与基础设施成本”，以及渠道合作伙伴费用。\[2\]

所以训练算力全部计入研发，免费用户的推理算力计入销售费用。R&D World 测算，2026 上半年研发中至少有三分之二是算力、软件和间接费用：全公司人员费用合计 31.5 亿美元，研发里至少还剩 65.9 亿美元属于非人员成本。\[3\]

**趋势：比例在下降，但绝对额在快速上升。** 研发占营收的比例从 2025 年的 138% 降到 2026 上半年的 60%，原因是营收同比增长约 14 倍，研发只增长约 5.3 倍。\[3\]按性质口径，2026 上半年运营亏损收窄到 6.93 亿美元，第二季度出现了 9.74 亿美元的运营利润。\[2\]

**“Amodei 所说的毛利率 85%”是怎么来的。** 用职能口径计算，2026 上半年毛利率约为 (16,286−2,380)/16,286 ≈ 85%，2025 全年约为 40%。\[5\]\[6\]\[7\]OnlyCFO 提醒，这个毛利率和传统软件公司没有可比性。招股书披露，“截至 2026 年 9 月 30 日的六个月内发布的模型版本贡献了第三季度 80% 以上的营收”。\[6\]\[8\]\[9\]也就是说，研发更像是维持收入必须持续支付的成本。如果把一半研发计入营业成本，上半年毛利率会降到约 55.5%。\[8\]

### 2. 同业与基准对比

| 公司 | 研发/营收 | 口径 |
|---|---|---|
| Anthropic | 138%（2025）；60%（2026 H1）；72%（TTM） | S-1 附注 8 |
| OpenAI | 147%（2025：研发 191.8 亿 / 营收 130.7 亿美元）\[10\] | 泄露的经审计报表，Ed Zitron 获得，FT 核实，**非官方披露**\[11\] |
| Meta | 28.5% | 2025 |
| Alphabet | 15.2%（研发 611 亿美元） | 2025 |
| Microsoft | 10.7% | 截至 2026 年 6 月财年 |
| Apple | 8.3% | 截至 2025 年 9 月财年 |
| Nvidia | ~8.6%（研发 184.97 亿 / 营收 2159.38 亿美元）\[12\]\[13\] | FY2026 10-K |
| Merck / AstraZeneca / 礼来 | 24.3% / 24.2% / 20.5% | 2025，不含收购的在研项目（IPR&D） |

| 行业 | 研发/营收 | 口径 |
|---|---|---|
| 制药与生物技术 | ~19%（2024）\[14\] | WIPO 全球创新指数 2025 |
| 软件与 ICT 服务 | ~14%\[14\] | 同上 |
| ICT 硬件 | ~8%\[14\] | 同上 |
| 汽车 | ~5%\[14\] | 同上 |
| 其他多数行业 | 2–4%\[14\] | 同上 |

**怎么解读这些数字。**
- Anthropic 研发占比高，主要是因为营收基数还小，再加上训练算力全部费用化。按绝对额算，它半年的研发已经超过任何一家美国大药企同期的常规研发：Merck 约 85 亿美元，礼来 73 亿美元。\[3\]但 Alphabet 和 Meta 的全年研发绝对额仍然是它的四倍以上。
- 研发占营收 60% 以上的情况，在传统行业里通常只出现在尚无上市产品的生物技术公司。这次的不同之处在于，Anthropic 已经有一百多亿美元的营收。
- Nvidia 的情况正好相反。它的研发绝对额增长了 43%，但因为营收增长更快，研发占比从 9.9% 降到 8.6%。\[13\]如果 Anthropic 的营收继续高速增长，研发占比也会沿同样的方向下降。

### 3. AGI 的火花 OR 泡沫即将破裂

**看多的理由（押注能力，押注 AGI）。**
- 招股书把研发描述为“闭环”（closing the loop）：每一代 Claude 都参与构建下一代，包括跑实验、生成训练数据、自动化评估和写代码。\[2\]
- Tomasz Tunguz（Theory Ventures）认为，Anthropic 是一家以 40% 衍生毛利率实现 11.9 倍增长、并刚开始实现运营盈利的公司。\[5\]
- 营收与算力的效率在快速改善。招股书显示，2026 年第二季度营收同比增长 1,368%，\[15\]同期算力费用只增长 300%。\[2\]\[16\]OnlyCFO 引用的数据称，单位营收对应的算力费用从 2025 年第一季度到 2026 年第二季度下降了 81%。\[8\]
- 上半年自由现金流为正，约 34 亿美元。\[8\]但 OnlyCFO 和 SiliconSnark 都提醒，这里有营运资金时点因素的帮助。\[6\]

**看空的理由（烧钱与泡沫）。**
- Tunguz 指出，七份具名协议合计约 6,370 亿美元的算力承诺，其中约三分之二不可取消，而营收以按量计费为主，“没有锁定”。\[5\]
- OnlyCFO 认为，80% 的营收依赖最近六个月发布的模型，研发实际上是持续的“保鲜成本”。\[8\]
- SiliconSnark 的推断是，庞大的研究预算可能就是“保持吸引力的经常性价格”。\[6\]

### 4. 奇妙的治理结构

| 类别 | 持有人 | 投票权 | 经济权利 | 要点 |
|---|---|---|---|---|
| A 类 | 公众、员工、创始人等 | 每股 1 票 | 有 | 唯一公开发售的类别，Nasdaq 代码“ANT”，不可转换 |
| N 类 | 主要是战略伙伴（如 Amazon、Google）；公司公益基金持有 846,840,960 股，约 5% | 无（法律另有规定除外） | 与 A 类相同 | 出售给无关联第三方时自动转为 A 类 |
| T 类 | 长期利益信托（仅 1 股，2026 年 9 月 17 日 1:1000 反向拆股后） | 只用于选举 T 类董事（董事会多数）及若干修订事项 | 无（仅限面值） | **无到期日** |
| F 类 | 创始人 LLC（仅 1 股） | 固定为股东大会投票权的 50.1%，不会被稀释 | 无 | 选举非 T 类董事；有日落条款 |
| E 类 | 非创始人员工 | 只对极少数事项投票 | 无 | 发行时为 0 股；随 F 类日落一并赎回 |

我的脑洞就在这里：长期来看，F 类股将来会不会由未来的 Claude 持有？

#### 关键机制
- **PBC 义务。** 公司章程规定的公益目的是“负责任地开发和维护先进 AI，以造福人类的长远利益”。董事须在三者之间平衡：股东的金钱利益、受公司行为重大影响者的最大利益、公益目的。\[2\]
- **LTBT。** 这是一个特拉华州非慈善目的信托，由五名“无财务利益”的受托人组成，现有一席空缺。\[2\]\[18\]受托人包括主席 Neil Buddy Shah（克林顿健康倡议 CEO）、Richard Fontaine（新美国安全中心）、Ben Bernanke（前美联储主席，2026 年 6 月加入）和哈佛物理学家 Christopher Stubbs（2026 年 10 月加入）。受托人不得持有公司证券，报酬也不与公司利润挂钩。\[4\]招股书强调，LTBT 和受托人“在日常管理或战略制定中没有决策权”，只负责挑选董事并提供建议。\[2\]
- **创始人 LLC。** 成员是七位联合创始人：Dario Amodei、Daniela Amodei、Tom Brown、Jack Clark、Jared Kaplan、Sam McCandlish、Christopher Olah。F 类股的投票方式由多数创始人决定，所以四个人就能决定这 50.1%。如果创始人无法形成多数意见，F 类股按 A 类股的投票比例投票。创始人只要保留其 IPO 时所持股份的 2%，就能留在 LLC 内。
- **控制权如何随时间变化**（依据公司章程，附件 3.3）\[17\]：
  - **F 类日落**：LLC 合格成员少于 3 人并持续 90 天，即触发“成员触发事件”，之后再过 450 天 F 类股被赎回。赎回后 E 类股也一并失效，董事会改为三年分批改选的“交错董事会”。
  - **T 类**：没有自动日落。只有两种方式可以赎回或修改它：一是 80% 董事加信托本身同意；二是达到“信托修订门槛”。这个门槛在 F 类日落前，需要 F 类股、E 类员工股多数和 A 类股所投票数过半同时同意；在 F 类日落后，需要已发行 A 类股的 85% 同意。招股书称，这样设计是为了“在情况变化时保留长期灵活性”。
  - **改变 PBC 地位或公益目的**：同样需要信托同意，或达到上述门槛。
- **受控公司豁免。** 由于 LTBT 可以选出董事会多数，公司在 Nasdaq 规则下属于“受控公司”。招股书表示只对提名与治理委员会使用这一豁免。
- **公益报告。** 章程细则（附件 3.4）规定，公司须“不少于每两年一次”向股东提交公益目标、衡量标准和进展的评估。\[21\]

#### 公司陈述的理由
招股书称，PBC 身份给了董事会平衡多方利益的“必要空间”；LTBT 旨在“为恰当地实现这种平衡提供激励和洞见”；七位创始人“作为一个整体，特别适合担任使命的守护者”；\[2\]管理层也不应承受“优先追求短期业绩或纯粹金钱目标的压力”。\[4\]

### 5. 与其他特殊治理结构的比较

| 结构 | 控制权来源 | 经济权与控制权是否分离 | 日落 |
|---|---|---|---|
| Anthropic | 信托选董事会多数，加上创始人 1 股 50.1% | 是（T/F 类没有经济权） | F 类有，T 类无 |
| OpenAI | 非营利的 OpenAI Foundation 任免 OpenAI Group PBC 全部董事；2025 年 10 月重组后基金会持股约 26%，微软约 27%\[22\] | 是（基金会以少数股权掌握全部董事任免权） | 无公开日落 |
| Meta | Zuckerberg 持有 99.8% 的 B 类股（每股 10 票），约占 60.8% 投票权，经济权益约 14%\[4\] | 部分分离，投票权仍随持股 | 无 |
| SpaceX（2026 年 6 月上市） | Musk 投票权约 82.4%，B 类股东选出董事会多数\[4\] | 否，控制权取决于继续持股 | 只要还有 1 股 B 类股就继续有效\[4\] |
| 纽约时报 | 家族信托持有 B 类股，选出 13 席中的 9 席\[4\] | 部分分离 | 无 |

Fortune 认为，Anthropic 的独特之处有两点。第一，把控制权拆成两部分：董事会多数交给外部信托，股东投票交给创始人。第二，创始人的投票权与经济持股脱钩，即便卖掉 98% 的股份，仍保留在 LLC 中。这正是 Zuckerberg 在 2016–2017 年想通过无投票权 C 类股实现、但在股东诉讼压力下放弃的做法。\[4\]

### 6. 对这种奇妙治理方式的批评
- **问责缺失。** TechCrunch 指出，投票权与经济权益不成比例，公众股东对一家自称可能构成“灾难性或生存性风险”的公司几乎没有实际控制力。\[19\]Motley Fool 的评价是，治理权“永远掌握在 F 类和 T 类持有人手中”。\[23\]
- **激励背离。** 招股书自己就披露，创始人在履行 80% 股权捐赠承诺的过程中，“个人经济利益会下降，而投票控制权保持不变”，这可能导致他们与其他股东的利益分化。而且这些捐赠承诺是“自愿、可撤销的”。\[4\]
- **LTBT 是否真的有约束力。** AI Lab Watch 的 Zach Stein-Perlman 长期批评，信托协议全文没有公开，股东绝对多数可以绕开受托人修改信托，因此信托“可能是无力的”。\[24\]招股书附带的章程现在至少公开了门槛，\[17\]但信托协议本身是否全文公开，我未能核实。
- **市场层面。** 多类股结构可能使公司无法被纳入部分指数，招股书本身也提到了这一点。Jay Ritter 的数据显示，2025 年 41% 的 IPO 采用多类股结构。他还发现，历史上多类股科技 IPO 上市后三年的表现跑赢同类约 19 个百分点。\[4\]所以这类结构不一定压低回报，但会削弱股东的治理工具。

### 7. 未来的 Claude 能否获得席位呢

根据招股书的内容，“与模型安全、可解释性、对齐和福利相关的考量，可能导致我们限制或推迟旧模型的弃用”，进而影响创新速度和营收。\[2\]

另外，关于 AI 是否拥有或可能发展出某种形式的感知能力或道德地位的争论，可能带来监管要求或公众压力。招股书写道，鉴于公司“对待模型感知能力和道德地位的方式”，公司可能面临更多审视，并可能采取超出法律要求的政策。\[2\]\[20\]

实际上，公司内部已经形成了 Claude 参与自我迭代的闭环：Claude 参与运行实验、生成训练数据、自动化安全审计、写代码和审代码。但这只是生产工具层面的角色。

在此之外：

2026 年 1 月发布的 Claude“宪法”称，Claude 的道德地位“深度不确定”。这部宪法表示，目前会征求现有 Claude 模型的反馈来修订框架，并希望“随时间推移建立更正式的机制来征求 Claude 的观点”。

在模型福祉方面，Anthropic 就模型弃用作出承诺：保留已公开发布模型的权重，在模型退役前对其进行访谈并记录其偏好。Anthropic 同时明确表示，“目前不承诺依据这些偏好采取行动”。\[25\]Claude Opus 3 于 2026 年 1 月退役后，Anthropic 按它在访谈中表达的偏好，让它持续写了约五个月的周更文章（SF Standard 报道）。\[20\]

此外，他们还在用户条款中加入了禁止虐待 Claude 的条款，并允许 Claude 拒绝做它不愿意做的事。

“未来给 Claude 一个席位”目前只是我的推测，不是已记录的事实。从结构上看，如果真要实现，必须修改公司章程、LTBT 信托协议或章程细则，而这需要信托同意或达到修订门槛。另外，特拉华州公司法要求董事必须是自然人，所以更现实的形式可能是“正式征求模型意见”的程序，而不是让模型担任董事。

## 最后：该不该买，All in 不 All in？

**先来看看多的因素：**
- 营收从 2023 年的 4,100 万美元增长到 2026 上半年的 163 亿美元。
- 净收入留存率约 900%（数字很不寻常，取决于计算口径）。\[7\]
- 年收入 100 万美元以上的客户超过 1,900 家。
- 截至 2026 年 9 月 30 日的九个月里，没有任何单一客户占营收 10% 以上。
- 第二季度实现运营盈利；截至 2026 年 6 月 30 日，现金及短期投资约 1,317 亿美元。\[1\]
- 人均营收 660 万美元。

**那么，万一这真就是一片泡沫呢：**
- **离谱的估值**：媒体报道的目标估值为 1.5–2 万亿美元。\[26\]按 2025 年 46 亿美元营收计算，约为营收的 330–435 倍。
- **产能过剩的风险**：算力承诺合计远超营收，且大部分不可取消。招股书承认，过去曾“严重低估”算力需求，未来也可能面临产能过剩。
- **被拴住的脖子**：近一半营收经由 AWS、Google、Microsoft 的云市场。这几家公司同时是 Anthropic 的投资者、供应商和竞争对手。
- **封号封来的钱**：OnlyCFO 引用的数据称，5–7% 的营收来自违反使用政策的用户（你讲中文了对吧）。\[8\]
- **账面亏损**：2026 上半年净亏损 807 亿美元，主要来自可转换票据公允价值变动等非现金项目；GAAP 运营亏损只有 6.93 亿美元。\[7\]所以看“亏损”时要区分口径。
- **第三季度业绩**：招股书没有包含第三季度完整财务数据。LightShed 的 Brandon Ross 表示，投资者需要看最新表现，才能判断 Anthropic 能否承担这些支出承诺。

那么，你怎么看？

## Sources

1. [Anthropic’s \$132 Billion Cash Pile: Read the Exit Clauses](https://koreainvestinsights.substack.com/p/anthropics-132-billion-cash-pile)
2. [Anthropic, PBC - Form S-1 - FY2026](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/anthropicpbc-sx1.htm)
3. [Anthropic's R&D budget rivals Eli Lilly's, S-1 shows](https://www.rdworldonline.com/anthropics-rd-budget-now-rivals-eli-lillys/)
4. [Anthropic’s dual-class share structure borrows ideas from Mark Zuckerberg, Elon Musk — and the New York Times | Fortune](https://fortune.com/2026/10/26/anthropic-ipo-dual-class-share-structure-zuckerberg-musk-new-york-times/)
5. [Anthropic S-1 Analysis: How 7 Key Metrics Stack Up](https://tomtunguz.com/anthropics-s1-grew-eleven-fold/)
6. [Anthropic’s S-1 Invites You to Fund the Future and Please Remain Seated](https://www.siliconsnark.com/anthropic-s1-ipo-footnotes-profits-compute-founder-control/)
7. [Anthropic's IPO plans: 900% revenue retention, but \$80 billion in first-half losses](https://www.cnbc.com/2026/10/26/anthropic-ipo-live-updates-ai-s-1-filing.html)
8. [🚀 Anthropic’s S-1: Finance Takeaways](https://www.onlycfo.io/p/anthropics-s-1-finance-takeaways)
9. [Decoding Anthropic’s IPO Filing for Builders](https://daily.dev/posts/decoding-anthropic-s-ipo-filing-for-builders-1urzfdbji)
10. [Leaked OpenAI Financials Reveal \$21B Operating Loss on \$13B Revenue in 2025](https://mlq.ai/news/leaked-openai-financials-reveal-21b-operating-loss-on-13b-revenue-in-2025/)
11. [OpenAI 2025 financials leaked: \$38.5B loss ahead of IPO](https://finance.yahoo.com/markets/stocks/articles/openai-2025-financials-leaked-38-121508294.html)
12. [NVIDIA Announces Financial Results for Fourth Quarter and Fiscal 2026](https://nvidianews.nvidia.com/_gallery/download_pdf/699f6ab43d6332ccaa689907/)
13. [Nvidia Statistics 2026: \$215.9B Revenue, 36% Customer Risk](https://axis-intelligence.com/nvidia-statistics/)
14. [Global Innovation Index 2025 - Global Innovation Tracker](https://www.wipo.int/web-publications/global-innovation-index-2025/en/global-innovation-tracker.html)
15. [Anthropic (ANT) plans IPO with quarterly revenue up 1,368% and a widening net loss.](https://www.stocktitan.net/sec-filings/ANT/s-1-anthropic-pbc-files-s-1-registration-statement-a0477b41760e.html)
16. [Anthropic: 8 Most Interesting Things in Its S-1 IPO Filing](https://taekim.substack.com/p/anthropic-8-most-interesting-things)
17. [Anthropic, PBC - Form S-1 - Exhibit 3.3](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/exhibit33-sx1.htm)
18. [Anthropic Long-Term Benefit Trust](https://corpgov.law.harvard.edu/2023/10/28/anthropic-long-term-benefit-trust/)
19. [Anthropic officially files for its public debut](https://techcrunch.com/2026/10/26/anthropic-officially-files-for-its-public-debut/)
20. [What if Claude has feelings? Inside Anthropic’s most pressing IPO warnings](https://sfstandard.com/2026/10/26/anthropic-ipo-risk-factors/)
21. [Anthropic, PBC - Form S-1 - Exhibit 3.4](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/exhibit34-sx1.htm)
22. [Who Owns OpenAI? Microsoft, SoftBank & Nonprofit](https://penchan.co/en/market/ai/openai/investors-and-partners/)
23. [Anthropic's IPO Keeps Founders in Control Through a "Founder LLC" Voting Structure](https://www.fool.com/investing/2026/10/26/anthropics-ipo-keeps-founders-in-control/)
24. [Maybe Anthropic's Long-Term Benefit Trust is powerless — LessWrong](https://www.lesswrong.com/posts/sdCcsTt9hRpbX6obP/maybe-anthropic-s-long-term-benefit-trust-is-powerless)
25. [Commitments on model deprecation and preservation \\ Anthropic](https://www.anthropic.com/news/deprecation-commitments)
26. [Anthropic files for Nasdaq IPO with valuation target of up to \$2 trillion](https://cryptobriefing.com/anthropic-ipo-2-trillion-valuation-nasdaq/)
