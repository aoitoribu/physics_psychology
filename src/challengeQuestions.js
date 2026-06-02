export const CHALLENGE_CONFIG = {
  timerMs: 30000,
  scoreWeights: {
    stamina: 1,
    mood: 1.15,
    gpa: 1.35
  },
  difficulties: {
    easy: {
      label: "轻松闯关",
      initial: { stamina: 15, mood: 15, gpa: 10 },
      scoreScale: { positive: 1.08, negative: 0.82 },
      trapRate: 1,
      hideScoreHints: false,
      hint: "资源更充足，扣分更轻，适合熟悉完整剧情。"
    },
    normal: {
      label: "标准期末",
      initial: { stamina: 12, mood: 12, gpa: 10 },
      scoreScale: { positive: 1, negative: 1 },
      trapRate: 2,
      hideScoreHints: false,
      hint: "平衡版本，选择会明显影响后续状态。"
    },
    hard: {
      label: "高压挑战",
      initial: { stamina: 10, mood: 10, gpa: 9 },
      scoreScale: { positive: 0.92, negative: 1.25 },
      trapRate: 3,
      hideScoreHints: true,
      hint: "初始资源更紧，扣分更重，且不显示选项分值。"
    }
  },
  intro:
    "闯关模式是一名大学生从期中后到期末考的个人生存线。每题限时 30 秒，点击选项后立即结算；部分冒进选项可能触发提前结算。",
  reflection:
    "闯关模式的重点不是每一步都选最优，而是看到长期压力怎样一点点累积。真正能走到最后的，往往不是一直硬撑的人，而是能在任务、恢复、求助和取舍之间不断校准的人。"
};

export const CHALLENGE_QUESTIONS = [
  {
    title: "第 1 天：期中成绩刚出",
    text: "期中成绩比你预期低一点，但还没到不可挽回。你准备怎么处理？",
    options: [
      { name: "A. 马上翻错题找原因", desc: "先搞清楚失分点，而不是只盯着分数难受。", score: { stamina: -1, mood: 1, gpa: 3 } },
      { name: "B. 假装没看见成绩", desc: "短期少一点难受，但问题也会留到后面。", score: { stamina: 0, mood: 1, gpa: -1 } },
      { name: "C. 和同学对答案复盘", desc: "听听别人怎么想，顺便确认自己是不是漏了重点。", score: { stamina: -1, mood: 2, gpa: 2 } },
      { name: "D. 当晚疯狂补完整门课", desc: "很有决心，但刚受打击就硬冲，容易开局过载。", score: { stamina: -4, mood: -2, gpa: 4 }, trap: { stat: "stamina", reason: "你刚被期中成绩刺激到就强行补完整门课，体力被焦虑式冲刺直接抽空。" } }
    ]
  },
  {
    title: "第 3 天：课程群开始安静",
    text: "期中后大家都松了一口气，课程群突然安静下来。你也有点想休息。",
    options: [
      { name: "A. 给自己放半天假", desc: "明确休息半天，之后再回到节奏。", score: { stamina: 3, mood: 2, gpa: 0 } },
      { name: "B. 做一份后半学期清单", desc: "趁压力低，把后面的任务先看一眼。", score: { stamina: -1, mood: 1, gpa: 2 } },
      { name: "C. 继续完全不管学习", desc: "休息很舒服，但没有边界就容易滑走。", score: { stamina: 2, mood: 1, gpa: -2 } },
      { name: "D. 把所有课件重新下载整理", desc: "不算直接复习，但能降低之后找资料的摩擦。", score: { stamina: -1, mood: 1, gpa: 1 } }
    ]
  },
  {
    title: "第 5 天：老师提到期末占比",
    text: "老师说期末占比很高，而且题型会更综合。你听完有点紧。",
    options: [
      { name: "A. 记下题型和范围", desc: "先把模糊压力变成具体信息。", score: { stamina: 0, mood: 1, gpa: 2 } },
      { name: "B. 立刻问学长学姐经验", desc: "提前拿到方向，少走一点弯路。", score: { stamina: -1, mood: 2, gpa: 2 } },
      { name: "C. 开始担心但不行动", desc: "焦虑上来了，行动还没跟上。", score: { stamina: 0, mood: -2, gpa: 0 } },
      { name: "D. 当场决定每天学到凌晨", desc: "计划很猛，但过早拉满很容易后劲不足。", score: { stamina: -3, mood: -2, gpa: 3 } }
    ]
  },
  {
    title: "第 7 天：实验报告返修",
    text: "实验报告被老师打回，需要补图和解释误差。",
    options: [
      { name: "A. 当天改完返修", desc: "趁记忆还在，尽快处理掉。", score: { stamina: -2, mood: 0, gpa: 3 } },
      { name: "B. 先看反馈再约同伴讨论", desc: "确认问题，再分工修改。", score: { stamina: -1, mood: 1, gpa: 3 } },
      { name: "C. 拖到下周再说", desc: "眼前轻松一点，但返修会变成新的堵点。", score: { stamina: 1, mood: 0, gpa: -2 } },
      { name: "D. 随便补几句话交上去", desc: "看似省事，质量风险很高。", score: { stamina: 0, mood: -1, gpa: -3 } }
    ]
  },
  {
    title: "第 10 天：社团活动撞上作业",
    text: "你答应过参加社团活动，但同一天还有一份作业要交。",
    options: [
      { name: "A. 提前和社团请假", desc: "承认时间冲突，减少临时崩盘。", score: { stamina: 0, mood: 1, gpa: 2 } },
      { name: "B. 白天写作业，晚上去活动", desc: "两边都保住，但当天会比较累。", score: { stamina: -2, mood: 1, gpa: 2 } },
      { name: "C. 先去活动，作业晚上再冲", desc: "心情能回血，但晚上压力会集中爆发。", score: { stamina: -2, mood: 2, gpa: 0 } },
      { name: "D. 活动结束后通宵补作业", desc: "极限救火，第二天状态很危险。", score: { stamina: -5, mood: -2, gpa: 3 }, trap: { stat: "stamina", reason: "活动后又通宵补作业，身体没有任何缓冲，直接进入停机状态。" } }
    ]
  },
  {
    title: "第 12 天：第一次想做复习计划",
    text: "你打开日历，发现期末其实已经没有想象中远。",
    options: [
      { name: "A. 按课程列出复习块", desc: "先不追求完美计划，只把任务拆开。", score: { stamina: -1, mood: 1, gpa: 3 } },
      { name: "B. 只写一个大目标", desc: "目标很振奋，但执行路径还不清楚。", score: { stamina: 0, mood: 1, gpa: 0 } },
      { name: "C. 从最难的课开始排", desc: "直面硬骨头，但可能一开始就消耗不少。", score: { stamina: -2, mood: 0, gpa: 3 } },
      { name: "D. 计划做了两小时还没开始学", desc: "计划越来越漂亮，行动越来越远。", score: { stamina: -1, mood: -1, gpa: 0 } }
    ]
  },
  {
    title: "第 14 天：室友开始刷题",
    text: "你看到室友已经开始刷题，自己突然有点慌。",
    options: [
      { name: "A. 问清楚对方刷到哪里", desc: "把比较变成信息。", score: { stamina: 0, mood: 1, gpa: 2 } },
      { name: "B. 继续按自己的计划走", desc: "不盲目跟节奏，但需要相信自己的安排。", score: { stamina: 0, mood: 2, gpa: 1 } },
      { name: "C. 立刻改成同款刷题", desc: "从众能缓解焦虑，但未必适合你的薄弱点。", score: { stamina: -2, mood: -1, gpa: 1 } },
      { name: "D. 觉得自己完了，刷手机逃避", desc: "压力太大时最容易逃进即时快乐里。", score: { stamina: -1, mood: 0, gpa: -2 } }
    ]
  },
  {
    title: "第 16 天：小测突然通知",
    text: "明天有一次随堂小测，范围不大，但你还没看。",
    options: [
      { name: "A. 今晚看核心概念", desc: "用有限时间保住最可能考的内容。", score: { stamina: -1, mood: 0, gpa: 3 } },
      { name: "B. 找同学互问重点", desc: "快速校准范围，也能降低慌张。", score: { stamina: -1, mood: 1, gpa: 2 } },
      { name: "C. 通宵把章节全刷完", desc: "覆盖面很广，但代价也很大。", score: { stamina: -5, mood: -2, gpa: 4 }, trap: { stat: "stamina", reason: "为了小测通宵刷完整章，收益有限，体力却被提前耗尽。" } },
      { name: "D. 明早早起再看", desc: "如果能起得来还行，风险是早上更慌。", score: { stamina: 1, mood: 0, gpa: 0 } }
    ]
  },
  {
    title: "第 18 天：论文选题卡住",
    text: "课程论文要交选题，你想了很久都觉得不满意。",
    options: [
      { name: "A. 先交一个可修改版本", desc: "把选题推进到可反馈状态。", score: { stamina: -1, mood: 1, gpa: 2 } },
      { name: "B. 去找老师确认方向", desc: "外部反馈能减少无效纠结。", score: { stamina: -1, mood: 2, gpa: 3 } },
      { name: "C. 继续追求完美题目", desc: "质量可能提高，但很容易卡在开头。", score: { stamina: -2, mood: -1, gpa: 1 } },
      { name: "D. 随便选一个不感兴趣的", desc: "开局很快，后面写作会变痛苦。", score: { stamina: 0, mood: -1, gpa: -1 } }
    ]
  },
  {
    title: "第 20 天：身体有点不舒服",
    text: "你有点头痛，效率明显下降，但今天原计划要学两门课。",
    options: [
      { name: "A. 降低任务量，保留重点", desc: "承认状态变差，把任务缩到能完成。", score: { stamina: 2, mood: 1, gpa: 1 } },
      { name: "B. 照计划硬学两门", desc: "不想打乱计划，但效率可能很低。", score: { stamina: -3, mood: -1, gpa: 2 } },
      { name: "C. 休息并补水吃饭", desc: "先把身体拉回可用状态。", score: { stamina: 3, mood: 1, gpa: 0 } },
      { name: "D. 靠咖啡和止痛药硬撑", desc: "短期能顶一下，但不适合当常规策略。", score: { stamina: -4, mood: -2, gpa: 3 }, trap: { stat: "stamina", reason: "身体已经报警，你却继续硬撑，体力被透支到清零。" } }
    ]
  },
  {
    title: "第 22 天：第一次模拟复习失败",
    text: "你试着复习一章，发现看完就忘，心态有点掉。",
    options: [
      { name: "A. 换成主动回忆", desc: "合上书试着写框架，比反复看更有效。", score: { stamina: -1, mood: 1, gpa: 3 } },
      { name: "B. 做几道例题找手感", desc: "用题目检验自己到底卡在哪里。", score: { stamina: -2, mood: 0, gpa: 3 } },
      { name: "C. 觉得自己不适合这门课", desc: "把问题归因到自己身上，会削弱行动感。", score: { stamina: 0, mood: -3, gpa: -1 } },
      { name: "D. 找同学讲一遍", desc: "让别人帮你发现理解断点。", score: { stamina: -1, mood: 2, gpa: 2 } }
    ]
  },
  {
    title: "第 24 天：课程展示分工",
    text: "小组展示要分工，大家都想做轻松部分。",
    options: [
      { name: "A. 主动认领一个核心部分", desc: "压力更大，但也能掌握关键内容。", score: { stamina: -2, mood: 0, gpa: 3 } },
      { name: "B. 先明确每部分工作量", desc: "把争论从感觉变成事实。", score: { stamina: -1, mood: 2, gpa: 2 } },
      { name: "C. 只选最轻松的一块", desc: "短期省力，可能影响整体质量和关系。", score: { stamina: 1, mood: 0, gpa: -1 } },
      { name: "D. 接下没人要的全部内容", desc: "很负责，但容易把自己压垮。", score: { stamina: -4, mood: -2, gpa: 3 } }
    ]
  },
  {
    title: "第 26 天：周末到了",
    text: "你终于有一个相对完整的周末，但诱惑也很多。",
    options: [
      { name: "A. 上午学习，下午放松", desc: "给学习和恢复都留出位置。", score: { stamina: 1, mood: 2, gpa: 2 } },
      { name: "B. 全天泡图书馆", desc: "进度可能很快，但要看能不能保持效率。", score: { stamina: -3, mood: -1, gpa: 4 } },
      { name: "C. 完全放空两天", desc: "恢复很明显，但复习线会被推迟。", score: { stamina: 4, mood: 3, gpa: -2 } },
      { name: "D. 一边学习一边刷短视频", desc: "看似都做了，实际注意力被切碎。", score: { stamina: -1, mood: 0, gpa: -1 } }
    ]
  },
  {
    title: "第 28 天：第一门课发布复习提纲",
    text: "复习提纲终于发了，内容比你想象中多。",
    options: [
      { name: "A. 按提纲标记掌握程度", desc: "先找出红黄绿区域，别平均用力。", score: { stamina: -1, mood: 1, gpa: 3 } },
      { name: "B. 从第一页开始细看", desc: "踏实但可能进度慢。", score: { stamina: -2, mood: 0, gpa: 2 } },
      { name: "C. 只看同学说会考的", desc: "省时间，但容易漏掉真正薄弱点。", score: { stamina: 0, mood: 0, gpa: 0 } },
      { name: "D. 看到提纲直接崩溃", desc: "压力变大时，大脑会先想逃。", score: { stamina: 0, mood: -3, gpa: -1 } }
    ]
  },
  {
    title: "第 30 天：睡眠开始变乱",
    text: "你连续几天晚睡，白天开始犯困。",
    options: [
      { name: "A. 今晚设固定上床时间", desc: "先把节律拉回来一点。", score: { stamina: 3, mood: 2, gpa: 0 } },
      { name: "B. 白天补一小时午睡", desc: "短期恢复有效，但别睡太久。", score: { stamina: 2, mood: 1, gpa: 0 } },
      { name: "C. 继续熬，等考完再补", desc: "这是常见想法，但身体未必等得到。", score: { stamina: -4, mood: -2, gpa: 2 }, trap: { stat: "stamina", reason: "你把睡眠债继续往后推，体力系统提前结算了。" } },
      { name: "D. 睡前刷手机放松", desc: "看起来放松，实际上可能越刷越清醒。", score: { stamina: -1, mood: 0, gpa: -1 } }
    ]
  },
  {
    title: "第 32 天：朋友约你吃饭",
    text: "朋友说最近大家都很累，想约你吃顿饭聊聊。",
    options: [
      { name: "A. 去吃饭，但控制时间", desc: "补充社会支持，也不让安排失控。", score: { stamina: 1, mood: 3, gpa: 0 } },
      { name: "B. 拒绝并说明自己要复习", desc: "保住时间，但也要照顾关系。", score: { stamina: 0, mood: 0, gpa: 2 } },
      { name: "C. 去吃饭后继续夜聊很久", desc: "心情恢复不少，但睡眠又被挤压。", score: { stamina: -2, mood: 3, gpa: -1 } },
      { name: "D. 一边吃饭一边焦虑复习", desc: "人去了，心没休息到。", score: { stamina: -1, mood: -1, gpa: 0 } }
    ]
  },
  {
    title: "第 34 天：第二门课作业堆积",
    text: "你发现第二门课有几次作业还没订正，期末可能会考类似题。",
    options: [
      { name: "A. 选典型错题订正", desc: "抓高频错误，不求每题都重做。", score: { stamina: -2, mood: 1, gpa: 4 } },
      { name: "B. 全部作业从头重做", desc: "覆盖很完整，但时间和体力消耗大。", score: { stamina: -4, mood: -1, gpa: 5 } },
      { name: "C. 只看答案不动笔", desc: "速度很快，但掌握程度容易虚高。", score: { stamina: 0, mood: 0, gpa: 0 } },
      { name: "D. 找会的同学讲错题", desc: "通过讲解快速补上关键缺口。", score: { stamina: -1, mood: 2, gpa: 3 } }
    ]
  },
  {
    title: "第 36 天：论文初稿截止",
    text: "论文初稿明天要交，你还有一部分论证没写顺。",
    options: [
      { name: "A. 先交完整但粗糙的初稿", desc: "让老师能看到结构，再根据反馈改。", score: { stamina: -2, mood: 0, gpa: 3 } },
      { name: "B. 优先打磨核心论证", desc: "重点部分更扎实，但边角可能不完整。", score: { stamina: -2, mood: 0, gpa: 4 } },
      { name: "C. 熬夜追求完美初稿", desc: "质量可能提高，但身体和心态风险明显。", score: { stamina: -5, mood: -2, gpa: 5 }, trap: { stat: "stamina", reason: "你为了初稿完美通宵打磨，体力被论文和焦虑一起清空。" } },
      { name: "D. 先交半成品并祈祷", desc: "能赶上截止，但后续返修压力会很大。", score: { stamina: 0, mood: -1, gpa: -2 } }
    ]
  },
  {
    title: "第 38 天：复习资料太多",
    text: "你收到了好几份资料包，每一份看起来都很重要。",
    options: [
      { name: "A. 只保留一份主资料", desc: "减少信息源，避免来回横跳。", score: { stamina: 0, mood: 2, gpa: 2 } },
      { name: "B. 对照提纲筛资料", desc: "用考试范围决定资料优先级。", score: { stamina: -1, mood: 1, gpa: 3 } },
      { name: "C. 全部下载全部收藏", desc: "收藏很安心，但不等于学会。", score: { stamina: 0, mood: 0, gpa: -1 } },
      { name: "D. 每份资料都看一点", desc: "感觉很忙，实际容易碎片化。", score: { stamina: -2, mood: -1, gpa: 0 } }
    ]
  },
  {
    title: "第 40 天：第一次完整模拟",
    text: "你做了一套模拟卷，时间不够，错题也不少。",
    options: [
      { name: "A. 复盘时间分配", desc: "先解决做不完的问题。", score: { stamina: -1, mood: 1, gpa: 3 } },
      { name: "B. 按错题分类补弱点", desc: "把失败拆成能处理的小块。", score: { stamina: -2, mood: 1, gpa: 4 } },
      { name: "C. 再刷一套压压惊", desc: "想用数量覆盖焦虑，但未必吸收。", score: { stamina: -3, mood: -1, gpa: 2 } },
      { name: "D. 觉得没救了直接停掉", desc: "挫败感接管了行动。", score: { stamina: 0, mood: -4, gpa: -2 } }
    ]
  },
  {
    title: "第 42 天：开始出现烦躁",
    text: "别人说话、消息提示、室友走动都让你有点烦。",
    options: [
      { name: "A. 换一个安静环境", desc: "先减少刺激源。", score: { stamina: 0, mood: 2, gpa: 1 } },
      { name: "B. 和室友说明复习时间", desc: "用沟通替代憋着生气。", score: { stamina: 0, mood: 2, gpa: 1 } },
      { name: "C. 什么都不说继续忍", desc: "表面和平，内心消耗。", score: { stamina: -1, mood: -2, gpa: 0 } },
      { name: "D. 在群里发火", desc: "情绪释放了，但关系和心态都可能受损。", score: { stamina: 0, mood: -3, gpa: -1 } }
    ]
  },
  {
    title: "第 44 天：第三门课完全没底",
    text: "你发现有一门课一直被你放在最后，现在几乎没底。",
    options: [
      { name: "A. 先看近三年题型", desc: "用题型建立方向感。", score: { stamina: -1, mood: 1, gpa: 3 } },
      { name: "B. 找同学借课堂笔记", desc: "补上自己缺席或走神的部分。", score: { stamina: -1, mood: 2, gpa: 3 } },
      { name: "C. 从教材第一页开始啃", desc: "很踏实，但现在可能太慢。", score: { stamina: -3, mood: -1, gpa: 2 } },
      { name: "D. 放弃这门，保其他课", desc: "是一种取舍，但 GPA 风险很明显。", score: { stamina: 1, mood: -1, gpa: -4 } }
    ]
  },
  {
    title: "第 46 天：家里打来电话",
    text: "家里关心你复习得怎么样，你不太想说自己很焦虑。",
    options: [
      { name: "A. 简单说真实状态", desc: "不需要讲太多，但可以少装一点。", score: { stamina: 0, mood: 2, gpa: 0 } },
      { name: "B. 报喜不报忧", desc: "避免家人担心，但你会继续一个人扛。", score: { stamina: 0, mood: -1, gpa: 0 } },
      { name: "C. 请家人少打扰几天", desc: "给自己留复习空间，也说清楚原因。", score: { stamina: 1, mood: 1, gpa: 1 } },
      { name: "D. 接完电话更焦虑，开始乱刷题", desc: "压力转成无序行动，效率不稳。", score: { stamina: -3, mood: -2, gpa: 2 } }
    ]
  },
  {
    title: "第 48 天：考前资料又更新",
    text: "老师补充了一份新资料，大家开始疯狂转发。",
    options: [
      { name: "A. 先确认资料是否必考", desc: "别让新资料自动打乱全部计划。", score: { stamina: 0, mood: 1, gpa: 2 } },
      { name: "B. 把新资料并入提纲", desc: "把新增内容放到已有框架里。", score: { stamina: -1, mood: 1, gpa: 3 } },
      { name: "C. 立刻推翻原计划重学", desc: "看似重视，实际很容易节奏崩。", score: { stamina: -3, mood: -2, gpa: 1 } },
      { name: "D. 完全不看新资料", desc: "保持节奏，但可能错过重点。", score: { stamina: 0, mood: 0, gpa: -1 } }
    ]
  },
  {
    title: "第 50 天：进入倒计时一周",
    text: "距离第一门考试还有一周，你开始明显感到紧张。",
    options: [
      { name: "A. 每天安排一门主攻课", desc: "减少切换，提升深入度。", score: { stamina: -1, mood: 1, gpa: 3 } },
      { name: "B. 每天三门都碰一下", desc: "保持熟悉感，但容易浅尝辄止。", score: { stamina: -2, mood: 0, gpa: 2 } },
      { name: "C. 先补最差的一门", desc: "风险最高的地方最值得先救。", score: { stamina: -2, mood: 0, gpa: 4 } },
      { name: "D. 一想到倒计时就逃避", desc: "压力太具体，反而让人想躲开。", score: { stamina: 0, mood: -3, gpa: -2 } }
    ]
  },
  {
    title: "第 52 天：同学开始互相报进度",
    text: "有人说自己已经刷完两遍，你听完心里一沉。",
    options: [
      { name: "A. 不参与进度攀比", desc: "保护自己的节奏。", score: { stamina: 0, mood: 2, gpa: 1 } },
      { name: "B. 问对方哪些题最有用", desc: "从比较里提取信息。", score: { stamina: 0, mood: 1, gpa: 2 } },
      { name: "C. 立刻加倍学习时长", desc: "短期追赶感强，但很可能透支。", score: { stamina: -4, mood: -2, gpa: 3 }, trap: { stat: "mood", reason: "你被别人的进度带着跑，越追越慌，心情值被比较压力清空。" } },
      { name: "D. 开始怀疑自己计划全错", desc: "计划可以调整，但全盘否定很消耗。", score: { stamina: -1, mood: -3, gpa: 0 } }
    ]
  },
  {
    title: "第 54 天：第一门考前两天",
    text: "第一门考试快到了，你还剩几块内容不熟。",
    options: [
      { name: "A. 优先补高频重点", desc: "把有限时间放在最可能得分的地方。", score: { stamina: -2, mood: 0, gpa: 4 } },
      { name: "B. 整理一页速记卡", desc: "压缩知识，帮助考前回忆。", score: { stamina: -1, mood: 1, gpa: 3 } },
      { name: "C. 通宵补所有不熟内容", desc: "看似全面，实际可能损害第二天表现。", score: { stamina: -5, mood: -2, gpa: 4 }, trap: { stat: "stamina", reason: "考前两天通宵补缺口，身体直接进入红灯状态。" } },
      { name: "D. 放弃不熟内容只看会的", desc: "心态稳定一点，但提升有限。", score: { stamina: 1, mood: 1, gpa: 0 } }
    ]
  },
  {
    title: "第 55 天：考前失眠",
    text: "明天考试，你躺下后脑子一直在过知识点。",
    options: [
      { name: "A. 设定停止复习仪式", desc: "告诉大脑今天到此为止。", score: { stamina: 2, mood: 2, gpa: 0 } },
      { name: "B. 起床再看半小时", desc: "可能缓解焦虑，也可能越看越醒。", score: { stamina: -2, mood: -1, gpa: 1 } },
      { name: "C. 做呼吸放松", desc: "不直接加分，但帮助睡眠。", score: { stamina: 2, mood: 2, gpa: 0 } },
      { name: "D. 在床上刷题到很晚", desc: "床变成考场，大脑更难停下来。", score: { stamina: -4, mood: -2, gpa: 2 } }
    ]
  },
  {
    title: "第 56 天：第一门考试当天",
    text: "早上起来，你有点紧张，担心自己忘东西。",
    options: [
      { name: "A. 吃早饭并提前出门", desc: "稳定身体和现场节奏。", score: { stamina: 1, mood: 2, gpa: 1 } },
      { name: "B. 最后十分钟翻速记卡", desc: "轻量回顾，不试图塞新内容。", score: { stamina: 0, mood: 0, gpa: 2 } },
      { name: "C. 路上疯狂翻新题", desc: "增加信息，但也增加慌乱。", score: { stamina: -1, mood: -2, gpa: 1 } },
      { name: "D. 不吃早饭直接冲考场", desc: "省时间，但身体状态可能掉线。", score: { stamina: -2, mood: -1, gpa: 0 } }
    ]
  },
  {
    title: "第 56 天：考试中卡题",
    text: "卷子前半部分有一道题卡住了，你已经想了十分钟。",
    options: [
      { name: "A. 先跳过，标记回来", desc: "保护整体得分。", score: { stamina: 0, mood: 1, gpa: 3 } },
      { name: "B. 继续硬想直到做出", desc: "如果做出很赚，做不出会拖垮节奏。", score: { stamina: -2, mood: -2, gpa: 1 } },
      { name: "C. 先写能拿的步骤分", desc: "不空着，减少损失。", score: { stamina: 0, mood: 1, gpa: 2 } },
      { name: "D. 一慌开始怀疑整张卷", desc: "一道题影响全局，是考试里很常见的心理陷阱。", score: { stamina: 0, mood: -4, gpa: -2 } }
    ]
  },
  {
    title: "第 56 天：考后对答案",
    text: "第一门刚考完，同学们开始在门口对答案。",
    options: [
      { name: "A. 不细对，先吃饭休息", desc: "保护下一门考试的状态。", score: { stamina: 2, mood: 2, gpa: 0 } },
      { name: "B. 只确认明显疑问", desc: "适度了解，不让情绪失控。", score: { stamina: 0, mood: 0, gpa: 1 } },
      { name: "C. 全面对答案到崩溃", desc: "知道更多不一定更有帮助。", score: { stamina: -1, mood: -4, gpa: 0 }, trap: { stat: "mood", reason: "你在考场门口把答案对到心态崩盘，下一门前心情直接归零。" } },
      { name: "D. 上网搜答案", desc: "短期停不下来，但无法改变已交的卷子。", score: { stamina: -1, mood: -2, gpa: 0 } }
    ]
  },
  {
    title: "第 57 天：第二门复习被打断",
    text: "第一门考完后，你本来要复习第二门，但一直静不下来。",
    options: [
      { name: "A. 先做二十分钟低难任务", desc: "用小任务重启状态。", score: { stamina: 0, mood: 1, gpa: 2 } },
      { name: "B. 散步后再回来", desc: "让身体切出上一门考试。", score: { stamina: 1, mood: 2, gpa: 0 } },
      { name: "C. 强迫自己立刻高强度刷题", desc: "可能推进，但很难持续。", score: { stamina: -3, mood: -2, gpa: 2 } },
      { name: "D. 今天彻底摆掉", desc: "恢复不少，但第二门压力会上升。", score: { stamina: 3, mood: 2, gpa: -2 } }
    ]
  },
  {
    title: "第 58 天：第二门考前夜",
    text: "第二门内容更多，你发现有一章几乎没碰。",
    options: [
      { name: "A. 看这一章高频题型", desc: "先抓可得分部分。", score: { stamina: -2, mood: 0, gpa: 4 } },
      { name: "B. 放弃这一章，保其他内容", desc: "明确取舍，减少全局崩盘。", score: { stamina: 1, mood: 1, gpa: 1 } },
      { name: "C. 通宵补完整章", desc: "最后时刻大幅加压，风险非常高。", score: { stamina: -5, mood: -3, gpa: 5 }, trap: { stat: "stamina", reason: "第二门考前夜硬补完整章，体力被最后一波冲刺直接清空。" } },
      { name: "D. 找同学问最核心三点", desc: "用外部经验快速缩小范围。", score: { stamina: -1, mood: 1, gpa: 3 } }
    ]
  },
  {
    title: "第 59 天：连续考试后很累",
    text: "你已经考了两门，身体和情绪都明显下降。",
    options: [
      { name: "A. 安排半天恢复", desc: "让系统重新上线。", score: { stamina: 4, mood: 3, gpa: 0 } },
      { name: "B. 只做轻量复习", desc: "保持手感，不再强行拉满。", score: { stamina: 1, mood: 1, gpa: 2 } },
      { name: "C. 继续全天高强度", desc: "想一鼓作气，但疲劳会放大错误。", score: { stamina: -4, mood: -2, gpa: 3 } },
      { name: "D. 报复性娱乐到深夜", desc: "很想补偿自己，但睡眠会再次被牺牲。", score: { stamina: -3, mood: 1, gpa: -2 } }
    ]
  },
  {
    title: "第 60 天：最后一门考前",
    text: "最后一门在明天。你离结束很近，也最容易松掉。",
    options: [
      { name: "A. 复盘错题和重点", desc: "保住最后一门的基本盘。", score: { stamina: -2, mood: 0, gpa: 4 } },
      { name: "B. 稳住作息，少量回顾", desc: "把临场稳定放在第一位。", score: { stamina: 2, mood: 2, gpa: 2 } },
      { name: "C. 觉得快结束了直接放松", desc: "心情先飞走了，最后一门可能受影响。", score: { stamina: 2, mood: 2, gpa: -2 } },
      { name: "D. 最后一晚极限冲刺", desc: "把所有剩余电量压上去，风险和收益都高。", score: { stamina: -5, mood: -2, gpa: 5 }, trap: { stat: "stamina", reason: "最后一晚极限冲刺让身体彻底断电，终点前被迫提前结算。" } }
    ]
  },
  {
    title: "第 61 天：最后一门考试中",
    text: "你发现卷子不算简单，但也不是完全不会。",
    options: [
      { name: "A. 先拿稳会做的题", desc: "最后一门也要守住基本盘。", score: { stamina: 0, mood: 1, gpa: 3 } },
      { name: "B. 按分值分配时间", desc: "用分值决定投入，不被难题拖走。", score: { stamina: 0, mood: 1, gpa: 3 } },
      { name: "C. 被难题吸住半小时", desc: "很容易发生，但会挤压后面的题。", score: { stamina: -2, mood: -2, gpa: 0 } },
      { name: "D. 写完就交卷冲出去", desc: "结束感很强，但可能错过检查。", score: { stamina: 1, mood: 1, gpa: -1 } }
    ]
  },
  {
    title: "第 61 天：终于考完",
    text: "最后一门结束了，你走出考场，突然有点空。",
    options: [
      { name: "A. 好好吃饭睡觉", desc: "让身体知道期末真的结束了。", score: { stamina: 4, mood: 3, gpa: 0 } },
      { name: "B. 和朋友复盘这段时间", desc: "把压力经验说出来，结束感会更完整。", score: { stamina: 1, mood: 3, gpa: 0 } },
      { name: "C. 立刻开始担心成绩", desc: "考完了，但心理还没从考试里出来。", score: { stamina: 0, mood: -2, gpa: 0 } },
      { name: "D. 通宵庆祝", desc: "很有仪式感，但身体可能还没恢复。", score: { stamina: -3, mood: 3, gpa: 0 } }
    ]
  }
];
