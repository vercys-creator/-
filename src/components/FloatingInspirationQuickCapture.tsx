import React, { useState, useEffect, useRef } from 'react';
import {
  Lightbulb,
  Sparkles,
  Zap,
  Plus,
  X,
  Check,
  ArrowRight,
  Bookmark,
  Tag,
  BookOpen,
  Send,
  RefreshCw,
  Copy,
  PenTool,
  Clock,
  ChevronRight,
  Flame,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { Account, KnowledgeItem, DeconstructionResult } from '../types';

interface FloatingInspirationQuickCaptureProps {
  activeAccount: Account | null;
  knowledgeBase: KnowledgeItem[];
  onAddKnowledgeItem: (item: KnowledgeItem) => void;
  onNavigateToKnowledge: () => void;
  onNavigateToEditor: (template: string, title: string) => void;
}

const VIEWPOINT_CATEGORIES = [
  { id: 'golden_quote', label: '爆款金句/切片', icon: '✨', defaultTag: '爆款金句' },
  { id: 'counter_intuitive', label: '认知颠覆/反常识', icon: '🧠', defaultTag: '反常识' },
  { id: 'audience_pain', label: '受众深层痛点', icon: '🎯', defaultTag: '受众痛点' },
  { id: 'topic_spark', label: '选题点子/闪念', icon: '💡', defaultTag: '灵感选题' },
  { id: 'case_deconstruct', label: '对标素材拆解', icon: '📦', defaultTag: '对标拆解' },
  { id: 'monetization_hook', label: '商业转化钩子', icon: '💰', defaultTag: '转化钩子' }
];

const SUGGESTED_QUICK_TAGS = [
  '反常识',
  '受众痛点',
  '爆款金句',
  '认知升级',
  '转化钩子',
  '避坑指南',
  '实操SOP',
  '情绪共鸣'
];

export const FloatingInspirationQuickCapture: React.FC<FloatingInspirationQuickCaptureProps> = ({
  activeAccount,
  knowledgeBase,
  onAddKnowledgeItem,
  onNavigateToKnowledge,
  onNavigateToEditor
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'recent'>('create');

  // Form states
  const [rawContent, setRawContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(VIEWPOINT_CATEGORIES[0].id);
  const [selectedTags, setSelectedTags] = useState<string[]>([VIEWPOINT_CATEGORIES[0].defaultTag]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Success Notification State
  const [savedSuccessItem, setSavedSuccessItem] = useState<KnowledgeItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Global Keyboard Shortcut: Cmd+I / Ctrl+I or Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is already in an input unless it's the shortcut
      if ((e.metaKey || e.ctrlKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      setSavedSuccessItem(null);
    }
  }, [isOpen]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    const cat = VIEWPOINT_CATEGORIES.find((c) => c.id === catId);
    if (cat && !selectedTags.includes(cat.defaultTag)) {
      setSelectedTags((prev) => Array.from(new Set([...prev, cat.defaultTag])));
    }
  };

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
      const val = customTagInput.trim().replace(/^#/, '');
      if (!selectedTags.includes(val)) {
        setSelectedTags([...selectedTags, val]);
      }
      setCustomTagInput('');
    }
  };

  // 1. Direct Quick Save (Instant, no AI wait)
  const handleInstantSave = () => {
    if (!rawContent.trim()) return;

    const catObj = VIEWPOINT_CATEGORIES.find((c) => c.id === selectedCategory);
    const derivedTitle = title.trim() || `【${catObj?.label.split('/')[0] || '观点'}】${rawContent.trim().slice(0, 24)}...`;

    const newItem: KnowledgeItem = {
      id: `kb-spark-${Date.now()}`,
      accountId: activeAccount?.id,
      title: derivedTitle,
      coverText: rawContent.trim().slice(0, 30),
      bodyContent: rawContent.trim() + (sourceRef.trim() ? `\n\n📌 来源/备注：${sourceRef.trim()}` : ''),
      myInsights: `【灵感观点速记】分类：${catObj?.label || '随手记'}\n${rawContent.trim()}`,
      accountNiche: activeAccount?.niche || '通用',
      tags: Array.from(new Set([...selectedTags, '灵感随手记'])),
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddKnowledgeItem(newItem);
    setSavedSuccessItem(newItem);

    // Reset fields
    setRawContent('');
    setTitle('');
    setSourceRef('');
  };

  // 2. AI Smart Structuring & Auto Save to Knowledge Base
  const handleAiRefineAndSave = async () => {
    if (!rawContent.trim()) return;
    setIsAiProcessing(true);

    try {
      const catObj = VIEWPOINT_CATEGORIES.find((c) => c.id === selectedCategory);
      const res = await fetch('/api/ai/quick-spark-to-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawSpark: rawContent.trim(),
          viewpointType: catObj?.label || '碎片爆款观点',
          sourceReference: sourceRef.trim(),
          accountContext: activeAccount ? {
            name: activeAccount.name,
            niche: activeAccount.niche,
            targetPlatform: activeAccount.targetPlatform,
            positioning: activeAccount.positioning
          } : undefined
        })
      });

      const data = await res.json();
      if (data.result) {
        const aiRes = data.result;
        const newItem: KnowledgeItem = {
          id: `kb-spark-${Date.now()}`,
          accountId: activeAccount?.id,
          title: title.trim() || aiRes.title || `【${catObj?.label.split('/')[0]}】${rawContent.slice(0, 20)}`,
          coverText: aiRes.coverTextProposal || rawContent.trim().slice(0, 24),
          bodyContent: rawContent.trim() + (sourceRef.trim() ? `\n\n📌 来源/备注：${sourceRef.trim()}` : ''),
          myInsights: aiRes.structuredInsights || `【灵感速记与洞察】${rawContent.trim()}`,
          accountNiche: activeAccount?.niche || '通用',
          tags: Array.from(new Set([...selectedTags, ...(aiRes.tags || []), 'AI升维'])),
          deconstruction: aiRes.deconstruction,
          createdAt: new Date().toISOString().split('T')[0]
        };

        onAddKnowledgeItem(newItem);
        setSavedSuccessItem(newItem);

        // Reset
        setRawContent('');
        setTitle('');
        setSourceRef('');
      } else {
        // Fallback to instant save if AI fails
        handleInstantSave();
      }
    } catch (err) {
      console.error('AI quick spark failed, falling back to direct save:', err);
      handleInstantSave();
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* 1. Floating Global Quick Entry Dock Button in the Footer Area */}
      <div 
        id="floating-quick-inspiration-dock"
        className="fixed bottom-5 right-5 z-40 flex items-center space-x-2"
      >
        <button
          id="btn-open-quick-spark-modal"
          onClick={() => setIsOpen(true)}
          className="group flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/25 border border-amber-300/40 hover:scale-105 active:scale-95 transition-all duration-200"
          title="随时记录爆款观点与灵感闪念 (快捷键 ⌘+I / Ctrl+I)"
        >
          <div className="w-5 h-5 rounded-full bg-slate-950/15 flex items-center justify-center text-slate-950 animate-pulse">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <span className="tracking-wide">灵感随手记 · 存知识库</span>
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950/15 text-slate-900 border border-slate-950/10">
            ⌘I
          </span>
          {knowledgeBase.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 text-[10px] font-bold">
              {knowledgeBase.length}
            </span>
          )}
        </button>
      </div>

      {/* 2. Floating Quick Capture Modal */}
      {isOpen && (
        <div 
          id="quick-inspiration-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div 
            id="quick-inspiration-modal-card"
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      全局灵感与碎片观点速记
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium">
                      自动存入知识库
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    随时捕捉转瞬即逝的爆款切片、认知颠覆与金句，自动沉淀为可复用的知识资产
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Account Tag */}
                {activeAccount && (
                  <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700">
                    <span>{activeAccount.avatarIcon}</span>
                    <span className="max-w-[100px] truncate">{activeAccount.name}</span>
                  </span>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="关闭 (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub Tabs: Record vs Recent */}
            <div className="px-5 pt-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('create')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center space-x-1.5 border-b-2 ${
                    activeSubTab === 'create'
                      ? 'border-amber-500 text-amber-400 bg-slate-900/90'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>记录灵感观点</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('recent')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center space-x-1.5 border-b-2 ${
                    activeSubTab === 'recent'
                      ? 'border-amber-500 text-amber-400 bg-slate-900/90'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>知识库速览 ({knowledgeBase.length})</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 hidden sm:block">
                按 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono text-[10px]">Cmd+Enter</kbd> 极速保存
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              
              {/* Success Notification Alert */}
              {savedSuccessItem && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-300 flex items-center space-x-1">
                        <span>已成功同步保存至知识库！</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        《{savedSuccessItem.title}》
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateToKnowledge();
                      }}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-all flex items-center justify-center space-x-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>查看知识库</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        const tpl = savedSuccessItem.deconstruction?.reusableTemplate || savedSuccessItem.bodyContent;
                        onNavigateToEditor(tpl, savedSuccessItem.title);
                      }}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-md shadow-amber-500/10"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>去创作区套用</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSubTab === 'create' ? (
                <>
                  {/* 1. Category Quick Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>观点/灵感类型：</span>
                      </span>
                      <span className="text-[11px] text-slate-500">选择契合的观点切入点</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {VIEWPOINT_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleSelectCategory(cat.id)}
                            className={`px-2.5 py-2 rounded-xl text-left border transition-all flex items-center space-x-2 ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/20 font-medium'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            <span className="text-sm">{cat.icon}</span>
                            <span className="text-xs truncate">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Main Textarea Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>灵感内容 / 碎片观点 / 金句切片：</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {rawContent.length} 字
                      </span>
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={rawContent}
                      onChange={(e) => setRawContent(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                          e.preventDefault();
                          handleInstantSave();
                        }
                      }}
                      rows={4}
                      placeholder="例如：很多做自媒体的人不是缺项目，而是缺把一件小事做深做透的笨功夫；或者记录一条刷到的同行爆款标题文案/反常识金句..."
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed resize-none font-sans"
                    />
                  </div>

                  {/* 3. Optional Title and Source */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        条目标题 (可选，留空将自动生成)：
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="如：【认知颠覆】为什么副业做不大？"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none placeholder-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        来源 / 参考出处 (可选)：
                      </label>
                      <input
                        type="text"
                        value={sourceRef}
                        onChange={(e) => setSourceRef(e.target.value)}
                        placeholder="如：即刻热帖 / 某对标账号 / 用户评论区"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none placeholder-slate-600"
                      />
                    </div>
                  </div>

                  {/* 4. Tag Selection & Custom Tag */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                      标签归类：
                    </label>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {SUGGESTED_QUICK_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleTag(tag)}
                            className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center space-x-1 ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium'
                                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>#{tag}</span>
                          </button>
                        );
                      })}

                      {selectedTags
                        .filter((t) => !SUGGESTED_QUICK_TAGS.includes(t))
                        .map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-lg text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium inline-flex items-center space-x-1"
                          >
                            <span>#{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleTag(tag)}
                              className="text-amber-400 hover:text-rose-400 ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}

                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={handleAddCustomTag}
                        placeholder="+ 自定义标签 (回车)"
                        className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none w-32"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Recent Knowledge Items List */
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span>知识库最近沉淀记录 ({knowledgeBase.length})</span>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateToKnowledge();
                      }}
                      className="text-amber-400 hover:underline flex items-center space-x-1"
                    >
                      <span>前往完整知识库</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {knowledgeBase.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 space-y-2">
                      <Bookmark className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-xs">暂无知识库记录，快来随手记下第一条灵感吧！</p>
                    </div>
                  ) : (
                    knowledgeBase.slice(0, 8).map((item) => {
                      const isCopied = copiedId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-1 flex items-center space-x-1.5">
                              <span>📌</span>
                              <span>{item.title}</span>
                            </h4>
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] text-slate-500 font-mono">
                                {item.createdAt}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.id, item.bodyContent || item.myInsights)}
                                className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                                title="复制内容"
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  const tpl = item.deconstruction?.reusableTemplate || item.bodyContent;
                                  onNavigateToEditor(tpl, item.title);
                                }}
                                className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-semibold transition-colors flex items-center space-x-0.5"
                                title="引用至创作区"
                              >
                                <span>套用</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                            {item.bodyContent || item.myInsights}
                          </p>

                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800/80 text-slate-400"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            {activeSubTab === 'create' && (
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>支持一键直存知识库，或使用 AI 升维提炼为拆解公式</span>
                </div>

                <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                  {/* AI Refine & Save */}
                  <button
                    type="button"
                    onClick={handleAiRefineAndSave}
                    disabled={!rawContent.trim() || isAiProcessing}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all disabled:opacity-40"
                    title="让 AI 自动提炼核心爆款逻辑、Hook公式并沉淀入库"
                  >
                    {isAiProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>AI 升维提炼中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>AI 升维提炼并入库</span>
                      </>
                    )}
                  </button>

                  {/* Direct 1-Click Instant Save */}
                  <button
                    type="button"
                    onClick={handleInstantSave}
                    disabled={!rawContent.trim() || isAiProcessing}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>秒速存入知识库</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
