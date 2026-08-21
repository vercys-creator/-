import React, { useState, useMemo } from 'react';
import {
  Lightbulb,
  Zap,
  Plus,
  Trash2,
  Copy,
  Check,
  Pin,
  Sparkles,
  ArrowUpRight,
  Filter,
  Search,
  ChevronRight,
  ChevronLeft,
  Users,
  UserCheck,
  CircleDollarSign,
  LayoutTemplate,
  HelpCircle,
  Tag,
  RefreshCw,
  Send,
  Target,
  TrendingUp,
  ShieldCheck,
  Flame,
  Compass,
  Link2,
  Edit3,
  X,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { 
  Account, 
  CapturedIdea, 
  PositioningDimension, 
  StrategicGoal, 
  PriorityLevel 
} from '../types';

interface InspirationCaptureSidebarProps {
  activeAccount: Account;
  capturedIdeas: CapturedIdea[];
  onAddIdea: (idea: CapturedIdea) => void;
  onDeleteIdea: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUpdateIdea?: (updated: CapturedIdea) => void;
  onInjectToPositioning: (idea: CapturedIdea) => void;
  onNavigateToTopics: (keyword: string) => void;
  onAppendToInspirationInput: (text: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  selectedDimensionFilter?: PositioningDimension | 'all';
  onSelectDimensionFilter?: (dim: PositioningDimension | 'all') => void;
  selectedStrategicGoalFilter?: StrategicGoal | 'all';
  onSelectStrategicGoalFilter?: (goal: StrategicGoal | 'all') => void;
}

export const DIMENSION_CONFIG: Record<
  PositioningDimension,
  {
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
    injectionTargetDesc: string;
  }
> = {
  audience: {
    label: '目标受众与痛点细分',
    shortLabel: '受众痛点',
    icon: Users,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300',
    injectionTargetDesc: '注入到【受众深层痛点】'
  },
  persona: {
    label: '差异化人设与信任锚点',
    shortLabel: '人设信任',
    icon: UserCheck,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    injectionTargetDesc: '注入到【信任背书与人设】'
  },
  monetization: {
    label: '商业变现闭环与漏斗',
    shortLabel: '变现漏斗',
    icon: CircleDollarSign,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    injectionTargetDesc: '注入到【变现钩子与路径】'
  },
  contentVisual: {
    label: '内容形式与视觉辨识度',
    shortLabel: '内容视觉',
    icon: LayoutTemplate,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    injectionTargetDesc: '注入到【视觉规范与支柱】'
  },
  rawSpark: {
    label: '自由原始闪念灵感',
    shortLabel: '自由灵感',
    icon: Lightbulb,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    badgeBg: 'bg-orange-500/20',
    badgeText: 'text-orange-300',
    injectionTargetDesc: '追加到【创作者原始灵感输入框】'
  }
};

export const STRATEGIC_GOAL_CONFIG: Record<
  StrategicGoal,
  {
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
    desc: string;
  }
> = {
  traffic_growth: {
    label: '流量破圈 (新客触达/破圈涨粉)',
    shortLabel: '流量破圈',
    icon: TrendingUp,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    badgeBg: 'bg-sky-500/20',
    badgeText: 'text-sky-300',
    desc: '击穿泛受众深层痛点，快速扩大公域曝光与漏斗开口'
  },
  trust_authority: {
    label: '信任背书 (专业人设/心智占领)',
    shortLabel: '人设信任',
    icon: ShieldCheck,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    desc: '用真实踩坑账单与反差人设建立深度信任'
  },
  lead_conversion: {
    label: '商业变现 (高价值钩子/私域沉淀)',
    shortLabel: '变现转化',
    icon: Target,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    desc: '低门槛引流钩子与最短后端高客单交付转化'
  },
  content_efficiency: {
    label: '视觉资产 (辨识度/爆款模板)',
    shortLabel: '视觉效率',
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    desc: '打造高反差视觉锤与信息密度排版标准化'
  },
  niche_breakthrough: {
    label: '冷启破局 (差异化切入/赛道卡位)',
    shortLabel: '冷启破局',
    icon: Compass,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
    desc: '主业能力溢出与反常识差异化卡位'
  }
};

export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  {
    label: string;
    shortLabel: string;
    color: string;
    badgeBg: string;
    borderColor: string;
  }
> = {
  high: {
    label: 'P0 核心破局',
    shortLabel: 'P0核心',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/20',
    borderColor: 'border-rose-500/30'
  },
  medium: {
    label: 'P1 标准排期',
    shortLabel: 'P1标准',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30'
  },
  low: {
    label: 'P2 储备闪念',
    shortLabel: 'P2储备',
    color: 'text-slate-400',
    badgeBg: 'bg-slate-700/40',
    borderColor: 'border-slate-700'
  }
};

const SUGGESTED_TAGS: Record<PositioningDimension, string[]> = {
  audience: ['高频痛点', '焦虑共鸣', '用户渴望', '年龄场景', '破圈痛点'],
  persona: ['反差标签', '说话语气', '实操背书', '真实账单', 'Slogan金句'],
  monetization: ['前端资料包', '私域多维表', '后端高客单', '转化路径', '免费交付'],
  contentVisual: ['封面大字', '黑黄对比', '避坑印章', '信息图卡片', '视觉锤'],
  rawSpark: ['新选题点子', '跨界迁移', '反常识认知', '金句摘录', '能力溢出']
};

export const InspirationCaptureSidebar: React.FC<InspirationCaptureSidebarProps> = ({
  activeAccount,
  capturedIdeas,
  onAddIdea,
  onDeleteIdea,
  onTogglePin,
  onUpdateIdea,
  onInjectToPositioning,
  onNavigateToTopics,
  onAppendToInspirationInput,
  isCollapsed,
  onToggleCollapse,
  selectedDimensionFilter = 'all',
  onSelectDimensionFilter,
  selectedStrategicGoalFilter = 'all',
  onSelectStrategicGoalFilter
}) => {
  // Creation States
  const [inputText, setInputText] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<PositioningDimension>('audience');
  const [selectedStrategicGoal, setSelectedStrategicGoal] = useState<StrategicGoal>('traffic_growth');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('high');
  const [selectedAnchor, setSelectedAnchor] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [internalGoalFilter, setInternalGoalFilter] = useState<StrategicGoal | 'all'>(
    selectedStrategicGoalFilter || 'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all');
  const [onlyPinned, setOnlyPinned] = useState(false);

  // AI & Interaction States
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [injectedId, setInjectedId] = useState<string | null>(null);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingGoal, setEditingGoal] = useState<StrategicGoal>('traffic_growth');
  const [editingDim, setEditingDim] = useState<PositioningDimension>('audience');
  const [editingPriority, setEditingPriority] = useState<PriorityLevel>('high');

  // Dynamic Positioning Anchors from current account
  const currentPositioningAnchors = useMemo(() => {
    const pos = activeAccount.positioning;
    if (!pos) return [];

    const anchors: { label: string; dimension: PositioningDimension; value: string }[] = [];

    // Audience anchors
    pos.targetAudience?.painPoints?.forEach((p) => {
      anchors.push({ label: `受众痛点: ${p.slice(0, 16)}...`, dimension: 'audience', value: `痛点：${p}` });
    });
    pos.targetAudience?.desires?.forEach((d) => {
      anchors.push({ label: `核心渴望: ${d.slice(0, 16)}...`, dimension: 'audience', value: `渴望：${d}` });
    });

    // Persona anchors
    if (pos.personaAndTrust?.identity) {
      anchors.push({ label: `人设: ${pos.personaAndTrust.identity.slice(0, 16)}`, dimension: 'persona', value: `人设标签：${pos.personaAndTrust.identity}` });
    }
    if (pos.personaAndTrust?.trustAnchor) {
      anchors.push({ label: `背书: ${pos.personaAndTrust.trustAnchor.slice(0, 16)}`, dimension: 'persona', value: `信任锚点：${pos.personaAndTrust.trustAnchor}` });
    }
    if (pos.personaAndTrust?.slogan) {
      anchors.push({ label: `Slogan: ${pos.personaAndTrust.slogan.slice(0, 16)}`, dimension: 'persona', value: `金句Slogan：${pos.personaAndTrust.slogan}` });
    }

    // Monetization anchors
    if (pos.monetization?.frontend) {
      anchors.push({ label: `前端钩子: ${pos.monetization.frontend.slice(0, 16)}`, dimension: 'monetization', value: `引流品：${pos.monetization.frontend}` });
    }
    if (pos.monetization?.backend) {
      anchors.push({ label: `后端盈利: ${pos.monetization.backend.slice(0, 16)}`, dimension: 'monetization', value: `高客单：${pos.monetization.backend}` });
    }
    if (pos.monetization?.funnelLogic) {
      anchors.push({ label: `转化路径: ${pos.monetization.funnelLogic.slice(0, 16)}`, dimension: 'monetization', value: `漏斗路径：${pos.monetization.funnelLogic}` });
    }

    // Content visual anchors
    pos.contentAndVisual?.contentPillars?.forEach((cp) => {
      anchors.push({ label: `内容支柱: ${cp.slice(0, 16)}`, dimension: 'contentVisual', value: `支柱：${cp}` });
    });
    if (pos.contentAndVisual?.visualStyle) {
      anchors.push({ label: `视觉规范: ${pos.contentAndVisual.visualStyle.slice(0, 16)}`, dimension: 'contentVisual', value: `视觉规范：${pos.contentAndVisual.visualStyle}` });
    }

    return anchors;
  }, [activeAccount.positioning]);

  // Anchors matching currently selected dimension
  const dimensionSpecificAnchors = useMemo(() => {
    return currentPositioningAnchors.filter((a) => a.dimension === selectedDimension);
  }, [currentPositioningAnchors, selectedDimension]);

  // Filter ideas for current account
  const accountIdeas = useMemo(() => {
    return capturedIdeas.filter(
      (item) => !item.accountId || item.accountId === activeAccount.id
    );
  }, [capturedIdeas, activeAccount.id]);

  // Dimension counts
  const dimensionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: accountIdeas.length };
    Object.keys(DIMENSION_CONFIG).forEach((dim) => {
      counts[dim] = accountIdeas.filter((i) => i.dimension === dim).length;
    });
    return counts;
  }, [accountIdeas]);

  // Strategic Goal counts
  const goalCounts = useMemo(() => {
    const counts: Record<string, number> = { all: accountIdeas.length };
    Object.keys(STRATEGIC_GOAL_CONFIG).forEach((goal) => {
      counts[goal] = accountIdeas.filter((i) => i.strategicGoal === goal).length;
    });
    return counts;
  }, [accountIdeas]);

  // Active goal filter
  const activeGoalFilter = onSelectStrategicGoalFilter ? (selectedStrategicGoalFilter || 'all') : internalGoalFilter;

  const handleGoalFilterSelect = (goal: StrategicGoal | 'all') => {
    if (onSelectStrategicGoalFilter) {
      onSelectStrategicGoalFilter(goal);
    } else {
      setInternalGoalFilter(goal);
    }
  };

  // Filtered and sorted list (pinned first, then by date)
  const filteredIdeas = useMemo(() => {
    return accountIdeas
      .filter((item) => {
        // Dimension filter
        const matchesDim =
          selectedDimensionFilter === 'all' || item.dimension === selectedDimensionFilter;

        // Strategic goal filter
        const matchesGoal =
          activeGoalFilter === 'all' || item.strategicGoal === activeGoalFilter;

        // Priority filter
        const matchesPriority =
          priorityFilter === 'all' || item.priority === priorityFilter;

        // Pinned only filter
        const matchesPinned = !onlyPinned || !!item.isPinned;

        // Search query
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !query ||
          item.content.toLowerCase().includes(query) ||
          item.tags?.some((t) => t.toLowerCase().includes(query)) ||
          (item.dimensionAnchor && item.dimensionAnchor.toLowerCase().includes(query)) ||
          (item.strategicGoal && STRATEGIC_GOAL_CONFIG[item.strategicGoal]?.shortLabel.toLowerCase().includes(query));

        return matchesDim && matchesGoal && matchesPriority && matchesPinned && matchesQuery;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [accountIdeas, selectedDimensionFilter, activeGoalFilter, priorityFilter, onlyPinned, searchQuery]);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(customTagInput.trim())) {
        setSelectedTags([...selectedTags, customTagInput.trim()]);
      }
      setCustomTagInput('');
    }
  };

  const handleSaveSpark = () => {
    if (!inputText.trim()) return;

    const newIdea: CapturedIdea = {
      id: `spark-${Date.now()}`,
      accountId: activeAccount.id,
      content: inputText.trim(),
      dimension: selectedDimension,
      strategicGoal: selectedStrategicGoal,
      priority: selectedPriority,
      dimensionAnchor: selectedAnchor || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      createdAt: new Date().toISOString().split('T')[0],
      isPinned: false
    };

    onAddIdea(newIdea);
    setInputText('');
    setSelectedAnchor('');
    setSelectedTags([]);
  };

  // AI Smart Spark Refinement & Classification
  const handleAiRefineSpark = async () => {
    if (!inputText.trim()) return;
    setIsAiAnalyzing(true);

    try {
      const res = await fetch('/api/ai/spark-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawSpark: inputText,
          accountContext: {
            name: activeAccount.name,
            niche: activeAccount.niche,
            targetPlatform: activeAccount.targetPlatform,
            currentStage: activeAccount.currentStage,
            positioning: activeAccount.positioning
          }
        })
      });

      const data = await res.json();
      if (data.result) {
        if (data.result.refinedContent) {
          setInputText(data.result.refinedContent);
        }
        if (data.result.suggestedDimension && DIMENSION_CONFIG[data.result.suggestedDimension as PositioningDimension]) {
          setSelectedDimension(data.result.suggestedDimension as PositioningDimension);
        }
        if (data.result.strategicGoal && STRATEGIC_GOAL_CONFIG[data.result.strategicGoal as StrategicGoal]) {
          setSelectedStrategicGoal(data.result.strategicGoal as StrategicGoal);
        }
        if (data.result.priority && PRIORITY_CONFIG[data.result.priority as PriorityLevel]) {
          setSelectedPriority(data.result.priority as PriorityLevel);
        }
        if (data.result.dimensionAnchor) {
          setSelectedAnchor(data.result.dimensionAnchor);
        }
        if (Array.isArray(data.result.tags) && data.result.tags.length > 0) {
          setSelectedTags(data.result.tags);
        }
        setShowAdvancedOptions(true);
      }
    } catch (err) {
      console.error('AI Spark refine failed:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInject = (idea: CapturedIdea) => {
    onInjectToPositioning(idea);
    setInjectedId(idea.id);
    setTimeout(() => setInjectedId(null), 2500);
  };

  const handleStartEdit = (idea: CapturedIdea) => {
    setEditingIdeaId(idea.id);
    setEditingContent(idea.content);
    setEditingGoal(idea.strategicGoal || 'traffic_growth');
    setEditingDim(idea.dimension || 'audience');
    setEditingPriority(idea.priority || 'high');
  };

  const handleSaveEdit = (idea: CapturedIdea) => {
    if (!editingContent.trim()) return;
    const updated: CapturedIdea = {
      ...idea,
      content: editingContent.trim(),
      dimension: editingDim,
      strategicGoal: editingGoal,
      priority: editingPriority
    };
    if (onUpdateIdea) {
      onUpdateIdea(updated);
    }
    setEditingIdeaId(null);
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        id="btn-expand-inspiration-sidebar"
        className="flex flex-col items-center space-y-2 py-4 px-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-slate-300 transition-all shadow-lg group"
        title="展开四维定位与战略灵感侧边栏"
      >
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
          <Zap className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold writing-mode-vertical py-1 text-slate-300 tracking-wider">
          定位灵感
        </span>
        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
          {accountIdeas.length}
        </span>
        <ChevronLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
      </button>
    );
  }

  return (
    <aside
      id="inspiration-capture-sidebar"
      className="w-full lg:w-88 xl:w-[410px] flex-shrink-0 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col overflow-hidden animate-in fade-in duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-bold text-white tracking-tight">灵感捕获与战略矩阵</h2>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                {accountIdeas.length} 条
              </span>
            </div>
            <p className="text-[11px] text-slate-400">支持按四维定位与五大战略增长目标分类过滤</p>
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="收起侧边栏"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Input Area */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 space-y-3">
        {/* 1. Dimension Pill Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>1. 关联四维定位底盘：</span>
            </span>
            <span className={`text-[10px] font-semibold ${DIMENSION_CONFIG[selectedDimension].color}`}>
              {DIMENSION_CONFIG[selectedDimension].shortLabel}
            </span>
          </label>
          <div className="grid grid-cols-5 gap-1">
            {(Object.keys(DIMENSION_CONFIG) as PositioningDimension[]).map((dimKey) => {
              const cfg = DIMENSION_CONFIG[dimKey];
              const Icon = cfg.icon;
              const isSelected = selectedDimension === dimKey;
              return (
                <button
                  key={dimKey}
                  type="button"
                  onClick={() => setSelectedDimension(dimKey)}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
                    isSelected
                      ? `${cfg.bgColor} ${cfg.borderColor} ${cfg.color} ring-1 ring-amber-500/30 shadow-sm font-semibold`
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                  title={cfg.label}
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[9px] leading-none truncate w-full text-center">
                    {cfg.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Strategic Goal Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Target className="w-3 h-3 text-emerald-400" />
              <span>2. 战略增长目标归类：</span>
            </span>
            <span className={`text-[10px] font-semibold ${STRATEGIC_GOAL_CONFIG[selectedStrategicGoal].color}`}>
              {STRATEGIC_GOAL_CONFIG[selectedStrategicGoal].shortLabel}
            </span>
          </label>
          <div className="grid grid-cols-5 gap-1">
            {(Object.keys(STRATEGIC_GOAL_CONFIG) as StrategicGoal[]).map((goalKey) => {
              const cfg = STRATEGIC_GOAL_CONFIG[goalKey];
              const Icon = cfg.icon;
              const isSelected = selectedStrategicGoal === goalKey;
              return (
                <button
                  key={goalKey}
                  type="button"
                  onClick={() => setSelectedStrategicGoal(goalKey)}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
                    isSelected
                      ? `${cfg.bgColor} ${cfg.borderColor} ${cfg.color} ring-1 ring-emerald-500/30 shadow-sm font-semibold`
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                  title={cfg.desc}
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[9px] leading-none truncate w-full text-center">
                    {cfg.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input Box */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSaveSpark();
              }
            }}
            rows={3}
            placeholder={`写下【${DIMENSION_CONFIG[selectedDimension].shortLabel} × ${STRATEGIC_GOAL_CONFIG[selectedStrategicGoal].shortLabel}】的灵感或痛点... (Cmd+Enter 保存)`}
            className="w-full bg-slate-900 border border-slate-700/80 focus:border-amber-500 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed resize-none font-sans"
          />
        </div>

        {/* Dynamic Positioning Dimension Anchors (Current Account) */}
        {dimensionSpecificAnchors.length > 0 && (
          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center space-x-1 font-medium">
                <Link2 className="w-3 h-3 text-amber-400" />
                <span>挂载到当前账号定位子项：</span>
              </span>
              {selectedAnchor && (
                <button
                  type="button"
                  onClick={() => setSelectedAnchor('')}
                  className="text-rose-400 hover:text-rose-300"
                >
                  清除挂载
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto no-scrollbar">
              {dimensionSpecificAnchors.map((anchor, idx) => {
                const isSelected = selectedAnchor === anchor.value;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAnchor(isSelected ? '' : anchor.value)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-all flex items-center space-x-1 truncate max-w-[180px] ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-300'
                    }`}
                    title={anchor.value}
                  >
                    <span className="truncate">{anchor.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Priority & Tag Controls (Toggleable) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-semibold text-slate-400">优先级：</span>
              <div className="inline-flex rounded-md bg-slate-900 p-0.5 border border-slate-800">
                {(Object.keys(PRIORITY_CONFIG) as PriorityLevel[]).map((pKey) => {
                  const pCfg = PRIORITY_CONFIG[pKey];
                  const isSel = selectedPriority === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => setSelectedPriority(pKey)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all ${
                        isSel
                          ? `${pCfg.badgeBg} ${pCfg.color}`
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {pCfg.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center space-x-0.5"
            >
              <span>标签与配置</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Tags Drawer */}
          {showAdvancedOptions && (
            <div className="pt-1.5 border-t border-slate-800/80 space-y-1.5 animate-in fade-in">
              <div className="flex flex-wrap gap-1 items-center">
                {SUGGESTED_TAGS[selectedDimension].map((tag) => {
                  const isTagSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center space-x-1 ${
                        isTagSelected
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      <span>#{tag}</span>
                    </button>
                  );
                })}
                <div className="inline-flex items-center">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    placeholder="+ 自定义标签 (回车)"
                    className="w-24 bg-transparent border-b border-slate-700 focus:border-amber-500 text-[10px] text-slate-300 px-1 py-0.5 focus:outline-none placeholder-slate-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleAiRefineSpark}
            disabled={!inputText.trim() || isAiAnalyzing}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-semibold transition-all disabled:opacity-40"
            title="让 AI 自动提炼核心词并智能推荐定位维度与战略目标"
          >
            {isAiAnalyzing ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>AI 战略分析中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                <span>AI 智能提炼与归类</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSaveSpark}
            disabled={!inputText.trim()}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>捕获入库</span>
          </button>
        </div>
      </div>

      {/* Strategic Filters & Search Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/80 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索灵感内容、标签、战略目标或挂载锚点..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-slate-200 focus:outline-none placeholder-slate-500"
          />
        </div>

        {/* Filter 1: Strategic Goal Tabs */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-semibold flex items-center space-x-1">
              <Target className="w-3 h-3 text-emerald-400" />
              <span>战略目标过滤：</span>
            </span>
            {activeGoalFilter !== 'all' && (
              <button
                onClick={() => handleGoalFilterSelect('all')}
                className="text-amber-400 hover:underline"
              >
                重置
              </button>
            )}
          </div>
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => handleGoalFilterSelect('all')}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all ${
                activeGoalFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-300'
              }`}
            >
              全部目标 ({goalCounts.all})
            </button>
            {(Object.keys(STRATEGIC_GOAL_CONFIG) as StrategicGoal[]).map((goalKey) => {
              const cfg = STRATEGIC_GOAL_CONFIG[goalKey];
              const isSelected = activeGoalFilter === goalKey;
              const count = goalCounts[goalKey] || 0;
              return (
                <button
                  key={goalKey}
                  onClick={() => handleGoalFilterSelect(goalKey)}
                  className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all flex items-center space-x-1 ${
                    isSelected
                      ? `${cfg.bgColor} ${cfg.color} border ${cfg.borderColor} shadow-sm`
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span>{cfg.shortLabel}</span>
                  <span className="opacity-75 text-[9px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter 2: Positioning Dimension Tabs */}
        <div className="space-y-1 pt-1 border-t border-slate-800/60">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-semibold flex items-center space-x-1">
              <Compass className="w-3 h-3 text-blue-400" />
              <span>四维定位过滤：</span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setOnlyPinned(!onlyPinned)}
                className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                  onlyPinned
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                    : 'text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                仅看置顶
              </button>
              <button
                onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
                className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                  priorityFilter === 'high'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                    : 'text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                仅看高优
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => onSelectDimensionFilter && onSelectDimensionFilter('all')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all ${
                selectedDimensionFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-300'
              }`}
            >
              全部维度 ({dimensionCounts.all})
            </button>
            {(Object.keys(DIMENSION_CONFIG) as PositioningDimension[]).map((dimKey) => {
              const cfg = DIMENSION_CONFIG[dimKey];
              const isSelected = selectedDimensionFilter === dimKey;
              const count = dimensionCounts[dimKey] || 0;
              return (
                <button
                  key={dimKey}
                  onClick={() => onSelectDimensionFilter && onSelectDimensionFilter(dimKey)}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all flex items-center space-x-1 ${
                    isSelected
                      ? `${cfg.bgColor} ${cfg.color} border ${cfg.borderColor}`
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span>{cfg.shortLabel}</span>
                  <span className="opacity-70 text-[9px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Idea Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[500px]">
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500 space-y-2">
            <Lightbulb className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
            <p className="text-xs text-slate-400">
              {searchQuery || activeGoalFilter !== 'all' || selectedDimensionFilter !== 'all'
                ? '当前战略目标与维度筛选下无匹配灵感'
                : '暂无捕获的灵感'}
            </p>
            <p className="text-[11px] text-slate-500">
              可在上方输入想法，归类战略目标与四维定位后保存
            </p>
          </div>
        ) : (
          filteredIdeas.map((idea) => {
            const dimCfg = DIMENSION_CONFIG[idea.dimension] || DIMENSION_CONFIG.rawSpark;
            const DimIcon = dimCfg.icon;

            const goalKey = idea.strategicGoal || 'traffic_growth';
            const goalCfg = STRATEGIC_GOAL_CONFIG[goalKey] || STRATEGIC_GOAL_CONFIG.traffic_growth;
            const GoalIcon = goalCfg.icon;

            const priorityKey = idea.priority || 'medium';
            const priorityCfg = PRIORITY_CONFIG[priorityKey];

            const isCopied = copiedId === idea.id;
            const isInjected = injectedId === idea.id;
            const isEditing = editingIdeaId === idea.id;

            return (
              <div
                key={idea.id}
                className={`group rounded-xl border p-3 bg-slate-950/80 transition-all relative ${
                  idea.isPinned
                    ? 'border-amber-500/40 shadow-sm shadow-amber-500/5 bg-gradient-to-b from-amber-500/5 to-slate-950/80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Top: Dimension + Strategic Goal + Priority + Actions */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    {/* Dimension Badge */}
                    <span
                      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${dimCfg.bgColor} ${dimCfg.borderColor} ${dimCfg.color}`}
                    >
                      <DimIcon className="w-2.5 h-2.5" />
                      <span>{dimCfg.shortLabel}</span>
                    </span>

                    {/* Strategic Goal Badge */}
                    <span
                      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${goalCfg.bgColor} ${goalCfg.borderColor} ${goalCfg.color}`}
                      title={goalCfg.label}
                    >
                      <GoalIcon className="w-2.5 h-2.5" />
                      <span>{goalCfg.shortLabel}</span>
                    </span>

                    {/* Priority Badge */}
                    {idea.priority && (
                      <span
                        className={`px-1 py-0.2 rounded text-[9px] font-semibold ${priorityCfg.badgeBg} ${priorityCfg.color}`}
                      >
                        {priorityCfg.shortLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onTogglePin(idea.id)}
                      className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                        idea.isPinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={idea.isPinned ? '取消置顶' : '置顶灵感'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(idea)}
                      className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                      title="编辑灵感与战略分类"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleCopy(idea.id, idea.content)}
                      className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                      title="复制灵感文本"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteIdea(idea.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
                      title="删除灵感"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Inline Edit Form */}
                {isEditing ? (
                  <div className="space-y-2 py-1 bg-slate-900/90 p-2 rounded-lg border border-slate-700 animate-in fade-in">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div>
                        <label className="block text-slate-400 mb-0.5">定位维度</label>
                        <select
                          value={editingDim}
                          onChange={(e) => setEditingDim(e.target.value as PositioningDimension)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                        >
                          {(Object.keys(DIMENSION_CONFIG) as PositioningDimension[]).map((d) => (
                            <option key={d} value={d}>
                              {DIMENSION_CONFIG[d].shortLabel}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-0.5">战略目标</label>
                        <select
                          value={editingGoal}
                          onChange={(e) => setEditingGoal(e.target.value as StrategicGoal)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                        >
                          {(Object.keys(STRATEGIC_GOAL_CONFIG) as StrategicGoal[]).map((g) => (
                            <option key={g} value={g}>
                              {STRATEGIC_GOAL_CONFIG[g].shortLabel}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-1.5 pt-1">
                      <button
                        onClick={() => setEditingIdeaId(null)}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px]"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleSaveEdit(idea)}
                        className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px]"
                      >
                        保存更新
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Card Content */}
                    <p className="text-xs text-slate-200 leading-relaxed font-sans select-text">
                      {idea.content}
                    </p>

                    {/* Dynamic Positioning Dimension Anchor Link */}
                    {idea.dimensionAnchor && (
                      <div className="mt-2 flex items-center space-x-1 text-[10px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        <Link2 className="w-3 h-3 flex-shrink-0 text-amber-400" />
                        <span className="font-semibold flex-shrink-0">已挂载锚点:</span>
                        <span className="truncate">{idea.dimensionAnchor}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {idea.tags && idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {idea.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 text-[9px] border border-slate-800/80 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Quick Action Footer */}
                <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px]">
                  <button
                    onClick={() => handleInject(idea)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md font-semibold transition-all ${
                      isInjected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                    title={dimCfg.injectionTargetDesc}
                  >
                    {isInjected ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>已注入定位</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>注入定位</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] text-slate-500 font-mono">
                      {idea.createdAt}
                    </span>
                    <button
                      onClick={() => onNavigateToTopics(idea.content)}
                      className="flex items-center space-x-0.5 text-slate-400 hover:text-amber-300 transition-colors"
                      title="以此灵感为种子生成一周选题"
                    >
                      <span>转为选题</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 text-center flex items-center justify-center space-x-2">
        <Sparkles className="w-3 h-3 text-amber-500/70" />
        <span className="text-[10px] text-slate-400">
          灵感与定位子项实时锚定 · 支持一键转为 7 天选题
        </span>
      </div>
    </aside>
  );
};
