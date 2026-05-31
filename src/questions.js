export const GAME_CONFIG = {
  initial: {
    stamina: 10,
    mood: 10,
    gpa: 10
  },
  scoreWeights: {
    stamina: 1,
    mood: 1.3,
    gpa: 1.2
  },
  restRoundsWhenStaminaEmpty: 2,
  duplicateChoicePenalty: {
    mood: -1,
    gpa: -1
  },
  setupIntro:
    "建议 4-8 组游玩。每组每轮派一位同学代表做决策。若某组体力值 <= 0，将进入“强制休息”，停止决策 2 轮。同一轮中，若后面的组选择了前面组已经选过的选项，会额外受到跟风折损。",
  followTip:
    "规则：同一轮里，某选项每被前面的组选择过一次，后续选择该项会叠加一次跟风折损。",
  reflection:
    "可以引导同学思考：在游戏里，很多选择都不是“绝对正确”或“绝对错误”，而是在有限体力、情绪和学业要求之间做取舍。期末压力下真正重要的，不只是把任务完成，也包括意识到自己的资源有限，并学会求助、协作和保留恢复空间。"
};

export const QUESTIONS = [
  {
    title: "第 1 轮：考试周突然提前",
    text: "老师通知：原定下周的考试提前到本周五。你们组现在需要决定接下来 48 小时的生存策略。",
    options: [
      {
        name: "A. 熬夜硬刚",
        desc: "把睡眠献祭给复习进度。适合短期冲刺，但副作用明显。",
        score: { stamina: -4, mood: -2, gpa: 4 }
      },
      {
        name: "B. 制定最低复习线",
        desc: "先保核心知识点，不追求面面俱到。",
        score: { stamina: -1, mood: 1, gpa: 2 }
      },
      {
        name: "C. 组内分工互讲",
        desc: "每人负责一块内容，互相讲题。",
        score: { stamina: -2, mood: 2, gpa: 3 }
      },
      {
        name: "D. 祈祷老师手下留情",
        desc: "精神胜利法，短期心情稳定，长期不一定。",
        score: { stamina: 1, mood: 2, gpa: 1 }
      },
      {
        name: "E. 直接摆烂睡觉",
        desc: "身体保住了，但知识点可能没保住。",
        score: { stamina: 3, mood: 2, gpa: -2 }
      }
    ]
  },
  {
    title: "第 2 轮：实验报告和小组 Pre 撞车",
    text: "实验报告、课程展示、随堂测验同时出现。你们组必须决定如何分配有限精力。",
    options: [
      {
        name: "A. 全员优先实验报告",
        desc: "保住硬性 ddl，但其他任务会被挤压。",
        score: { stamina: -2, mood: -1, gpa: 3 }
      },
      {
        name: "B. 把 Pre 做成极简版",
        desc: "追求能讲清楚，不追求花哨。",
        score: { stamina: -1, mood: 1, gpa: 2 }
      },
      {
        name: "C. 一人多线程硬扛",
        desc: "看似高效，实则高危。",
        score: { stamina: -4, mood: -2, gpa: 4 }
      },
      {
        name: "D. 向隔壁组借经验",
        desc: "触发合作型策略，收益稳定。",
        score: { stamina: -1, mood: 2, gpa: 2 }
      },
      {
        name: "E. 先吃顿好的再说",
        desc: "短暂回血，有时确实需要先恢复。",
        score: { stamina: 1, mood: 3, gpa: -1 }
      }
    ]
  },
  {
    title: "第 3 轮：组员突然失联",
    text: "小组作业截止前，一位组员突然不回消息。大家开始焦虑。你们要怎么处理？",
    options: [
      {
        name: "A. 疯狂连环 call",
        desc: "信息强压，也许有效，也许让关系更紧张。",
        score: { stamina: -1, mood: -1, gpa: 2 }
      },
      {
        name: "B. 重新分配任务",
        desc: "先处理问题，不把时间耗在情绪上。",
        score: { stamina: -2, mood: 1, gpa: 3 }
      },
      {
        name: "C. 在群里阴阳怪气",
        desc: "短期出气，长期高风险。",
        score: { stamina: 0, mood: 1, gpa: -2 }
      },
      {
        name: "D. 私聊确认情况",
        desc: "先了解对方是否真的遇到困难。",
        score: { stamina: -1, mood: 2, gpa: 2 }
      },
      {
        name: "E. 直接一个人全做",
        desc: "效率可能高，但代价是自我消耗。",
        score: { stamina: -4, mood: -2, gpa: 3 }
      }
    ]
  },
  {
    title: "第 4 轮：连续失眠",
    text: "复习越紧张越睡不着，越睡不着越焦虑。你们组需要选择一种应对方式。",
    options: [
      {
        name: "A. 睡前继续刷题",
        desc: "给大脑加压，可能有用，也可能更清醒。",
        score: { stamina: -2, mood: -2, gpa: 2 }
      },
      {
        name: "B. 设定固定停止时间",
        desc: "到点停工，给身体一个恢复边界。",
        score: { stamina: 2, mood: 2, gpa: 1 }
      },
      {
        name: "C. 喝咖啡续命",
        desc: "短期提神，长期可能透支。",
        score: { stamina: -2, mood: 0, gpa: 3 }
      },
      {
        name: "D. 和朋友散步十分钟",
        desc: "低成本情绪调节，不直接提高 GPA。",
        score: { stamina: 1, mood: 3, gpa: 0 }
      },
      {
        name: "E. 刷短视频逃避",
        desc: "短期快乐，但时间黑洞很危险。",
        score: { stamina: -1, mood: 1, gpa: -2 }
      }
    ]
  },
  {
    title: "第 5 轮：模拟考试崩了",
    text: "你们发现模拟题错得比想象中多。全组心态受到冲击，现在要决定下一步。",
    options: [
      {
        name: "A. 立刻复盘错题",
        desc: "把挫败转化为具体任务。",
        score: { stamina: -2, mood: 1, gpa: 3 }
      },
      {
        name: "B. 互相安慰十分钟",
        desc: "先稳住情绪，再进入任务。",
        score: { stamina: 0, mood: 3, gpa: 1 }
      },
      {
        name: "C. 质疑人生",
        desc: "非常真实，但收益不稳定。",
        score: { stamina: -1, mood: -2, gpa: 0 }
      },
      {
        name: "D. 找老师/助教问重点",
        desc: "求助是策略，不是示弱。",
        score: { stamina: -1, mood: 2, gpa: 3 }
      },
      {
        name: "E. 开始玄学押题",
        desc: "刺激但风险很大。",
        score: { stamina: -1, mood: 1, gpa: 2 }
      }
    ]
  },
  {
    title: "第 6 轮：期末最后 24 小时",
    text: "最终 Boss 战。你们只剩最后一天，需要选择最后的冲刺方式。",
    options: [
      {
        name: "A. 通宵背完所有内容",
        desc: "理论上很燃，现实中容易烧毁。",
        score: { stamina: -5, mood: -2, gpa: 5 }
      },
      {
        name: "B. 复习高频重点 + 睡够 6 小时",
        desc: "平衡型选择，爆发力不强但稳定。",
        score: { stamina: 1, mood: 2, gpa: 3 }
      },
      {
        name: "C. 小组互相抽查",
        desc: "通过输出检验掌握程度。",
        score: { stamina: -2, mood: 2, gpa: 4 }
      },
      {
        name: "D. 放弃焦虑，整理考场物品",
        desc: "不一定提高分数，但能减少临场崩溃。",
        score: { stamina: 1, mood: 3, gpa: 1 }
      },
      {
        name: "E. 临时抱佛脚刷十套题",
        desc: "爽感很强，消耗也很强。",
        score: { stamina: -4, mood: -1, gpa: 5 }
      }
    ]
  }
];
