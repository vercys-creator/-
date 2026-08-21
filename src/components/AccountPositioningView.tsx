import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  Users, 
  UserCheck, 
  CircleDollarSign, 
  LayoutTemplate, 
  Sparkles, 
  RefreshCw, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  ArrowRight, 
  TrendingUp, 
  Zap, 
  Lightbulb, 
  ExternalLink, 
  Info, 
  Target, 
  ShieldCheck,
  Brain,
  ChevronRight
} from 'lucide-react';
import { 
  Account, 
  AccountPositioning, 
  CapturedIdea, 
  InspirationNote, 
  PositioningDimension,
  StrategicGoal
} from '../types';
import { getInspirationNotes, saveInspirationNotes, getCapturedIdeas, saveCapturedIdeas } from '../utils/storage';
import { 
  InspirationCaptureSidebar, 
  DIMENSION_CONFIG,
  STRATEGIC_GOAL_CONFIG 
} from './InspirationCaptureSidebar';

interface AccountPositioningViewProps {
  activeAccount: Account | null;
  onUpdateAccount: (updated: Account) => void;
  onNavigateToTopics: (keyword: string) => void;
  onOpenCreateAccount?: () => void;
  onNavigateToMemory?: () => void;
  accountMemoriesCount?: number;
}

export const AccountPositioningView: React.FC<AccountPositioningViewProps> = ({
  activeAccount,
  onUpdateAccount,
  onNavigateToTopics,
  onOpenCreateAccount,
  onNavigateToMemory,
  accountMemoriesCount = 0
}) => {
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [injectionToast, setInjectionToast] = useState<string | null>(null);
  
  const [inspirationInput, setInspirationInput] = useState(activeAccount?.inspiration || '');
  const [nicheInput, setNicheInput] = useState(activeAccount?.niche || '');
  const [stageInput, setStageInput] = useState(activeAccount?.currentStage || '0-1万粉探索期');

  // Mini Sidebar & Filters State
  const [capturedIdeas, setCapturedIdeas] = useState<CapturedIdea[]>(() => getInspirationNotes());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dimensionFilter, setDimensionFilter] = useState<PositioningDimension | 'all'>('all');
  const [strategicGoalFilter, setStrategicGoalFilter] = useState<StrategicGoal | 'all'>('all');

  // Synchronize internal inputs when activeAccount changes
  useEffect(() => {
    if (activeAccount) {
      setInspirationInput(activeAccount.inspiration || '');
      setNicheInput(activeAccount.niche || '');
      setStageInput(activeAccount.currentStage || '0-1万粉探索期');
    }
  }, [activeAccount?.id]);

  if (!activeAccount) {
    return (
      <div className="text-center py-20 text-slate-400 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-xl">
          <Compass className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-200">暂无活跃账号</h3>
          <p className="text-xs text-slate-400 mt-1">请先在顶部下拉菜单选择账号，或快速创建一个全新的定位账号。</p>
        </div>
        {onOpenCreateAccount && (
          <button
            onClick={onOpenCreateAccount}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>新建工作账号</span>
          </button>
        )}
      </div>
    );
  }

  const positioning = activeAccount.positioning;

  // Persist ideas helper
  const handleAddIdea = (newIdea: CapturedIdea) => {
    const updated = [newIdea, ...capturedIdeas];
    setCapturedIdeas(updated);
    saveInspirationNotes(updated);
  };

  const handleDeleteIdea = (id: string) => {
    const updated = capturedIdeas.filter((item) => item.id !== id);
    setCapturedIdeas(updated);
    saveInspirationNotes(updated);
  };

  const handleTogglePin = (id: string) => {
    const updated = capturedIdeas.map((item) =>
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    );
    setCapturedIdeas(updated);
    saveInspirationNotes(updated);
  };

  const handleUpdateIdea = (updatedIdea: CapturedIdea) => {
    const updated = capturedIdeas.map((item) =>
      item.id === updatedIdea.id ? updatedIdea : item
    );
    setCapturedIdeas(updated);
    saveInspirationNotes(updated);
  };

  // Inject a captured spark directly into the Account positioning model
  const handleInjectToPositioning = (idea: CapturedIdea) => {
    const defaultPos: AccountPositioning = {
      targetAudience: { primary: '', painPoints: [], desires: [] },
      personaAndTrust: { identity: '', tone: '', trustAnchor: '', slogan: '' },
      monetization: { frontend: '', backend: '', funnelLogic: '' },
      contentAndVisual: { primaryFormat: '', visualStyle: '', contentPillars: [] },
      oneSentencePitch: ''
    };

    const currentPos = activeAccount.positioning || defaultPos;
    let updatedPos = { ...currentPos };
    let toastMessage = '';

    if (idea.dimension === 'audience') {
      const existingPain = updatedPos.targetAudience?.painPoints || [];
      // If already present, don't duplicate
      if (!existingPain.includes(idea.content)) {
        updatedPos.targetAudience = {
          ...updatedPos.targetAudience,
          painPoints: [idea.content, ...existingPain]
        };
      }
      toastMessage = '已成功将灵感注入到【受众深层痛点】！';
    } else if (idea.dimension === 'persona') {
      const existingAnchor = updatedPos.personaAndTrust?.trustAnchor || '';
      updatedPos.personaAndTrust = {
        ...updatedPos.personaAndTrust,
        trustAnchor: existingAnchor ? `${existingAnchor}；${idea.content}` : idea.content
      };
      toastMessage = '已成功将灵感注入到【信任锚点与人设】！';
    } else if (idea.dimension === 'monetization') {
      const existingFront = updatedPos.monetization?.frontend || '';
      updatedPos.monetization = {
        ...updatedPos.monetization,
        frontend: existingFront ? `${existingFront}；${idea.content}` : idea.content
      };
      toastMessage = '已成功将灵感注入到【前端引流钩子】！';
    } else if (idea.dimension === 'contentVisual') {
      const existingPillars = updatedPos.contentAndVisual?.contentPillars || [];
      if (!existingPillars.includes(idea.content)) {
        updatedPos.contentAndVisual = {
          ...updatedPos.contentAndVisual,
          contentPillars: [...existingPillars, idea.content]
        };
      }
      toastMessage = '已成功将灵感注入到【视觉与内容支柱】！';
    } else if (idea.dimension === 'rawSpark') {
      const newInspiration = inspirationInput
        ? `${inspirationInput}\n- 灵感捕获：${idea.content}`
        : `灵感捕获：${idea.content}`;
      setInspirationInput(newInspiration);
      const updatedAcc: Account = {
        ...activeAccount,
        inspiration: newInspiration
      };
      onUpdateAccount(updatedAcc);
      setInjectionToast('已成功将灵感追加到【创作者原始灵感输入框】！');
      setTimeout(() => setInjectionToast(null), 3000);
      return;
    }

    const updatedAccount: Account = {
      ...activeAccount,
      positioning: updatedPos
    };

    onUpdateAccount(updatedAccount);
    setInjectionToast(toastMessage);
    setTimeout(() => setInjectionToast(null), 3000);
  };

  const handleGeneratePositioning = async () => {
    setLoading(true);
    setSavedSuccess(false);

    try {
      const response = await fetch('/api/ai/positioning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: activeAccount.name,
          niche: nicheInput || activeAccount.niche,
          inspiration: inspirationInput || activeAccount.inspiration,
          currentStage: stageInput || activeAccount.currentStage,
          targetPlatform: activeAccount.targetPlatform
        })
      });

      const data = await response.json();
      if (data.result) {
        const updated: Account = {
          ...activeAccount,
          niche: nicheInput || activeAccount.niche,
          inspiration: inspirationInput || activeAccount.inspiration,
          currentStage: stageInput || activeAccount.currentStage,
          positioning: data.result
        };
        onUpdateAccount(updated);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to generate positioning:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = () => {
    const updated: Account = {
      ...activeAccount,
      niche: nicheInput,
      inspiration: inspirationInput,
      currentStage: stageInput,
    };
    onUpdateAccount(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Quick filter dimension in sidebar
  const handleFocusDimensionInSidebar = (dim: PositioningDimension) => {
    setDimensionFilter(dim);
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  // Quick filter strategic goal in sidebar
  const handleFocusStrategicGoalInSidebar = (goal: StrategicGoal) => {
    setStrategicGoalFilter(goal);
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  // Count ideas per dimension and goal for current account
  const currentAccountIdeas = useMemo(() => {
    return capturedIdeas.filter(
      (i) => !i.accountId || i.accountId === activeAccount.id
    );
  }, [capturedIdeas, activeAccount.id]);

  const strategicGoalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (Object.keys(STRATEGIC_GOAL_CONFIG) as StrategicGoal[]).forEach((goal) => {
      counts[goal] = currentAccountIdeas.filter((i) => (i.strategicGoal || 'traffic_growth') === goal).length;
    });
    return counts;
  }, [currentAccountIdeas]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification for Spark Injection */}
      {injectionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl bg-emerald-900/90 border border-emerald-500/40 text-emerald-100 shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{injectionToast}</span>
        </div>
      )}

      {/* Header & Inspiration Incubator Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>灵感孵化与四维定位系统</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {activeAccount.name} · 账号四维定位底盘
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              定位是起号的灵魂——定义精准受众痛点、信任人设、最短变现闭环与视觉辨识度，右侧可随时捕获灵感。
            </p>
          </div>

          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                !isSidebarCollapsed
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              }`}
              title="切换灵感捕获迷你侧边栏"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>灵感捕获</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                {currentAccountIdeas.length}
              </span>
            </button>

            <button
              onClick={handleGeneratePositioning}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI 正在重塑四维定位...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI 一键重塑四维定位</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Editable Inspiration Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">主打赛道 / 领域标签</label>
            <input
              type="text"
              value={nicheInput}
              onChange={(e) => setNicheInput(e.target.value)}
              placeholder="如：职场跃迁 / 一人企业 / 个人商业化"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">当前账号阶段</label>
            <input
              type="text"
              value={stageInput}
              onChange={(e) => setStageInput(e.target.value)}
              placeholder="如：从零起步探索期 / 1-5万粉放量期"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">发布主战场</label>
            <input
              type="text"
              value={activeAccount.targetPlatform}
              disabled
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-400">创作者原始灵感 / 真实经历与优势</label>
            <button
              onClick={handleManualSave}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1"
            >
              <Save className="w-3 h-3" />
              <span>保存基础输入</span>
            </button>
          </div>
          <textarea
            value={inspirationInput}
            onChange={(e) => setInspirationInput(e.target.value)}
            rows={2}
            placeholder="把你的职业背景、踩过的坑、掌握的技能或右侧捕获的灵感写在这里..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
          />
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>账号定位已成功更新保存！</span>
          </div>
        )}
      </div>

      {/* One Sentence Pitch Banner */}
      {positioning?.oneSentencePitch && (
        <div className="rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-l-4 border-amber-500 p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">账号一句话价值主张 (Elevator Pitch)</div>
            <div className="text-sm font-semibold text-white mt-0.5">{positioning.oneSentencePitch}</div>
          </div>
          <button
            onClick={() => onNavigateToTopics(activeAccount.niche.split('/')[0].trim() || '副业破局')}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition-colors flex-shrink-0"
          >
            <span>以此深挖选题</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Account Memory Hub Quick Bridge */}
      {onNavigateToMemory && (
        <div className="rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-amber-950/30 border border-purple-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">专属记忆库资产储备</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  {accountMemoriesCount} 条专属记忆
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                沉淀个人经历故事、产品核心卖点、反常识观点与高频金句，将在选题矩阵中被精准调用。
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToMemory}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all flex-shrink-0 cursor-pointer"
          >
            <span>管理专属记忆库</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Strategic Goals Distribution & Strategy Matrix Bar */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              当前账号战略增长目标分布 (Strategic Goals Filter)
            </span>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              点击下方目标卡片，可在右侧侧边栏精准过滤对应的定位灵感储备
            </span>
          </div>

          {strategicGoalFilter !== 'all' && (
            <button
              onClick={() => setStrategicGoalFilter('all')}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
            >
              重置全部目标
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {(Object.keys(STRATEGIC_GOAL_CONFIG) as StrategicGoal[]).map((goalKey) => {
            const cfg = STRATEGIC_GOAL_CONFIG[goalKey];
            const Icon = cfg.icon;
            const count = strategicGoalCounts[goalKey] || 0;
            const isSelected = strategicGoalFilter === goalKey;

            return (
              <button
                key={goalKey}
                onClick={() => handleFocusStrategicGoalInSidebar(goalKey)}
                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? `${cfg.bgColor} ${cfg.borderColor} ring-1 ring-emerald-500/40 shadow-sm`
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${cfg.badgeBg} ${cfg.color}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className={`text-xs font-bold font-mono px-1.5 py-0.2 rounded-full ${
                    count > 0 ? `${cfg.badgeBg} ${cfg.color}` : 'bg-slate-900 text-slate-500'
                  }`}>
                    {count} 条
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-white">
                  {cfg.shortLabel}
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5 opacity-80">
                  {cfg.desc.slice(0, 15)}...
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: 4-Dimension Grid + Inspiration Capture Mini Sidebar */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* Left Side: The 4-Dimension Positioning Grid */}
        <div className="flex-1 w-full space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Dimension 1: Target Audience & Pain Points */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all group">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-blue-400">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">维度一：目标受众与痛点细分</h3>
                    <span className="text-[11px] text-slate-400">解决【为谁创作、击穿什么焦虑】</span>
                  </div>
                </div>

                <button
                  onClick={() => handleFocusDimensionInSidebar('audience')}
                  className="flex items-center space-x-1 px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-semibold border border-blue-500/20 transition-colors"
                  title="在灵感侧边栏中查看或记录该维度灵感"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>灵感 ({currentAccountIdeas.filter((i) => i.dimension === 'audience').length})</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-300">核心受众画像：</span>
                  <p className="mt-1 text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                    {positioning?.targetAudience?.primary || '尚未生成画像'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-rose-300">深层痛点 / 焦虑靶心：</span>
                  <ul className="mt-1 space-y-1.5">
                    {positioning?.targetAudience?.painPoints?.map((p, i) => (
                      <li key={i} className="flex items-start space-x-2 text-slate-300 bg-rose-500/5 border border-rose-500/10 p-2 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                        <span className="flex-1 leading-relaxed">{p}</span>
                      </li>
                    )) || <li className="text-slate-500">点击上方AI重塑或从右侧注入灵感</li>}
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-emerald-300">核心渴望与利益点：</span>
                  <ul className="mt-1 space-y-1">
                    {positioning?.targetAudience?.desires?.map((d, i) => (
                      <li key={i} className="flex items-center space-x-2 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Dimension 2: Persona, Tone & Trust Anchor */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all group">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">维度二：差异化人设与信任锚点</h3>
                    <span className="text-[11px] text-slate-400">解决【我是谁、为什么受众相信我】</span>
                  </div>
                </div>

                <button
                  onClick={() => handleFocusDimensionInSidebar('persona')}
                  className="flex items-center space-x-1 px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-semibold border border-amber-500/20 transition-colors"
                  title="在灵感侧边栏中查看或记录该维度灵感"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>灵感 ({currentAccountIdeas.filter((i) => i.dimension === 'persona').length})</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-300">反差人设标签：</span>
                  <p className="mt-1 text-amber-300 font-medium bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                    {positioning?.personaAndTrust?.identity || '尚未设定人设'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-300">语言风格与调性：</span>
                  <p className="mt-1 text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    {positioning?.personaAndTrust?.tone || '犀利直接、保姆级理性质疑'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-300">信任锚点（实操背书）：</span>
                  <p className="mt-1 text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    {positioning?.personaAndTrust?.trustAnchor || '真实踩坑账单、学员案例'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-300">金句 Slogan：</span>
                  <p className="mt-1 italic text-slate-200 bg-slate-800/60 p-2 rounded-lg border-l-2 border-amber-400">
                    “{positioning?.personaAndTrust?.slogan || '拒绝无效内卷，打通第二曲线'}”
                  </p>
                </div>
              </div>
            </div>

            {/* Dimension 3: Monetization Funnel */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all group">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CircleDollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">维度三：商业变现闭环与漏斗</h3>
                    <span className="text-[11px] text-slate-400">解决【前端引流钩子、后端高客单交付】</span>
                  </div>
                </div>

                <button
                  onClick={() => handleFocusDimensionInSidebar('monetization')}
                  className="flex items-center space-x-1 px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 transition-colors"
                  title="在灵感侧边栏中查看或记录该维度灵感"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>灵感 ({currentAccountIdeas.filter((i) => i.dimension === 'monetization').length})</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-emerald-400">前端引流钩子（低门槛/免费装）：</span>
                  <p className="mt-1 text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    {positioning?.monetization?.frontend || '高价值免费资料包/模板'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-amber-400">后端核心盈利产品：</span>
                  <p className="mt-1 text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    {positioning?.monetization?.backend || '实战营/咨询服务/高客单定制'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-300">最短变现漏斗路径：</span>
                  <p className="mt-1 text-slate-300 bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg font-mono">
                    {positioning?.monetization?.funnelLogic || '爆款图文 → 评论区钩子 → 私域交付'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dimension 4: Content & Visual Format */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all group">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-purple-400">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <LayoutTemplate className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">维度四：内容形式与视觉辨识度</h3>
                    <span className="text-[11px] text-slate-400">解决【内容排版范式、封面视觉抓眼力】</span>
                  </div>
                </div>

                <button
                  onClick={() => handleFocusDimensionInSidebar('contentVisual')}
                  className="flex items-center space-x-1 px-2 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] font-semibold border border-purple-500/20 transition-colors"
                  title="在灵感侧边栏中查看或记录该维度灵感"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>灵感 ({currentAccountIdeas.filter((i) => i.dimension === 'contentVisual').length})</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-300">主打内容形式：</span>
                  <p className="mt-1 text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    {positioning?.contentAndVisual?.primaryFormat || '高信息密度图文卡片 + 强对比封面'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-300">封面排版视觉风格规范：</span>
                  <p className="mt-1 text-purple-300 bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-lg font-mono">
                    {positioning?.contentAndVisual?.visualStyle || '深灰底色 + 醒目亮黄高亮词 + 醒目标签框'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-300">三大内容支柱分布：</span>
                  <div className="mt-1.5 space-y-1.5">
                    {positioning?.contentAndVisual?.contentPillars?.map((cp, i) => (
                      <div key={i} className="px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                        <span>{cp}</span>
                      </div>
                    )) || <div className="text-slate-500">点击生成内容支柱</div>}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Inspiration Capture Mini Sidebar */}
        <InspirationCaptureSidebar
          activeAccount={activeAccount}
          capturedIdeas={capturedIdeas}
          onAddIdea={handleAddIdea}
          onDeleteIdea={handleDeleteIdea}
          onTogglePin={handleTogglePin}
          onUpdateIdea={handleUpdateIdea}
          onInjectToPositioning={handleInjectToPositioning}
          onNavigateToTopics={onNavigateToTopics}
          onAppendToInspirationInput={(text) => {
            setInspirationInput((prev) => (prev ? `${prev}\n- ${text}` : text));
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          selectedDimensionFilter={dimensionFilter}
          onSelectDimensionFilter={setDimensionFilter}
          selectedStrategicGoalFilter={strategicGoalFilter}
          onSelectStrategicGoalFilter={setStrategicGoalFilter}
        />

      </div>

    </div>
  );
};
