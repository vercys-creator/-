import React, { useState, useMemo } from 'react';
import { 
  Brain, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Check, 
  Copy, 
  Layers, 
  BookOpen, 
  Flame, 
  ArrowRight, 
  Tag, 
  RefreshCw, 
  ShieldAlert, 
  Gift, 
  HelpCircle, 
  Compass, 
  Filter,
  CheckCircle2,
  Sliders,
  ExternalLink,
  MessageSquareQuote,
  Lightbulb,
  FileText
} from 'lucide-react';
import { Account, AccountMemoryItem, MemoryCategory } from '../types';

export const MEMORY_CATEGORY_CONFIG: Record<MemoryCategory, {
  label: string;
  icon: any;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  desc: string;
  placeholder: string;
}> = {
  personal_story: {
    label: '个人经历与故事',
    icon: BookOpen,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
    desc: '真实踩坑历史、裸辞/转行经历、学员破局战绩、真金白银数据佐证',
    placeholder: '例：2023年裸辞创业被割2万高价课程，只给了百度网盘，后来坚持轻量MVP跑通第一个闭环...'
  },
  core_thesis: {
    label: '独家认知与金句',
    icon: MessageSquareQuote,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    desc: '反常识观点、底层方法论、破除传统思维、个人坚持的价值观',
    placeholder: '例：执行力差不是意志力问题，而是起步摩擦力过大；不要消耗意志力，要建立10分钟微步系统...'
  },
  product_hook: {
    label: '变现产品与钩子',
    icon: Gift,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    desc: '引流资料包、多维表格、高客单服务、训练营、电子书等交付资产',
    placeholder: '例：《一人公司副业破局多维自测表SOP》，评论区互动关键词免费领取，私域转化率38%...'
  },
  audience_faq: {
    label: '受众卡点与痛点',
    icon: HelpCircle,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/30',
    desc: '学员最常问的困惑、评论区高频卡点、新手最容易犯的低级误区',
    placeholder: '例：大厂职场人总觉得自己每天做的事太普通没人买单，忽视了“知识的诅咒”与技能溢出价值...'
  },
  style_boundary: {
    label: '表达禁忌与红线',
    icon: ShieldAlert,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    desc: '严禁使用的浮夸词汇、特定语气调性要求、品牌合规底线',
    placeholder: '例：严禁兜售暴富焦虑，严禁使用“月入10万不是梦”等浮夸黑话，必须理性克制、有据可查...'
  }
};

interface AccountMemoryViewProps {
  activeAccount: Account | null;
  accounts?: Account[];
  memories?: AccountMemoryItem[];
  onSaveMemories: (memories: AccountMemoryItem[]) => void;
  onNavigateToTopics: (keyword?: string) => void;
}

export const AccountMemoryView: React.FC<AccountMemoryViewProps> = ({
  activeAccount,
  accounts = [],
  memories = [],
  onSaveMemories,
  onNavigateToTopics
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiDistillModalOpen, setIsAiDistillModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<AccountMemoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Distillation states
  const [rawTextForDistill, setRawTextForDistill] = useState('');
  const [distilling, setDistilling] = useState(false);
  const [distilledPreview, setDistilledPreview] = useState<Array<Omit<AccountMemoryItem, 'id' | 'createdAt' | 'accountId'>>>([]);

  // Manual Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: MemoryCategory;
    content: string;
    keyTakeaway: string;
    tags: string;
    importance: 'high' | 'medium' | 'low';
    isEnabled: boolean;
    accountId: string;
  }>({
    title: '',
    category: 'personal_story',
    content: '',
    keyTakeaway: '',
    tags: '',
    importance: 'high',
    isEnabled: true,
    accountId: activeAccount?.id || 'acc-1'
  });

  // Filter memories for active account (or global)
  const currentAccountMemories = useMemo(() => {
    return memories.filter(
      (m) => m.accountId === activeAccount?.id || m.accountId === 'global' || !m.accountId
    );
  }, [memories, activeAccount?.id]);

  const filteredMemories = useMemo(() => {
    return currentAccountMemories.filter((m) => {
      const matchCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const matchSearch = 
        !searchQuery.trim() ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.keyTakeaway && m.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [currentAccountMemories, selectedCategory, searchQuery]);

  const activeCount = useMemo(() => {
    return currentAccountMemories.filter((m) => m.isEnabled).length;
  }, [currentAccountMemories]);

  // Actions
  const handleToggleMemory = (id: string) => {
    const updated = memories.map((m) => 
      m.id === id ? { ...m, isEnabled: !m.isEnabled } : m
    );
    onSaveMemories(updated);
  };

  const handleDeleteMemory = (id: string) => {
    if (confirm('确定要删除这条专属记忆资产吗？')) {
      const updated = memories.filter((m) => m.id !== id);
      onSaveMemories(updated);
    }
  };

  const handleOpenEdit = (item: AccountMemoryItem) => {
    setEditingMemory(item);
    setFormData({
      title: item.title,
      category: item.category,
      content: item.content,
      keyTakeaway: item.keyTakeaway || '',
      tags: item.tags.join(', '),
      importance: item.importance,
      isEnabled: item.isEnabled,
      accountId: item.accountId
    });
    setIsAddModalOpen(true);
  };

  const handleOpenAdd = (category?: MemoryCategory) => {
    setEditingMemory(null);
    setFormData({
      title: '',
      category: category || (selectedCategory !== 'all' ? selectedCategory : 'personal_story'),
      content: '',
      keyTakeaway: '',
      tags: '',
      importance: 'high',
      isEnabled: true,
      accountId: activeAccount?.id || 'acc-1'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    const parsedTags = formData.tags
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingMemory) {
      const updated = memories.map((m) => 
        m.id === editingMemory.id
          ? {
              ...m,
              title: formData.title.trim(),
              category: formData.category,
              content: formData.content.trim(),
              keyTakeaway: formData.keyTakeaway.trim(),
              tags: parsedTags,
              importance: formData.importance,
              isEnabled: formData.isEnabled,
              accountId: formData.accountId
            }
          : m
      );
      onSaveMemories(updated);
    } else {
      const newMemory: AccountMemoryItem = {
        id: `mem-${Date.now()}`,
        accountId: formData.accountId || activeAccount?.id || 'acc-1',
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
        keyTakeaway: formData.keyTakeaway.trim(),
        tags: parsedTags,
        importance: formData.importance,
        isEnabled: formData.isEnabled,
        citationsCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onSaveMemories([newMemory, ...memories]);
    }

    setIsAddModalOpen(false);
    setEditingMemory(null);
  };

  // AI Distillation Handler
  const handleStartDistill = async () => {
    if (!rawTextForDistill.trim()) return;
    setDistilling(true);
    setDistilledPreview([]);

    try {
      const response = await fetch('/api/ai/memory-distill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawTextForDistill,
          accountContext: activeAccount ? {
            name: activeAccount.name,
            niche: activeAccount.niche,
            stage: activeAccount.currentStage,
            positioning: activeAccount.positioning
          } : undefined
        })
      });

      const data = await response.json();
      if (data.result && Array.isArray(data.result.memories)) {
        setDistilledPreview(data.result.memories);
      }
    } catch (err) {
      console.error('Failed to distill memory:', err);
    } finally {
      setDistilling(false);
    }
  };

  const handleSaveDistilledMemories = () => {
    if (distilledPreview.length === 0) return;

    const newMemories: AccountMemoryItem[] = distilledPreview.map((item, idx) => ({
      id: `mem-${Date.now()}-${idx}`,
      accountId: activeAccount?.id || 'acc-1',
      title: item.title || '提炼记忆',
      category: item.category || 'personal_story',
      content: item.content || '',
      keyTakeaway: item.keyTakeaway || '',
      tags: item.tags || [],
      importance: item.importance || 'high',
      isEnabled: true,
      citationsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }));

    onSaveMemories([...newMemories, ...memories]);
    setIsAiDistillModalOpen(false);
    setRawTextForDistill('');
    setDistilledPreview([]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateTopicFromMemory = (mem: AccountMemoryItem) => {
    // Navigate to topic generator and prompt based on this memory
    const keyword = mem.tags[0] || mem.title.slice(0, 10);
    onNavigateToTopics(keyword);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header & Value Proposition Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
              <Brain className="w-3.5 h-3.5" />
              <span>AI 专属记忆资产中心 · 账号与选题的智能连接器</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>赋予 AI 你的专属记忆，让每一个选题都带着真实血液</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              将您的【真实踩坑故事】、【独家反常识观点】、【飞书多维表格引流品】与【受众真实卡点】沉淀为结构化记忆资产。在生成 7 天选题矩阵时，AI 将自动深度结合已激活的记忆，拒绝千篇一律的套话！
            </p>

            {/* Quick Category Explainer Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {(Object.keys(MEMORY_CATEGORY_CONFIG) as MemoryCategory[]).map((cat) => {
                const conf = MEMORY_CATEGORY_CONFIG[cat];
                const Icon = conf.icon;
                const count = currentAccountMemories.filter((m) => m.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                      selectedCategory === cat
                        ? `${conf.badgeBg} ${conf.color} border ${conf.badgeBorder} ring-1 ring-amber-500/30 font-bold`
                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{conf.label}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-start lg:self-center flex-shrink-0">
            <button
              onClick={() => setIsAiDistillModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-lg shadow-orange-500/10 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI 智能提炼笔记入库</span>
            </button>

            <button
              onClick={() => handleOpenAdd()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>手动录入记忆</span>
            </button>
          </div>

        </div>

        {/* Live Active Context Status Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 text-slate-300">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">当前账号：</span>
              <span className="font-semibold text-white">{activeAccount?.name || '默认账号'}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div>
              <span className="text-slate-400">已激活记忆注入：</span>
              <span className="font-bold text-amber-400 ml-1">{activeCount}</span>
              <span className="text-slate-500"> / {currentAccountMemories.length} 条</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTopics()}
            className="inline-flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-semibold group cursor-pointer"
          >
            <span>直接前往【一周选题矩阵】生成专属选题</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            全部记忆 ({currentAccountMemories.length})
          </button>
          {(Object.keys(MEMORY_CATEGORY_CONFIG) as MemoryCategory[]).map((cat) => {
            const conf = MEMORY_CATEGORY_CONFIG[cat];
            const isSelected = selectedCategory === cat;
            const count = currentAccountMemories.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{conf.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索记忆标题、故事或标签..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* 3. Memories List / Cards Grid */}
      {filteredMemories.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-xl">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {searchQuery || selectedCategory !== 'all' ? '未找到匹配的记忆资产' : '当前账号记忆库暂空'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery || selectedCategory !== 'all'
                ? '尝试更换搜索关键词或选择其他记忆分类。'
                : '立即添加您的个人踩坑故事、变现钩子或反常识认知，AI 生成选题时将自动调用这些独家资产！'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAiDistillModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              AI 智能提取笔记
            </button>
            <button
              onClick={() => handleOpenAdd()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
            >
              手动创建一条
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((mem) => {
            const conf = MEMORY_CATEGORY_CONFIG[mem.category] || MEMORY_CATEGORY_CONFIG.personal_story;
            const Icon = conf.icon;

            return (
              <div
                key={mem.id}
                className={`rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  mem.isEnabled
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg'
                    : 'bg-slate-950/60 border-slate-900 opacity-60 hover:opacity-100'
                }`}
              >
                {/* Top Row: Category + Importance + Switch Toggle */}
                <div className="p-5 space-y-3 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${conf.badgeBg} ${conf.badgeBorder} ${conf.color}`}>
                        <Icon className="w-3 h-3" />
                        <span>{conf.label}</span>
                      </span>

                      {mem.importance === 'high' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                          高优注入
                        </span>
                      )}
                    </div>

                    {/* Enable Toggle Switch */}
                    <label className="inline-flex items-center cursor-pointer space-x-2" title="是否在生成选题时激活该记忆">
                      <span className="text-[11px] text-slate-400">
                        {mem.isEnabled ? '已激活' : '已停用'}
                      </span>
                      <input
                        type="checkbox"
                        checked={mem.isEnabled}
                        onChange={() => handleToggleMemory(mem.id)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500 relative"></div>
                    </label>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                    {mem.title}
                  </h3>

                  {/* Main Content */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 whitespace-pre-line bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    {mem.content}
                  </p>

                  {/* Key Takeaway Callout */}
                  {mem.keyTakeaway && (
                    <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-xs">
                      <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                      <div className="leading-snug">
                        <span className="font-semibold text-amber-400">核心提炼：</span>
                        <span>{mem.keyTakeaway}</span>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {mem.tags && mem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mem.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    录入于 {mem.createdAt}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleGenerateTopicFromMemory(mem)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-semibold transition-all"
                      title="以此记忆为核心灵感生成选题矩阵"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>生选题</span>
                    </button>

                    <button
                      onClick={() => handleCopy(`${mem.title}\n\n${mem.content}`, mem.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="复制记忆详情"
                    >
                      {copiedId === mem.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(mem)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="编辑"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. Modal: Add / Edit Memory */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Brain className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingMemory ? '编辑专属记忆资产' : '录入新专属记忆资产'}
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              
              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  记忆分类维度
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(MEMORY_CATEGORY_CONFIG) as MemoryCategory[]).map((cat) => {
                    const conf = MEMORY_CATEGORY_CONFIG[cat];
                    const isSelected = formData.category === cat;
                    const Icon = conf.icon;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? `${conf.badgeBg} ${conf.badgeBorder} ring-1 ring-amber-500/40`
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <Icon className={`w-3.5 h-3.5 ${conf.color}`} />
                          <span className="text-xs font-bold text-white">{conf.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{conf.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  记忆标题 <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="如：裸辞创业被割2万高价课程的真实踩坑经历"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Detailed Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  核心详细内容 (包含真实细节、论据、数据或操作逻辑) <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={MEMORY_CATEGORY_CONFIG[formData.category].placeholder}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Key Takeaway */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  一句话核心金句 / 提炼 (可选，AI 将优先引用此金句)
                </label>
                <input
                  type="text"
                  value={formData.keyTakeaway}
                  onChange={(e) => setFormData({ ...formData, keyTakeaway: e.target.value })}
                  placeholder="如：真金白银踩坑2万买来的教训：坚决不买无交付承诺的高价课..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Tags & Importance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    标签 (逗号分隔)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="如：踩坑, 裸辞, MVP验证"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    AI 注入优先级
                  </label>
                  <select
                    value={formData.importance}
                    onChange={(e) => setFormData({ ...formData, importance: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="high">高优先级 (选题必选)</option>
                    <option value="medium">中优先级 (相关时融入)</option>
                    <option value="low">低优先级 (备用参考)</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                >
                  {editingMemory ? '保存修改' : '存入专属记忆库'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: AI Smart Distill from Raw Notes */}
      {isAiDistillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    AI 智能提炼笔记与素材为记忆资产
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    直接粘贴任意聊天记录、学员反馈、口述复盘或大纲笔记，AI 自动归类为结构化记忆。
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiDistillModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Input area */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                粘贴原始经历文本 / 口语化想法 / 变现钩子描述：
              </label>
              <textarea
                rows={5}
                value={rawTextForDistill}
                onChange={(e) => setRawTextForDistill(e.target.value)}
                placeholder="例如：上个月有个学员跟我聊，说他工作7年是资深UI设计师，想做小红书但不知道分享什么。我帮他盘点了一下，把大厂设计交付规范做成了多维表格，结果第一篇笔记爆了3000赞，引流了80多个付费咨询。这让我再次意识到普通人真的很容易忽视自己的技能溢出..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleStartDistill}
                  disabled={distilling || !rawTextForDistill.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  {distilling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>正在深度提炼记忆结构...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI 智能提炼为记忆卡片</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Distilled Preview Section */}
            {distilledPreview.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>提炼完成！共解析出 {distilledPreview.length} 条专属记忆资产：</span>
                  </h3>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {distilledPreview.map((item, idx) => {
                    const conf = MEMORY_CATEGORY_CONFIG[item.category] || MEMORY_CATEGORY_CONFIG.personal_story;
                    const Icon = conf.icon;
                    return (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold ${conf.badgeBg} ${conf.color}`}>
                            <Icon className="w-3 h-3" />
                            <span>{conf.label}</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {item.importance === 'high' ? '高优先级' : '中优先级'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <p className="text-[11px] text-slate-300 line-clamp-2">{item.content}</p>
                        {item.keyTakeaway && (
                          <p className="text-[11px] text-amber-300/90 bg-amber-500/5 p-1.5 rounded border border-amber-500/20">
                            💡 提炼：{item.keyTakeaway}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDistilledPreview([]);
                      setRawTextForDistill('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    重置
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDistilledMemories}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
                  >
                    一键确认全部存入记忆库
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
