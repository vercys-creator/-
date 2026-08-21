export type MemoryCategory = 
  | 'personal_story'     // 个人经历与真实案例 (真实故事、踩坑历史、学员战绩)
  | 'core_thesis'        // 独家观点与反常识金句 (行业洞察、坚守原则、反常识)
  | 'product_hook'       // 变现产品与引流钩子 (资料包、课程、服务、交付清单)
  | 'audience_faq'       // 受众卡点与高频痛点 (真实问答、评论区困惑、新手误区)
  | 'style_boundary';    // 表达禁忌与风格红线 (严禁词汇、偏好口吻、品牌调性)

export interface AccountMemoryItem {
  id: string;
  accountId: string;          // 绑定的账号ID (支持特定账号，也可设为 'global')
  title: string;              // 记忆标题（如：第一次裸辞被坑2万的经历）
  category: MemoryCategory;   // 记忆分类
  content: string;            // 核心记忆详细内容 (AI生成选题时的深度知识上下文)
  keyTakeaway?: string;       // 一句话精炼提炼
  tags: string[];             // 关联标签
  importance: 'high' | 'medium' | 'low'; // 注入权重
  isEnabled: boolean;         // 是否在生成选题时激活该条记忆
  citationsCount?: number;    // 被选题引用的次数统计
  lastUsedAt?: string;
  createdAt: string;
}

export interface TargetAudience {
  primary: string;
  painPoints: string[];
  desires: string[];
}

export interface PersonaAndTrust {
  identity: string;
  tone: string;
  trustAnchor: string;
  slogan: string;
}

export interface Monetization {
  frontend: string;
  backend: string;
  funnelLogic: string;
}

export interface ContentAndVisual {
  primaryFormat: string;
  visualStyle: string;
  contentPillars: string[];
}

export type PositioningDimension = 
  | 'audience'       // 目标受众与痛点
  | 'persona'        // 差异化人设与信任
  | 'monetization'   // 商业变现与漏斗
  | 'contentVisual'  // 内容形式与视觉
  | 'rawSpark';      // 自由原始灵感

export type StrategicGoal = 
  | 'traffic_growth'     // 流量破圈/触达新客
  | 'trust_authority'    // 信任背书/人设心智
  | 'lead_conversion'    // 私域引流/转化变现
  | 'content_efficiency' // 视觉辨识/内容资产
  | 'niche_breakthrough'; // 冷启切入/赛道卡位

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface CapturedIdea {
  id: string;
  accountId: string;
  content: string;
  dimension: PositioningDimension;
  strategicGoal?: StrategicGoal;
  priority?: PriorityLevel;
  dimensionAnchor?: string; // 关联当前账号的具体定位子项（如特定痛点、内容支柱、前端引流品等）
  tags?: string[];
  createdAt: string;
  isPinned?: boolean;
  appliedTarget?: string;
}

export type InspirationNote = CapturedIdea;

export interface AccountPositioning {
  targetAudience: TargetAudience;
  personaAndTrust: PersonaAndTrust;
  monetization: Monetization;
  contentAndVisual: ContentAndVisual;
  oneSentencePitch: string;
}

export interface Account {
  id: string;
  name: string;
  avatarIcon: string;
  niche: string;
  targetPlatform: string;
  currentStage: string;
  inspiration: string;
  positioning?: AccountPositioning;
  createdAt: string;
}

export interface TopicDay {
  day: number;
  angleType: string;
  headlineOptions: string[];
  goldenHook: string;
  targetEmotion: string;
  psychologyTrigger: string;
  outline: string[];
  coverTextProposal: {
    badge: string;
    mainTitle: string;
    subTitle: string;
  };
  referencedMemoryTitle?: string;       // 融合引用的专属记忆标题（如：裸辞踩坑经历）
  referencedMemoryCategory?: MemoryCategory; // 融合的记忆分类
  memoryIntegrationTip?: string;        // 记忆资产融入说明（如何与当天选题天然结合）
}

export interface TopicMatrix {
  id: string;
  accountId: string;
  keyword: string;
  coreThesis: string;
  topics: TopicDay[];
  createdAt: string;
}

export interface XingtuButterVisualSpec {
  toolSource: '醒图' | '黄油相机' | '醒图+黄油';
  fontStyle: string; // 字体风格名，如 "黄油软糖体 (圆润吸睛)" / "阿里妈妈数黑体 (力量感加粗)"
  fontFamily: string; // CSS 字体族
  layoutStructure: string; // 如 "上标下主标题" / "双栏左右对比" / "高光大字居中" / "三段式清单"
  colorPalette: {
    titleColor: string;
    titleBg?: string;
    badgeBg: string;
    badgeColor: string;
    bgColor: string;
    bgGradient?: string;
    highlightColor: string;
  };
  filterPreset: 'none' | 'high-contrast' | 'vintage' | 'warm' | 'cool' | 'cinematic';
  filterName: string; // 如 "醒图 · 奶油日杂" / "黄油 · 芝士暖黄" / "高反差黑金"
  stickerPresets?: {
    text: string;
    bg: string;
    color: string;
  }[];
  designNotes: string; // 设计排版拆解要点与复用诀窍
}

export interface DeconstructionResult {
  coreLogic: string;
  hookPattern: {
    type: string;
    analysis: string;
    formula: string;
  };
  structureFlow: {
    part: string;
    function: string;
    keyElements: string;
  }[];
  coverVisualLogic: string;
  visualSpec?: XingtuButterVisualSpec;
  reversePrompt?: string; // AI 反推生图/封面海报提示词（用于在 Gemini / 绘图工具中 1:1 复刻或二创）
  reusableTemplate: string;
  actionableTakeaways: string[];
}

export interface KnowledgeItem {
  id: string;
  accountId?: string;
  title: string;
  coverText: string;
  bodyContent: string;
  myInsights: string;
  accountNiche: string;
  tags: string[];
  referenceImage?: string; // 导入的参考图（Base64 或 图片链接）
  deconstructMode?: 'deep' | 'standard';
  visualSpec?: XingtuButterVisualSpec; // 提炼并可同步的醒图/黄油排版规范
  reversePrompt?: string; // 反推文生图/封面提示词
  deconstruction?: DeconstructionResult;
  isFavorite?: boolean; // 是否加入收藏
  createdAt: string;
}

export interface CoverVisualConfig {
  aspectRatio: '3:4' | '1:1' | '9:16' | '16:9';
  bgType: 'color' | 'gradient' | 'image';
  bgColor: string;
  bgGradient: string;
  bgImage?: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  mainTitle: string;
  titleColor: string;
  titleHighlightColor: string;
  titleBg: string;
  titleSize: number;
  subTitle: string;
  subTitleColor: string;
  subTitleSize: number;
  fontFamily?: string;
  fontStyle?: string;
  xingtuButterStyle?: string;
  sourceKnowledgeId?: string; // 来源于具体哪一个爆款经验库条目
  highlightWords: string[];
  stickers: {
    id: string;
    text: string;
    x: number;
    y: number;
    bg: string;
    color: string;
  }[];
  filter: 'none' | 'high-contrast' | 'vintage' | 'warm' | 'cool' | 'cinematic';
  overlayDarkness: number;
}

export interface ActivePromptContext {
  topic: string;
  selectedTitle: string;
  goldenHook: string;
  badgeText: string;
  bodyContent?: string;
  tags?: string[];
  accountNiche?: string;
  targetAudience?: string;
  accountPersona?: string;
  // Referenced Knowledge Visual Deconstruction Metadata
  sourceKnowledgeId?: string;
  sourceKnowledgeTitle?: string;
  referenceImage?: string;
  visualSpec?: XingtuButterVisualSpec;
  reversePrompt?: string;
  coverVisualLogic?: string;
  extractedHookFormula?: string;
  reusableTemplate?: string;
  isDeconstructingAsync?: boolean;
  deconstructStatusText?: string;
}

export type CreationWorkflowMode = 'dual_all' | 'cover_only' | 'text_only';

export interface DraftPost {
  id: string;
  accountId: string;
  topicTitle: string;
  titles: string[];
  selectedTitle: string;
  goldenHook: string;
  body: string;
  callToAction: string;
  tags: string[];
  coverVisual: CoverVisualConfig;
  createdAt: string;
}

export interface DataReviewItem {
  id: string;
  accountId: string;
  postTitle: string;
  postUrl: string;
  platform: string;
  publishDate: string;
  views: number;
  likes: number;
  comments: number;
  collects: number;
  shares: number;
  conversions: number;
  diagnosis?: {
    performanceLevel: string;
    calculatedMetrics: {
      engagementRate: string;
      collectToLikeRatio: string;
      estimatedCTRHealth: string;
    };
    coreBottleneck: string;
    deepDiagnosis: {
      coverAndTitle: string;
      contentAndHook: string;
      ctaAndConversion: string;
    };
    actionableFixes: {
      priority: string;
      action: string;
      expectedImpact: string;
    }[];
    iterativePromptForNextPost: string;
  };
  createdAt: string;
}

export interface MasterPromptResult {
  rawInput: string;
  rawResponse: string;
  understanding: string;
  missingPoints: string;
  framework: string;
  masterPrompt: string;
  createdAt: string;
}

export interface WorkflowAuditReport {
  healthScore: number;
  statusSummary: string;
  auditChecklist: {
    module: string;
    status: 'pass' | 'warning' | 'danger';
    issue: string;
    suggestion: string;
  }[];
  topPriorityAction: string;
  systemOptimizationTips: string[];
  timestamp: string;
}
