import type { Lang } from '../i18n';

export const repo = 'https://github.com/Ramirez0291/graph-workflow';
const roles = ['Human', 'Main', 'Tester', 'Main', 'Coder', 'Main', 'Punk', 'Human'];
const files = ['PRD.md · gate-0.md', 'brief-N.md', 'test-plan-N.md', 'visible/ · holdout/', 'handoff-N.md', 'diff · test results', 'objections-M.md', 'gate-M.md'];

const content = {
  zh: {
    title: '让 Agent 分工，让规则把关。',
    intro: '一个把产品规划、测试、实现和审查串起来的开发工作流。Main 掌握全局，其他角色独立工作；你在计划和里程碑处做决定。',
    explore: '沿着一次交付，看看团队怎么工作', hint: '点击编号节点，查看职责与交付物。',
    back: '返回工具与项目', source: '查看源码', read: '读开发复盘',
    previous: '上一说明', next: '下一说明', output: '交付物', guard: '放行条件',
    legend: ['当前步骤', '执行顺序', '人工决策'],
    summary: '任务可以自动推进，产品取舍仍由你决定。',
    loop: 'Gate 2 按任务重复：测试或审查未通过，就回到修正；到达里程碑后，再进入 Punk 审查与人工验收。',
    engine: '脚本管顺序，文件记住进度',
    engineDesc: 'gw.py 检查步骤、文件范围和测试锁；drive.py 在自动运行模式下调度新的 Claude Code 会话。角色交接的依据保存在 Git 里的 docs/workflow/。',
    why: '把容易被忽略的约束，变成可检查的边界',
    features: [
      ['01 / context', '一个 Main 保留完整判断', '产品、架构和代码审查由同一个角色负责，减少反复交接时丢掉的意图。'],
      ['02 / tests', '先出题，再写实现', 'Tester 先写测试。Coder 只拿到可见测试，隐藏测试隔离保存，测试内容通过 SHA-256 锁定。'],
      ['03 / isolation', '实现有自己的工作区', 'Coder 在独立 Git worktree 里工作，修改范围受文件白名单约束。新增防御逻辑必须说明理由。'],
      ['04 / product', '让 Punk 看实际产品', 'Punk 依据 PRD 和运行截图提出异议，不读源码。测试通过之后，仍要检查用户会碰到什么。'],
    ],
    start: '从一个有验收目标的项目开始',
    startDesc: '这是在本地开发环境中使用的工作流。先阅读仓库中的安装与 Quick Start，再让 Main 整理需求、边界情况和任务计划。自动驱动模式使用 Claude Code CLI。',
    install: '安装与使用文档', note: '流程图是核心路径的简化说明，不代表正在运行的 Agent。具体命令和约束以仓库文档为准。',
    steps: [
      ['确认计划', '你确定要做什么，以及哪些边界情况不能让模型替你决定。Main 把这些整理成 PRD 和计划。', 'Gate 1：有争议的边界情况由 CEO 明确确认。'],
      ['拆出任务', 'Main 将已批准的计划拆成任务，写清目标、允许修改的文件和验收要求。', '任务 brief 必须说明风险所在的层。'],
      ['先写测试', 'Tester 从 brief 出发，独立编写可见测试和隐藏测试。此时实现还没有开始。', '测试方案先接受审查；隐藏测试不交给 Coder。'],
      ['检查测试方案', 'Main 检查测试是否验证了需求，是否覆盖风险层，再允许实现开始。', '锁定测试与任务范围，避免实现反过来改写标准。'],
      ['隔离实现', 'Coder 在自己的 worktree 中实现任务，运行可见测试，并提交交接说明。', '只修改允许的文件，列出新增的防御逻辑。'],
      ['验收与审查', 'Main 检查 diff、验收结果和过度防御。通过后合并任务，继续下一项。', '失败就修正；隐藏测试泄露后需要作废并重新设计。'],
      ['检查真实体验', '到达里程碑后，Punk 看 PRD 与实际运行截图，指出产品和交互问题。', '按严重程度记录异议，供 Main 处理和人工决策。'],
      ['亲手试用', '你试用里程碑成果，阅读一页验收材料，确认是否进入下一阶段。', 'Gate 3：明确批准；被移除、隐藏或移动的功能必须披露。'],
    ],
  },
  en: {
    title: 'Give agents roles. Give rules teeth.',
    intro: 'A development workflow connecting planning, tests, implementation and review. Main keeps the whole picture; other roles work independently. You decide at plan and milestone gates.',
    explore: 'Follow a delivery through the team', hint: 'Select a numbered node to inspect its responsibilities and output.',
    back: 'Back to tools & projects', source: 'View source', read: 'Read the build retrospective',
    previous: 'Previous note', next: 'Next note', output: 'Output', guard: 'Release condition',
    legend: ['Selected step', 'Execution order', 'Human decision'],
    summary: 'Tasks advance automatically. Product decisions stay with you.',
    loop: 'Gate 2 repeats per task: failed tests or reviews lead to corrections. Punk review and human acceptance follow at milestone boundaries.',
    engine: 'Scripts enforce order. Files preserve state.',
    engineDesc: 'gw.py checks step order, file scope and test locks. In automated mode, drive.py dispatches fresh Claude Code sessions. Handoffs persist in Git under docs/workflow/.',
    why: 'Turn overlooked constraints into checkable boundaries',
    features: [
      ['01 / context', 'One Main keeps the whole picture', 'Product, architecture and code review stay with one role, reducing intent lost in repeated handoffs.'],
      ['02 / tests', 'Write tests before implementation', 'Tester works first. Coder receives visible tests only; held-out tests stay isolated, with SHA-256 locks protecting test content.'],
      ['03 / isolation', 'Implementation gets its own workspace', 'Coder works in a separate Git worktree with an allowed-file scope. Every added defensive mechanism needs a reason.'],
      ['04 / product', 'Punk inspects the actual product', 'Punk reviews the PRD and live screenshots, without source code. Passing tests still leaves the user experience to inspect.'],
    ],
    start: 'Start with a project and an acceptance goal',
    startDesc: 'This workflow runs in your local development environment. Read the repository installation guide and Quick Start, then have Main prepare requirements, edge cases and a task plan. Automated driving uses the Claude Code CLI.',
    install: 'Installation & usage', note: 'This diagram simplifies the core path; it is not a live agent monitor. The repository documents the current commands and constraints.',
    steps: [
      ['Approve the plan', 'You decide the goal and resolve product ambiguities. Main captures them in the PRD and plan.', 'Gate 1: the CEO explicitly resolves disputed edge cases.'],
      ['Brief the task', 'Main turns the approved plan into tasks with goals, allowed files and acceptance criteria.', 'The brief identifies the layer most likely to fail.'],
      ['Write tests first', 'Tester independently writes visible and held-out tests from the brief, before implementation begins.', 'Review the test plan; keep held-out tests away from Coder.'],
      ['Check the test plan', 'Main checks requirement coverage and the risk layer before implementation starts.', 'Lock tests and scope so implementation cannot redefine acceptance.'],
      ['Implement in isolation', 'Coder implements in a separate worktree, runs visible tests and writes a handoff.', 'Stay within allowed files and declare added defenses.'],
      ['Accept and review', 'Main checks the diff, acceptance results and over-defense. Merge passing tasks and continue.', 'Correct failures; exposed held-out tests must be burned and redesigned.'],
      ['Inspect the experience', 'At the milestone, Punk reviews the PRD and live screenshots for product and interaction problems.', 'Rank objections for Main to address and the human to decide.'],
      ['Try it yourself', 'You try the milestone, read a one-page gate packet and decide whether to continue.', 'Gate 3: explicit approval, with removed, hidden or moved features disclosed.'],
    ],
  },
  ja: {
    title: 'Agent に役割を。ルールに実効性を。',
    intro: '計画、テスト、実装、レビューをつなぐ開発ワークフロー。Main が全体を把握し、各役割が独立して作業します。計画とマイルストーンの判断は人が担います。',
    explore: '一つの成果が届くまでをたどる', hint: '番号付きのノードを選ぶと、役割と成果物を確認できます。',
    back: 'ツールとプロジェクトへ', source: 'ソースを見る', read: '開発の振り返りを読む',
    previous: '前の説明', next: '次の説明', output: '成果物', guard: '通過条件',
    legend: ['選択中', '実行順序', '人による判断'],
    summary: 'タスクは自動で進み、製品の判断はあなたに残ります。',
    loop: 'Gate 2 はタスクごとに反復。テストやレビューに落ちたら修正します。マイルストーンで Punk のレビューと人による受け入れに進みます。',
    engine: 'スクリプトが順序を守り、ファイルが進捗を残す',
    engineDesc: 'gw.py が手順、変更範囲、テストのロックを検査。自動運転では drive.py が新しい Claude Code セッションを起動します。引き継ぎは Git の docs/workflow/ に保存します。',
    why: '見落としやすい制約を、検査できる境界にする',
    features: [
      ['01 / context', '一つの Main が全体を把握する', '製品設計、アーキテクチャ、コードレビューを一つの役割に集約。引き継ぎで意図が失われる機会を減らします。'],
      ['02 / tests', '実装より先にテストを書く', 'Tester が先にテストを作成。Coder には可視テストだけを渡し、隠しテストは隔離、内容は SHA-256 でロックします。'],
      ['03 / isolation', '実装には独立した作業場所を', 'Coder は別の Git worktree で作業し、許可されたファイルだけを変更。追加した防御ロジックには理由を記載します。'],
      ['04 / product', 'Punk は実際の製品を見る', 'Punk は PRD と動作画面で判断し、ソースを読みません。テスト合格後も、利用者の体験を検証します。'],
    ],
    start: '受け入れ目標のあるプロジェクトから始める',
    startDesc: 'ローカルの開発環境で使うワークフローです。リポジトリの導入手順と Quick Start を読み、Main と要件、境界条件、タスク計画を整理します。自動運転は Claude Code CLI を使用します。',
    install: '導入・使い方', note: '図は主要な流れの簡略版で、実行中の Agent の監視画面ではありません。最新のコマンドと制約はリポジトリをご確認ください。',
    steps: [
      ['計画を承認', '目標と曖昧な製品要件を人が決め、Main が PRD と計画にまとめます。', 'Gate 1：争点のある境界条件は CEO が明示的に確定します。'],
      ['タスクを定義', 'Main が承認済みの計画を、目標、変更可能なファイル、受け入れ条件付きのタスクに分解します。', 'brief に障害リスクの高い層を記載します。'],
      ['テストを先に作る', 'Tester が brief を読み、実装前に可視テストと隠しテストを独立して作成します。', '計画をレビューし、隠しテストを Coder から隔離します。'],
      ['テスト計画を確認', 'Main が要件とリスク層を検証できるか確認してから、実装を許可します。', '実装側が基準を変えないよう、テストと範囲をロックします。'],
      ['隔離して実装', 'Coder は別の worktree で実装し、可視テストを実行して引き継ぎを書きます。', '変更範囲を守り、追加した防御ロジックを申告します。'],
      ['検証とレビュー', 'Main が差分、検証結果、過剰な防御を確認。合格したタスクをマージします。', '不合格は修正。露出した隠しテストは破棄し再設計します。'],
      ['実際の体験を確認', 'マイルストーンで Punk が PRD と動作画面を読み、製品と操作の問題を指摘します。', '異議を重要度順に記録し、Main の対応と人の判断につなげます。'],
      ['自分で試す', '成果を試し、1 ページの承認資料を読んで次の段階に進むか決めます。', 'Gate 3：明示的な承認。削除、非表示、移動された機能も開示します。'],
    ],
  },
};

export function workflowContent(lang: Lang) {
  const c = content[lang];
  return { ...c, steps: c.steps.map(([title, body, guard], i) => ({ title, body, guard, role: roles[i], file: files[i] })) };
}
