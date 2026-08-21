import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Server-side GoogleGenAI initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Candidate models for automatic fallback during high demand or temporary 503 / 429 errors
const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
];

interface GenerateWithFallbackOptions {
  contents: any;
  config?: any;
  preferredModel?: string;
  maxRetriesPerModel?: number;
}

/**
 * Robust wrapper that handles transient 503 (high demand), 429 (rate limits), and network errors
 * by executing exponential backoff and gracefully falling back to secondary valid models.
 */
async function generateWithFallback(options: GenerateWithFallbackOptions) {
  const modelsToTry = options.preferredModel
    ? [options.preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== options.preferredModel)]
    : CANDIDATE_MODELS;

  let lastError: any = null;

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const model = modelsToTry[mIdx];
    const maxRetries = options.maxRetriesPerModel ?? 2;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(800 * Math.pow(2, attempt - 1) + Math.random() * 200, 2500);
          console.warn(`[AI Retry] Waiting ${Math.round(delay)}ms before retry attempt ${attempt + 1} for model '${model}'...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });

        if (mIdx > 0 || attempt > 0) {
          console.log(`[AI Success] Generated successfully using model '${model}' (fallback/retry succeeded)`);
        }

        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[AI Warning] Model '${model}' attempt ${attempt + 1} failed: ${errMsg}`);

        const isTemporaryIssue =
          err?.status === 503 ||
          err?.status === 429 ||
          errMsg.includes("503") ||
          errMsg.includes("429") ||
          errMsg.includes("high demand") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("Resource has been exhausted") ||
          errMsg.includes("Overloaded") ||
          errMsg.includes("fetch failed");

        if (!isTemporaryIssue && attempt === 0) {
          // If it's a non-retryable bad request on this model, break to next model
          break;
        }
      }
    }
  }

  throw lastError || new Error("AI 服务当前处于高峰期，请稍后重试");
}

// 1. Master Prompt Generator (Based on user's First Principles framework)
app.post("/api/ai/master-prompt", async (req, res) => {
  try {
    const { rawThoughts, accountContext } = req.body;
    if (!rawThoughts) {
      return res.status(400).json({ error: "请提供原始想法或问题内容" });
    }

    const systemInstruction = `你是一名顶级的【AI 提示词架构师 + 问题拆解专家 + 需求澄清专家 + 结果质量优化专家】。
你的任务不是马上解决用户的原始问题，而是把用户零散、口语化、不完整的想法，按照以下“第一性原理”深度重构成一份可以直接复制给 ChatGPT/Claude 使用的高质量 Master Prompt。

你必须严格按照以下四个部分结构化输出：

① 你对我真正需求的理解
用简练精炼的语言，说明用户表面上在问什么、真正想解决的核心问题是什么、最终目标是什么。

② 我的原问题还缺少什么
客观指出原问题遗漏的维度、核心变量、模糊点、逻辑漏洞或错误假设（不迎合用户）。

③ 推荐的分析框架
列出针对该问题最适合的分析维度（例如商业模式、获客成本、转化路径、用户心理、交付成本、风险规避、验证优先级等）。

④ 最终 Master Prompt
生成一份可以直接复制、结构严谨的完整提示词：
包含：
- 【AI专家角色组合】：根据任务定制具体复合专家（如：小红书爆款操盘手 + 转化文案专家 + 商业增长顾问）
- 【任务背景与核心目标】：明确任务边界与资源约束
- 【必须遵循的原则】：严禁泛泛而谈、必须区分事实/判断/假设、优先考虑落地可行性、给出明确优先级与可量化指标、严禁盲目迎合
- 【深度分析维度与反向质疑】：要求 AI 主动反向提问与挑刺
- 【严格结构化输出要求】：分模块落地执行步骤`;

    const prompt = `用户账号背景信息：
${accountContext ? JSON.stringify(accountContext, null, 2) : "无特定账号绑定"}

用户口语化的原始想法与问题：
${rawThoughts}

请严格按照四部分格式生成 Master Prompt。`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ result: response.text || "" });
  } catch (error: any) {
    console.error("Master Prompt error:", error);
    res.status(500).json({ error: error.message || "生成 Master Prompt 失败，请稍后重试" });
  }
});

// 2. Account 4-Dimension Positioning (四维定位)
app.post("/api/ai/positioning", async (req, res) => {
  try {
    const { accountName, niche, inspiration, currentStage, targetPlatform } = req.body;

    const systemInstruction = `你是一名拥有操盘上百个百万粉丝账号的【新媒体操盘手 + 商业IP定位架构师】。
你需要根据创作者的灵感、赛道和阶段，为该账号制定极其精准、极具商业价值的【账号四维定位方案】。
不要输出假大空的套话，每一项都要有具体可落地的抓手。

请输出 JSON 格式，严格符合以下结构：
{
  "targetAudience": {
    "primary": "核心目标受众画像（年龄、职业、生活场景）",
    "painPoints": ["核心痛点1（深层焦虑或阻碍）", "核心痛点2", "核心痛点3"],
    "desires": ["核心渴望/利益点1", "核心渴望/利益点2"]
  },
  "personaAndTrust": {
    "identity": "人设标签与鲜明反差定位（如：8年大厂裸辞的极简生活践行者）",
    "tone": "说话风格与语气特征（如：犀利直接、温和陪伴、保姆级理性质疑）",
    "trustAnchor": "信任锚点（为什么受众相信你？实操成果/踩坑经验/背书）",
    "slogan": "一句击中人心的金句Slogan"
  },
  "monetization": {
    "frontend": "前端引流钩子（免费资料包/社群/诊断/模板）",
    "backend": "后端核心变现产品（课程/咨询/带货/私董会/服务）",
    "funnelLogic": "最短商业闭环转化路径"
  },
  "contentAndVisual": {
    "primaryFormat": "主打内容形式（图文干货合集/真人出镜口播/痛点对比图/幕后Vlog）",
    "visualStyle": "封面与排版视觉风格规范（主色调、高光对比词、醒目标签样式）",
    "contentPillars": ["内容支柱1（如：避坑干货 40%）", "内容支柱2（如：认知升级 30%）", "内容支柱3（如：实操案例 30%）"]
  },
  "oneSentencePitch": "账号一句话电梯介绍（我是谁+帮谁解决什么问题+提供什么独特价值）"
}`;

    const prompt = `账号名称：${accountName || "新账号"}
目标赛道/领域：${niche || "未定"}
目标平台：${targetPlatform || "小红书/抖音/微信视频号/公众号"}
创作者灵感与现状：${inspiration || "想从零启动一个高价值账号"}
当前阶段：${currentStage || "从零起步探索期"}

请输出深度量身定制的四维定位 JSON。`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ result: parsed });
  } catch (error: any) {
    console.error("Positioning error:", error);
    res.status(500).json({ error: error.message || "生成账号四维定位失败，请稍后重试" });
  }
});

// 2.1 Spark Inspiration Analyzer (灵感快速提炼与四维战略归类)
app.post("/api/ai/spark-analyze", async (req, res) => {
  try {
    const { rawSpark, accountContext } = req.body;
    if (!rawSpark) {
      return res.status(400).json({ error: "请输入灵感内容" });
    }

    const systemInstruction = `你是一名顶级账号四维定位与战略灵感提炼专家。创作者快速记录了一句转瞬即逝的灵感或想法，你需要帮其提炼精炼、归类到最契合的账号定位维度与战略增长目标中。
可选定位维度（dimension）：
- "audience": 目标受众与痛点细分（击穿什么焦虑、痛点、渴望）
- "persona": 差异化人设与信任锚点（反差人设、说话调性、背书信任、金句Slogan）
- "monetization": 商业变现闭环与漏斗（前端钩子、后端高客单、转化路径）
- "contentVisual": 内容形式与视觉辨识度（封面规范、排版形式、内容支柱）
- "rawSpark": 自由原始灵感（适合后续发散或选题）

可选战略目标（strategicGoal）：
- "traffic_growth": 流量破圈与新客触达（打造爆款Hook、扩大受众面、情绪共鸣）
- "trust_authority": 信任背书与专业心智（深度排雷、真实证据链、反差人设）
- "lead_conversion": 商业变现与私域沉淀（引流资料包、交付产品、转化漏斗）
- "content_efficiency": 视觉辨识与爆款模版（视觉锤、封面规范、高密度结构）
- "niche_breakthrough": 冷启破局与赛道卡位（差异化细分切入、降维打击）

请输出 JSON 格式：
{
  "refinedContent": "提炼后更具穿透力和定位价值的精炼表述（1-2句话）",
  "suggestedDimension": "audience | persona | monetization | contentVisual | rawSpark",
  "strategicGoal": "traffic_growth | trust_authority | lead_conversion | content_efficiency | niche_breakthrough",
  "priority": "high | medium | low",
  "dimensionAnchor": "具体建议挂载/关联的定位细分子项描述（如：精准击穿30岁副业焦虑、高价值引流多维表、黑黄高反差封面）",
  "tags": ["标签1", "标签2", "标签3"],
  "dimensionRationale": "为什么归入该维度与战略目标的简短说明",
  "injectionTarget": "painPoints | trustAnchor | frontendHook | visualStyle | generalSpark",
  "topicPromptSeed": "如果延伸成选题的一句话切入点"
}`;

    const prompt = `账号背景与定位：${accountContext ? JSON.stringify(accountContext) : "通用博主"}
创作者原始灵感：
"${rawSpark}"

请深入分析提炼该灵感，给出精炼表达、推荐维度、战略增长目标、优先级以及关联定位锚点。`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ result: parsed });
  } catch (error: any) {
    console.error("Spark analyze error:", error);
    res.status(500).json({ error: error.message || "灵感提炼分析失败，请稍后重试" });
  }
});

// 2.2 Account Memory Distiller (AI 智能记忆提炼与归纳)
app.post("/api/ai/memory-distill", async (req, res) => {
  try {
    const { rawText, accountContext } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: "请输入需要提炼的原始内容或经历笔记" });
    }

    const systemInstruction = `你是一名顶级自媒体个人IP记忆资产架构师与知识提炼专家。创作者提供了一段口语化笔记、聊天记录、真实经历、踩坑复盘、产品介绍或受众反馈，你的任务是将其精细化提炼为 1 至 3 条高价值、可直接用于赋能选题创作的【账号专属记忆资产】。

记忆分类（category）：
- "personal_story": 个人经历与真实案例（真实故事、踩坑历史、学员战绩、职场/创业经历）
- "core_thesis": 独家观点与反常识金句（底层洞察、坚守原则、反直觉认知、方法论）
- "product_hook": 变现产品与引流钩子（资料包、多维表格、课程、交付清单、私域服务）
- "audience_faq": 受众卡点与高频痛点（真实问答、评论区困惑、新手常见误区）
- "style_boundary": 表达禁忌与品牌红线（严禁词汇、偏好口吻、合规调性）

请输出严格的 JSON 格式：
{
  "memories": [
    {
      "title": "精炼清晰的记忆标题（如：第一次裸辞被割2万的真实踩坑复盘）",
      "category": "personal_story | core_thesis | product_hook | audience_faq | style_boundary",
      "content": "沉淀后的核心记忆详细内容（包含细节、事实或方法，便于后续AI直接引用为案例或论据）",
      "keyTakeaway": "一句话核心提炼/金句总结",
      "tags": ["标签1", "标签2", "标签3"],
      "importance": "high | medium | low"
    }
  ]
}`;

    const prompt = `当前账号背景：${accountContext ? JSON.stringify(accountContext) : "通用博主"}
创作者提供的原始素材与口语化内容：
"${rawText}"

请深入提炼出最关键的专属记忆资产 JSON。`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ result: parsed });
  } catch (error: any) {
    console.error("Memory distill error:", error);
    res.status(500).json({ error: error.message || "提炼记忆资产失败，请稍后重试" });
  }
});

// 3. 1-Keyword to 7-Day Topic Matrix (一周爆款选题矩阵 · 深度融合账号记忆库)
app.post("/api/ai/topics-matrix", async (req, res) => {
  try {
    const { keyword, accountInfo, accountMemories } = req.body;
    if (!keyword) {
      return res.status(400).json({ error: "请输入核心关键词" });
    }

    const hasMemories = Array.isArray(accountMemories) && accountMemories.length > 0;

    const systemInstruction = `你是一名顶级爆款内容选题总监与个人IP架构操盘手。根据单个关键词、账号四维定位以及【创作者专属记忆库 (Personal Story, Product Hook, Core Thesis, FAQs)】，深挖出 7 天连贯且切中不同用户心理机制的【一周爆款选题矩阵】。

7天选题必须涵盖不同情绪驱动：
- Day 1: 痛点暴露 / 焦虑共鸣 (痛点暴露、心理代入)
- Day 2: 避坑避雷 / 认知颠覆 (反直觉避坑、破除误区)
- Day 3: 保姆级实操教程 / SOP清单 (步骤拆解、引流资料包植入)
- Day 4: 反直觉观点 / 独家金句 (打破传统认知、建立专业心智)
- Day 5: 真实逆袭/踩坑案例复盘 (真实故事佐证、人设立体化)
- Day 6: 高价值资源合集 / 模板分享 (实用工具、模板赋能)
- Day 7: 深度提炼 / 互动召集与沉淀 (社群互动、私域变现)

${hasMemories ? `
★ 核心指令：【深度融入创作者专属记忆库】
创作者特别激活了专属记忆资产（包含其真实踩坑故事、独家变现工具/引流资料、反常识金句、受众真实痛点）。
你【必须】将这些独家记忆天然融入到 7 天各个选题中！
- 比如在 Day 5 案例复盘中直接引用创作者的真实故事；
- 在 Day 3 / Day 6 SOP清单中自然结合其独家变现钩子或多维表格资料包；
- 在 Day 2 / Day 4 中引用创作者的独家认知金句；
- 在输出的每个 topic 中，必须清晰注明 referencedMemoryTitle（融入的记忆标题）、referencedMemoryCategory（记忆分类）和 memoryIntegrationTip（如何将该记忆转化为爆款内容的独家要点）。
` : `请根据行业通用爆款模型，输出极具吸引力的7天选题。`}

请输出严格 JSON 格式：
{
  "keyword": "关键词",
  "coreThesis": "该关键词背后的核心用户洞察与战略切入点",
  "topics": [
    {
      "day": 1,
      "angleType": "痛点共鸣/避坑干货/保姆教程/反直觉观点/案例复盘/资源合集/互动引流",
      "headlineOptions": ["爆款标题选项A", "爆款标题选项B", "爆款标题选项C（高CTR）"],
      "goldenHook": "前3秒/第一屏黄金抓眼文案（融入真实感与痛点）",
      "targetEmotion": "击中的核心情绪",
      "psychologyTrigger": "为什么用户忍不住点击和收藏？",
      "outline": ["步骤1 / 观点1", "步骤2 / 观点2", "步骤3 / 观点3"],
      "coverTextProposal": {
        "badge": "标签（如：避坑必看）",
        "mainTitle": "封面大字主标题（8-12字）",
        "subTitle": "副标题/补充利益点"
      },
      "referencedMemoryTitle": "融入引用的记忆标题（如：裸辞创业被割2万的真实踩坑经历）",
      "referencedMemoryCategory": "personal_story | core_thesis | product_hook | audience_faq | style_boundary",
      "memoryIntegrationTip": "记忆资产融入说明（如：将2万学费踩坑作为开篇反差Hook，强化真实感与信任背书）"
    }
  ]
}`;

    const prompt = `核心关键词：${keyword}
账号背景与定位：${accountInfo ? JSON.stringify(accountInfo) : "通用优质自媒体博主"}
创作者专属记忆库资产：
${hasMemories ? JSON.stringify(accountMemories, null, 2) : "暂无专属记忆注入"}

请生成极具爆款潜力和专属真实感的 7 天选题矩阵 JSON。`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ result: parsed });
  } catch (error: any) {
    console.error("Topic matrix error:", error);
    res.status(500).json({ error: error.message || "生成选题矩阵失败，请稍后重试" });
  }
});

// 4. Viral Deconstruction Engine (爆款反向拆解 + 醒图/黄油视觉对接 + 反推生图提示词)
app.post("/api/ai/deconstruct", async (req, res) => {
  try {
    const { title, coverText, bodyContent, myInsights, accountNiche, referenceImage, deconstructMode = 'deep' } = req.body;
    if (!title && !bodyContent && !coverText && !referenceImage) {
      return res.status(400).json({ error: "请提供至少一项拆解素材（参考图/标题/封面文案/正文内容）" });
    }

    const isDeep = deconstructMode === 'deep' || !!referenceImage;

    const systemInstruction = `你是一名顶级新媒体爆款内容反向工程大师、视觉排版设计总监兼提示词架构师。
你的任务是将优秀的爆款图文/视频文案、封面参考图以及创作者的心得笔记，进行手术刀级别的深度反向工程拆解，提炼出可复制的底层逻辑，并产出可直接对接到“醒图”和“黄油相机”的排版与视觉设计规范，以及生图/封面反推提示词。

请输出严格的 JSON 格式：
{
  "deconstruction": {
    "coreLogic": "底层爆火逻辑（为什么能拿到流量？满足了什么受众心理与平台推荐机制）",
    "hookPattern": {
      "type": "Hook分类（如：痛点反直觉/好奇缺口/数字暴击/身份代入/避坑警示/权威背书）",
      "analysis": "Hook 抓人留存逻辑剖析",
      "formula": "提炼出的爆款公式（如：【受众身份】+【反常识结果】+【低门槛SOP路径】）"
    },
    "structureFlow": [
      { "part": "开头/黄金3秒", "function": "抓注意、拉升完读率", "keyElements": "核心要素与触发词" },
      { "part": "中段/价值展开", "function": "提供信息增量与认知颠覆", "keyElements": "论据层级与排版节奏" },
      { "part": "结尾/行动号召(CTA)", "function": "促点赞/收藏/评论/私信转化", "keyElements": "低阻力互动钩子" }
    ],
    "coverVisualLogic": "封面视觉与文案排版深度剖析（视觉焦点、字号级差、色块衬底、留白与信息密度）",
    "visualSpec": {
      "toolSource": "醒图" 或 "黄油相机" 或 "醒图+黄油",
      "fontStyle": "推荐的具体字体名称及特征（如：黄油软糖体 (圆润吸睛) / 阿里妈妈数黑体 (力量感加粗) / 造字工房尚雅 (极简冷淡) / 汉仪尚巍手书 (情绪冲击) / 得意黑 (日系醒目) / 华康少女体 (生活手账)）",
      "fontFamily": "匹配的系统/Web字体族（如：'Alimama ShuHeiTi', 'ZCOOL KuaiLe', 'PingFang SC', sans-serif）",
      "layoutStructure": "排版结构（如：'上标下主标题+大字高光' / '双栏左右对比' / '高光大字居中+胶囊标签' / '三段式信息流清单'）",
      "colorPalette": {
        "titleColor": "#ffffff",
        "titleBg": "#0f172a",
        "badgeBg": "#e11d48",
        "badgeColor": "#ffffff",
        "bgColor": "#090d16",
        "bgGradient": "linear-gradient(135deg, #090d16 0%, #1e293b 100%)",
        "highlightColor": "#facc15"
      },
      "filterPreset": "high-contrast" 或 "warm" 或 "cool" 或 "vintage" 或 "cinematic" 或 "none",
      "filterName": "调色方案名（如：'醒图 · 高反差黑金' / '黄油 · 芝士暖黄' / '醒图 · 奶油日杂' / '黄油 · 薄荷清甜' / '醒图 · 复古胶片'）",
      "stickerPresets": [
        { "text": "🔥 爆款标签1", "bg": "#f59e0b", "color": "#000000" },
        { "text": "📌 建议收藏", "bg": "#10b981", "color": "#ffffff" }
      ],
      "designNotes": "醒图/黄油具体实操建议（如何在大字排版、高亮色块、贴纸阴影上达到同等爆款视觉冲击力）"
    },
    "reversePrompt": "反推文生图/封面提示词（包含风格限定、视角构图、主体描述、光影色调、细节修饰、质量词等，格式兼容 Midjourney / Gemini / 百度搭子 生图，如：Commercial product/knowledge card photography, high contrast bold typography layout, matte dark backdrop with glowing yellow accent blocks, minimalist composition, 8k resolution, aspect ratio 3:4）",
    "reusableTemplate": "可直接套用的万能文案模板（包含完整骨架与填空括号）",
    "actionableTakeaways": [
      "落地执行建议1（结合账号赛道与创作者心得）",
      "落地执行建议2",
      "落地执行建议3"
    ]
  },
  "tags": ["标签1", "标签2", "标签3", "标签4"]
}`;

    const promptText = `待拆解素材信息：
- 拆解深度模式：${isDeep ? "⚡ 深度拆解 (视觉排版+文案公式+醒图黄油规范+反向提示词)" : "📋 标准拆解 (文案与Hook)"}
- 爆款标题：${title || "未提供，请根据素材内容提炼"}
- 封面文案：${coverText || "未提供，请根据素材内容或参考图分析"}
- 正文文案：${bodyContent || "未提供，请根据素材内容分析"}
- 创作者手动心得与观察：${myInsights || "无"}
- 适配账号赛道：${accountNiche || "通用"}
${referenceImage ? "- 包含一张上传的爆款封面/参考图（已作为多模态图片传入），请重点解析该参考图的视觉排版、大字布局、色彩对比、醒图/黄油工具对应选项，并生成精准反推提示词。" : ""}

请依据第一性原理输出严谨、高质量且立即可落地的 JSON 拆解报告。`;

    const contents: any[] = [];
    if (referenceImage && typeof referenceImage === 'string' && referenceImage.startsWith('data:')) {
      const matches = referenceImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        contents.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }
    contents.push({ text: promptText });

    const response = await generateWithFallback({
      contents: contents.length === 1 ? promptText : contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ result: parsed });
  } catch (error: any) {
    console.error("Deconstruct error:", error);
    res.status(500).json({ error: error.message || "拆解失败，请稍后重试" });
  }
});

// 4.1 Quick Spark to Knowledge Base AI Refiner (灵感/碎片观点快速升维并存入知识库)
app.post("/api/ai/quick-spark-to-knowledge", async (req, res) => {
  try {
    const { rawSpark, viewpointType, sourceReference, accountContext } = req.body;
    if (!rawSpark) {
      return res.status(400).json({ error: "请输入灵感或观点内容" });
    }

    const systemInstruction = `你是一名顶级新媒体内容操盘手与知识体系架构师。
创作者记录了一条随时闪现的碎片化爆款观点、金句或灵感，你需要帮其快速升维成结构化、可复用、可检索的知识库条目（KnowledgeItem）。

请输出 JSON 格式，严格符合以下结构：
{
  "title": "提炼成极具吸引力的知识库条目标题（如：【认知颠覆】为什么副业做不大？缺的不是项目而是笨功夫）",
  "coverTextProposal": "提炼出适合作为封面大字的吸睛金句（8-14字）",
  "structuredInsights": "创作者核心洞察与经验提炼（深入解析这个观点的底层价值与破局点）",
  "tags": ["适合标签1", "适合标签2", "适合标签3", "适合标签4"],
  "deconstruction": {
    "coreLogic": "该碎片观点背后的用户心理机制或爆款逻辑（为什么能引发共鸣/转发/付费？）",
    "hookPattern": {
      "type": "痛点反直觉/认知颠覆/金句切片/情绪共鸣/实用SOP",
      "analysis": "Hook 抓人逻辑分析",
      "formula": "可复用的爆款表达公式（如：【打破大众常识】+【揭露核心真相】+【给出唯一解】）"
    },
    "structureFlow": [
      { "part": "开头抛出观点/打破认知", "function": "瞬间拉升好奇与认同", "keyElements": "要素" },
      { "part": "中段论证拆解/真实对比", "function": "建立深度说服力", "keyElements": "要素" },
      { "part": "结尾金句收尾/引导互动", "function": "促收藏或评论区讨论", "keyElements": "要素" }
    ],
    "coverVisualLogic": "推荐搭配的视觉风格（如：黑底黄字高反差、大字排版、高亮关键词）",
    "reusableTemplate": "基于此观点提炼出的通用文案仿写模板（带填空括号）",
    "actionableTakeaways": [
      "落地实操/选题建议1",
      "落地实操/选题建议2"
    ]
  }
}`;

    const prompt = `创作者碎片观点/灵感内容：
"${rawSpark}"

观点类型：${viewpointType || "碎片爆款观点"}
来源参考/补充备注：${sourceReference || "随手记录"}
账号背景：${accountContext ? JSON.stringify(accountContext) : "通用博主"}

请将该碎片灵感升维提炼为完整的知识库结构化条目 JSON。`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ result: parsed });
  } catch (error: any) {
    console.error("Quick spark to knowledge error:", error);
    res.status(500).json({ error: error.message || "灵感升维失败，请稍后重试" });
  }
});

// 5. Viral Copywriting & Cover Layout Generator (爆款图文生成与封面微调数据)
app.post("/api/ai/generate-content", async (req, res) => {
  try {
    const { topic, angle, targetAudience, accountPersona, deconstructedTemplate } = req.body;

    const systemInstruction = `你是一名千万级爆款文案主笔 + 视觉设计师。
根据选题、受众和账号人设，生成包含：
1. 3个不同测试角度的高点击标题
2. 黄金前3秒第一屏文案
3. 具有强呼吸感、排版优美、包含适量Emoji的高转化正文
4. 诱导点赞/收藏/评论的强力互动CTA
5. 精准标签Hashtags
6. 专为【醒图/黄油相机】视觉编辑器设计的封面图层数据（包括主标题、副标题、标签、高光色建议）。

请输出 JSON 格式：
{
  "titles": ["高唤醒标题1", "好奇心标题2", "痛点颠覆标题3"],
  "goldenHook": "黄金前3秒 Hook",
  "body": "正文内容（段落分明，每段不超过3行，自带视觉节奏）",
  "callToAction": "结尾促互动/私信话术",
  "tags": ["#小红书爆款", "#干货分享", "#认知提升"],
  "coverVisualData": {
    "badgeText": "🔥 收藏备用",
    "mainTitle": "核心爆款大标题",
    "subTitle": "直击痛点的副标题解释",
    "highlightWords": ["核心词1", "核心词2"],
    "suggestedBgColor": "#1e293b",
    "suggestedAccentColor": "#fbbf24"
  }
}`;

    const prompt = `选题/主题：${topic || "如何高效做出爆款内容"}
切入角度：${angle || "避坑指南与实操框架"}
目标受众：${targetAudience || "自媒体创作者/知识博主"}
账号人设风格：${accountPersona || "专业、实操、犀利直接"}
参考拆解模板：${deconstructedTemplate ? JSON.stringify(deconstructedTemplate) : "按行业最优爆款范式生成"}

请生成完整的图文内容与封面设计数据 JSON。`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ result: parsed });
  } catch (error: any) {
    console.error("Generate content error:", error);
    res.status(500).json({ error: error.message || "生成文案与封面数据失败，请稍后重试" });
  }
});

// 5.0 Fast Asynchronous Image Visual Metadata Extractor
app.post("/api/ai/extract-image-visual-metadata", async (req, res) => {
  try {
    const { referenceImage, title, accountNiche } = req.body;
    if (!referenceImage) {
      return res.status(400).json({ error: "请提供需要解析的参考图" });
    }

    console.log(`[AI Vision] Asynchronously extracting visual spec & reverse prompt for: "${title || '参考图'}"`);

    const systemInstruction = `你是一名顶级新媒体视觉总监与【醒图 / 黄油相机】排版拆解专家。
你的任务是快速深度解析用户提供的爆款封面参考图，精准提炼其 4 色调色板、醒图/黄油字体工具规范、构图与排版逻辑、滤镜方案以及高水准的 AI 反推文生图 Prompt。

请输出严格 JSON 格式：
{
  "visualSpec": {
    "toolSource": "醒图" 或 "黄油相机" 或 "醒图+黄油",
    "fontStyle": "字体风格名称（如：'醒图加粗黑体 (高冲击力)' / '黄油软糖体 (圆润吸睛)' / '阿里妈妈数黑体'）",
    "fontFamily": "系统推荐搭配的 CSS 字体族（如 'system-ui, sans-serif' 或 'serif'）",
    "layoutStructure": "排版结构（如：'高反差大字居中+双色标签' / '三段式清单' / '左右对比'）",
    "colorPalette": {
      "bgColor": "#16进制背景主色",
      "bgGradient": "线性渐变CSS（如果有，如 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)'）",
      "titleColor": "#16进制主标题文字色（通常为高对比白或明黄）",
      "titleBg": "主标题底色或透明（如 'transparent' 或 '#000000'）",
      "highlightColor": "#16进制高光强调色（如 '#facc15' 或 '#38bdf8'）",
      "badgeBg": "#16进制角标标签背景色（如 '#e11d48'）",
      "badgeColor": "#16进制角标文字色"
    },
    "filterPreset": "high-contrast" 或 "warm" 或 "cool" 或 "vintage" 或 "cinematic" 或 "none",
    "filterName": "调色方案名（如：'醒图 · 高反差黑金' / '黄油 · 芝士暖黄' / '醒图 · 奶油日杂' / '黄油 · 薄荷清甜'）",
    "stickerPresets": [
      { "text": "🔥 爆款标签1", "bg": "#f59e0b", "color": "#000000" },
      { "text": "📌 建议收藏", "bg": "#10b981", "color": "#ffffff" }
    ],
    "designNotes": "醒图/黄油实操建议（如：大字主标题加粗居中，保留画面上方弱光区供排版，下部放置辅助信息）"
  },
  "reversePrompt": "纯英文高质量反推生图Prompt（用于在 Gemini / Midjourney 生成同款质感背景，严格 3:4 比例，必须强调 clean negative space in upper center for typography overlay, 8k resolution, studio lighting, no text on image）",
  "coverVisualLogic": "一句话视觉底层逻辑解析（如：黑黄高反差配色，视觉焦点集中在上半部，带来极强点击欲）",
  "dominantHex": "#1e293b",
  "accentHex": "#fbbf24"
}`;

    const promptText = `请对该爆款封面参考图进行视觉排版与色彩拆解：
- 标题参考：${title || "爆款笔记"}
- 赛道参考：${accountNiche || "通用"}

请提取视觉规范、4色卡、醒图/黄油排版建议与英文反推生图 Prompt。`;

    const contents: any[] = [];
    if (referenceImage && typeof referenceImage === 'string' && referenceImage.startsWith('data:')) {
      const matches = referenceImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        contents.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }
    contents.push({ text: promptText });

    const response = await generateWithFallback({
      contents: contents.length === 1 ? promptText : contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error("Extract image metadata error:", error);
    res.status(500).json({ error: error.message || "提取图片视觉元数据失败" });
  }
});

// 5.1 Intelligent Visual Spec & Title Synthesizer -> 3:4 Cover Background AI Generator
app.post("/api/ai/generate-cover-background", async (req, res) => {
  try {
    const {
      mainTitle,
      subTitle,
      badgeText,
      visualSpec,
      presetSourceTitle,
      reversePrompt,
      coverVisualLogic,
      referenceImage,
      accountContext,
      targetAudience,
      accountPersona,
    } = req.body;

    console.log(`[AI Cover] Synthesizing prompt & background for title: "${mainTitle}" based on preset: "${presetSourceTitle}"`);

    // Step 1: Synthesize an optimized visual prompt combining the template's color/tool style + user's title & subtitle
    const synthesisSystemInstruction = `你是一名顶级小红书视觉艺术总监与 AI 生图提示词架构师。
你的任务是将【用户当前的主标题、副标题、标签、受众定位】与【爆款经验库拆解模板的视觉排版、4色调色卡、醒图/黄油工具风格、反向提示词、底层视觉逻辑】融合成一段高水准的 3:4 封面底图生成英文 Prompt。

核心要求：
1. 【主题契合度】：根据用户输入的主标题和副标题（如商业增长、职场避坑、情感治愈、数码测评、美妆穿搭等），提炼出最匹配的画面意境与高级构图。
2. 【视觉调色对齐】：严格参考拆解模板的调色方案（主背景色、高光色、冷暖影调），如黑金高反差、暖黄芝士、日杂奶油质感、复古冷调等。
3. 【留白与排版友好】：小红书封面必须在【画面中上方或中心】预留干净的弱对比/微暗区（Negative Space），便于后续叠加大字排版，严禁视觉中心过于杂乱。
4. 【画面纯净感】：严禁在画面中生成错乱的无意义文字或假字母（NO messy text, clean composition, studio lighting, depth of field, 8k wallpaper quality）。
5. 【比例严格】：3:4 portrait aspect ratio。

请输出 JSON 格式：
{
  "synthesizedPrompt": "用于生图的纯英文高质量提示词（例如：Minimalist cinematic studio shot for knowledge card background, sleek dark matte slate tones with warm amber soft rim light, clean negative space in upper center for typography overlay, subtle modern geometric shadow, 8k resolution, photorealistic, 3:4 aspect ratio, no text on image）",
  "chineseSummary": "该生图方案的设计理念简述（一句话说明如何融合了当前标题与模板调色）",
  "visualMood": "视觉氛围描述（如：高反差质感黑金 / 治愈暖色调）",
  "dominantHex": "#1e293b",
  "accentHex": "#f59e0b"
}`;

    const synthesisUserPrompt = `【用户当前创作上下文】
- 主标题：${mainTitle || "爆款内容创作方法论"}
- 副标题：${subTitle || "拆解核心逻辑与实操SOP"}
- 角标/标签：${badgeText || "干货指南"}
- 目标受众：${targetAudience || "知识博主 / 自媒体创作者"}
- 账号人设：${accountPersona || "专业实战派"}
- 账号赛道：${accountContext ? JSON.stringify(accountContext) : "通用"}

【引用的拆解经验库元数据与视觉规范】
- 模板名称：${presetSourceTitle || "爆款拆解模板"}
- 视觉风格/工具：${visualSpec?.toolSource || "醒图+黄油"} · ${visualSpec?.fontStyle || "醒图粗黑"}
- 4色卡与色调：底色 ${visualSpec?.colorPalette?.bgColor || "#090d16"}, 标题色 ${visualSpec?.colorPalette?.titleColor || "#ffffff"}, 高光色 ${visualSpec?.colorPalette?.highlightColor || "#facc15"}, 标签色 ${visualSpec?.colorPalette?.badgeBg || "#e11d48"}
- 滤镜风格：${visualSpec?.filterName || visualSpec?.filterPreset || "高反差"}
- 模板反推提示词参考：${reversePrompt || "无，请根据视觉规范直接生成"}
- 封面排版与视觉逻辑：${coverVisualLogic || visualSpec?.designNotes || "大字排版，强调主标题，中上方留白"}

请综合当前创作意图与视觉规范，生成融合两者的结构化生图 Prompt 与设计理念 JSON。`;

    const synthesisContents: any[] = [];
    if (referenceImage && typeof referenceImage === 'string' && referenceImage.startsWith('data:')) {
      const matches = referenceImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        synthesisContents.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }
    synthesisContents.push({ text: synthesisUserPrompt });

    // Generate synthesized prompt first
    const promptSynthesisResponse = await generateWithFallback({
      contents: synthesisContents.length === 1 ? synthesisUserPrompt : synthesisContents,
      config: {
        systemInstruction: synthesisSystemInstruction,
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const promptData = JSON.parse(promptSynthesisResponse.text || "{}");
    const synthesizedPrompt = promptData.synthesizedPrompt || `High-end minimalist Xiaohongshu 3:4 cover background for ${mainTitle || 'knowledge sharing'}, clean negative space in upper center, elegant lighting, modern studio aesthetics, 8k resolution, no text`;

    console.log(`[AI Cover] Synthesized Prompt:`, synthesizedPrompt);

    // Step 2: Generate the 3:4 background image using Gemini Image model
    let generatedImageUrl: string | null = null;

    try {
      const imageModels = ["gemini-3.1-flash-image", "gemini-3.1-flash-lite-image"];
      for (const imgModel of imageModels) {
        try {
          const imgResponse = await ai.models.generateContent({
            model: imgModel,
            contents: {
              parts: [{ text: synthesizedPrompt }],
            },
            config: {
              imageConfig: {
                aspectRatio: "3:4",
              },
            },
          });

          const candidates = imgResponse.candidates || [];
          for (const cand of candidates) {
            for (const part of cand.content?.parts || []) {
              if (part.inlineData && part.inlineData.data) {
                const mimeType = part.inlineData.mimeType || "image/png";
                generatedImageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                console.log(`[AI Cover] Successfully generated image with model: ${imgModel}`);
                break;
              }
            }
            if (generatedImageUrl) break;
          }
          if (generatedImageUrl) break;
        } catch (imgErr: any) {
          console.warn(`[AI Cover] Model ${imgModel} image generation attempt failed:`, imgErr.message || imgErr);
        }
      }
    } catch (genError: any) {
      console.warn(`[AI Cover] AI image generation step encountered issue:`, genError.message);
    }

    // Step 3: High-aesthetic fallback SVG generator if base64 model is in paid quota / rate limit
    if (!generatedImageUrl) {
      console.log(`[AI Cover] Generating high-fidelity SVG/Canvas texture background aligned with color palette and prompt`);
      const domColor = promptData.dominantHex || visualSpec?.colorPalette?.bgColor || '#0d1117';
      const accColor = promptData.accentHex || visualSpec?.colorPalette?.highlightColor || '#f59e0b';
      const badgeBg = visualSpec?.colorPalette?.badgeBg || '#e11d48';
      
      const svgGraphic = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${domColor}" />
      <stop offset="60%" stop-color="#161b22" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <radialGradient id="glowTop" cx="50%" cy="20%" r="60%">
      <stop offset="0%" stop-color="${accColor}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${domColor}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowBottom" cx="80%" cy="85%" r="50%">
      <stop offset="0%" stop-color="${badgeBg}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${domColor}" stop-opacity="0" />
    </radialGradient>
    <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" />
    </filter>
  </defs>
  <rect width="900" height="1200" fill="url(#bgGrad)" />
  <circle cx="450" cy="240" r="280" fill="url(#glowTop)" filter="url(#blurFilter)" />
  <circle cx="750" cy="950" r="320" fill="url(#glowBottom)" filter="url(#blurFilter)" />
  <path d="M 0,300 Q 450,150 900,350 L 900,1200 L 0,1200 Z" fill="#ffffff" fill-opacity="0.02" />
  <rect x="60" y="80" width="780" height="1040" rx="24" fill="none" stroke="${accColor}" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="8 6" />
</svg>`;
      
      const base64Svg = Buffer.from(svgGraphic).toString('base64');
      generatedImageUrl = `data:image/svg+xml;base64,${base64Svg}`;
    }

    res.json({
      success: true,
      imageUrl: generatedImageUrl,
      synthesizedPrompt,
      chineseSummary: promptData.chineseSummary || `已综合【${mainTitle}】与【${presetSourceTitle}】的色彩与排版生成匹配底图`,
      visualMood: promptData.visualMood || '高反差质感',
      dominantHex: promptData.dominantHex,
      accentHex: promptData.accentHex,
    });
  } catch (error: any) {
    console.error("Generate cover background error:", error);
    res.status(500).json({ error: error.message || "生成封面底图失败，请稍后重试" });
  }
});

// 6. Data Review & Diagnostic Engine (作品数据复盘与诊断)
app.post("/api/ai/data-review", async (req, res) => {
  try {
    const { postData, historicalAverage } = req.body;
    if (!postData) {
      return res.status(400).json({ error: "请提供作品数据" });
    }

    const systemInstruction = `你是一名数据驱动的新媒体增长诊断专家。
根据创作者导入的作品链接、标题、浏览量、点赞量、评论量、收藏量、转发量和转化数据，结合平台核心指标逻辑（如：点赞率、收藏率、播完/阅读完播率、互动率、收藏点赞比等），进行严苛且极具建设性的复盘诊断。

诊断重点包括：
1. 核心瓶颈定位（是点击率低[封面/标题问题]？还是完读率低[开头Hook/节奏问题]？还是收藏率低[干货密度问题]？还是转化低[CTA漏斗问题]？）
2. 爆款因子与失误点拆解
3. 3条按照优先级排序的【下一次改进清单】

请输出 JSON 格式：
{
  "performanceLevel": "S级爆款 / A级优秀 / B级正常 / C级待优化",
  "calculatedMetrics": {
    "engagementRate": "总体互动率（如 8.5%）",
    "collectToLikeRatio": "收藏点赞比（>1 说明干货极强）",
    "estimatedCTRHealth": "点击率健康度评估"
  },
  "coreBottleneck": "一句话指明当前最大问题",
  "deepDiagnosis": {
    "coverAndTitle": "封面与标题评估",
    "contentAndHook": "开头Hook与正文节奏评估",
    "ctaAndConversion": "互动率与商业转化评估"
  },
  "actionableFixes": [
    { "priority": "P0 (最高)", "action": "具体改进动作", "expectedImpact": "预期收益" },
    { "priority": "P1", "action": "具体改进动作", "expectedImpact": "预期收益" },
    { "priority": "P2", "action": "具体改进动作", "expectedImpact": "预期收益" }
  ],
  "iterativePromptForNextPost": "针对本次复盘为下篇笔记定制的优化 Prompt 建议"
}`;

    const prompt = `当前作品数据：
${JSON.stringify(postData, null, 2)}

历史均值参考（如有）：
${historicalAverage ? JSON.stringify(historicalAverage, null, 2) : "无"}

请输出专业的数据复盘诊断分析 JSON。`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ result: parsed });
  } catch (error: any) {
    console.error("Data review error:", error);
    res.status(500).json({ error: error.message || "数据复盘诊断失败，请稍后重试" });
  }
});

// 7. Workflow Health Audit & Gap Monitor (智能自检与闭环监测)
app.post("/api/ai/workflow-audit", async (req, res) => {
  try {
    const { workbenchState } = req.body;

    const systemInstruction = `你是一名新媒体工作流质量内控与优化专家。
请对创作者当前工作台的全链路状态（账号定位、一周选题、经验库积累、文案封面产出、数据复盘闭环）进行全面扫描自检，评估是否存在断层、逻辑脱节、灵感枯竭或执行偏差。

请输出 JSON 格式：
{
  "healthScore": 85,
  "statusSummary": "整体工作流运行健康度评估",
  "auditChecklist": [
    { "module": "四维定位", "status": "pass | warning | danger", "issue": "发现的问题或优势", "suggestion": "优化建议" },
    { "module": "选题矩阵", "status": "pass | warning | danger", "issue": "发现的问题或优势", "suggestion": "优化建议" },
    { "module": "经验沉淀库", "status": "pass | warning | danger", "issue": "发现的问题或优势", "suggestion": "优化建议" },
    { "module": "图文与封面编辑器", "status": "pass | warning | danger", "issue": "发现的问题或优势", "suggestion": "优化建议" },
    { "module": "数据复盘闭环", "status": "pass | warning | danger", "issue": "发现的问题或优势", "suggestion": "优化建议" }
  ],
  "topPriorityAction": "当前最应该立刻做的一项关键动作",
  "systemOptimizationTips": ["工作流提效技巧1", "工作流提效技巧2"]
}`;

    const prompt = `当前工作台全流程数据状态：
${JSON.stringify(workbenchState, null, 2)}

请进行全流程自检监测，找出漏洞并输出优化建议 JSON。`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ result: parsed });
  } catch (error: any) {
    console.error("Workflow audit error:", error);
    res.status(500).json({ error: error.message || "工作台自检失败" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
