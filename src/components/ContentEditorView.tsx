import React, { useState, useEffect, useMemo } from 'react';
import { 
  Palette, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Save, 
  Send, 
  FileText, 
  Hash, 
  MessageSquare, 
  Flame, 
  BookmarkCheck,
  Share2,
  AlertTriangle,
  Scissors,
  Activity,
  Maximize2,
  Link,
  Zap,
  ArrowRightLeft,
  Image as ImageIcon,
  Layers,
  CheckCircle2,
  HelpCircle,
  Wand2,
  Sliders,
  CheckCircle,
  X,
  BookOpen,
  Loader2,
  Cpu
} from 'lucide-react';
import { Account, DraftPost, CoverVisualConfig, XingtuButterVisualSpec, KnowledgeItem, CreationWorkflowMode, ActivePromptContext } from '../types';
import { CoverCanvasEditor } from './CoverCanvasEditor';
import { calculate3x4CanvasBoundary, CanvasBoundaryReport } from '../utils/canvasBoundaryCalculator';

interface ContentEditorViewProps {
  activeAccount: Account | null;
  initialTopic?: string;
  initialAngle?: string;
  initialTemplate?: string;
  initialVisualSpec?: XingtuButterVisualSpec;
  initialReferenceImage?: string;
  knowledgeBase?: KnowledgeItem[];
  onSaveDraftPost: (post: DraftPost) => void;
  onNavigateToDataReview?: (post: DraftPost) => void;
}

export const ContentEditorView: React.FC<ContentEditorViewProps> = ({
  activeAccount,
  initialTopic,
  initialAngle,
  initialTemplate,
  initialVisualSpec,
  initialReferenceImage,
  knowledgeBase = [],
  onSaveDraftPost,
  onNavigateToDataReview
}) => {
  // Current Workflow Mode (1: cover_only | 2: text_only | 3: dual_all)
  const [creationMode, setCreationMode] = useState<CreationWorkflowMode>(() => {
    if (initialReferenceImage && !initialTemplate) return 'cover_only';
    if (initialTemplate && !initialVisualSpec) return 'text_only';
    return 'dual_all';
  });

  const [topicInput, setTopicInput] = useState(initialTopic || '下班后2小时如何变现？我的“一人公司”验证清单');
  const [angleInput, setAngleInput] = useState(initialAngle || '保姆级实操SOP + 真实避坑经验');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoSyncToCover, setAutoSyncToCover] = useState(true);
  const [isKnowledgePresetsOpen, setIsKnowledgePresetsOpen] = useState(false);
  const [quickPresetNotification, setQuickPresetNotification] = useState<string | null>(null);

  // Content Generation States
  const [titleOptions, setTitleOptions] = useState<string[]>([
    '🔥 普通人副业从0到1启动全流程（建议收藏，保姆级SOP）',
    '下班后2小时如何变现？我的“一人公司”最小可行性验证清单',
    '不用辞职！手把手教你如何用一门特长跑通商业变现闭环'
  ]);
  const [selectedTitle, setSelectedTitle] = useState(
    '🔥 普通人副业从0到1启动全流程（建议收藏，保姆级SOP）'
  );
  const [goldenHook, setGoldenHook] = useState(
    '不需要辞职，也不需要启动资金，只需这套经过真金白银验证的4步SOP，你也能在30天内跑出属于你的第一单！'
  );
  const [bodyContent, setBodyContent] = useState(`很多朋友每天下班累得像条狗，躺在床上刷短视频焦虑，心里想搞副业却不知从何下手。
今天不画大饼，直接把我和多位学员验证过的【一人公司副业破局4步法】毫无保留公开：

📌 第一步：技能资产盘点（拒绝自嗨）
不要问“我能做什么”，要问“别人愿意为解决什么问题付钱”。
把你的过往职业技能拆解成【具体的解决方案】。

📌 第二步：做你的“低门槛免费体验装”
在朋友圈或垂直社群，先送出10份干货资料或免费诊断。收集真实的痛点反馈和信任背书！

📌 第三步：最小闭环收费（哪怕只有9.9元）
只有真金白银付款，才算验证商业模式。先跑通3个付费客户，把交付流程标准化。

📌 第四步：借助AI与自动化杠杆
把反复沟通的话术、资料交付全部用AI工具自动化，实现下班后自动运转！`);

  const [callToAction, setCallToAction] = useState(
    '💬 评论区扣【破局SOP】，免费领我整理好的《一人公司副业启动30天自查清单》，手慢无！'
  );
  const [hashtags, setHashtags] = useState<string[]>([
    '#一人公司', '#副业搞钱', '#职场逆袭', '#搞钱干货', '#个人商业化'
  ]);

  // Cover Visual State
  const [coverConfig, setCoverConfig] = useState<CoverVisualConfig>({
    aspectRatio: '3:4',
    bgType: 'gradient',
    bgColor: '#0f172a',
    bgGradient: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
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
    subTitleSize: 18,
    highlightWords: ['0-1启动', 'SOP'],
    stickers: [
      { id: 'stk-1', text: '🔥 建议收藏', x: 24, y: 32, bg: '#f59e0b', color: '#000000' }
    ],
    filter: 'high-contrast',
    overlayDarkness: 10
  });

  // Active Unified AI Prompt Context (Maintains live sync of title, subtitle, badge, 4-color palette, font style, and reverse prompt)
  const [activePromptContext, setActivePromptContext] = useState<ActivePromptContext>(() => ({
    topic: initialTopic || '下班后2小时如何变现？我的“一人公司”验证清单',
    selectedTitle: '🔥 普通人副业从0到1启动全流程（建议收藏，保姆级SOP）',
    goldenHook: '不需要辞职，也不需要启动资金，只需这套经过真金白银验证的4步SOP，你也能在30天内跑出属于你的第一单！',
    badgeText: '📌 保姆级干货',
    bodyContent: `很多朋友每天下班累得像条狗，躺在床上刷短视频焦虑，心里想搞副业却不知从何下手。
今天不画大饼，直接把我和多位学员验证过的【一人公司副业破局4步法】毫无保留公开：`,
    tags: ['#一人公司', '#副业搞钱', '#职场逆袭', '#搞钱干货', '#个人商业化'],
    accountNiche: activeAccount?.niche,
    targetAudience: activeAccount?.positioning?.targetAudience?.primary,
    accountPersona: activeAccount?.positioning?.personaAndTrust?.identity,
    visualSpec: initialVisualSpec,
    referenceImage: initialReferenceImage,
    isDeconstructingAsync: false
  }));

  // Synchronize live text edits back into activePromptContext
  useEffect(() => {
    setActivePromptContext((prev) => ({
      ...prev,
      topic: topicInput,
      selectedTitle,
      goldenHook,
      badgeText: coverConfig.badgeText,
      bodyContent,
      tags: hashtags,
      accountNiche: activeAccount?.niche,
      targetAudience: activeAccount?.positioning?.targetAudience?.primary,
      accountPersona: activeAccount?.positioning?.personaAndTrust?.identity
    }));
  }, [topicInput, selectedTitle, goldenHook, coverConfig.badgeText, bodyContent, hashtags, activeAccount]);

  // Calculate real-time 3:4 canvas boundary report for two-way synchronization
  const boundaryReport: CanvasBoundaryReport = useMemo(() => {
    return calculate3x4CanvasBoundary({
      mainTitle: coverConfig.mainTitle || selectedTitle,
      subTitle: coverConfig.subTitle || goldenHook,
      badgeText: coverConfig.badgeText,
      titleSize: coverConfig.titleSize || 38,
      subTitleSize: coverConfig.subTitleSize || 18,
      canvasWidth: 450,
      canvasHeight: 600,
      paddingX: 32,
      paddingY: 32
    });
  }, [coverConfig.mainTitle, coverConfig.subTitle, coverConfig.badgeText, coverConfig.titleSize, coverConfig.subTitleSize, selectedTitle, goldenHook]);

  // When initialTopic, initialAngle, or initialVisualSpec changes from outside, update
  useEffect(() => {
    if (initialTopic) {
      setTopicInput(initialTopic);
      setCoverConfig((prev) => ({
        ...prev,
        mainTitle: initialTopic.slice(0, 14)
      }));
    }
    if (initialAngle) setAngleInput(initialAngle);
    if (initialTemplate) {
      setBodyContent(initialTemplate);
    }
    if (initialVisualSpec) {
      const s = initialVisualSpec;
      setCoverConfig((prev) => ({
        ...prev,
        bgType: s.colorPalette.bgGradient ? 'gradient' : 'color',
        bgColor: s.colorPalette.bgColor,
        bgGradient: s.colorPalette.bgGradient || prev.bgGradient,
        badgeBg: s.colorPalette.badgeBg,
        badgeColor: s.colorPalette.badgeColor,
        titleColor: s.colorPalette.titleColor,
        titleBg: s.colorPalette.titleBg || 'transparent',
        titleHighlightColor: s.colorPalette.highlightColor,
        filter: s.filterPreset,
        xingtuButterStyle: `${s.toolSource} · ${s.fontStyle}`,
        stickers: s.stickerPresets ? s.stickerPresets.map((stk, idx) => ({
          id: `stk-sync-${idx}-${Date.now()}`,
          text: stk.text,
          x: 28 + idx * 16,
          y: 80 + idx * 30,
          bg: stk.bg,
          color: stk.color
        })) : prev.stickers
      }));
    }
    if (initialReferenceImage) {
      setCoverConfig((prev) => ({
        ...prev,
        bgType: 'image',
        bgImage: initialReferenceImage
      }));
      // If initial reference image provided without spec, extract metadata asynchronously
      if (!initialVisualSpec) {
        fetch('/api/ai/extract-image-visual-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceImage: initialReferenceImage,
            title: initialTopic || '小红书封面素材',
            accountNiche: activeAccount?.niche
          })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.result) {
              const { visualSpec: extractedSpec, reversePrompt: extractedRP, coverVisualLogic: extractedLogic } = data.result;
              setActivePromptContext((prev) => ({
                ...prev,
                visualSpec: extractedSpec || prev.visualSpec,
                reversePrompt: extractedRP || prev.reversePrompt,
                coverVisualLogic: extractedLogic || prev.coverVisualLogic
              }));
              if (extractedSpec) {
                setCoverConfig((prev) => ({
                  ...prev,
                  bgColor: extractedSpec.colorPalette?.bgColor || prev.bgColor,
                  bgGradient: extractedSpec.colorPalette?.bgGradient || prev.bgGradient,
                  titleColor: extractedSpec.colorPalette?.titleColor || prev.titleColor,
                  titleBg: extractedSpec.colorPalette?.titleBg || prev.titleBg,
                  titleHighlightColor: extractedSpec.colorPalette?.highlightColor || prev.titleHighlightColor,
                  badgeBg: extractedSpec.colorPalette?.badgeBg || prev.badgeBg,
                  badgeColor: extractedSpec.colorPalette?.badgeColor || prev.badgeColor,
                  filter: extractedSpec.filterPreset || prev.filter,
                  xingtuButterStyle: `${extractedSpec.toolSource} · ${extractedSpec.fontStyle}`
                }));
              }
            }
          })
          .catch((err) => console.warn('Initial reference image metadata extraction error:', err));
      }
    }
  }, [initialTopic, initialAngle, initialTemplate, initialVisualSpec, initialReferenceImage]);

  // Two-way synchronization helper when user edits title
  const handleTitleChange = (newTitle: string) => {
    setSelectedTitle(newTitle);
    if (autoSyncToCover) {
      setCoverConfig((prev) => ({
        ...prev,
        mainTitle: newTitle
      }));
    }
  };

  // Two-way synchronization helper when user pastes or edits hook
  const handleHookChange = (newHook: string) => {
    setGoldenHook(newHook);
    if (autoSyncToCover && !coverConfig.subTitle) {
      setCoverConfig((prev) => ({
        ...prev,
        subTitle: newHook.slice(0, 24)
      }));
    }
  };

  // Auto-fit font size to 3:4 canvas
  const handleAutoFitCanvas = () => {
    setCoverConfig((prev) => ({
      ...prev,
      titleSize: boundaryReport.suggestedTitleSize,
      subTitleSize: boundaryReport.suggestedSubtitleSize
    }));
  };

  // Asynchronously extract and merge visual deconstruction metadata from reference image into active prompt context
  const extractAndMergeKnowledgeMetadata = async (
    item: KnowledgeItem,
    mode: 'all' | 'copy_only' | 'cover_only' = 'all'
  ) => {
    let titleToUse = item.title;
    let badgeToUse = (item.tags && item.tags[0]) || '爆款拆解';
    let hookToUse = item.deconstruction?.hookPattern?.formula || '';
    let bodyToUse = item.deconstruction?.reusableTemplate || item.bodyContent || '';

    if (item.coverText) {
      const badgeMatch = item.coverText.match(/【(.*?)】/);
      if (badgeMatch) {
        badgeToUse = badgeMatch[1];
      }
      titleToUse = item.coverText.replace(/【.*?】/, '').trim() || item.title;
    }

    // 1. Immediately apply available textual and structured fields
    if (mode === 'all' || mode === 'copy_only') {
      setTopicInput(titleToUse);
      setSelectedTitle(titleToUse);
      if (hookToUse) setGoldenHook(hookToUse);
      if (bodyToUse) setBodyContent(bodyToUse);
    }

    const existingSpec = item.visualSpec || item.deconstruction?.visualSpec;
    const existingReversePrompt = item.reversePrompt || item.deconstruction?.reversePrompt;
    const existingCoverVisualLogic = item.deconstruction?.coverVisualLogic;

    if (mode === 'all' || mode === 'cover_only') {
      const v = existingSpec;
      setCoverConfig((prev) => ({
        ...prev,
        aspectRatio: '3:4',
        mainTitle: titleToUse.slice(0, 18),
        subTitle: hookToUse ? hookToUse.slice(0, 26) : prev.subTitle,
        badgeText: badgeToUse || prev.badgeText,
        bgType: item.referenceImage ? 'image' : (v?.colorPalette?.bgGradient ? 'gradient' : (v?.colorPalette?.bgColor ? 'color' : prev.bgType)),
        bgImage: item.referenceImage || prev.bgImage,
        overlayDarkness: item.referenceImage ? 25 : prev.overlayDarkness,
        bgColor: v?.colorPalette?.bgColor || prev.bgColor,
        bgGradient: v?.colorPalette?.bgGradient || prev.bgGradient,
        titleColor: v?.colorPalette?.titleColor || prev.titleColor,
        titleBg: v?.colorPalette?.titleBg || prev.titleBg,
        titleHighlightColor: v?.colorPalette?.highlightColor || prev.titleHighlightColor,
        badgeBg: v?.colorPalette?.badgeBg || prev.badgeBg,
        badgeColor: v?.colorPalette?.badgeColor || prev.badgeColor,
        filter: v?.filterPreset || prev.filter,
        xingtuButterStyle: v ? `${v.toolSource} · ${v.fontStyle}` : (item.referenceImage ? '醒图+黄油 · 拆解原图' : prev.xingtuButterStyle),
        sourceKnowledgeId: item.id,
        stickers: v?.stickerPresets ? v.stickerPresets.map((stk, idx) => ({
          id: `stk-kb-${idx}-${Date.now()}`,
          text: stk.text,
          x: 28 + idx * 16,
          y: 80 + idx * 30,
          bg: stk.bg,
          color: stk.color
        })) : prev.stickers
      }));
    }

    // Merge into active prompt context immediately
    setActivePromptContext((prev) => ({
      ...prev,
      sourceKnowledgeId: item.id,
      sourceKnowledgeTitle: item.title,
      referenceImage: item.referenceImage,
      visualSpec: existingSpec,
      reversePrompt: existingReversePrompt,
      coverVisualLogic: existingCoverVisualLogic,
      extractedHookFormula: hookToUse,
      reusableTemplate: bodyToUse,
      isDeconstructingAsync: false
    }));

    const actionText = mode === 'all' ? '全套 (文案 + 3:4封面排版)' : (mode === 'copy_only' ? '文案与Hook模板' : '3:4 封面视觉规范');
    setQuickPresetNotification(`⚡ 已成功载入【${item.title}】的${actionText}！`);
    setTimeout(() => setQuickPresetNotification(null), 3500);

    // 2. If item has referenceImage but lacks full visualSpec or reversePrompt, trigger asynchronous AI vision extraction
    if (item.referenceImage && (!existingSpec || !existingReversePrompt)) {
      setActivePromptContext((prev) => ({
        ...prev,
        isDeconstructingAsync: true,
        deconstructStatusText: `AI 正在异步深度提取【${item.title}】的 4色调色卡、醒图黄油排版规范与反推提示词...`
      }));

      try {
        const res = await fetch('/api/ai/extract-image-visual-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceImage: item.referenceImage,
            title: item.title,
            accountNiche: activeAccount?.niche
          })
        });

        const data = await res.json();
        if (data.success && data.result) {
          const { visualSpec: extractedSpec, reversePrompt: extractedRP, coverVisualLogic: extractedLogic } = data.result;

          setActivePromptContext((prev) => ({
            ...prev,
            visualSpec: extractedSpec || prev.visualSpec,
            reversePrompt: extractedRP || prev.reversePrompt,
            coverVisualLogic: extractedLogic || prev.coverVisualLogic,
            isDeconstructingAsync: false,
            deconstructStatusText: undefined
          }));

          if (extractedSpec && (mode === 'all' || mode === 'cover_only')) {
            setCoverConfig((prev) => ({
              ...prev,
              bgColor: extractedSpec.colorPalette?.bgColor || prev.bgColor,
              bgGradient: extractedSpec.colorPalette?.bgGradient || prev.bgGradient,
              titleColor: extractedSpec.colorPalette?.titleColor || prev.titleColor,
              titleBg: extractedSpec.colorPalette?.titleBg || prev.titleBg,
              titleHighlightColor: extractedSpec.colorPalette?.highlightColor || prev.titleHighlightColor,
              badgeBg: extractedSpec.colorPalette?.badgeBg || prev.badgeBg,
              badgeColor: extractedSpec.colorPalette?.badgeColor || prev.badgeColor,
              filter: extractedSpec.filterPreset || prev.filter,
              xingtuButterStyle: `${extractedSpec.toolSource} · ${extractedSpec.fontStyle}`,
              stickers: extractedSpec.stickerPresets ? extractedSpec.stickerPresets.map((stk, idx) => ({
                id: `stk-async-${idx}-${Date.now()}`,
                text: stk.text,
                x: 28 + idx * 16,
                y: 80 + idx * 30,
                bg: stk.bg,
                color: stk.color
              })) : prev.stickers
            }));
          }

          setQuickPresetNotification(`✨ 已自动解析【${item.title}】的 4色调色卡、醒图黄油排版与反推提示词并合并至当前 Prompt 上下文！`);
          setTimeout(() => setQuickPresetNotification(null), 4000);
        }
      } catch (err) {
        console.warn('Async visual metadata extraction error:', err);
        setActivePromptContext((prev) => ({
          ...prev,
          isDeconstructingAsync: false,
          deconstructStatusText: undefined
        }));
      }
    }
  };

  // One-click apply from Knowledge Experience Repository (Custom imported images / decomposed templates)
  const handleApplyKnowledgeItem = (
    item: KnowledgeItem,
    mode: 'all' | 'copy_only' | 'cover_only' = 'all'
  ) => {
    extractAndMergeKnowledgeMetadata(item, mode);
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput,
          angle: angleInput,
          targetAudience: activeAccount?.positioning?.targetAudience?.primary,
          accountPersona: activeAccount?.positioning?.personaAndTrust?.identity,
          deconstructedTemplate: initialTemplate
        })
      });

      const data = await response.json();
      if (data.result) {
        const res = data.result;
        if (res.titles && res.titles.length > 0) {
          setTitleOptions(res.titles);
          setSelectedTitle(res.titles[0]);
        }
        if (res.goldenHook) setGoldenHook(res.goldenHook);
        if (res.body) setBodyContent(res.body);
        if (res.callToAction) setCallToAction(res.callToAction);
        if (res.tags) setHashtags(res.tags);

        // Update cover suggestions
        if (res.coverVisualData) {
          setCoverConfig((prev) => ({
            ...prev,
            badgeText: res.coverVisualData.badgeText || prev.badgeText,
            mainTitle: res.coverVisualData.mainTitle || (res.titles ? res.titles[0].slice(0, 14) : prev.mainTitle),
            subTitle: res.coverVisualData.subTitle || prev.subTitle
          }));
        }
      }
    } catch (error) {
      console.error('Failed to generate copy:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyFullCopy = () => {
    const fullText = `${selectedTitle}\n\n${goldenHook}\n\n${bodyContent}\n\n${callToAction}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedKey('full');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSavePost = () => {
    const newPost: DraftPost = {
      id: `draft-${Date.now()}`,
      accountId: activeAccount?.id || 'acc-1',
      topicTitle: topicInput,
      titles: titleOptions,
      selectedTitle,
      goldenHook,
      body: bodyContent,
      callToAction,
      tags: hashtags,
      coverVisual: coverConfig,
      createdAt: new Date().toISOString().split('T')[0]
    };
    onSaveDraftPost(newPost);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* 🚀 Top Creation Intent Dispatcher (3 Efficient Workflows) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
              <span className="text-amber-400 font-bold">🛠️ 创作工坊</span>
              <span>•</span>
              <span>请选择本次创作诉求，系统将为您定制最精简高效的操作界面</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {creationMode === 'cover_only' && '🎨 纯做 3:4 封面模式 (文案已有，专注封面设计与导出)'}
              {creationMode === 'text_only' && '✍️ 纯写爆款文案模式 (封面已有，专注生成Hook与正文)'}
              {creationMode === 'dual_all' && '⚡ 封面 + 文案全案联动模式 (双向同步，一站式生成)'}
            </h2>
          </div>

          {/* 3 Workflow Mode Segmented Switcher */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl w-full lg:w-auto overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setCreationMode('cover_only')}
              className={`flex-1 lg:flex-none flex items-center justify-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                creationMode === 'cover_only'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>1. 纯做 3:4 封面</span>
            </button>

            <button
              type="button"
              onClick={() => setCreationMode('text_only')}
              className={`flex-1 lg:flex-none flex items-center justify-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                creationMode === 'text_only'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. 纯写爆款文案</span>
            </button>

            <button
              type="button"
              onClick={() => setCreationMode('dual_all')}
              className={`flex-1 lg:flex-none flex items-center justify-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                creationMode === 'dual_all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>3. 封面 + 文案全案</span>
            </button>
          </div>
        </div>

        {/* Dynamic Mode Guide description banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div 
            onClick={() => setCreationMode('cover_only')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              creationMode === 'cover_only' 
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-200' 
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold flex items-center space-x-1.5 mb-0.5">
              <span>🎨 诉求 1：仅做 3:4 封面</span>
              {creationMode === 'cover_only' && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">当前</span>}
            </div>
            <p className="text-[11px] opacity-80">文案已经写好，只需粘贴核心词/标题，快速排版醒图/黄油规范封面并导出高清 PNG。</p>
          </div>

          <div 
            onClick={() => setCreationMode('text_only')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              creationMode === 'text_only' 
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-200' 
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold flex items-center space-x-1.5 mb-0.5">
              <span>✍️ 诉求 2：仅写爆款文案</span>
              {creationMode === 'text_only' && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">当前</span>}
            </div>
            <p className="text-[11px] opacity-80">封面已在其他软件做好，只需生成 3 秒抓眼 Hook、呼吸感正文排版、CTA 与话题标签。</p>
          </div>

          <div 
            onClick={() => setCreationMode('dual_all')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              creationMode === 'dual_all' 
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-200' 
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold flex items-center space-x-1.5 mb-0.5">
              <span>⚡ 诉求 3：文案 + 封面全案</span>
              {creationMode === 'dual_all' && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">当前</span>}
            </div>
            <p className="text-[11px] opacity-80">既要写文案又要出封面，双屏左右联动，实时计算 3:4 可视化边界与字号溢出适配。</p>
          </div>
        </div>

      </div>

      {/* Toast Notification when preset is loaded */}
      {quickPresetNotification && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{quickPresetNotification}</span>
          </div>
          <button
            onClick={() => setQuickPresetNotification(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Experience Presets Drawer Bar */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-200">
              📚 经验库拆解预设快速载入（含自定义导入素材）
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono">
              {(knowledgeBase || []).length} 条经验资产
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsKnowledgePresetsOpen(!isKnowledgePresetsOpen)}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1 cursor-pointer"
          >
            <span>{isKnowledgePresetsOpen ? '收起预设列表 ▲' : '展开选择预设 ▼'}</span>
          </button>
        </div>

        {/* Quick Horizontal Scrollable Strip for Quick Click */}
        {(!isKnowledgePresetsOpen && (knowledgeBase || []).length > 0) && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-slate-400 flex-shrink-0">快捷套用：</span>
            {(knowledgeBase || []).slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleApplyKnowledgeItem(item, 'all')}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/60 text-slate-300 hover:text-white transition-all flex-shrink-0 text-left group cursor-pointer"
              >
                {item.referenceImage ? (
                  <img
                    src={item.referenceImage}
                    alt="thumb"
                    className="w-4 h-5 object-cover rounded border border-amber-500/40"
                  />
                ) : (
                  <Sparkles className="w-3 h-3 text-purple-400 group-hover:text-amber-400" />
                )}
                <span className="text-[11px] font-medium max-w-[130px] truncate">{item.title}</span>
                <span className="text-[9px] px-1 rounded bg-slate-900 text-amber-400">一键载入</span>
              </button>
            ))}
          </div>
        )}

        {/* Expanded Grid View */}
        {isKnowledgePresetsOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 animate-in fade-in">
            {(knowledgeBase || []).map((item) => {
              const hasVisual = !!item.visualSpec || !!item.referenceImage;
              const hasCopy = !!item.deconstruction?.reusableTemplate || !!item.bodyContent;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-purple-500/60 transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-start space-x-2.5">
                    {item.referenceImage ? (
                      <div className="relative aspect-[3/4] w-12 rounded-lg overflow-hidden border border-amber-500/40 bg-slate-900 flex-shrink-0 shadow">
                        <img
                          src={item.referenceImage}
                          alt="封面"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 px-1 bg-slate-950/80 text-[7px] text-amber-300 font-mono">
                          3:4
                        </span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800/50 flex items-center justify-center flex-shrink-0 text-purple-300 font-bold text-xs">
                        经验
                      </div>
                    )}

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-1 flex-wrap gap-y-0.5">
                        <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                          {item.accountNiche || '通用'}
                        </span>
                        {item.referenceImage && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                            带原图
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 line-clamp-1" title={item.title}>
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2">
                        {item.deconstruction?.hookPattern?.formula || item.coverText || item.bodyContent?.slice(0, 60)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-900 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleApplyKnowledgeItem(item, 'all')}
                      className="py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer text-center"
                      title="同时填人文案模板、Hook、3:4封面排版与参考图"
                    >
                      ⚡ 全套载入
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyKnowledgeItem(item, 'copy_only')}
                      className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer text-center"
                      title="仅载人文案模板与选题Hook"
                    >
                      ✍️ 仅文案
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyKnowledgeItem(item, 'cover_only')}
                      className="py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800/60 font-medium transition-colors cursor-pointer text-center"
                      title="仅载入 3:4 封面排版与参考底图"
                    >
                      🎨 仅封面
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🧠 Live Prompt Context & Deconstruction Metadata Fusion Banner */}
      <div className="rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-amber-950/30 border border-purple-800/40 p-3.5 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-100">
              ⚡ 实时已挂载 Prompt 上下文与图片拆解元数据
            </span>
            {activePromptContext.isDeconstructingAsync ? (
              <span className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>视觉元数据深度提取中...</span>
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>上下文已就绪 (实时同步)</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            点击封面编辑区【仅套用视觉调色】将自动融合以下全维度 Prompt
          </span>
        </div>

        {/* Live Merged Context Breakdown Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          {/* Main Title Context */}
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-1">
            <span className="text-[10px] text-slate-400 font-medium">🎯 实时主标题</span>
            <p className="text-slate-100 font-bold text-[11px] truncate" title={selectedTitle || coverConfig.mainTitle}>
              {selectedTitle || coverConfig.mainTitle || '未设置主标题'}
            </p>
          </div>

          {/* Subtitle / Golden Hook */}
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-1">
            <span className="text-[10px] text-slate-400 font-medium">🪝 黄金Hook / 副标题</span>
            <p className="text-slate-200 text-[11px] truncate" title={goldenHook || coverConfig.subTitle}>
              {goldenHook || coverConfig.subTitle || '未设置副标题'}
            </p>
          </div>

          {/* 4-Color Palette */}
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-1">
            <span className="text-[10px] text-slate-400 font-medium">🎨 4色调色卡 / 滤镜</span>
            <div className="flex items-center space-x-1.5 pt-0.5">
              <span className="w-3 h-3 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: coverConfig.bgColor }} title={`背景色 ${coverConfig.bgColor}`} />
              <span className="w-3 h-3 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: coverConfig.titleColor }} title={`标题色 ${coverConfig.titleColor}`} />
              <span className="w-3 h-3 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: coverConfig.titleHighlightColor }} title={`高光色 ${coverConfig.titleHighlightColor}`} />
              <span className="w-3 h-3 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: coverConfig.badgeBg }} title={`标签色 ${coverConfig.badgeBg}`} />
              <span className="text-[10px] text-amber-300 font-mono ml-1 truncate">
                {coverConfig.filter === 'none' ? '原色' : coverConfig.filter}
              </span>
            </div>
          </div>

          {/* Reverse Prompt / Layout Spec */}
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-1">
            <span className="text-[10px] text-slate-400 font-medium">🔤 醒图/黄油规范与反推Prompt</span>
            <p className="text-purple-300 font-mono text-[10px] truncate" title={activePromptContext.reversePrompt || activePromptContext.visualSpec?.designNotes || coverConfig.xingtuButterStyle}>
              {activePromptContext.sourceKnowledgeTitle ? `来源于: ${activePromptContext.sourceKnowledgeTitle}` : (coverConfig.xingtuButterStyle || '醒图/黄油标准排版')}
            </p>
          </div>
        </div>

        {activePromptContext.deconstructStatusText && (
          <p className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-500/30 p-1.5 rounded-lg animate-pulse">
            {activePromptContext.deconstructStatusText}
          </p>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SCENARIO 1: COVER ONLY WORKFLOW (纯做 3:4 封面) */}
      {/* ========================================================================= */}
      {creationMode === 'cover_only' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">3:4 爆款封面专注工坊 (无干扰极简视图)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                直接在此粘贴已有文案，自动解析并渲染 3:4 醒图/黄油排版，一键下载高清图
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSavePost}
                className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>保存至草稿库</span>
              </button>
            </div>
          </div>

          {/* Quick Paste & Deconstruct Bar for ready copy */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <span>📋 已有文案快速粘贴区 (粘贴后可一键填入封面大字)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                支持直接按 <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">Ctrl+V</kbd>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8">
                <textarea
                  value={bodyContent}
                  onChange={(e) => setBodyContent(e.target.value)}
                  rows={2}
                  placeholder="在此直接粘贴你已经写好的文案、金句、口播脚本或笔记正文..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="md:col-span-4 flex flex-col justify-between gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const firstLine = bodyContent.split('\n')[0]?.trim() || '';
                    if (firstLine) {
                      setCoverConfig(prev => ({
                        ...prev,
                        mainTitle: firstLine.slice(0, 16),
                        subTitle: bodyContent.split('\n')[1]?.trim()?.slice(0, 24) || prev.subTitle
                      }));
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 text-left flex items-center justify-between"
                >
                  <span>⚡ 自动提取首行作为主标题</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const firstLine = bodyContent.split('\n')[0]?.trim() || '';
                      if (firstLine) setCoverConfig(prev => ({ ...prev, mainTitle: firstLine.slice(0, 16) }));
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] text-center"
                  >
                    设为主标题
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstLine = bodyContent.split('\n')[0]?.trim() || '';
                      if (firstLine) setCoverConfig(prev => ({ ...prev, subTitle: firstLine.slice(0, 24) }));
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] text-center"
                  >
                    设为副标题
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full Cover Canvas Editor */}
          <CoverCanvasEditor
            config={coverConfig}
            onChangeConfig={setCoverConfig}
            titleSuggestion={coverConfig.mainTitle}
            subtitleSuggestion={coverConfig.subTitle}
            badgeSuggestion={coverConfig.badgeText}
            knowledgeBase={knowledgeBase}
            activePromptContext={activePromptContext}
            accountContext={{
              niche: activeAccount?.niche,
              targetAudience: activeAccount?.positioning?.targetAudience?.primary,
              persona: activeAccount?.positioning?.personaAndTrust?.identity
            }}
            onSyncBackToEditor={(data) => {
              if (data.title) setSelectedTitle(data.title);
              if (data.subTitle) setGoldenHook(data.subTitle);
              if (data.bodyTemplate) setBodyContent(data.bodyTemplate);
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCENARIO 2: TEXT ONLY WORKFLOW (纯写爆款文案) */}
      {/* ========================================================================= */}
      {creationMode === 'text_only' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Topic Generator */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>爆款文案智能生成器 (黄金3秒Hook + 呼吸感段落)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  输入选题与切入角度，一键生成 3 个高点击标题测试池与高密度干货正文
                </p>
              </div>

              <button
                onClick={handleGenerateAI}
                disabled={loading || !topicInput.trim()}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI 正在创作高转化文案...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>一键生成爆款文案</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">选题标题 / 核心主题</label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="如：下班后2小时如何变现？"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">切入角度 / 情绪驱动</label>
                <input
                  type="text"
                  value={angleInput}
                  onChange={(e) => setAngleInput(e.target.value)}
                  placeholder="如：避坑避雷 + 保姆级实操SOP"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Full Width Copywriting Studio */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">爆款正文主笔与精修台</h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={copyFullCopy}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  {copiedKey === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'full' ? '已复制全篇文案' : '一键复制全文'}</span>
                </button>

                <button
                  onClick={handleSavePost}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>保存至草稿库</span>
                </button>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                <span>✅ 文案已成功保存至草稿库！</span>
                {onNavigateToDataReview && (
                  <button
                    onClick={() => {
                      const post: DraftPost = {
                        id: `draft-${Date.now()}`,
                        accountId: activeAccount?.id || 'acc-1',
                        topicTitle: topicInput,
                        titles: titleOptions,
                        selectedTitle,
                        goldenHook,
                        body: bodyContent,
                        callToAction,
                        tags: hashtags,
                        coverVisual: coverConfig,
                        createdAt: new Date().toISOString().split('T')[0]
                      };
                      onNavigateToDataReview(post);
                    }}
                    className="underline text-emerald-400 hover:text-emerald-200 font-bold"
                  >
                    去导入数据复盘 →
                  </button>
                )}
              </div>
            )}

            {/* 3 Title Options */}
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-300">高点击标题测试池（点击选定）：</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {titleOptions.map((t, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedTitle(t)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedTitle === t
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500 mb-1 font-mono">备选标题 {i + 1}</div>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Selected Title (Custom editable) */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-300">当前选定标题（可自由修改编辑）：</label>
              <input
                type="text"
                value={selectedTitle}
                onChange={(e) => setSelectedTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-slate-100 font-bold focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            {/* Golden Hook (3-second hook) */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-amber-400 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5" />
                <span>黄金前3秒抓眼 Hook (第一屏)：</span>
              </label>
              <textarea
                value={goldenHook}
                onChange={(e) => setGoldenHook(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-slate-100 italic focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* Body Content */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-300">正文高信息密度排版（呼吸感段落）：</label>
              <textarea
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
                rows={12}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
              />
            </div>

            {/* CTA & Hashtags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-emerald-400 flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>强互动转化与资料引流号召 (CTA)：</span>
                </label>
                <input
                  type="text"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-400 flex items-center space-x-1">
                  <Hash className="w-3.5 h-3.5" />
                  <span>话题标签 (Hashtags)：</span>
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hashtags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCENARIO 3: DUAL WORKFLOW (封面 + 文案全案联动) */}
      {/* ========================================================================= */}
      {creationMode === 'dual_all' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Top Generator Bar */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>全案双向联动：文案生成 + 3:4 封面排版实时同步</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  左侧文案主笔与右侧 3:4 封面画布实时双向同步，智能测算文字排版边界与溢出红线。
                </p>
              </div>

              <button
                onClick={handleGenerateAI}
                disabled={loading || !topicInput.trim()}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI 正在撰写文案与设计封面...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI 一键生成全套图文</span>
                  </>
                )}
              </button>
            </div>

            {/* Input Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">选题标题 / 核心主题</label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="如：下班后2小时如何变现？"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">切入角度 / 情绪驱动</label>
                <input
                  type="text"
                  value={angleInput}
                  onChange={(e) => setAngleInput(e.target.value)}
                  placeholder="如：避坑避雷 + 保姆级实操SOP"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Main 2-Column Split: Copywriter on Left, Visual Cover Editor on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (6 Cols): AI Copywriting Engine */}
            <div className="lg:col-span-6 space-y-4">
              
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">爆款文案主笔台</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setAutoSyncToCover(!autoSyncToCover)}
                      className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        autoSyncToCover 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                      title="开关文案与封面画布双向自动同步"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>{autoSyncToCover ? '画布双向联动: 开' : '双向联动: 关'}</span>
                    </button>

                    <button
                      onClick={copyFullCopy}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      {copiedKey === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'full' ? '已复制全篇' : '复制全文'}</span>
                    </button>

                    <button
                      onClick={handleSavePost}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>保存草稿</span>
                    </button>
                  </div>
                </div>

                {/* Real-time 3:4 Canvas Boundary Calculation & Alert Bar */}
                <div className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                  boundaryReport.warningLevel === 'danger'
                    ? 'bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-950/20'
                    : boundaryReport.warningLevel === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Activity className={`w-3.5 h-3.5 ${
                        boundaryReport.warningLevel === 'danger' 
                          ? 'text-rose-400 animate-pulse' 
                          : boundaryReport.warningLevel === 'warning'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`} />
                      <span className="font-semibold text-slate-200">3:4 画布可视边界监测</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        boundaryReport.warningLevel === 'danger'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : boundaryReport.warningLevel === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {boundaryReport.warningLevel === 'danger' ? '🚨 文案溢出画框' : boundaryReport.warningLevel === 'warning' ? '⚠️ 接近边界' : '✅ 处于安全区'} ({boundaryReport.heightUsagePercent}%)
                      </span>
                    </div>
                  </div>

                  {/* Overflow warning message & fast actions */}
                  {boundaryReport.warningLevel === 'danger' && (
                    <div className="pt-1.5 border-t border-rose-500/20 space-y-2">
                      <p className="text-[11px] text-rose-300">
                        ⚠️ 粘贴文案过长：当前主标题折行为 <strong className="text-white">{boundaryReport.titleLines.length} 行</strong>，在当前预设字号 ({coverConfig.titleSize || 38}px) 下已超出 3:4 封面下边界约 <strong className="text-rose-200">{boundaryReport.overflowAmountPx}px</strong>！
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleAutoFitCanvas}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-[11px] flex items-center space-x-1 transition-all"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>⚡ 自动缩放字号以适配 3:4 画布 ({coverConfig.titleSize}px → {boundaryReport.suggestedTitleSize}px)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (boundaryReport.titleLines.length > 2) {
                              const truncated = boundaryReport.titleLines.slice(0, 2).join('');
                              setCoverConfig(prev => ({ ...prev, mainTitle: truncated.slice(0, 16) }));
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center space-x-1"
                        >
                          <Scissors className="w-3 h-3 text-amber-400" />
                          <span>截断为2行安全字数</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {saveSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
                    <span>✅ 作品已保存至草稿库！</span>
                    {onNavigateToDataReview && (
                      <button
                        onClick={() => {
                          const post: DraftPost = {
                            id: `draft-${Date.now()}`,
                            accountId: activeAccount?.id || 'acc-1',
                            topicTitle: topicInput,
                            titles: titleOptions,
                            selectedTitle,
                            goldenHook,
                            body: bodyContent,
                            callToAction,
                            tags: hashtags,
                            coverVisual: coverConfig,
                            createdAt: new Date().toISOString().split('T')[0]
                          };
                          onNavigateToDataReview(post);
                        }}
                        className="underline text-emerald-400 hover:text-emerald-200 font-bold ml-2"
                      >
                        去导入数据复盘 →
                      </button>
                    )}
                  </div>
                )}

                {/* 3 Title Options */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300">高点击标题测试池（点击选定并双向联动画布）：</label>
                    <span className="text-[10px] text-amber-400/80">⚡ 自动同步至封面主标题</span>
                  </div>
                  <div className="space-y-1.5">
                    {titleOptions.map((t, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedTitle(t);
                          setCoverConfig((prev) => ({
                            ...prev,
                            mainTitle: t.slice(0, 16)
                          }));
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedTitle === t
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Selected Title (Custom editable / pasteable with 3:4 canvas sync) */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300 flex items-center space-x-1">
                      <span>当前选定标题（支持粘贴修改并同步至 3:4 画布）：</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCoverConfig(prev => ({ ...prev, mainTitle: selectedTitle.slice(0, 16) }));
                      }}
                      className="text-[10px] text-amber-300 hover:text-amber-200 underline font-medium"
                    >
                      ⚡ 同步至封面主标题大字
                    </button>
                  </div>
                  <input
                    type="text"
                    value={selectedTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text');
                      if (pasted) {
                        setTimeout(() => handleTitleChange(pasted), 10);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-bold focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                {/* Golden Hook (3-second hook) */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-amber-400 flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>黄金前3秒抓眼 Hook (第一屏)：</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCoverConfig(prev => ({ ...prev, subTitle: goldenHook.slice(0, 24) }));
                        }}
                        className="text-[10px] text-amber-300 hover:text-amber-200 underline font-medium"
                      >
                        ⚡ 同步为封面副标题
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCoverConfig(prev => ({ ...prev, mainTitle: goldenHook.slice(0, 16) }));
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                      >
                        设为主标题
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={goldenHook}
                    onChange={(e) => handleHookChange(e.target.value)}
                    rows={2}
                    placeholder="粘贴前3秒Hook文案，自动计算画布边界..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-slate-100 italic focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Body Content */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300">正文高信息密度排版（呼吸感段落）：</label>
                    {bodyContent && (
                      <button
                        type="button"
                        onClick={() => {
                          const firstLine = bodyContent.split('\n')[0]?.trim() || '';
                          if (firstLine) {
                            setCoverConfig(prev => ({
                              ...prev,
                              mainTitle: firstLine.slice(0, 16),
                              subTitle: bodyContent.split('\n')[1]?.trim()?.slice(0, 24) || prev.subTitle
                            }));
                          }
                        }}
                        className="text-[10px] text-amber-300 hover:text-amber-200 underline font-medium"
                      >
                        ⚡ 提取首段核心金句至 3:4 封面
                      </button>
                    )}
                  </div>
                  <textarea
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    rows={9}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                  />
                </div>

                {/* CTA */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-emerald-400 flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>强互动转化与资料引流号召 (CTA)：</span>
                  </label>
                  <input
                    type="text"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Hashtags */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-400 flex items-center space-x-1">
                    <Hash className="w-3.5 h-3.5" />
                    <span>话题标签 (Hashtags)：</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column (6 Cols): Live Cover Canvas Editor */}
            <div className="lg:col-span-6 space-y-4">
              <CoverCanvasEditor
                config={coverConfig}
                onChangeConfig={setCoverConfig}
                titleSuggestion={selectedTitle}
                subtitleSuggestion={goldenHook}
                badgeSuggestion={coverConfig.badgeText}
                knowledgeBase={knowledgeBase}
                activePromptContext={activePromptContext}
                accountContext={{
                  niche: activeAccount?.niche,
                  targetAudience: activeAccount?.positioning?.targetAudience?.primary,
                  persona: activeAccount?.positioning?.personaAndTrust?.identity
                }}
                onSyncBackToEditor={(data) => {
                  if (data.title) setSelectedTitle(data.title);
                  if (data.subTitle) setGoldenHook(data.subTitle);
                  if (data.bodyTemplate) setBodyContent(data.bodyTemplate);
                }}
              />
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

