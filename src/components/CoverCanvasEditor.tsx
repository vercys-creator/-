import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Download, 
  Palette, 
  Type, 
  Layers, 
  Sparkles, 
  Image as ImageIcon, 
  Sliders, 
  Plus, 
  X, 
  Check, 
  Move, 
  RotateCcw,
  SunMedium,
  Contrast,
  Smile,
  BookOpen,
  Wand2,
  CheckCircle2,
  ClipboardPaste,
  FileText,
  Trash2,
  Maximize2,
  AlertTriangle,
  Scissors,
  CheckCircle,
  TrendingUp,
  Activity,
  Zap,
  Loader2
} from 'lucide-react';
import { CoverVisualConfig, KnowledgeItem, XingtuButterVisualSpec, ActivePromptContext } from '../types';
import { calculate3x4CanvasBoundary, CanvasBoundaryReport } from '../utils/canvasBoundaryCalculator';

interface CoverCanvasEditorProps {
  config: CoverVisualConfig;
  onChangeConfig: (newConfig: CoverVisualConfig) => void;
  titleSuggestion?: string;
  subtitleSuggestion?: string;
  badgeSuggestion?: string;
  knowledgeBase?: KnowledgeItem[];
  activePromptContext?: ActivePromptContext;
  accountContext?: { niche?: string; targetAudience?: string; persona?: string };
  onSyncBackToEditor?: (data: { title?: string; subTitle?: string; badge?: string; bodyTemplate?: string }) => void;
}

export interface EnrichedKnowledgePreset {
  sourceId: string;
  sourceTitle: string;
  isCustomImported: boolean;
  referenceImage?: string;
  spec: XingtuButterVisualSpec;
  reversePrompt?: string;
  coverVisualLogic?: string;
  extractedTitle?: string;
  extractedSubtitle?: string;
  extractedBadge?: string;
  extractedHook?: string;
  reusableTemplate?: string;
  tags?: string[];
  accountNiche?: string;
  createdAt?: string;
}

export const CoverCanvasEditor: React.FC<CoverCanvasEditorProps> = ({
  config,
  onChangeConfig,
  titleSuggestion,
  subtitleSuggestion,
  badgeSuggestion,
  knowledgeBase = [],
  activePromptContext,
  accountContext,
  onSyncBackToEditor
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<'presets' | 'text' | 'bg' | 'stickers' | 'filter'>('text');
  const [presetFilter, setPresetFilter] = useState<'all' | 'custom' | 'system'>('all');
  const [exporting, setExporting] = useState(false);
  const [bgImageObj, setBgImageObj] = useState<HTMLImageElement | null>(null);
  const [appliedPresetName, setAppliedPresetName] = useState<string | null>(null);
  const [pastedCopyText, setPastedCopyText] = useState<string>('');
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);
  
  // AI Background Generation state from visual template + user's titles
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [generatingBgSourceId, setGeneratingBgSourceId] = useState<string | null>(null);
  const [bgGenerationStatus, setBgGenerationStatus] = useState<string | null>(null);
  const [lastDesignConcept, setLastDesignConcept] = useState<string | null>(null);

  // Strictly ensure config has aspectRatio set to 3:4 by default
  useEffect(() => {
    if (!config.aspectRatio) {
      onChangeConfig({ ...config, aspectRatio: '3:4' });
    }
  }, []);

  // Compute 3:4 canvas boundary & vertical space usage
  const boundaryReport: CanvasBoundaryReport = useMemo(() => {
    return calculate3x4CanvasBoundary({
      mainTitle: config.mainTitle,
      subTitle: config.subTitle,
      badgeText: config.badgeText,
      titleSize: config.titleSize || 36,
      subTitleSize: config.subTitleSize || 18,
      canvasWidth: 450,
      canvasHeight: 600,
      paddingX: 32,
      paddingY: 32
    });
  }, [config.mainTitle, config.subTitle, config.badgeText, config.titleSize, config.subTitleSize]);

  // Helper to construct a robust visual spec if an item has no visualSpec explicitly returned
  const buildEffectiveSpec = (item: KnowledgeItem): XingtuButterVisualSpec => {
    if (item.visualSpec) return item.visualSpec;
    return {
      toolSource: item.referenceImage ? '醒图+黄油' : '醒图',
      fontStyle: '醒图粗黑 (高辨识加粗)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      layoutStructure: '上居中大字 + 重点底色框',
      colorPalette: {
        titleColor: '#ffffff',
        titleBg: '#000000',
        badgeBg: '#e11d48',
        badgeColor: '#ffffff',
        bgColor: '#090d16',
        bgGradient: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
        highlightColor: '#facc15'
      },
      filterPreset: 'high-contrast',
      filterName: '醒图 · 高反差黑金',
      stickerPresets: [
        { text: '🔥 爆款拆解', bg: '#f59e0b', color: '#000000' },
        { text: '📌 建议收藏', bg: '#e11d48', color: '#ffffff' }
      ],
      designNotes: '智能提取自导入素材视觉特征'
    };
  };

  // Extract all custom imported items from knowledge base
  const customImportedPresets: EnrichedKnowledgePreset[] = useMemo(() => {
    return (knowledgeBase || []).map((item) => {
      const spec = buildEffectiveSpec(item);
      let badge = (item.tags && item.tags[0]) || '爆款拆解';
      let mainTitle = item.title;
      let subTitle = '';
      
      if (item.coverText) {
        const badgeMatch = item.coverText.match(/【(.*?)】/);
        if (badgeMatch) {
          badge = badgeMatch[1];
        }
        mainTitle = item.coverText.replace(/【.*?】/, '').trim() || item.title;
      }
      
      if (item.deconstruction?.hookPattern?.formula) {
        subTitle = item.deconstruction.hookPattern.formula.slice(0, 24);
      } else if (item.bodyContent) {
        subTitle = item.bodyContent.split('\n')[0]?.trim()?.slice(0, 24) || '';
      }

      return {
        sourceId: item.id,
        sourceTitle: item.title,
        isCustomImported: true,
        referenceImage: item.referenceImage,
        spec,
        reversePrompt: item.reversePrompt || item.deconstruction?.reversePrompt,
        coverVisualLogic: item.deconstruction?.coverVisualLogic,
        extractedTitle: mainTitle,
        extractedSubtitle: subTitle,
        extractedBadge: badge,
        extractedHook: item.deconstruction?.hookPattern?.analysis || item.bodyContent?.slice(0, 60),
        reusableTemplate: item.deconstruction?.reusableTemplate || item.bodyContent,
        tags: item.tags,
        accountNiche: item.accountNiche,
        createdAt: item.createdAt
      };
    });
  }, [knowledgeBase]);

  // Fallback / Built-in knowledge seeds if knowledgeBase is minimal
  const defaultKnowledgeSpecs: {
    sourceId: string;
    sourceTitle: string;
    spec: XingtuButterVisualSpec;
  }[] = [
    {
      sourceId: 'kb-seed-1',
      sourceTitle: '醒图 · 高反差黑金大字报 (爆款复盘标配)',
      spec: {
        toolSource: '醒图',
        fontStyle: '醒图粗黑 (高辨识加粗)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        layoutStructure: '上居中大字 + 黑底黄字重点框',
        colorPalette: {
          titleColor: '#ffffff',
          titleBg: '#000000',
          badgeBg: '#e11d48',
          badgeColor: '#ffffff',
          bgColor: '#090d16',
          bgGradient: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
          highlightColor: '#fbbf24'
        },
        filterPreset: 'high-contrast',
        filterName: '醒图 · 高反差黑金',
        stickerPresets: [
          { text: '🔥 建议收藏', bg: '#f59e0b', color: '#000000' },
          { text: '⚠️ 避坑必看', bg: '#e11d48', color: '#ffffff' }
        ],
        designNotes: '黑底黄字强反差，前3秒完播率提升35%'
      }
    },
    {
      sourceId: 'kb-seed-2',
      sourceTitle: '黄油相机 · 芝士暖黄日杂风 (治愈/生活/副业)',
      spec: {
        toolSource: '黄油相机',
        fontStyle: '黄油软糖体 (圆润吸睛)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        layoutStructure: '极简双段式 + 暖色微胶贴纸',
        colorPalette: {
          titleColor: '#1e293b',
          titleBg: '#fef08a',
          badgeBg: '#f59e0b',
          badgeColor: '#000000',
          bgColor: '#fffbeb',
          bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          highlightColor: '#d97706'
        },
        filterPreset: 'warm',
        filterName: '黄油 · 芝士暖黄',
        stickerPresets: [
          { text: '✨ 保姆级干货', bg: '#fbbf24', color: '#000000' },
          { text: '💯 亲测有效', bg: '#10b981', color: '#ffffff' }
        ],
        designNotes: '暖调治愈亲和力强，点赞收藏比显著提升'
      }
    },
    {
      sourceId: 'kb-seed-3',
      sourceTitle: '醒图 · 赛博暗夜荧光绿 (科技/AI/认知)',
      spec: {
        toolSource: '醒图',
        fontStyle: '阿里妈妈数黑体 (力量感加粗)',
        fontFamily: 'monospace, sans-serif',
        layoutStructure: '三段式痛点居中 + 荧光点缀',
        colorPalette: {
          titleColor: '#4ade80',
          titleBg: '#022c22',
          badgeBg: '#22c55e',
          badgeColor: '#052e16',
          bgColor: '#020617',
          bgGradient: 'linear-gradient(135deg, #020617 0%, #064e3b 100%)',
          highlightColor: '#86efac'
        },
        filterPreset: 'cool',
        filterName: '醒图 · 冷艳赛博',
        stickerPresets: [
          { text: '⚡ 颠覆认知', bg: '#4ade80', color: '#052e16' },
          { text: '🎯 商业实操', bg: '#3b82f6', color: '#ffffff' }
        ],
        designNotes: '黑绿荧光视觉冲击力强，科技感与权威感倍增'
      }
    }
  ];

  const systemBuiltinPresets: EnrichedKnowledgePreset[] = useMemo(() => {
    return defaultKnowledgeSpecs.map((seed) => ({
      ...seed,
      isCustomImported: false,
      extractedTitle: seed.sourceTitle.split('·')[1]?.trim() || seed.sourceTitle,
      extractedBadge: seed.spec.toolSource
    }));
  }, []);

  // Combined all active available presets (Custom imported first)
  const allAvailablePresets: EnrichedKnowledgePreset[] = useMemo(() => {
    return [...customImportedPresets, ...systemBuiltinPresets];
  }, [customImportedPresets, systemBuiltinPresets]);

  // Filtered presets based on tab filter
  const displayedPresets = useMemo(() => {
    if (presetFilter === 'custom') return customImportedPresets;
    if (presetFilter === 'system') return systemBuiltinPresets;
    return allAvailablePresets;
  }, [presetFilter, customImportedPresets, systemBuiltinPresets, allAvailablePresets]);

  // 1. Apply ONLY the visual specification (Font, color palette, filter, stickers) + Synthesize Prompt & Generate 3:4 AI Background
  const applyVisualSpec = async (presetItem: EnrichedKnowledgePreset) => {
    const s = presetItem.spec;
    
    // Step A: Immediately apply the color palette, fonts, stickers and filters to make UI immediately responsive
    const updatedConfig: CoverVisualConfig = {
      ...config,
      bgType: s.colorPalette.bgGradient ? 'gradient' : 'color',
      bgColor: s.colorPalette.bgColor,
      bgGradient: s.colorPalette.bgGradient || 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
      badgeBg: s.colorPalette.badgeBg,
      badgeColor: s.colorPalette.badgeColor,
      titleColor: s.colorPalette.titleColor,
      titleBg: s.colorPalette.titleBg || 'transparent',
      titleHighlightColor: s.colorPalette.highlightColor,
      filter: s.filterPreset,
      xingtuButterStyle: `${s.toolSource} · ${s.fontStyle}`,
      sourceKnowledgeId: presetItem.sourceId,
      stickers: s.stickerPresets ? s.stickerPresets.map((stk, idx) => ({
        id: `stk-preset-${idx}-${Date.now()}`,
        text: stk.text,
        x: 28 + idx * 16,
        y: 80 + idx * 30,
        bg: stk.bg,
        color: stk.color
      })) : config.stickers
    };
    onChangeConfig(updatedConfig);

    // Step B: Synthesize Prompt & Generate matching 3:4 Background Image
    setIsGeneratingBg(true);
    setGeneratingBgSourceId(presetItem.sourceId);

    const effectiveMainTitle = config.mainTitle || activePromptContext?.selectedTitle || titleSuggestion || presetItem.extractedTitle || '爆款内容创作';
    const effectiveSubTitle = config.subTitle || activePromptContext?.goldenHook || subtitleSuggestion || presetItem.extractedSubtitle || presetItem.extractedHook || '';
    const effectiveBadgeText = config.badgeText || activePromptContext?.badgeText || badgeSuggestion || presetItem.extractedBadge || '爆款干货';
    const effectiveReversePrompt = presetItem.reversePrompt || (presetItem.sourceId === activePromptContext?.sourceKnowledgeId ? activePromptContext?.reversePrompt : undefined);
    const effectiveCoverVisualLogic = presetItem.coverVisualLogic || (presetItem.sourceId === activePromptContext?.sourceKnowledgeId ? activePromptContext?.coverVisualLogic : undefined);
    const effectiveRefImage = presetItem.referenceImage || (presetItem.sourceId === activePromptContext?.sourceKnowledgeId ? activePromptContext?.referenceImage : undefined);
    const effectiveTargetAudience = activePromptContext?.targetAudience || accountContext?.targetAudience;
    const effectiveAccountPersona = activePromptContext?.accountPersona || accountContext?.persona;
    const effectiveAccountNiche = activePromptContext?.accountNiche || accountContext?.niche || presetItem.accountNiche;

    setBgGenerationStatus(`🧠 正在综合当前主标题【${effectiveMainTitle}】与【${presetItem.sourceTitle}】4色卡/醒图黄油排版/反推Prompt 生成 3:4 底图...`);

    try {
      const res = await fetch('/api/ai/generate-cover-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainTitle: effectiveMainTitle,
          subTitle: effectiveSubTitle,
          badgeText: effectiveBadgeText,
          visualSpec: s,
          presetSourceTitle: presetItem.sourceTitle,
          reversePrompt: effectiveReversePrompt,
          coverVisualLogic: effectiveCoverVisualLogic,
          referenceImage: effectiveRefImage,
          targetAudience: effectiveTargetAudience,
          accountPersona: effectiveAccountPersona,
          accountContext: effectiveAccountNiche ? { niche: effectiveAccountNiche } : undefined
        })
      });

      if (!res.ok) {
        throw new Error(`生成失败 (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (data.imageUrl) {
        onChangeConfig({
          ...updatedConfig,
          bgType: 'image',
          bgImage: data.imageUrl,
          overlayDarkness: config.overlayDarkness > 10 ? config.overlayDarkness : 20,
          xingtuButterStyle: `${s.toolSource} · ${s.fontStyle} (AI定制底图)`
        });
        setLastDesignConcept(data.chineseSummary || `已综合【${effectiveMainTitle}】与【${presetItem.sourceTitle}】调色生成匹配 3:4 封面底图`);
        setAppliedPresetName(`✨ ${data.chineseSummary || `已根据【${effectiveMainTitle}】生成匹配 3:4 底图！`}`);
      } else {
        setAppliedPresetName(`已套用【${presetItem.sourceTitle}】视觉排版与配色规范`);
      }
    } catch (err: any) {
      console.warn('AI cover background generation fallback:', err);
      setAppliedPresetName(`已套用【${presetItem.sourceTitle}】视觉排版（底图网络繁忙已保底）`);
    } finally {
      setIsGeneratingBg(false);
      setGeneratingBgSourceId(null);
      setBgGenerationStatus(null);
      setTimeout(() => setAppliedPresetName(null), 4500);
    }
  };

  // 2. Apply Custom Reference Image as 3:4 Background with text overlay
  const applyReferenceImageAsBackground = (presetItem: EnrichedKnowledgePreset) => {
    if (!presetItem.referenceImage) return;
    const s = presetItem.spec;
    onChangeConfig({
      ...config,
      bgType: 'image',
      bgImage: presetItem.referenceImage,
      overlayDarkness: config.overlayDarkness > 15 ? config.overlayDarkness : 25,
      badgeBg: s.colorPalette.badgeBg,
      badgeColor: s.colorPalette.badgeColor,
      titleColor: s.colorPalette.titleColor || '#ffffff',
      titleHighlightColor: s.colorPalette.highlightColor || '#facc15',
      filter: s.filterPreset,
      xingtuButterStyle: `${s.toolSource} · ${s.fontStyle}`,
      sourceKnowledgeId: presetItem.sourceId
    });
    setAppliedPresetName(`已将【${presetItem.sourceTitle}】原图作为 3:4 封面背景加载`);
    setTimeout(() => setAppliedPresetName(null), 3000);
  };

  // 3. Apply Text Content from Deconstruction
  const applyDeconstructedText = (presetItem: EnrichedKnowledgePreset) => {
    const newTitle = presetItem.extractedTitle || presetItem.sourceTitle;
    const newSub = presetItem.extractedSubtitle || presetItem.extractedHook || config.subTitle;
    const newBadge = presetItem.extractedBadge || config.badgeText;

    onChangeConfig({
      ...config,
      mainTitle: newTitle.slice(0, 18),
      subTitle: newSub.slice(0, 26),
      badgeText: newBadge
    });

    if (onSyncBackToEditor) {
      onSyncBackToEditor({
        title: newTitle,
        subTitle: newSub,
        badge: newBadge,
        bodyTemplate: presetItem.reusableTemplate
      });
    }

    setAppliedPresetName(`已同步【${presetItem.sourceTitle}】拆解文案与大字`);
    setTimeout(() => setAppliedPresetName(null), 3000);
  };

  // 4. One-Click ALL-IN-ONE Apply (Visual Spec + Image Background + Text)
  const applyFullPresetAll = (presetItem: EnrichedKnowledgePreset) => {
    const s = presetItem.spec;
    const newTitle = presetItem.extractedTitle || presetItem.sourceTitle;
    const newSub = presetItem.extractedSubtitle || presetItem.extractedHook || config.subTitle;
    const newBadge = presetItem.extractedBadge || config.badgeText;

    onChangeConfig({
      ...config,
      bgType: presetItem.referenceImage ? 'image' : (s.colorPalette.bgGradient ? 'gradient' : 'color'),
      bgImage: presetItem.referenceImage || config.bgImage,
      overlayDarkness: presetItem.referenceImage ? 25 : config.overlayDarkness,
      bgColor: s.colorPalette.bgColor,
      bgGradient: s.colorPalette.bgGradient || 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
      badgeText: newBadge,
      badgeBg: s.colorPalette.badgeBg,
      badgeColor: s.colorPalette.badgeColor,
      mainTitle: newTitle.slice(0, 18),
      titleColor: s.colorPalette.titleColor,
      titleBg: s.colorPalette.titleBg || 'transparent',
      titleHighlightColor: s.colorPalette.highlightColor,
      subTitle: newSub.slice(0, 26),
      filter: s.filterPreset,
      xingtuButterStyle: `${s.toolSource} · ${s.fontStyle}`,
      sourceKnowledgeId: presetItem.sourceId,
      stickers: s.stickerPresets ? s.stickerPresets.map((stk, idx) => ({
        id: `stk-preset-${idx}-${Date.now()}`,
        text: stk.text,
        x: 28 + idx * 16,
        y: 80 + idx * 30,
        bg: stk.bg,
        color: stk.color
      })) : config.stickers
    });

    if (onSyncBackToEditor) {
      onSyncBackToEditor({
        title: newTitle,
        subTitle: newSub,
        badge: newBadge,
        bodyTemplate: presetItem.reusableTemplate
      });
    }

    setAppliedPresetName(`⚡ 已全套套用【${presetItem.sourceTitle}】(排版 + ${presetItem.referenceImage ? '参考图' : '底色'} + 文案)`);
    setTimeout(() => setAppliedPresetName(null), 3500);
  };

  // Strictly return 3:4 canvas dimensions for Xiaohongshu standard
  const getCanvasDimensions = () => {
    return { width: 450, height: 600, exportW: 900, exportH: 1200 };
  };

  // Load Background Image if provided
  useEffect(() => {
    if (config.bgType === 'image' && config.bgImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = config.bgImage;
      img.onload = () => setBgImageObj(img);
    } else {
      setBgImageObj(null);
    }
  }, [config.bgType, config.bgImage]);

  // Render Canvas with 3:4 strict scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getCanvasDimensions();
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background (3:4 ratio container fit)
    if (config.bgType === 'image' && bgImageObj) {
      const scale = Math.max(width / bgImageObj.width, height / bgImageObj.height);
      const x = (width - bgImageObj.width * scale) / 2;
      const y = (height - bgImageObj.height * scale) / 2;
      ctx.drawImage(bgImageObj, x, y, bgImageObj.width * scale, bgImageObj.height * scale);
    } else if (config.bgType === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      const match = config.bgGradient.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g);
      if (match && match.length >= 2) {
        grad.addColorStop(0, match[0]);
        grad.addColorStop(1, match[1]);
      } else {
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(1, '#1e293b');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = config.bgColor || '#090d16';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Apply Visual Filter / Mood
    if (config.filter === 'high-contrast') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);
    } else if (config.filter === 'warm') {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
      ctx.fillRect(0, 0, width, height);
    } else if (config.filter === 'cool') {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.fillRect(0, 0, width, height);
    } else if (config.filter === 'vintage') {
      ctx.fillStyle = 'rgba(120, 53, 15, 0.1)';
      ctx.fillRect(0, 0, width, height);
    }

    // 3. Apply Overlay Darkness Mask
    if (config.overlayDarkness > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${config.overlayDarkness / 100})`;
      ctx.fillRect(0, 0, width, height);
    }

    // 4. Aesthetic 3:4 Frame Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // 5. Draw Badge Tag
    let badgeBottom = 48;
    if (config.badgeText) {
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const badgeMetrics = ctx.measureText(config.badgeText);
      const badgeW = badgeMetrics.width + 24;
      const badgeH = 30;
      const badgeX = 32;
      const badgeY = 48;
      badgeBottom = badgeY + badgeH;

      ctx.fillStyle = config.badgeBg || '#e11d48';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
      ctx.fill();

      ctx.fillStyle = config.badgeColor || '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.badgeText, badgeX + 12, badgeY + badgeH / 2);
    }

    // 6. Draw Main Title with Dynamic/Safe Spacing
    let currentBottomY = badgeBottom + 20;
    if (config.mainTitle) {
      const titleLines = wrapText(ctx, config.mainTitle, width - 64, config.titleSize || 36);
      
      // Calculate responsive start Y to optimize space
      const estimatedTitleH = titleLines.length * ((config.titleSize || 36) * 1.35);
      let startY = height * 0.36;
      if (titleLines.length >= 3) {
        startY = Math.max(badgeBottom + 24, height * 0.28);
      }
      const lineHeight = (config.titleSize || 36) * 1.35;

      titleLines.forEach((line, index) => {
        const lineY = startY + index * lineHeight;
        
        ctx.font = `bold ${config.titleSize || 36}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const lineMetrics = ctx.measureText(line);

        // Highlight background block
        if (config.titleBg && config.titleBg !== 'transparent') {
          ctx.fillStyle = config.titleBg;
          ctx.beginPath();
          ctx.roundRect(32 - 8, lineY - (config.titleSize || 36) * 0.85, lineMetrics.width + 16, (config.titleSize || 36) * 1.25, 4);
          ctx.fill();
        }

        // Text shadow for contrast
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = config.titleColor || '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(line, 32, lineY);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      });

      currentBottomY = startY + estimatedTitleH;
    }

    // 7. Draw Subtitle with Collision Avoidance
    if (config.subTitle) {
      const subLines = wrapText(ctx, config.subTitle, width - 64, config.subTitleSize || 18);
      const subStartY = Math.max(currentBottomY + 24, height * 0.72);
      const subLineHeight = (config.subTitleSize || 18) * 1.4;

      subLines.forEach((line, index) => {
        const currentSubY = subStartY + index * subLineHeight;
        ctx.font = `500 ${config.subTitleSize || 18}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = config.subTitleColor || '#cbd5e1';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(line, 32, currentSubY);
      });
    }

    // 8. Draw Floating Stickers
    if (config.stickers && config.stickers.length > 0) {
      config.stickers.forEach((stk) => {
        ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif';
        const metrics = ctx.measureText(stk.text);
        const w = metrics.width + 18;
        const h = 26;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;

        ctx.fillStyle = stk.bg || '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(stk.x, stk.y, w, h, 13);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = stk.color || '#000000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(stk.text, stk.x + 9, stk.y + h / 2);
      });
    }

    // 9. If text exceeds 3:4 canvas boundary, render safety margin guide and warning badge on canvas
    if (boundaryReport.isOverflow) {
      ctx.save();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      
      // Bottom overflow line
      ctx.beginPath();
      ctx.moveTo(16, height - 32);
      ctx.lineTo(width - 16, height - 32);
      ctx.stroke();

      // Small warning indicator tag on bottom right
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(225, 29, 72, 0.9)';
      ctx.beginPath();
      ctx.roundRect(width - 146, height - 28, 130, 20, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠️ 3:4 可视画框已溢出', width - 81, height - 18);
      ctx.restore();
    }

  }, [config, bgImageObj]);

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number) => {
    ctx.font = `bold ${fontSize}px sans-serif`;
    const words = text.split('');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const char = words[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setExporting(true);
    const link = document.createElement('a');
    link.download = `cover-3x4-${config.mainTitle.slice(0, 10) || 'viral'}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    setTimeout(() => setExporting(false), 800);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChangeConfig({
            ...config,
            bgType: 'image',
            bgImage: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Smart Parse Copied/Pasted Text into Title, Subtitle, Badge
  const handleSmartParsePastedText = () => {
    if (!pastedCopyText.trim()) return;

    const lines = pastedCopyText.split('\n').map(l => l.trim()).filter(Boolean);
    const firstLine = lines[0] || '';
    
    // Extract badge if brackets exist e.g. 【...】 or 🔥
    let detectedBadge = '';
    let cleanTitle = firstLine;

    const bracketMatch = firstLine.match(/【(.*?)】|\[(.*?)\]/);
    if (bracketMatch) {
      detectedBadge = `📌 ${bracketMatch[1] || bracketMatch[2]}`;
      cleanTitle = firstLine.replace(/【.*?】|\[.*?\]/, '').trim();
    } else if (firstLine.startsWith('🔥') || firstLine.startsWith('⚠️') || firstLine.startsWith('📌')) {
      const parts = firstLine.split(' ');
      detectedBadge = parts[0];
      cleanTitle = parts.slice(1).join(' ');
    }

    const titleResult = cleanTitle.slice(0, 16);
    const subtitleResult = (lines[1] || lines[0] || '').slice(0, 24);

    onChangeConfig({
      ...config,
      badgeText: detectedBadge || config.badgeText || '🔥 爆款复盘',
      mainTitle: titleResult || config.mainTitle,
      subTitle: subtitleResult || config.subTitle
    });

    setParseSuccessMsg('已智能解析并填入主标题、副标题与顶部标签！');
    setTimeout(() => setParseSuccessMsg(null), 3000);
  };

  const addSticker = (preset: { text: string; bg: string; color: string }) => {
    const newSticker = {
      id: `stk-${Date.now()}`,
      text: preset.text,
      x: 32 + (config.stickers?.length || 0) * 15,
      y: 90 + (config.stickers?.length || 0) * 32,
      bg: preset.bg,
      color: preset.color
    };
    onChangeConfig({
      ...config,
      stickers: [...(config.stickers || []), newSticker]
    });
  };

  const removeSticker = (id: string) => {
    onChangeConfig({
      ...config,
      stickers: (config.stickers || []).filter((s) => s.id !== id)
    });
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-5">
      
      {/* Top Header: Aspect Ratio Notice & Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">醒图 / 黄油相机 视觉微调工坊</h3>
          
          {/* Strictly 3:4 standard indicator */}
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
            <Maximize2 className="w-3 h-3" />
            <span>小红书标准 3:4 封面画幅已锁定</span>
          </div>

          {config.xingtuButterStyle && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
              当前风格：{config.xingtuButterStyle}
            </span>
          )}
        </div>

        <button
          onClick={handleExportPNG}
          disabled={exporting}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? '无损导出中...' : '导出高清 3:4 封面 (PNG)'}</span>
        </button>
      </div>

      {appliedPresetName && (
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
          <span>已应用【{appliedPresetName}】的醒图/黄油排版与调色参数！</span>
        </div>
      )}

      {/* Main Split: 3:4 Canvas Live Stage & Micro-adjustment Tool Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left: 3:4 Canvas Live Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
          <div className="text-[11px] text-amber-400/90 font-medium mb-2 flex items-center space-x-1">
            <span>📐 3:4 画幅标准输出 (450 × 600 px)</span>
          </div>
          
          {/* Strictly 3:4 Frame Container */}
          <div className="relative shadow-2xl rounded-xl overflow-hidden border border-slate-700/80 aspect-[3/4] w-full max-w-[320px] bg-slate-900 flex items-center justify-center">
            <canvas ref={canvasRef} className="block w-full h-full object-contain" />
          </div>
          
          <span className="text-[11px] text-slate-500 mt-3 text-center">
            💡 字体、色卡与贴纸均来源于经验库，严格保证高点击率与视觉一致性
          </span>
        </div>

        {/* Right: Micro-adjustment Tabs, Text Pasting Box & Controls */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Dedicated Text Box for Copy Pasting (User Request: 留一个文本框，可以粘贴文案) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-amber-400 flex items-center space-x-1.5">
                <ClipboardPaste className="w-4 h-4 text-amber-400" />
                <span>文案快捷粘贴板 / 导入提取区</span>
              </label>
              {pastedCopyText && (
                <button
                  onClick={() => setPastedCopyText('')}
                  className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center space-x-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清空</span>
                </button>
              )}
            </div>

            <textarea
              rows={3}
              value={pastedCopyText}
              onChange={(e) => setPastedCopyText(e.target.value)}
              placeholder="在此直接粘贴你的爆款文案、标题草稿或笔记正文，点击下方快捷提取..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 text-xs resize-none"
            />

            {/* Pasted text action buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleSmartParsePastedText}
                disabled={!pastedCopyText.trim()}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-[11px] flex items-center space-x-1 transition-all disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3" />
                <span>智能拆解填入封面</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (pastedCopyText.trim()) {
                    onChangeConfig({ ...config, mainTitle: pastedCopyText.trim().slice(0, 16) });
                  }
                }}
                disabled={!pastedCopyText.trim()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] transition-colors disabled:opacity-40"
              >
                设为主标题
              </button>

              <button
                type="button"
                onClick={() => {
                  if (pastedCopyText.trim()) {
                    onChangeConfig({ ...config, subTitle: pastedCopyText.trim().slice(0, 24) });
                  }
                }}
                disabled={!pastedCopyText.trim()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] transition-colors disabled:opacity-40"
              >
                设为副标题
              </button>

              <button
                type="button"
                onClick={() => {
                  if (pastedCopyText.trim()) {
                    onChangeConfig({ ...config, badgeText: `🔥 ${pastedCopyText.trim().slice(0, 8)}` });
                  }
                }}
                disabled={!pastedCopyText.trim()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] transition-colors disabled:opacity-40"
              >
                设为标签
              </button>
            </div>

            {parseSuccessMsg && (
              <p className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{parseSuccessMsg}</span>
              </p>
            )}
          </div>

          {/* AI Background Prompt Synthesis & Generation Status Banner */}
          {isGeneratingBg && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-amber-950/40 border border-amber-500/50 flex items-center space-x-3 shadow-lg shadow-purple-950/50 animate-pulse">
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="font-bold text-xs text-amber-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI 正在整合拆解模板与当前主副标题生成 3:4 底图...</span>
                </p>
                <p className="text-[11px] text-purple-200 truncate">
                  {bgGenerationStatus || '正在融合 4 色卡、排版规范与标题语义...'}
                </p>
              </div>
            </div>
          )}

          {lastDesignConcept && !isGeneratingBg && (
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-300 min-w-0 pr-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] text-amber-200 truncate">
                  <strong>AI生成理念：</strong>{lastDesignConcept}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLastDesignConcept(null)}
                className="text-slate-500 hover:text-slate-300 p-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Real-time 3:4 Canvas Boundary & Capacity Monitor */}
          <div className={`p-3.5 rounded-xl border transition-all text-xs space-y-2.5 ${
            boundaryReport.warningLevel === 'danger'
              ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/30'
              : boundaryReport.warningLevel === 'warning'
              ? 'bg-amber-950/30 border-amber-500/50'
              : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className={`w-4 h-4 ${
                  boundaryReport.warningLevel === 'danger'
                    ? 'text-rose-400 animate-pulse'
                    : boundaryReport.warningLevel === 'warning'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`} />
                <span className="font-bold text-slate-200">3:4 画布排版边界与容量监视</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  boundaryReport.warningLevel === 'danger'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : boundaryReport.warningLevel === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {boundaryReport.warningLevel === 'danger' ? '⚠️ 超出画框' : boundaryReport.warningLevel === 'warning' ? '接近红线' : '安全区'} ({boundaryReport.heightUsagePercent}%)
                </span>
              </div>
            </div>

            {/* Visual Capacity Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-300 ${
                    boundaryReport.warningLevel === 'danger'
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : boundaryReport.warningLevel === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${Math.min(100, boundaryReport.heightUsagePercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>0%</span>
                <span>主标题: {boundaryReport.titleLines.length} 行 ({config.titleSize || 36}px) · 副标题: {boundaryReport.subtitleLines.length} 行</span>
                <span>100% (3:4 安全上限)</span>
              </div>
            </div>

            {/* Boundary Overflow Alert & One-Click Auto-Fixes */}
            {boundaryReport.warningLevel === 'danger' ? (
              <div className="pt-1.5 border-t border-rose-500/30 space-y-2">
                <div className="flex items-start space-x-2 text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-rose-200">
                      文案已超出 3:4 封面可视边界！(超出约 {boundaryReport.overflowAmountPx}px)
                    </p>
                    <p className="text-[11px] text-rose-300/80">
                      {boundaryReport.warningMessage}。建议调整字号或精简文本。
                    </p>
                  </div>
                </div>

                {/* Auto-fix Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeConfig({
                        ...config,
                        titleSize: boundaryReport.suggestedTitleSize,
                        subTitleSize: boundaryReport.suggestedSubtitleSize
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⚡ 自动缩放字号适配 ({config.titleSize}px → {boundaryReport.suggestedTitleSize}px)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (boundaryReport.titleLines.length > 2) {
                        const truncated = boundaryReport.titleLines.slice(0, 2).join('');
                        onChangeConfig({
                          ...config,
                          mainTitle: truncated.slice(0, 16)
                        });
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 transition-colors"
                  >
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    <span>精简为主标题 2 行</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (boundaryReport.titleLines.length >= 2) {
                        const firstLine = boundaryReport.titleLines[0];
                        const remaining = boundaryReport.titleLines.slice(1).join('');
                        onChangeConfig({
                          ...config,
                          mainTitle: firstLine,
                          subTitle: remaining.slice(0, 24)
                        });
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 transition-colors"
                  >
                    <span>🔀 拆分主/副标题</span>
                  </button>
                </div>
              </div>
            ) : boundaryReport.warningLevel === 'warning' ? (
              <div className="pt-1 border-t border-amber-500/20 flex items-center justify-between text-amber-300">
                <span className="text-[11px] flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>排版内容饱满，建议保持主标题在 3 行内以防底部被遮挡</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onChangeConfig({
                      ...config,
                      titleSize: Math.max(26, (config.titleSize || 36) - 4)
                    });
                  }}
                  className="text-[11px] underline text-amber-400 hover:text-amber-300 font-medium"
                >
                  微调微缩字号 (-4px)
                </button>
              </div>
            ) : null}
          </div>

          {/* Sub-nav Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors whitespace-nowrap ${
                activeTab === 'text' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>文字排版</span>
            </button>

            <button
              onClick={() => setActiveTab('bg')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors whitespace-nowrap ${
                activeTab === 'bg' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>3:4 背景载入</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors whitespace-nowrap ${
                activeTab === 'presets' ? 'bg-slate-800 text-purple-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>经验库预设 ({allAvailablePresets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stickers')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors whitespace-nowrap ${
                activeTab === 'stickers' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>爆款贴纸</span>
            </button>

            <button
              onClick={() => setActiveTab('filter')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors whitespace-nowrap ${
                activeTab === 'filter' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Contrast className="w-3.5 h-3.5" />
              <span>调色滤镜</span>
            </button>
          </div>

          {/* TAB 1: Typography & Text Controls */}
          {activeTab === 'text' && (
            <div className="space-y-3.5 text-xs">
              
              {/* Badge Tag Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-slate-300">顶层醒目标签 (Badge)</label>
                  <div className="flex items-center space-x-1">
                    {['#e11d48', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6'].map((c) => (
                      <button
                        key={c}
                        onClick={() => onChangeConfig({ ...config, badgeBg: c })}
                        className="w-4 h-4 rounded-full border border-slate-700"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={config.badgeText}
                  onChange={(e) => onChangeConfig({ ...config, badgeText: e.target.value })}
                  placeholder="如：🔥 收藏备用 / ⚠️ 避坑必看"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Main Title Input & Size */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-slate-300">主标题大字</label>
                  <span className="text-[11px] text-amber-400 font-mono">{config.titleSize || 36}px</span>
                </div>
                <input
                  type="text"
                  value={config.mainTitle}
                  onChange={(e) => onChangeConfig({ ...config, mainTitle: e.target.value })}
                  placeholder="核心大标题（8-14字最具冲击力）"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                />
                
                {/* Title Size Slider */}
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-[10px] text-slate-500">字号:</span>
                  <input
                    type="range"
                    min="24"
                    max="50"
                    value={config.titleSize || 36}
                    onChange={(e) => onChangeConfig({ ...config, titleSize: Number(e.target.value) })}
                    className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Banner Style Presets from Knowledge library */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400">底色卡：</span>
                  <button
                    onClick={() => onChangeConfig({ ...config, titleBg: 'transparent', titleColor: '#ffffff' })}
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300"
                  >
                    无底色
                  </button>
                  <button
                    onClick={() => onChangeConfig({ ...config, titleBg: '#000000', titleColor: '#fbbf24' })}
                    className="px-2 py-0.5 rounded bg-black text-amber-300 border border-amber-500/40 text-[10px] font-bold"
                  >
                    醒图黑底黄字
                  </button>
                  <button
                    onClick={() => onChangeConfig({ ...config, titleBg: '#fef08a', titleColor: '#1e293b' })}
                    className="px-2 py-0.5 rounded bg-amber-200 text-slate-900 text-[10px] font-bold"
                  >
                    黄油暖黄底黑字
                  </button>
                  <button
                    onClick={() => onChangeConfig({ ...config, titleBg: '#e11d48', titleColor: '#ffffff' })}
                    className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold"
                  >
                    红底白字
                  </button>
                </div>
              </div>

              {/* Subtitle Input */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">副标题解释 (痛点/悬念)</label>
                <input
                  type="text"
                  value={config.subTitle}
                  onChange={(e) => onChangeConfig({ ...config, subTitle: e.target.value })}
                  placeholder="补充说明利益点或具体痛点"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

            </div>
          )}

          {/* TAB 2: Background & 3:4 Image Loading (User Request: 载入图片界面定为 3:4) */}
          {activeTab === 'bg' && (
            <div className="space-y-4 text-xs">
              
              {/* 3:4 Custom Image Upload & Preview Interface */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>载入 3:4 封面背景底图 (醒图/黄油底图)</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    3:4 比例界面
                  </span>
                </div>

                {/* AI Dynamic Generate Matching Background */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30 flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <p className="font-bold text-[11px] text-purple-200 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>根据当前主标题【{config.mainTitle || '当前标题'}】AI生成 3:4 底图</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      自动整合副标题、标签及当前配色方案生成留白友好的高转化底图
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isGeneratingBg}
                    onClick={() => {
                      // Apply with first preset or current visual
                      const activePreset = allAvailablePresets.find(p => p.sourceId === config.sourceKnowledgeId) || allAvailablePresets[0];
                      if (activePreset) {
                        applyVisualSpec(activePreset);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
                  >
                    {isGeneratingBg ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>生成中...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>AI 生成底图</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                {config.bgType === 'image' && config.bgImage ? (
                  <div className="relative aspect-[3/4] max-w-[200px] mx-auto rounded-xl overflow-hidden border-2 border-amber-500/60 bg-slate-900 group shadow-lg">
                    <img
                      src={config.bgImage}
                      alt="已载入封面"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px]"
                      >
                        替换图片
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeConfig({ ...config, bgType: 'gradient' })}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white font-medium text-[11px]"
                      >
                        切回渐变背景
                      </button>
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-400 font-mono">
                      3:4 比例已生效
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[3/4] max-w-[200px] mx-auto rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/80 bg-slate-900/60 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all group"
                  >
                    <ImageIcon className="w-8 h-8 text-slate-500 group-hover:text-amber-400 mb-2 transition-colors" />
                    <span className="text-xs font-bold text-slate-200">点击上传 3:4 封面图片</span>
                    <span className="text-[10px] text-slate-400 mt-1">支持 PNG, JPG 高清图片</span>
                    <span className="text-[10px] text-amber-400/80 mt-2 font-mono px-2 py-0.5 rounded bg-slate-800">
                      标准 3:4 画幅
                    </span>
                  </div>
                )}
              </div>

              {/* Experience Library Presets */}
              <div className="space-y-2">
                <label className="block font-medium text-slate-300">或选择经验库调色底色：</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: '深邃黑蓝 (爆款标配)', value: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)' },
                    { name: '黄油暖杏 (治愈生活)', value: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' },
                    { name: '赛博极光 (科技AI)', value: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)' },
                    { name: '极简磨砂黑 (高对比度)', value: 'linear-gradient(135deg, #111827 0%, #030712 100%)' },
                    { name: '暮色紫金 (高端IP)', value: 'linear-gradient(135deg, #2e1065 0%, #3b0764 100%)' },
                    { name: '活力暗红 (警示避坑)', value: 'linear-gradient(135deg, #450a0a 0%, #1c1917 100%)' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        onChangeConfig({
                          ...config,
                          bgType: 'gradient',
                          bgGradient: preset.value
                        })
                      }
                      className="flex items-center space-x-2 p-2 rounded-lg border border-slate-800 hover:border-amber-500/60 bg-slate-950 text-left transition-all group"
                    >
                      <div
                        className="w-6 h-6 rounded-md border border-slate-700 flex-shrink-0"
                        style={{ background: preset.value }}
                      />
                      <span className="text-[11px] text-slate-300 group-hover:text-amber-400 truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Overlay Darkness Mask */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">暗角遮罩压暗 (增强文字清晰度):</span>
                  <span className="text-amber-400 font-mono">{config.overlayDarkness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={config.overlayDarkness}
                  onChange={(e) => onChangeConfig({ ...config, overlayDarkness: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 0: Presets Derived Strictly from Experience Library & Custom Imported Images */}
          {activeTab === 'presets' && (
            <div className="space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-200 block">
                    经验库与自定义拆解预设库
                  </span>
                  <span className="text-[11px] text-slate-400">
                    支持一键套用视觉排版、原图垫底背景、或同步文案大字
                  </span>
                </div>

                {/* Sub-filter tabs */}
                <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPresetFilter('all')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                      presetFilter === 'all'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    全部 ({allAvailablePresets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetFilter('custom')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center space-x-1 ${
                      presetFilter === 'custom'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-purple-300'
                    }`}
                  >
                    <span>🌟 自定义拆解</span>
                    <span className="px-1 py-0.2 rounded-full bg-slate-800 text-[10px] text-purple-200">
                      {customImportedPresets.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetFilter('system')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                      presetFilter === 'system'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    💎 系统经典 ({systemBuiltinPresets.length})
                  </button>
                </div>
              </div>

              {displayedPresets.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-center space-y-2">
                  <p className="text-slate-400 font-medium">暂无自定义拆解预设</p>
                  <p className="text-slate-500 text-[11px]">
                    前往【爆款拆解经验库】导入爆款参考图或文案，拆解后将自动同步至此。
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {displayedPresets.map((preset, idx) => (
                    <div
                      key={preset.sourceId || idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        config.sourceKnowledgeId === preset.sourceId
                          ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                          : 'bg-slate-950 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              preset.isCustomImported
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {preset.isCustomImported ? '🌟 我自定义拆解' : '💎 系统模板'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-900 text-slate-300 border border-slate-800">
                            {preset.spec.toolSource}
                          </span>
                          <span className="text-xs font-bold text-slate-100 line-clamp-1">
                            {preset.sourceTitle}
                          </span>
                        </div>

                        {/* Top One-Click Master Button */}
                        <button
                          type="button"
                          onClick={() => applyFullPresetAll(preset)}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-[11px] shadow-sm flex items-center space-x-1 flex-shrink-0 cursor-pointer"
                        >
                          <Zap className="w-3 h-3" />
                          <span>一键全套套用</span>
                        </button>
                      </div>

                      {/* Content Details: Image Preview / Color Swatches / Font Specs */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80 mb-2.5">
                        {/* Reference Image Thumbnail if available */}
                        {preset.referenceImage && (
                          <div className="sm:col-span-3 flex flex-col items-center">
                            <div className="relative aspect-[3/4] w-full max-w-[70px] rounded-lg overflow-hidden border border-amber-500/50 bg-slate-950 shadow">
                              <img
                                src={preset.referenceImage}
                                alt="原图"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-slate-950/80 text-[8px] text-amber-300 font-mono rounded">
                                3:4 原图
                              </span>
                            </div>
                          </div>
                        )}

                        <div className={preset.referenceImage ? 'sm:col-span-9 space-y-1.5 text-[11px]' : 'sm:col-span-12 space-y-1.5 text-[11px]'}>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-slate-400 text-[10px] block">推荐字体：</span>
                              <span className="text-slate-200 font-medium truncate block">{preset.spec.fontStyle}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block">调色滤镜：</span>
                              <span className="text-slate-200 font-medium truncate block">{preset.spec.filterName}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-0.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-400 text-[10px]">4色卡：</span>
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: preset.spec.colorPalette.bgColor }} title="底色" />
                                <div className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: preset.spec.colorPalette.titleColor }} title="标题色" />
                                <div className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: preset.spec.colorPalette.highlightColor }} title="高光色" />
                                <div className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: preset.spec.colorPalette.badgeBg }} title="标签色" />
                              </div>
                            </div>
                            {preset.extractedBadge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                标: {preset.extractedBadge}
                              </span>
                            )}
                          </div>

                          {preset.extractedTitle && (
                            <div className="text-[10px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 truncate">
                              <strong className="text-slate-300">大字: </strong>{preset.extractedTitle}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Granular Action Buttons */}
                      <div className="flex items-center flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={isGeneratingBg}
                          onClick={() => applyVisualSpec(preset)}
                          className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                            generatingBgSourceId === preset.sourceId
                              ? 'bg-purple-600 text-white animate-pulse shadow-md shadow-purple-900/50'
                              : 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 hover:border-purple-400'
                          }`}
                          title="综合当前主副标题与本模板调色，合成生图Prompt并AI生成 3:4 底图"
                        >
                          {generatingBgSourceId === preset.sourceId ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                              <span>AI 正在生成底图...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>🎨 仅套用视觉调色 (AI生成匹配底图)</span>
                            </>
                          )}
                        </button>

                        {preset.referenceImage && (
                          <button
                            type="button"
                            onClick={() => applyReferenceImageAsBackground(preset)}
                            className="px-2.5 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            🖼️ 原图设为 3:4 背景
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => applyDeconstructedText(preset)}
                          className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          ✍️ 填入拆解大字文案
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Stickers & Badges */}
          {activeTab === 'stickers' && (
            <div className="space-y-3 text-xs">
              <label className="block font-medium text-slate-300">点击添加“黄油相机 / 醒图”经验库贴纸：</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: '🔥 建议收藏', bg: '#f59e0b', color: '#000000' },
                  { text: '⚠️ 避坑必看', bg: '#e11d48', color: '#ffffff' },
                  { text: '📌 保姆级干货', bg: '#10b981', color: '#ffffff' },
                  { text: '💡 颠覆认知', bg: '#8b5cf6', color: '#ffffff' },
                  { text: '🎯 实操复盘', bg: '#3b82f6', color: '#ffffff' },
                  { text: '⚡ 真金白银验证', bg: '#ec4899', color: '#ffffff' },
                  { text: '💯 亲测有效', bg: '#14b8a6', color: '#000000' },
                  { text: '✨ 全网首发', bg: '#fbbf24', color: '#000000' },
                ].map((stk, idx) => (
                  <button
                    key={idx}
                    onClick={() => addSticker(stk)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all text-left"
                  >
                    <span className="font-bold text-[11px]" style={{ color: stk.bg }}>
                      {stk.text}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-slate-500 hover:text-amber-400" />
                  </button>
                ))}
              </div>

              {/* Existing Sticker Manager */}
              {config.stickers && config.stickers.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">已添加的贴纸图层：</span>
                  {config.stickers.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800 text-[11px]"
                    >
                      <span style={{ color: s.bg }} className="font-semibold">{s.text}</span>
                      <button
                        onClick={() => removeSticker(s.id)}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Filters & Visual Mood */}
          {activeTab === 'filter' && (
            <div className="space-y-3 text-xs">
              <label className="block font-medium text-slate-300">选择视觉调色滤镜 (对接醒图/黄油)：</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', label: '原图无滤镜' },
                  { id: 'high-contrast', label: '🔥 醒图 · 高反差黑金' },
                  { id: 'warm', label: '☀️ 黄油 · 芝士暖阳' },
                  { id: 'cool', label: '❄️ 醒图 · 冷艳赛博' },
                  { id: 'vintage', label: '🎞️ 黄油 · 胶片复古' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onChangeConfig({ ...config, filter: f.id as any })}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                      config.filter === f.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
