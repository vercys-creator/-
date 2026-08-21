import { Account, KnowledgeItem, TopicMatrix, DraftPost, DataReviewItem, CapturedIdea, AccountMemoryItem } from '../types';

export const INITIAL_ACCOUNT_MEMORIES: AccountMemoryItem[] = [
  {
    id: 'mem-1',
    accountId: 'acc-1',
    title: '裸辞创业被割2万高价课程的真实踩坑经历',
    category: 'personal_story',
    content: '2023年从大厂裸辞后，急于找副业破局，花了21800元报了某大V的所谓“个人IP私教营”，结果进去只有一堆录屏视频和一个百度网盘，老师根本不给1v1指导。后来我痛定思痛，决定不搞虚头巴脑的概念，自己用MVP最小闭环测试出第一批付费学员。这个经历让我坚定了“先验证付费意愿、再做重度交付”的铁律。',
    keyTakeaway: '真金白银踩坑2万买来的教训：坚决不买无交付承诺的高价课，主张轻量MVP闭环验证。',
    tags: ['真实踩坑', '裸辞创业', '避坑经验', 'MVP验证'],
    importance: 'high',
    isEnabled: true,
    citationsCount: 12,
    createdAt: '2026-08-16'
  },
  {
    id: 'mem-2',
    accountId: 'acc-1',
    title: '独家变现钩子：《一人公司副业破局多维自测表SOP》',
    category: 'product_hook',
    content: '我们开发了一套包含“技能溢出盘点”、“商业闭环测算器”、“冷启动30天排期”的飞书多维表格。在爆款图文结尾引导用户在评论区发送关键词获取。该资料包转化率高达38%，是私域引流的核心抓手。',
    keyTakeaway: '高转化引流钩子：飞书多维表格版副业破局测算器，用于在干货文案末尾做自然引导。',
    tags: ['引流钩子', '多维表格', '高转化资料', '私域沉淀'],
    importance: 'high',
    isEnabled: true,
    citationsCount: 18,
    createdAt: '2026-08-17'
  },
  {
    id: 'mem-3',
    accountId: 'acc-1',
    title: '独家认知金句：执行力差不是意志力问题，而是起步摩擦力过大',
    category: 'core_thesis',
    content: '大多数人做自媒体坚持不下去，不是因为懒，而是把每一步设计得太沉重（要写大纲、做精致封面、写千字长文）。我们的核心方法论是“微步迭代”：把每次创作拆解为 10 分钟的最小原子动作，用系统代替意志力。',
    keyTakeaway: '反常识认知：用系统流程降低起步摩擦力，而不是靠消耗意志力死撑。',
    tags: ['反常识认知', '系统思维', '意志力伪命题', '生产力'],
    importance: 'high',
    isEnabled: true,
    citationsCount: 9,
    createdAt: '2026-08-18'
  },
  {
    id: 'mem-4',
    accountId: 'acc-1',
    title: '受众高频卡点：大厂中层总觉得自己的主业经验“太普通、没价值”',
    category: 'audience_faq',
    content: '咨询学员中最常见的心智阻碍：很多工作5-8年的产品经理、运营、研发，觉得自己每天做的事稀松平常，没人会为此买单。其实他们忽视了“知识的诅咒”——对你而言是基本常识的技能（如Excel建模、项目排期、跨部门沟通），对中小团队或转行新人来说就是降维打击的高价值资产。',
    keyTakeaway: '破解知识的诅咒：帮助职场人识别被低估的“技能溢出”，重塑商业自信。',
    tags: ['知识的诅咒', '技能溢出', '受众心理卡点', '破局答疑'],
    importance: 'medium',
    isEnabled: true,
    citationsCount: 7,
    createdAt: '2026-08-18'
  },
  {
    id: 'mem-5',
    accountId: 'acc-1',
    title: '表达红线：严禁兜售暴富焦虑，严禁使用“月入10万不是梦”等浮夸假词',
    category: 'style_boundary',
    content: '账号调性必须保持理性克制，数据真实有出处。绝不画无法兑现的大饼，不承诺“带你3天暴富”，所有案例都必须指出背后的前置条件和执行代价。',
    keyTakeaway: '品牌红线：克制、真实、有据可查，拒绝任何伪成功学与浮夸黑话。',
    tags: ['品牌调性', '合规红线', '反焦虑'],
    importance: 'medium',
    isEnabled: true,
    citationsCount: 15,
    createdAt: '2026-08-15'
  },
  {
    id: 'mem-6',
    accountId: 'acc-2',
    title: '实测200+主流大模型与AI工作流知识库沉淀',
    category: 'personal_story',
    content: '作为重度极客，累计深度实测了包括 Claude 3.5 Sonnet、Gemini 1.5/2.0/3.7、ChatGPT-4o、Midjourney、ComfyUI 在内的200多个主流模型，拥有自研的 10 万字模块化提示词字典，能够一眼看出哪类任务用什么模型最省钱、最精准。',
    keyTakeaway: '极客权威背书：实测200+模型硬核对比，拒绝云测评，输出绝对真刀真枪经验。',
    tags: ['极客背书', '深度实测', '模型对比'],
    importance: 'high',
    isEnabled: true,
    citationsCount: 8,
    createdAt: '2026-08-17'
  },
  {
    id: 'mem-7',
    accountId: 'acc-2',
    title: '独家变现钩子：《100套开箱即用高阶Prompt填空模板库》',
    category: 'product_hook',
    content: '整理好的飞书多维表格指令库，涵盖文案改写、代码排错、爆款拆解、数据清洗等模块。读者在评论区互动扣【Prompt】后，自动赠送10套精选体验版，完整版作为社群会员核心权益。',
    keyTakeaway: '标准化高价值钩子：按场景分类的填空式万能指令库，门槛极低，即拷即用。',
    tags: ['指令库', '填空模板', '引流抓手'],
    importance: 'high',
    isEnabled: true,
    citationsCount: 14,
    createdAt: '2026-08-18'
  },
  {
    id: 'mem-8',
    accountId: 'acc-2',
    title: '受众高频卡点：为什么我给AI的指令它总是听不懂，输出全是套话？',
    category: 'audience_faq',
    content: '新手最大的误区：把 AI 当成肚里的蛔虫，给的指令太宽泛（如“帮我写一篇关于AI的小红书”）。解决方案是“第一性原理四段式”：限定角色 + 明确背景约束 + 给出负向示例与禁忌 + 规定严格输出结构。',
    keyTakeaway: '高频痛点解决方案：提示词四段式框架（角色+约束+反向禁忌+结构格式）。',
    tags: ['提示词误区', '结构化表达', '高频答疑'],
    importance: 'high',
    isEnabled: true,
    citationsCount: 11,
    createdAt: '2026-08-19'
  }
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: '职场认知与搞钱实操',
    avatarIcon: 'Briefcase',
    niche: '职场跃迁 / 一人企业 / 个人商业化',
    targetPlatform: '小红书 + 公众号',
    currentStage: '起步破局期（0-1万粉）',
    inspiration: '把8年大厂中层与副业年入50W的实战避坑经验，转为可落地的干货SOP，帮助25-35岁职场人打造第二曲线',
    positioning: {
      targetAudience: {
        primary: '25-35岁一二线城市白领，遭遇职场天花板、渴望副业变现与个人增值',
        painPoints: [
          '主业耗尽精力但收入固定，缺乏第二曲线抗风险能力',
          '想做自媒体或副业但不知道从何下手，害怕踩坑与被割韭菜',
          '时间严重碎片化，无法坚持长期内容输出与商业交付'
        ],
        desires: [
          '掌握高客单技能，建立可沉淀的个人IP资产',
          '每月稳定产生5000-20000元第二收入'
        ]
      },
      personaAndTrust: {
        identity: '8年大厂前业务负责人 + 年入50W一人公司操盘手',
        tone: '犀利直接、不画大饼、只讲经过真金白银验证的数据与SOP',
        trustAnchor: '晒真实闭环收入账单、踩坑复盘笔记、学员30天出单案例',
        slogan: '拒绝无效内卷，用第一性原理重构你的个人商业操作系统'
      },
      monetization: {
        frontend: '免费领取《职场人副业破局30天实操清单SOP》引流私域',
        backend: '《一人公司个人IP商业化实战营》与 1v1 定向咨询陪跑',
        funnelLogic: '爆款图文干货 → 评论区钩子资料包 → 私域深度交付 → 高客单咨询'
      },
      contentAndVisual: {
        primaryFormat: '高信息密度图文卡片 + 强对比红黄黑大字封面 + 真实截图证据',
        visualStyle: '深灰/暖黑底色 + 醒目亮黄/荧光橙高亮词 + 醒目标签框',
        contentPillars: [
          '认知颠覆与反常识底层逻辑 (35%)',
          '保姆级副业实操与工具SOP (40%)',
          '真实学员踩坑与逆袭案例复盘 (25%)'
        ]
      },
      oneSentencePitch: '我是破局老林，专注帮25-35岁高潜职场人用第一性原理打通一人公司副业闭环。'
    },
    createdAt: '2026-08-15'
  },
  {
    id: 'acc-2',
    name: 'AI生产力极客指南',
    avatarIcon: 'Sparkles',
    niche: 'AI工具实战 / 工作流自动化 / 提示词工程',
    targetPlatform: '小红书 + 微信视频号',
    currentStage: '快速增长期（1-5万粉）',
    inspiration: '用最傻瓜式的实操，教普通小白把最新AI工具嵌入日常办公、自媒体创作和效率倍增中',
    positioning: {
      targetAudience: {
        primary: '内容创作者、新媒体运营、自由职业者与追求极致效率的知识工作者',
        painPoints: [
          '知道AI很火，但不知道怎么真正落地到自己的具体工作流',
          '提示词写不好，AI回答千篇一律、像废话套话',
          '工具太多太杂，缺乏系统性的测评与闭环串联'
        ],
        desires: [
          '用AI实现1小时搞定原本8小时的图文/文案/数据工作',
          '掌握独家万能提示词模板，快速打造爆款内容'
        ]
      },
      personaAndTrust: {
        identity: '重度AI工具评测狂人 + 万能提示词架构师',
        tone: '保姆级细致、极简主义、步骤明确、一键套用',
        trustAnchor: '全网实测200+主流AI模型、沉淀10万字提示词知识库',
        slogan: '普通人无需懂代码，也能用AI重构生产力杠杆'
      },
      monetization: {
        frontend: '100套高阶万能Prompt指令库与工作流模板',
        backend: 'AI自媒体搞钱实操课 + 专属提示词自动化插件',
        funnelLogic: '神仙工具对比演示 → 评论区扣【提示词】自动触发钩子 → 知识社群'
      },
      contentAndVisual: {
        primaryFormat: '痛点对比图 + 醒目界面录屏/卡片 + 步骤拆解图',
        visualStyle: '极简科技蓝黑底色 + 荧光绿/青色高光 + 醒目黄底黑字标签',
        contentPillars: [
          '万能提示词结构拆解 (40%)',
          '热门AI工具保姆级工作流 (35%)',
          '行业标杆AI落地搞钱案例 (25%)'
        ]
      },
      oneSentencePitch: '让每个普通人轻松驾驭AI，10倍放大个人生产力与变现效率。'
    },
    createdAt: '2026-08-18'
  }
];

export const INITIAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'kb-1',
    accountId: 'acc-1',
    title: '裸辞半年，我靠一人公司月入5W的5条冷酷真相',
    coverText: '【真实复盘】裸辞后才懂的5个搞钱真相，建议收藏！',
    bodyContent: '很多人以为裸辞做自由职业是睡到自然醒，其实第一关就是现金流焦虑...\n1. 技能不等于产品，必须产品化\n2. 别在自嗨的地方努力，只抓高转化环节\n3. 前期不要招人，把AI当你的免费外包...',
    myInsights: '这篇笔记爆点在于反常识+坦诚暴露真实痛点，封面用纯黑底+大字黄色高亮“5个搞钱真相”，极其吸睛。第一段不寒暄直接扎心，完播率超高。',
    accountNiche: '职场认知 / 个人商业化',
    tags: ['爆款结构', '反常识Hook', '高转化封面', '搞钱干货'],
    deconstructMode: 'deep',
    reversePrompt: 'A sleek, high-contrast digital marketing knowledge card, dark mode matte black background, bold yellow and white typography hierarchy, minimalist professional studio lighting, 8k resolution, clean composition, aspect ratio 3:4',
    visualSpec: {
      toolSource: '醒图',
      fontStyle: '阿里妈妈数黑体 (力量感高对比)',
      fontFamily: '"Alimama ShuHeiTi", "PingFang SC", sans-serif',
      layoutStructure: '上标下主标题 + 黑底黄字高光',
      colorPalette: {
        titleColor: '#ffffff',
        titleBg: '#0f172a',
        badgeBg: '#e11d48',
        badgeColor: '#ffffff',
        bgColor: '#090d16',
        bgGradient: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
        highlightColor: '#facc15'
      },
      filterPreset: 'high-contrast',
      filterName: '醒图 · 高反差黑金',
      stickerPresets: [
        { text: '🔥 真实复盘', bg: '#f59e0b', color: '#000000' },
        { text: '📌 建议收藏', bg: '#10b981', color: '#ffffff' }
      ],
      designNotes: '醒图大字排版精髓：主标题字号≥38px，使用亮黄色底衬高亮核心关键词，字级差保持在2.5倍以上。'
    },
    deconstruction: {
      coreLogic: '击中职场人对“自由职业美好幻想”与“现实残酷焦虑”的巨大反差，用第一人称真实数据破除认知偏见，建立极致信任。',
      hookPattern: {
        type: '反常识反差 + 真实身份认同',
        analysis: '前3秒直击“睡到自然醒”的虚假幻想，迅速切换到“现金流断崖”的冷酷现实，引发强烈窥探欲。',
        formula: '【真实身份标签】+【令人羡慕的结果】+【颠覆认知的N条代价/底层逻辑】'
      },
      structureFlow: [
        { part: '黄金前3秒', function: '打破美好滤镜，制造现实落差', keyElements: '真实时间点、具体金额、反差场景' },
        { part: '中段核心认知递进', function: '5条层层递进的硬核原则，每条配反例与正解', keyElements: '短句排版、数字量化、可执行行动点' },
        { part: '结尾促互动与引流', function: '唤醒共鸣，引导评论区领取配套自查清单', keyElements: '情绪升华、低门槛动作、明确资料钩子' }
      ],
      coverVisualLogic: '经典小红书3:4黄金比例，上下结构：顶部醒目标签【真实复盘】，中间12字超大高光黑黄对比标题，底部两行痛点悬念副标。',
      visualSpec: {
        toolSource: '醒图',
        fontStyle: '阿里妈妈数黑体 (力量感高对比)',
        fontFamily: '"Alimama ShuHeiTi", "PingFang SC", sans-serif',
        layoutStructure: '上标下主标题 + 黑底黄字高光',
        colorPalette: {
          titleColor: '#ffffff',
          titleBg: '#0f172a',
          badgeBg: '#e11d48',
          badgeColor: '#ffffff',
          bgColor: '#090d16',
          bgGradient: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
          highlightColor: '#facc15'
        },
        filterPreset: 'high-contrast',
        filterName: '醒图 · 高反差黑金',
        stickerPresets: [
          { text: '🔥 真实复盘', bg: '#f59e0b', color: '#000000' },
          { text: '📌 建议收藏', bg: '#10b981', color: '#ffffff' }
        ],
        designNotes: '醒图大字排版精髓：主标题字号≥38px，使用亮黄色底衬高亮核心关键词，字级差保持在2.5倍以上。'
      },
      reversePrompt: 'A sleek, high-contrast digital marketing knowledge card, dark mode matte black background, bold yellow and white typography hierarchy, minimalist professional studio lighting, 8k resolution, clean composition, aspect ratio 3:4',
      reusableTemplate: '【经历/身份】+【令人好奇的结果】，我用血泪总结出的【N条】冷酷真相：\n1. 关于【常见误区】：大家都在【错误做法】，但真正赚钱的都在【正确做法】...\n2. 关于【核心杠杆】：【核心认知】...\n3. 关于【执行动作】：先做【低成本验证】，再做【规模化复制】...',
      actionableTakeaways: [
        '封面主标题一定要有“反差词”（如：真相/劝退/别再做/避坑）',
        '正文每段严格控制在2-3行，视觉留白率维持在40%以上',
        '每条干货结尾必须附带一句行动指令，避免用户看完即走'
      ]
    },
    createdAt: '2026-08-17'
  },
  {
    id: 'kb-2',
    accountId: 'acc-2',
    title: '别再用“请帮我写一篇”了！教你万能提示词公式，AI秒变专家',
    coverText: '【建议收藏】90%的人都用错了ChatGPT！万能Prompt模板',
    bodyContent: '为什么你的AI回答总是一堆正确的废话？因为你根本没给它赋予精准的思考框架与反向挑刺机制！今天公开我自用的四步Master Prompt法则...',
    myInsights: '直接抨击用户的低效提问习惯，制造“我以前都用错了”的恐慌，随后提供即插即用的万能公式，收藏率高达35%！',
    accountNiche: 'AI工具 / 提示词工程',
    tags: ['提示词公式', '避坑指南', '保姆级SOP', '高收藏率'],
    deconstructMode: 'deep',
    reversePrompt: 'Infographic layout of AI prompt engineering checklist, vibrant cyber-neon accents, deep navy slate gradient backdrop, modern UI card floating elements, clear bold headings, clean typography, 8k, aspect ratio 3:4',
    visualSpec: {
      toolSource: '黄油相机',
      fontStyle: '黄油软糖体 (圆润吸睛)',
      fontFamily: '"ZCOOL KuaiLe", "PingFang SC", sans-serif',
      layoutStructure: '顶部黄色胶囊标签 + 暖黑底色 + 荧光青绿点缀',
      colorPalette: {
        titleColor: '#ffffff',
        titleBg: '#1e293b',
        badgeBg: '#fbbf24',
        badgeColor: '#000000',
        bgColor: '#0f172a',
        bgGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
        highlightColor: '#34d399'
      },
      filterPreset: 'warm',
      filterName: '黄油 · 芝士暖黄',
      stickerPresets: [
        { text: '⚡ 亲测有效', bg: '#34d399', color: '#000000' },
        { text: '💡 颠覆认知', bg: '#8b5cf6', color: '#ffffff' }
      ],
      designNotes: '黄油相机标志性设计：圆润加粗字形配合高明度暖黄胶囊标，营造亲和力高干货氛围。'
    },
    deconstruction: {
      coreLogic: '利用“多数人以为自己会用，其实一直在低效浪费”的认知盲区，以保姆级结构降低认知负荷，激发收藏与即时测试欲望。',
      hookPattern: {
        type: '指责常见错误 + 免费提供私藏神器',
        analysis: '开篇直接列出大家每天在用的废话Prompt，精准引发尴尬与好奇，随后给出降维打击的专业模板。',
        formula: '【停止做X常见低效动作】+【公布高手的Y套底层公式】+【复制即用】'
      },
      structureFlow: [
        { part: '前言避坑', function: '揭露AI生成套话废话的根本原因', keyElements: '低效提问截图对比、犀利总结' },
        { part: '公式拆解', function: '拆解【角色+背景+原则约束+结构化输出】四层架构', keyElements: '清晰标号、填空式占位符' },
        { part: '前后效果对比', function: '同一问题用新旧Prompt的产出质量天壤之别', keyElements: '实操截图、高光标红' }
      ],
      coverVisualLogic: '红底白色警告标签【严重避坑】+ 黑色主底色 + 黄底黑字高亮“万能Prompt模板”，字号级差大于2.5倍。',
      visualSpec: {
        toolSource: '黄油相机',
        fontStyle: '黄油软糖体 (圆润吸睛)',
        fontFamily: '"ZCOOL KuaiLe", "PingFang SC", sans-serif',
        layoutStructure: '顶部黄色胶囊标签 + 暖黑底色 + 荧光青绿点缀',
        colorPalette: {
          titleColor: '#ffffff',
          titleBg: '#1e293b',
          badgeBg: '#fbbf24',
          badgeColor: '#000000',
          bgColor: '#0f172a',
          bgGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
          highlightColor: '#34d399'
        },
        filterPreset: 'warm',
        filterName: '黄油 · 芝士暖黄',
        stickerPresets: [
          { text: '⚡ 亲测有效', bg: '#34d399', color: '#000000' },
          { text: '💡 颠覆认知', bg: '#8b5cf6', color: '#ffffff' }
        ],
        designNotes: '黄油相机标志性设计：圆润加粗字形配合高明度暖黄胶囊标，营造亲和力高干货氛围。'
      },
      reversePrompt: 'Infographic layout of AI prompt engineering checklist, vibrant cyber-neon accents, deep navy slate gradient backdrop, modern UI card floating elements, clear bold headings, clean typography, 8k, aspect ratio 3:4',
      reusableTemplate: '别再【错误动作】了！【N】个万能公式让你【目标结果倍增】：\n1. 【模块A】：【具体参数/设定】\n2. 【模块B】：【约束与反问机制】\n3. 【模块C】：【量化交付标准】\n👇 完整指令模板已整理好，直接抄作业！',
      actionableTakeaways: [
        '标题必须具备“痛点指责+解决方案”双重属性',
        '图文必须包含一张“前后对比图”，视觉冲击力远大于纯文字描述',
        '引导语必须明确写出“复制即用”，降低受众心理尝试门槛'
      ]
    },
    createdAt: '2026-08-19'
  }
];

export const INITIAL_TOPIC_MATRIX: TopicMatrix = {
  id: 'tm-1',
  accountId: 'acc-1',
  keyword: '自由职业副业破局',
  coreThesis: '职场人在副业启动期最缺的不是技能，而是商业闭环逻辑、最小成本验证思维与时间管理SOP。',
  topics: [
    {
      day: 1,
      angleType: '痛点暴露 / 焦虑共鸣',
      headlineOptions: [
        '月薪1万却存不下钱？职场人最该尽早启动的3条自救副业',
        '为什么你拼命加班却越过越穷？揭秘打工人的“收入单点脆弱性”',
        '25-35岁高潜职场人：千万别把所有鸡蛋放在一份工资里'
      ],
      goldenHook: '你有没有算过，如果明天公司突然裁员，你的存款能支撑现在的体面生活几个月？',
      targetEmotion: '生存危机感与自我反思',
      psychologyTrigger: '暴露隐藏风险，唤醒寻找备选方案的紧迫性',
      outline: [
        '打工收入与资产收入的本质区别',
        '3个常见但是极其危险的职场思维盲区',
        '自测清单：你的职业抗风险指数是多少分？'
      ],
      coverTextProposal: {
        badge: '⚠️ 深度扎心',
        mainTitle: '为什么越努力越存不下钱？',
        subTitle: '打工人必须看清的收入真相'
      }
    },
    {
      day: 2,
      angleType: '避坑避雷 / 认知颠覆',
      headlineOptions: [
        '求你别再做兼职刷单和无脑搬运了！盘点90%小白必踩的副业陷阱',
        '新手搞副业最容易被割韭菜的4个重灾区（附自查防坑指南）',
        '千万别碰的3类“伪副业”：除了耗尽时间，一毛钱都赚不到'
      ],
      goldenHook: '凡是跟你说“零门槛、每天10分钟、日入上千”的项目，99.9%是割你韭菜的杀猪盘。',
      targetEmotion: '警惕避雷与求真心理',
      psychologyTrigger: '帮助受众守住钱包，建立专业值得信赖的良心博主人设',
      outline: [
        '骗局一：低门槛打字/刷单/搬运的吸血机制',
        '骗局二：高昂加盟费与过时课程的二道贩子套路',
        '真正值得长期做的副业必须符合的3条硬指标'
      ],
      coverTextProposal: {
        badge: '🛑 避坑必看',
        mainTitle: '这4种副业千万别碰！',
        subTitle: '全是割韭菜套路，快来对号入座'
      }
    },
    {
      day: 3,
      angleType: '保姆级实操 / 极简SOP',
      headlineOptions: [
        '普通人副业从0到1启动全流程（建议收藏，保姆级SOP）',
        '下班后2小时如何变现？我的“一人公司”最小可行性验证清单',
        '不用辞职！手把手教你如何用一门特长跑通商业变现闭环'
      ],
      goldenHook: '不需要辞职，也不需要启动资金，只需这套经过验证的4步SOP，你也能在30天内跑出第一单。',
      targetEmotion: '掌握掌控感与渴望尝试',
      psychologyTrigger: '极低的执行门槛让受众觉得“我也能做到”，收藏率拉满',
      outline: [
        'Step 1: 盘点个人技能资产与真实受众痛点匹配',
        'Step 2: 制作你的第一个“免费体验装”引流钩子',
        'Step 3: 最小闭环测试：在社群/朋友圈获得3个付费种子用户',
        'Step 4: 收集反馈迭代产品，形成稳定交付节奏'
      ],
      coverTextProposal: {
        badge: '📌 保姆级干货',
        mainTitle: '副业0-1启动全流程',
        subTitle: '下班2小时，跑通你的第一单'
      }
    },
    {
      day: 4,
      angleType: '反直觉观点 / 打破常规',
      headlineOptions: [
        '反常识：搞副业千万不要追求“完美准备”，先搞到第一块钱才是王道',
        '为什么学了那么多干货你依然赚不到钱？因为你死在了“准备阶段”',
        '搞副业最快的方法不是做产品，而是先找到愿意付钱的人'
      ],
      goldenHook: '很多人花了3个月写课程、买设备、搭网站，结果上线第一天0人问津。商业的第一原则永远是：先卖后做。',
      targetEmotion: '恍然大悟与认知突破',
      psychologyTrigger: '打破“先投入再产出”的传统偏见，提供精益创业第一性原理',
      outline: [
        '准备主义陷阱：用努力的学习掩盖对被拒绝的恐惧',
        '先发预售法：如何用一张海报测出真实市场购买意愿',
        '快速试错法则：把验证成本压缩在100元以内'
      ],
      coverTextProposal: {
        badge: '💡 颠覆认知',
        mainTitle: '别再盲目做准备了！',
        subTitle: '搞副业的第一原则是先卖后做'
      }
    },
    {
      day: 5,
      angleType: '真实逆袭 / 案例拆解',
      headlineOptions: [
        '普通大厂程序员转做咨询，6个月月入3W的真实打法复盘',
        '从月光族到一人公司主理人：学员小张的30天破局全纪录',
        '不靠运气！一个文科生如何用AI工具跑通知识付费闭环？'
      ],
      goldenHook: '这是我学员小张上个月的微信收款截图：32,800元。而半年前，他还在为每个月交完房租只剩几百块发愁。',
      targetEmotion: '憧憬希望与代入感',
      psychologyTrigger: '真实案例与数据截图带来极强的说服力与信任转化',
      outline: [
        '学员背景与起步难点：无经验、时间少、怕露脸',
        '关键转折点：找到细分垂直小需求，单点打透',
        '核心收入结构拆解与可复用的关键动作'
      ],
      coverTextProposal: {
        badge: '🔥 真实复盘',
        mainTitle: '普通人如何月入3W？',
        subTitle: '学员从0到1跑通闭环全流程'
      }
    },
    {
      day: 6,
      angleType: '高价值资源 / 效率神器',
      headlineOptions: [
        '全网吹爆的7款一人公司效率神兵利器（直接提升10倍人效）',
        '一个人就是一支队伍！我自用的副业搞钱数字化工具箱大公开',
        '建议收藏！打造全自动副业闭环必备的5款免费自动化工具'
      ],
      goldenHook: '千万不要用打工时代的体力去卷副业！现代一人公司的核心秘密就是：善用数字杠杆。',
      targetEmotion: '收集癖与省时省力快感',
      psychologyTrigger: '工具资源合集类天生具备极高收藏点赞比，长尾流量极佳',
      outline: [
        '内容创作杠杆：AI文案与封面批量排版神器',
        '私域沉淀杠杆：自动化表单与知识库沉淀工具',
        '交付协同杠杆：极简轻量化多平台管理面板'
      ],
      coverTextProposal: {
        badge: '🧰 效率神器',
        mainTitle: '一人公司必备工具箱',
        subTitle: '一个人就是一支队伍，效率拉满'
      }
    },
    {
      day: 7,
      angleType: '深度复盘 / 互动召集',
      headlineOptions: [
        '复盘我做一人公司的这3年：给所有想破局朋友的10条肺腑之言',
        '副业自查问卷：评论区留下你的特长，免费帮你诊断变现路径！',
        '写在最后：2026年，普通人最好的投资就是打造属于自己的资产'
      ],
      goldenHook: '这一周我们聊了认知、避坑、SOP与工具。今天我想跟你聊聊最核心的心法：长期主义与执行力。',
      targetEmotion: '温度共鸣与深度链接',
      psychologyTrigger: '强互动引发评论区热烈讨论，算法极速推高热度，高效筛选高意向私域客户',
      outline: [
        '3年心路历程：从焦虑自耗到内心笃定',
        '10条高频踩坑反思金句提炼',
        '评论区互动福利：评论区留言即可获得一对一定制诊断'
      ],
      coverTextProposal: {
        badge: '💌 走心复盘',
        mainTitle: '做一人公司的这3年',
        subTitle: '给想破局者的10条肺腑之言'
      }
    }
  ],
  createdAt: '2026-08-19'
};

export const INITIAL_DRAFT_POSTS: DraftPost[] = [
  {
    id: 'draft-1',
    accountId: 'acc-1',
    topicTitle: '下班后2小时如何变现？我的“一人公司”最小可行性验证清单',
    titles: [
      '🔥 普通人副业从0到1启动全流程（建议收藏，保姆级SOP）',
      '下班后2小时如何变现？我的“一人公司”最小可行性验证清单',
      '不用辞职！手把手教你如何用一门特长跑通商业变现闭环'
    ],
    selectedTitle: '🔥 普通人副业从0到1启动全流程（建议收藏，保姆级SOP）',
    goldenHook: '不需要辞职，也不需要启动资金，只需这套经过真金白银验证的4步SOP，你也能在30天内跑出属于你的第一单！',
    body: `很多朋友每天下班累得像条狗，躺在床上刷短视频焦虑，心里想搞副业却不知从何下手。
今天不画大饼，直接把我和多位学员验证过的【一人公司副业破局4步法】毫无保留公开：

📌 第一步：技能资产盘点（拒绝自嗨）
不要问“我能做什么”，要问“别人愿意为解决什么问题付钱”。
把你的过往职业技能拆解成【具体的解决方案】，比如：
- 你会Excel ❌ → 帮财务小白做自动化发票核算模板 ✅
- 你会做PPT ❌ → 帮创业者做路演高说服力视觉提案 ✅

📌 第二步：做你的“低门槛免费体验装”
在朋友圈或垂直社群，先送出10份干货资料或免费诊断。
目的不是赚钱，而是收集真实的痛点反馈和信任背书！

📌 第三步：最小闭环收费（哪怕只有9.9元）
只有真金白银付款，才算验证商业模式。
先跑通3个付费客户，把交付流程标准化。

📌 第四步：借助AI与自动化杠杆
把反复沟通的话术、资料交付全部用AI工具自动化，实现下班后自动运转！`,
    callToAction: '💬 评论区扣【破局SOP】，免费领我整理好的《一人公司副业启动30天自查清单》，手慢无！',
    tags: ['#一人公司', '#副业搞钱', '#职场逆袭', '#搞钱干货', '#个人商业化'],
    coverVisual: {
      aspectRatio: '3:4',
      bgType: 'gradient',
      bgColor: '#0f172a',
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      badgeText: '📌 保姆级干货',
      badgeBg: '#e11d48',
      badgeColor: '#ffffff',
      mainTitle: '副业0-1启动SOP',
      titleColor: '#ffffff',
      titleHighlightColor: '#fbbf24',
      titleBg: '#000000',
      titleSize: 38,
      subTitle: '下班2小时，跑通第一单闭环',
      subTitleColor: '#cbd5e1',
      subTitleSize: 20,
      highlightWords: ['0-1启动', 'SOP', '第一单'],
      stickers: [
        { id: 'stk-1', text: '🔥 建议收藏', x: 24, y: 32, bg: '#f59e0b', color: '#000000' },
        { id: 'stk-2', text: '⚡ 真金白银验证', x: 220, y: 32, bg: '#10b981', color: '#ffffff' }
      ],
      filter: 'high-contrast',
      overlayDarkness: 10
    },
    createdAt: '2026-08-19'
  }
];

export const INITIAL_DATA_REVIEWS: DataReviewItem[] = [
  {
    id: 'rev-1',
    accountId: 'acc-1',
    postTitle: '裸辞半年，我靠一人公司月入5W的5条冷酷真相',
    postUrl: 'https://xhslink.com/demo1',
    platform: '小红书',
    publishDate: '2026-08-16',
    views: 48500,
    likes: 3120,
    comments: 480,
    collects: 4260,
    shares: 890,
    conversions: 142,
    diagnosis: {
      performanceLevel: 'S级爆款 (标杆案例)',
      calculatedMetrics: {
        engagementRate: '18.0%',
        collectToLikeRatio: '1.36 (干货极硬核)',
        estimatedCTRHealth: '优秀 (>12%)'
      },
      coreBottleneck: '前端流量与干货收藏极大爆发，但评论区转化钩子略微单一，私域承接链路可进一步缩短。',
      deepDiagnosis: {
        coverAndTitle: '黑黄高反差标题+数字刺激极大提升了点击率，反常识词汇有效击穿目标受众防线。',
        contentAndHook: '前3秒直戳痛点无废话，正文结构清晰，每条都包含行动点，造就极高收藏点赞比。',
        ctaAndConversion: '评论区互动热烈，但评论区置顶引导话术略显常规，建议增加限时限量紧迫感。'
      },
      actionableFixes: [
        { priority: 'P0 (最高)', action: '将该篇内容拆解为系列化选题（如“5条真相之商业变现篇”），趁热度连发3篇。', expectedImpact: '预计可承接原爆款30%的长尾流量' },
        { priority: 'P1', action: '在评论区置顶添加更具诱惑力的定制自测工具包钩子，提升私域转化率。', expectedImpact: '私域加粉转化率预计提升50%' },
        { priority: 'P2', action: '将封面配色方案沉淀为该账号的专属标准视觉模板。', expectedImpact: '强化受众视觉品牌记忆' }
      ],
      iterativePromptForNextPost: '请以《裸辞半年后我悟出的商业变现底层逻辑》为题，延续高反差黄金Hook和黑黄高光封面视觉，重点强化后端产品转化路径设计。'
    },
    createdAt: '2026-08-17'
  },
  {
    id: 'rev-2',
    accountId: 'acc-1',
    postTitle: '普通人如何高效管理时间？3个小技巧分享',
    postUrl: 'https://xhslink.com/demo2',
    platform: '小红书',
    publishDate: '2026-08-10',
    views: 1200,
    likes: 34,
    comments: 2,
    collects: 18,
    shares: 3,
    conversions: 0,
    diagnosis: {
      performanceLevel: 'C级待优化 (严重踩雷)',
      calculatedMetrics: {
        engagementRate: '4.7%',
        collectToLikeRatio: '0.52 (缺乏独家增量)',
        estimatedCTRHealth: '严重不足 (<3%)'
      },
      coreBottleneck: '标题与封面过于泛泛而谈（“时间管理”大词缺乏具体痛点场景与身份代入），无法在信息流中截留眼球。',
      deepDiagnosis: {
        coverAndTitle: '“3个小技巧”毫无吸引力，属于典型的AI套话风格，没有反常识或具体收益承诺。',
        contentAndHook: '开头直接说“今天跟大家聊聊时间管理”，废话过多导致3秒流失率高达70%。',
        ctaAndConversion: '结尾没有互动号召，受众看完直接划走。'
      },
      actionableFixes: [
        { priority: 'P0 (最高)', action: '彻底重写标题与封面：升级为《下班累瘫不想动？年入50W大佬的“低精力搞钱时间法”》', expectedImpact: '点击率预计提升3-5倍' },
        { priority: 'P1', action: '砍掉前言所有寒暄，第一句直接抛出颠覆性结论：“传统番茄工作法对职场人根本无效！”', expectedImpact: '完播率预计从15%提升至45%' },
        { priority: 'P2', action: '使用画布编辑器换用高反差色块和标签（如【避坑必看】），重新发布测试。', expectedImpact: '重新激活基础推流池' }
      ],
      iterativePromptForNextPost: '请将枯燥的时间管理理论，转化为针对【25-35岁高压疲惫职场人】的【低消耗精力管理SOP】，加入反常识Hook与高光封面图层。'
    },
    createdAt: '2026-08-11'
  }
];

export const INITIAL_CAPTURED_IDEAS: CapturedIdea[] = [
  {
    id: 'spark-1',
    accountId: 'acc-1',
    content: '受众痛点：很多30岁左右职场人下班后精力严重耗尽，买了一堆副业课根本没体力看，需要一套“超低启动阻力”的微型搞钱SOP。',
    dimension: 'audience',
    strategicGoal: 'traffic_growth',
    priority: 'high',
    dimensionAnchor: '痛点：下班精力耗尽无从下手',
    tags: ['低精力', '副业启动', '精力管理'],
    isPinned: true,
    createdAt: '2026-08-19'
  },
  {
    id: 'spark-2',
    accountId: 'acc-1',
    content: '反差人设信任：不要说自己是全知导师，强调“普通打工人视角的踩坑排雷者”，每篇直接贴出真实的纳税凭证和实操耗时清单。',
    dimension: 'persona',
    strategicGoal: 'trust_authority',
    priority: 'high',
    dimensionAnchor: '背书：真实踩坑账单与纳税凭证',
    tags: ['反差人设', '真实账单', '排雷者'],
    isPinned: true,
    createdAt: '2026-08-18'
  },
  {
    id: 'spark-3',
    accountId: 'acc-1',
    content: '变现漏斗钩子：不要只送普通PDF，送“一人公司自测打分飞书多维表格”，里面内置痛点诊断，填完自动引流加企微1v1分析。',
    dimension: 'monetization',
    strategicGoal: 'lead_conversion',
    priority: 'high',
    dimensionAnchor: '引流品：一人公司自测多维表格',
    tags: ['多维表格', '高转化钩子', '私域引流'],
    isPinned: false,
    createdAt: '2026-08-17'
  },
  {
    id: 'spark-4',
    accountId: 'acc-1',
    content: '视觉辨识度：封面统一左上角打黄色【避坑指数★★★】印章徽章，标题采用黑底+荧光黄核心词反差框，字号拉大到38px以上。',
    dimension: 'contentVisual',
    strategicGoal: 'content_efficiency',
    priority: 'medium',
    dimensionAnchor: '规范：深灰底+荧光黄核心词反差框',
    tags: ['避坑印章', '高反差黑黄', '封面规范'],
    isPinned: false,
    createdAt: '2026-08-16'
  },
  {
    id: 'spark-5',
    accountId: 'acc-1',
    content: '自由灵感：做副业千万不要把主业技能当包袱，而是做“能力溢出”；比如大厂项目经理把跨部门拉扯能力变成副业咨询谈判力。',
    dimension: 'rawSpark',
    strategicGoal: 'niche_breakthrough',
    priority: 'medium',
    dimensionAnchor: '跨界迁移：主业能力溢出为副业资产',
    tags: ['能力溢出', '迁移思维', '选题雏形'],
    isPinned: false,
    createdAt: '2026-08-15'
  },
  {
    id: 'spark-6',
    accountId: 'acc-2',
    content: '受众痛点：小白总觉得提示词太深奥记不住，想要那种“按步骤填空就能出S级文案”的傻瓜式模板。',
    dimension: 'audience',
    strategicGoal: 'traffic_growth',
    priority: 'high',
    dimensionAnchor: '痛点：提示词门槛高记不住',
    tags: ['填空式提示词', '小白易用'],
    isPinned: true,
    createdAt: '2026-08-18'
  },
  {
    id: 'spark-7',
    accountId: 'acc-2',
    content: '变现漏斗：在视频号演示30秒自动出图流程，评论区扣“AI神器”自动触发智能私信发放工作流源文件。',
    dimension: 'monetization',
    strategicGoal: 'lead_conversion',
    priority: 'high',
    dimensionAnchor: '转化路径：评论区AI神器触发私信',
    tags: ['工作流源文件', '自动私信'],
    isPinned: false,
    createdAt: '2026-08-17'
  }
];

