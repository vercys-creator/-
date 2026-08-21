import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Sparkles, 
  RefreshCw, 
  Flame, 
  ArrowRight, 
  Calendar, 
  Bookmark, 
  Copy, 
  Check, 
  Send, 
  Search, 
  ChevronRight,
  TrendingUp,
  Tag,
  Brain,
  Sliders,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Gift,
  MessageSquareQuote,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Account, TopicMatrix, TopicDay, AccountMemoryItem, MemoryCategory } from '../types';
import { MEMORY_CATEGORY_CONFIG } from './AccountMemoryView';

interface TopicMatrixViewProps {
  activeAccount: Account | null;
  topicMatrices: TopicMatrix[];
  accountMemories?: AccountMemoryItem[];
  onSaveTopicMatrix: (matrix: TopicMatrix) => void;
  onSendToEditor: (topic: TopicDay, keyword: string) => void;
  onToggleMemory?: (id: string) => void;
  onNavigateToMemory?: () => void;
}

export const TopicMatrixView: React.FC<TopicMatrixViewProps> = ({
  activeAccount,
  topicMatrices = [],
  accountMemories = [],
  onSaveTopicMatrix,
  onSendToEditor,
  onToggleMemory,
  onNavigateToMemory
}) => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<string | null>(null);
  const [isMemoryPanelOpen, setIsMemoryPanelOpen] = useState(false);

  // Filter memories for current active account
  const currentAccountMemories = useMemo(() => {
    return (accountMemories || []).filter(
      (m) => m.accountId === activeAccount?.id || m.accountId === 'global' || !m.accountId
    );
  }, [accountMemories, activeAccount?.id]);

  const activeMemories = useMemo(() => {
    return currentAccountMemories.filter((m) => m.isEnabled);
  }, [currentAccountMemories]);

  // Filter matrices for current active account
  const currentAccountMatrices = (topicMatrices || []).filter(
    (m) => m.accountId === activeAccount?.id || !m.accountId
  );
  const activeMatrix = currentAccountMatrices[0] || (topicMatrices || [])[0];

  const suggestedKeywords = [
    '副业破局SOP',
    '一人公司起步',
    'AI万能提示词',
    '职场反内卷',
    '小红书低粉变现',
    '时间精力管理'
  ];

  const handleGenerateMatrix = async (customKeyword?: string) => {
    const kw = customKeyword || keyword;
    if (!kw.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/topics-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: kw,
          accountInfo: activeAccount ? {
            name: activeAccount.name,
            niche: activeAccount.niche,
            targetAudience: activeAccount.positioning?.targetAudience?.primary,
            persona: activeAccount.positioning?.personaAndTrust?.identity
          } : undefined,
          accountMemories: activeMemories.map((m) => ({
            title: m.title,
            category: m.category,
            content: m.content,
            keyTakeaway: m.keyTakeaway,
            tags: m.tags,
            importance: m.importance
          }))
        })
      });

      const data = await response.json();
      if (data.result) {
        const newMatrix: TopicMatrix = {
          id: `tm-${Date.now()}`,
          accountId: activeAccount?.id || 'default',
          keyword: kw,
          coreThesis: data.result.coreThesis || `针对【${kw}】的7天爆款情绪矩阵`,
          topics: data.result.topics || [],
          createdAt: new Date().toISOString().split('T')[0]
        };
        onSaveTopicMatrix(newMatrix);
      }
    } catch (error) {
      console.error('Failed to generate topic matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyHeadline = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTitleIndex(id);
    setTimeout(() => setCopiedTitleIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & 1-Keyword Search Matrix Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>关键词深挖 · 一周爆款选题矩阵</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              凭 1 个核心词 + 专属记忆库，深挖 7 天不可替代的爆款矩阵
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              覆盖痛点暴露、避坑避雷、保姆级SOP、反常识观点、真实案例、效率神器与互动复盘等全情绪链路。
            </p>
          </div>

          {/* Quick Memory Bank Indicator Button */}
          {onNavigateToMemory && (
            <button
              onClick={onNavigateToMemory}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all group"
            >
              <Brain className="w-4 h-4 text-amber-400" />
              <span>记忆库 ({activeMemories.length}/{currentAccountMemories.length} 条激活)</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Account Memory Synergistic Control Bar */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">
                🧠 专属记忆库协同状态：
              </span>
              <span className="text-xs text-amber-400 font-semibold">
                已激活 {activeMemories.length} 条专属记忆
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                (AI 将把您的真实故事、产品钩子与金句植入 7 天选题)
              </span>
            </div>

            <button
              onClick={() => setIsMemoryPanelOpen(!isMemoryPanelOpen)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
            >
              <span>{isMemoryPanelOpen ? '收起配置' : '快速调控'}</span>
              {isMemoryPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Active Memories Pill List */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {currentAccountMemories.length === 0 ? (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>当前账号暂未录入记忆资产。</span>
                {onNavigateToMemory && (
                  <button
                    onClick={onNavigateToMemory}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    立即录入经历与钩子 &gt;
                  </button>
                )}
              </div>
            ) : (
              currentAccountMemories.slice(0, isMemoryPanelOpen ? currentAccountMemories.length : 4).map((mem) => {
                const conf = MEMORY_CATEGORY_CONFIG[mem.category] || MEMORY_CATEGORY_CONFIG.personal_story;
                const Icon = conf.icon;
                return (
                  <button
                    key={mem.id}
                    onClick={() => onToggleMemory && onToggleMemory(mem.id)}
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                      mem.isEnabled
                        ? `${conf.badgeBg} ${conf.color} border ${conf.badgeBorder} font-semibold`
                        : 'bg-slate-900 text-slate-500 border border-slate-800 line-through opacity-60'
                    }`}
                    title={mem.isEnabled ? '点击取消在本次生成中注入该记忆' : '点击激活在本次生成中注入该记忆'}
                  >
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    <span className="max-w-[180px] truncate">{mem.title}</span>
                    <span className="text-[10px] ml-1">
                      {mem.isEnabled ? '✓' : '✕'}
                    </span>
                  </button>
                );
              })
            )}

            {!isMemoryPanelOpen && currentAccountMemories.length > 4 && (
              <button
                onClick={() => setIsMemoryPanelOpen(true)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold px-1.5 py-0.5"
              >
                +{currentAccountMemories.length - 4} 条更多
              </button>
            )}
          </div>
        </div>

        {/* Input & Search Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateMatrix()}
              placeholder="输入一个核心关键词（如：自由职业、副业起步、AI工具、时间管理）..."
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={() => handleGenerateMatrix()}
            disabled={loading || !keyword.trim()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/20 transition-all cursor-pointer flex-shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>正在深度拆解7天选题...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>生成一周爆款矩阵</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Keywords Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>高潜热搜词参考：</span>
          </span>
          {suggestedKeywords.map((kw, i) => (
            <button
              key={i}
              onClick={() => {
                setKeyword(kw);
                handleGenerateMatrix(kw);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-colors cursor-pointer"
            >
              #{kw}
            </button>
          ))}
        </div>
      </div>

      {/* Active Matrix View */}
      {activeMatrix && (
        <div className="space-y-4">
          
          {/* Matrix Header Banner */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-200">
                当前矩阵：<span className="text-amber-400">“{activeMatrix.keyword}”</span> 7天高唤醒爆款计划
              </h2>
            </div>
            <span className="text-xs text-slate-500">生成时间：{activeMatrix.createdAt}</span>
          </div>

          {activeMatrix.coreThesis && (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-amber-400">🎯 底层用户洞察：</span> {activeMatrix.coreThesis}
            </div>
          )}

          {/* 7 Days Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeMatrix.topics.map((topic, index) => {
              const dayColors = [
                'border-blue-500/30 bg-blue-500/5 text-blue-400',
                'border-rose-500/30 bg-rose-500/5 text-rose-400',
                'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
                'border-purple-500/30 bg-purple-500/5 text-purple-400',
                'border-amber-500/30 bg-amber-500/5 text-amber-400',
                'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
                'border-pink-500/30 bg-pink-500/5 text-pink-400'
              ];
              const colorClass = dayColors[index % dayColors.length];

              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 space-y-3.5 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    
                    {/* Day & Emotion Tag */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${colorClass}`}>
                          Day {topic.day || index + 1} · {topic.angleType}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {topic.targetEmotion}
                      </span>
                    </div>

                    {/* Headline Options */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">3套高点击标题池（点击复制）：</span>
                      {topic.headlineOptions.map((h, hIdx) => {
                        const copyId = `${index}-${hIdx}`;
                        const isCopied = copiedTitleIndex === copyId;
                        return (
                          <div
                            key={hIdx}
                            onClick={() => copyHeadline(h, copyId)}
                            className="group flex items-center justify-between p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 hover:border-amber-500/40 text-xs text-slate-200 cursor-pointer transition-all"
                          >
                            <span className="line-clamp-1 pr-2">{h}</span>
                            <span className="text-slate-500 group-hover:text-amber-400 flex-shrink-0">
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Golden Hook & Psychology */}
                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-semibold text-amber-400 flex items-center space-x-1">
                        <Flame className="w-3 h-3" />
                        <span>黄金前3秒抓眼 Hook：</span>
                      </div>
                      <p className="text-xs text-slate-200 italic leading-relaxed">
                        “{topic.goldenHook}”
                      </p>
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span className="text-slate-300 font-medium">心理触发：</span> {topic.psychologyTrigger}
                      </div>
                    </div>

                    {/* Integrated Account Memory Badge & Tip */}
                    {topic.referencedMemoryTitle && (
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-orange-500/10 border border-purple-500/30 text-[11px] space-y-1">
                        <div className="flex items-center space-x-1.5 text-purple-300 font-bold">
                          <Brain className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span>🧠 融入专属记忆：</span>
                          <span className="text-white truncate">{topic.referencedMemoryTitle}</span>
                        </div>
                        {topic.memoryIntegrationTip && (
                          <p className="text-slate-300 pl-5 text-[11px] leading-snug">
                            💡 {topic.memoryIntegrationTip}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Outline Steps */}
                    {topic.outline && topic.outline.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400">核心行文大纲：</span>
                        <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-300">
                          {topic.outline.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-center space-x-1.5 truncate">
                              <span className="text-amber-500/80 font-bold">{sIdx + 1}.</span>
                              <span className="truncate">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cover Visual Text Suggestion */}
                    {topic.coverTextProposal && (
                      <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] space-y-0.5">
                        <span className="text-amber-400 font-semibold">🎨 封面大字方案：</span>
                        <div className="text-slate-200">
                          <span className="bg-rose-500 text-white px-1 py-0.5 rounded text-[10px] mr-1.5 font-bold">
                            {topic.coverTextProposal.badge}
                          </span>
                          <span className="font-bold">{topic.coverTextProposal.mainTitle}</span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Action Button: Feed Directly into Content & Visual Editor */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => onSendToEditor(topic, activeMatrix.keyword)}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition-colors cursor-pointer"
                    >
                      <span>👉 一键生成爆款图文与封面微调</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};

