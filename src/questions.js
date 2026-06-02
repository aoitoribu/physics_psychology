export const GAME_CONFIG = {
  initial: {
    stamina: 10,
    mood: 10,
    gpa: 10
  },
  scoreWeights: {
    stamina: 1,
    mood: 1.15,
    gpa: 1.35
  },
  batchSize: 5,
  probability: {
    baseRate: 88,
    perSameChoicePenalty: 9,
    minRate: 35,
    maxRate: 95,
    trapRate: 1,
    debuffMin: 0.1,
    debuffMax: 2,
    debuffTargetsMin: 1,
    debuffTargetsMax: 2
  },
  difficulties: {
    easy: {
      label: "轻松闯关",
      initial: { stamina: 14, mood: 14, gpa: 10 },
      hint: "资源更充足，适合熟悉流程。"
    },
    normal: {
      label: "标准期末",
      initial: { stamina: 10, mood: 10, gpa: 10 },
      hint: "接近竞赛模式默认状态。"
    },
    hard: {
      label: "高压挑战",
      initial: { stamina: 8, mood: 8, gpa: 8 },
      hint: "初始资源更紧张，容错更低。"
    }
  },
  setupIntro:
    "竞赛模式支持 2-20 组，系统按每 5 组一批推进。体力或心情任一 <= 0 会强制跳过 1 轮；两项都 <= 0 会跳过 2 轮，恢复后归 1 再继续。",
  followTip:
    "规则：每轮按随机批次推进；只有前面批次已选过的相同选项会降低后续成功率。同一批内部先记录选择，再统一结算，互不影响。",
  reflection:
    "可以引导同学思考：在游戏里，很多选择都不是“绝对正确”或“绝对错误”，而是在有限体力、情绪和学业要求之间做取舍。期末压力下真正重要的，不只是把任务完成，也包括意识到自己的资源有限，并学会求助、协作和保留恢复空间。"
};

export const QUESTIONS = [
  {
    title: "第 1 轮：考试周突然提前",
    text: "老师通知：原定下周的考试提前到本周五。你们组只剩 48 小时，要决定第一波复习策略。",
    options: [
      {
        name: "A. 通宵抢进度",
        desc: "今晚直接拉满，把最厚的章节先啃掉。短期 GPA 回报高，但身体和心态都要付账。",
        score: { stamina: -4, mood: -2, gpa: 5 },
        successMod: -10,
        trap: {
          rate: 2,
          stat: "stamina",
          reason: "通宵抢进度把身体电量直接榨干，眼前多背了几页，下一轮却只能被迫停机。"
        }
      },
      {
        name: "B. 画出最低复习线",
        desc: "先锁定必考概念和高频题，接受有些内容只能做到够用。",
        score: { stamina: -1, mood: 1, gpa: 3 },
        successMod: 5
      },
      {
        name: "C. 小组互讲核心题",
        desc: "每人负责一块内容，讲给别人听，也暴露自己的盲区。",
        score: { stamina: -2, mood: 2, gpa: 4 },
        successMod: 0
      },
      {
        name: "D. 先整理资料和错题",
        desc: "把课件、题型和错题放到一个框架里，今晚不追求刷很多题。",
        score: { stamina: 0, mood: 1, gpa: 2 },
        successMod: 8
      },
      {
        name: "E. 先睡一觉再开工",
        desc: "承认大脑已经卡住，先恢复状态，明天用清醒时间补回来。",
        score: { stamina: 3, mood: 2, gpa: -1 },
        successMod: 10,
        trap: {
          rate: 1,
          stat: "mood",
          reason: "休息没有设置边界，醒来发现复习窗口被睡过去，心情被迟到感直接打穿。"
        }
      }
    ]
  },
  {
    title: "第 2 轮：DDL 同时爆炸",
    text: "实验报告、课程展示、随堂测验同时出现。你们必须决定先保哪条线。",
    options: [
      {
        name: "A. 全员先冲最硬的 DDL",
        desc: "优先处理最不能迟交的任务，其他任务先接受不完美。",
        score: { stamina: -2, mood: -1, gpa: 4 },
        successMod: 0
      },
      {
        name: "B. 做一版够用 Pre",
        desc: "展示先保结构清楚、能讲明白，不把时间耗在装饰上。",
        score: { stamina: -1, mood: 1, gpa: 2 },
        successMod: 7
      },
      {
        name: "C. 一人多线程硬扛",
        desc: "把所有任务同时打开，靠意志力维持运转。看起来很燃，也很容易崩。",
        score: { stamina: -4, mood: -3, gpa: 5 },
        successMod: -12,
        trap: {
          rate: 2,
          stat: "mood",
          reason: "多线程硬扛触发了系统过载，任务还没排完，心态先被挤爆了。"
        }
      },
      {
        name: "D. 找同学借模板和经验",
        desc: "先问清楚格式、重点和坑点，减少无效摸索。",
        score: { stamina: -1, mood: 2, gpa: 3 },
        successMod: 3
      },
      {
        name: "E. 先暂停半小时重排优先级",
        desc: "不急着动手，先把任务按截止时间和收益重新排队。",
        score: { stamina: 1, mood: 2, gpa: 1 },
        successMod: 8,
        trap: {
          rate: 1,
          stat: "mood",
          reason: "优先级越排越细，行动迟迟没开始，温水式拖延把心态慢慢煮没了。"
        }
      }
    ]
  },
  {
    title: "第 3 轮：组员突然失联",
    text: "小组作业截止前，一位组员突然不回消息。大家开始焦虑，任务也还没做完。",
    options: [
      {
        name: "A. 群里高压催进度",
        desc: "立刻把问题摊开，逼出回应；可能推进任务，也可能让关系更僵。",
        score: { stamina: -1, mood: -2, gpa: 3 },
        successMod: -5
      },
      {
        name: "B. 先重分剩余任务",
        desc: "默认先救项目，把缺口拆给还能行动的人。",
        score: { stamina: -2, mood: 0, gpa: 4 },
        successMod: 0
      },
      {
        name: "C. 私聊确认情况",
        desc: "先问对方是不是遇到困难，再决定是否调整分工。",
        score: { stamina: -1, mood: 2, gpa: 3 },
        successMod: 6
      },
      {
        name: "D. 一个人接管全部内容",
        desc: "最快，但也最消耗。适合最后关头救火，不适合长期复制。",
        score: { stamina: -4, mood: -2, gpa: 4 },
        successMod: -8,
        trap: {
          rate: 2,
          stat: "stamina",
          reason: "一个人接管全部内容导致体力瞬间透支，项目被推进了，人也被按下暂停键。"
        }
      },
      {
        name: "E. 先在群里阴阳怪气",
        desc: "短期很解气，但任务、关系和心态都可能一起变差。",
        score: { stamina: 0, mood: -1, gpa: -2 },
        successMod: -5,
        trap: {
          rate: 1,
          stat: "mood",
          reason: "阴阳怪气让群聊气氛彻底冷掉，后续沟通成本暴涨，心情被关系压力清空。"
        }
      }
    ]
  },
  {
    title: "第 4 轮：连续失眠",
    text: "复习越紧张越睡不着，越睡不着越焦虑。你们组的判断力正在变钝。",
    options: [
      {
        name: "A. 睡前继续刷题",
        desc: "把焦虑转成行动，可能多见几道题，也可能让大脑更清醒。",
        score: { stamina: -3, mood: -2, gpa: 3 },
        successMod: -8
      },
      {
        name: "B. 设定今晚停工线",
        desc: "到点停止输入，给身体一个明确的恢复边界。",
        score: { stamina: 3, mood: 2, gpa: 1 },
        successMod: 10
        ,
        trap: {
          rate: 1,
          stat: "mood",
          reason: "停工线设得太早，躺下后反复担心自己是不是没学够，心情被未完成感拖垮。"
        }
      },
      {
        name: "C. 咖啡续命冲一波",
        desc: "短期提神，适合最后处理小任务，但不能当长期能源。",
        score: { stamina: -3, mood: -1, gpa: 4 },
        successMod: -10,
        trap: {
          rate: 2,
          stat: "stamina",
          reason: "咖啡续命没有续上，反而把最后一点体力刷空了。"
        }
      },
      {
        name: "D. 和朋友散步十分钟",
        desc: "低成本降压，帮大脑从高压循环里出来。",
        score: { stamina: 1, mood: 3, gpa: 0 },
        successMod: 8
      },
      {
        name: "E. 刷短视频逃避",
        desc: "短期快乐很真实，但时间黑洞也很真实。",
        score: { stamina: -1, mood: 1, gpa: -3 },
        successMod: -3
      }
    ]
  },
  {
    title: "第 5 轮：模拟考试崩了",
    text: "模拟题错得比想象中多。大家开始怀疑自己是不是根本没复习明白。",
    options: [
      {
        name: "A. 立刻复盘错题",
        desc: "把打击转成清单，找出真正不会的部分。",
        score: { stamina: -2, mood: 1, gpa: 4 },
        successMod: 4
      },
      {
        name: "B. 互相安慰十分钟",
        desc: "先稳住情绪，再决定下一步怎么补。",
        score: { stamina: 0, mood: 3, gpa: 1 },
        successMod: 8,
        trap: {
          rate: 1,
          stat: "mood",
          reason: "安慰变成了反复回放失败，全组越聊越丧，心情被二次打击清空。"
        }
      },
      {
        name: "C. 质疑人生并停止复习",
        desc: "非常真实，但如果停太久，挫败会变成新的压力源。",
        score: { stamina: 0, mood: -3, gpa: -2 },
        successMod: -8
      },
      {
        name: "D. 找老师/助教问重点",
        desc: "用外部反馈校准方向，避免在低收益内容里空转。",
        score: { stamina: -1, mood: 2, gpa: 4 },
        successMod: 2
      },
      {
        name: "E. 玄学押题搏一把",
        desc: "很刺激，命中会很爽，没命中就要承受偏科代价。",
        score: { stamina: -1, mood: 0, gpa: 5 },
        successMod: -15,
        trap: {
          rate: 2,
          stat: "mood",
          reason: "押题路线突然塌方，越想越慌，心情值被不确定性直接清空。"
        }
      }
    ]
  },
  {
    title: "第 6 轮：期末最后 24 小时",
    text: "最终 Boss 战。你们只剩最后一天，要决定如何用掉最后的资源。",
    options: [
      {
        name: "A. 通宵背完所有内容",
        desc: "理论上最拼，现实中很容易把最后一天烧穿。",
        score: { stamina: -5, mood: -3, gpa: 6 },
        successMod: -15,
        trap: {
          rate: 2,
          stat: "stamina",
          reason: "最后 24 小时通宵拉满，身体系统直接亮红灯，只能强制休息。"
        }
      },
      {
        name: "B. 高频重点 + 睡够 6 小时",
        desc: "爆发力不是最高，但临场稳定性最好。",
        score: { stamina: 1, mood: 2, gpa: 4 },
        successMod: 8
      },
      {
        name: "C. 小组互相抽查",
        desc: "用输出检验掌握程度，也能互相稳住节奏。",
        score: { stamina: -2, mood: 2, gpa: 5 },
        successMod: 0
      },
      {
        name: "D. 整理考场物品和错题卡",
        desc: "减少临场混乱，保住能拿到的分。",
        score: { stamina: 1, mood: 3, gpa: 2 },
        successMod: 10,
        trap: {
          rate: 1,
          stat: "mood",
          reason: "整理物品变成反复检查，越确认越不放心，考前心态被细节焦虑清空。"
        }
      },
      {
        name: "E. 刷十套题临时抱佛脚",
        desc: "爽感和风险都很高，适合赌题感，不适合已经过载的队伍。",
        score: { stamina: -4, mood: -2, gpa: 6 },
        successMod: -12
      }
    ]
  }
];
