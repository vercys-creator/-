import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  Check, 
  Copy, 
  ArrowRight, 
  Layers, 
  Eye, 
  Tag, 
  Zap,
  Bookmark,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Palette,
  Wand2,
  Share2,
  LayoutGrid,
  Type,
  Maximize2,
  Send,
  Sliders,
  CheckCircle2,
  Download
} from 'lucide-react';
import { Account, KnowledgeItem, DeconstructionResult, XingtuButterVisualSpec } from '../types';

interface KnowledgeBaseViewProps {
  activeAccount: Account | null;
  knowledgeBase: KnowledgeItem[];
  onAddKnowledgeItem: (item: KnowledgeItem) => void;
  onDeleteKnowledgeItem: (id: string) => void;
  onApplyTemplateToEditor: (template: string, title: string, visualSpec?: XingtuButterVisualSpec, referenceImage?: string) => void;
  onSyncToTopicMatrix?: (item: KnowledgeItem) => void;
  onSyncToCoverEditor?: (item: KnowledgeItem) => void;
  onSyncToPositioning?: (item: KnowledgeItem) => void;
  onSyncToMasterPrompt?: (prompt: string) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  activeAccount,
  knowledgeBase,
  onAddKnowledgeItem,
  onDeleteKnowledgeItem,
  onApplyTemplateToEditor,
  onSyncToTopicMatrix,
  onSyncToCoverEditor,
  onSyncToPositioning,
  onSyncToMasterPrompt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(knowledgeBase[0] || null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCoverText, setNewCoverText] = useState('');
  const [newBodyContent, setNewBodyContent] = useState('');
  const [newMyInsights, setNewMyInsights] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [deconstructMode, setDeconstructMode] = useState<'deep' | 'standard'>('deep');
  
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Gather all unique tags
  const allTags = Array.from(
    new Set(knowledgeBase.flatMap((item) => item.tags || []))
  );

  const filteredItems = knowledgeBase.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.myInsights.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bodyContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.visualSpec?.designNotes && item.visualSpec.designNotes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag =
      selectedTag === 'all' || (item.tags && item.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const showToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReferenceImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasteImage = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setReferenceImage(event.target.result as string);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    }
  };

  const handleDeconstructAndSave = async () => {
    if (!newTitle.trim() && !newBodyContent.trim() && !newCoverText.trim() && !referenceImage) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/deconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          coverText: newCoverText,
          bodyContent: newBodyContent,
          myInsights: newMyInsights,
          referenceImage: referenceImage || undefined,
          deconstructMode,
          accountNiche: activeAccount?.niche || '通用'
        })
      });

      const data = await response.json();
      if (data.result) {
        const newItem: KnowledgeItem = {
          id: `kb-${Date.now()}`,
          accountId: activeAccount?.id,
          title: newTitle || (referenceImage ? '导入参考图爆款拆解' : '未命名爆款素材'),
          coverText: newCoverText,
          bodyContent: newBodyContent,
          myInsights: newMyInsights,
          accountNiche: activeAccount?.niche || '通用',
          tags: data.result.tags || (deconstructMode === 'deep' ? ['深度拆解', '视觉复刻', '高转化'] : ['爆款拆解', '文案模板']),
          referenceImage: referenceImage || undefined,
          deconstructMode,
          visualSpec: data.result.visualSpec,
          reversePrompt: data.result.reversePrompt,
          deconstruction: data.result.deconstruction,
          createdAt: new Date().toISOString().split('T')[0]
        };

        onAddKnowledgeItem(newItem);
        setSelectedItem(newItem);
        setIsAddingNew(false);
        showToast('🎉 爆款已成功深度拆解并存入经验库，排版参数与Prompt已就绪！');

        // Reset form
        setNewTitle('');
        setNewCoverText('');
        setNewBodyContent('');
        setNewMyInsights('');
        setReferenceImage(null);
      }
    } catch (error) {
      console.error('Failed to deconstruct:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>爆款拆解与经验沉淀库 (支持图片导入与醒图/黄油排版提取)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              把爆款笔记、封面截图与个人心得，沉淀为可复用的底层公式与视觉规范
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              支持上传爆款封面截图或粘贴文案，AI 自动提取“醒图/黄油排版字型参数”、生成“反向AI生图Prompt”，并可一键分发同步到文案工坊与封面编辑器。
            </p>
          </div>

          <button
            id="add-knowledge-item-btn"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>录入新爆款 (支持图文/深度拆解)</span>
          </button>
        </div>

        {/* Global Notification Toast */}
        {syncToast && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{syncToast}</span>
          </div>
        )}

        {/* Search & Tag Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索沉淀库里的标题、心得、醒图/黄油排版、色卡或关键词..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTag === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              全部 ({knowledgeBase.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add New Deconstruction Form */}
      {isAddingNew && (
        <div 
          onPaste={handlePasteImage}
          className="rounded-2xl bg-slate-900 border-2 border-amber-500/40 p-6 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">录入爆款素材 & AI 深度反向拆解 (支持导入参考图)</h2>
            </div>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              取消
            </button>
          </div>

          {/* Deconstruct Mode Switcher */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-amber-400 flex items-center space-x-1.5">
                <Wand2 className="w-4 h-4" />
                <span>拆解深度选项：</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                深度拆解将额外提取“醒图/黄油”字体排版参数、生图反向Prompt与三段式心理叙事架构。
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => setDeconstructMode('deep')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                  deconstructMode === 'deep'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔬 深度拆解 (图文+醒图/黄油排版)
              </button>
              <button
                type="button"
                onClick={() => setDeconstructMode('standard')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  deconstructMode === 'standard'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📝 标准拆解 (文案+钩子)
              </button>
            </div>
          </div>

          {/* Reference Image Upload & Paste Area (Strict 3:4 aspect ratio & Rich Copy Pasting Box) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            
            {/* 3:4 Aspect Ratio Image Loading Box */}
            <div className="md:col-span-4 space-y-2">
              <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>爆款封面 / 参考截图 (3:4)</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  3:4 比例
                </span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {referenceImage ? (
                <div className="relative aspect-[3/4] max-w-[220px] mx-auto md:mx-0 w-full rounded-2xl overflow-hidden border-2 border-amber-500/60 bg-slate-950 group shadow-xl">
                  <img
                    src={referenceImage}
                    alt="参考图"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                    >
                      替换 3:4 图片
                    </button>
                    <button
                      type="button"
                      onClick={() => setReferenceImage(null)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium text-xs hover:bg-rose-500 transition-colors"
                    >
                      移除
                    </button>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-slate-950/85 text-[10px] text-amber-400 font-mono font-semibold">
                    3:4 已加载
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[3/4] max-w-[220px] mx-auto md:mx-0 w-full rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-500/80 bg-slate-950/70 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all group"
                >
                  <Upload className="w-8 h-8 text-slate-500 group-hover:text-amber-400 mb-2 transition-colors" />
                  <span className="text-xs font-bold text-slate-200">点击上传 3:4 封面截图</span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    或直接在页面 <kbd className="px-1 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">Ctrl+V</kbd> 粘贴
                  </span>
                  <span className="text-[10px] text-amber-400/80 mt-2 font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    📐 标准 3:4 画幅
                  </span>
                </div>
              )}
            </div>

            {/* Copy Pasting & Detailed Inputs Column */}
            <div className="md:col-span-8 space-y-3.5 text-xs">
              
              {/* Dedicated Copy Pasting Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-400 flex items-center space-x-1.5">
                    <span>📋 爆款文案快速粘贴区 (正文 / 口播稿 / 钩子)</span>
                  </label>
                  {newBodyContent && (
                    <button
                      type="button"
                      onClick={() => {
                        const firstLine = newBodyContent.split('\n')[0]?.trim() || '';
                        if (firstLine && !newTitle) {
                          setNewTitle(firstLine.slice(0, 30));
                        }
                        if (firstLine && !newCoverText) {
                          setNewCoverText(`【重点】${firstLine.slice(0, 16)}`);
                        }
                      }}
                      className="text-[11px] text-amber-300 hover:text-amber-200 font-medium underline"
                    >
                      ⚡ 智能提取首行到标题
                    </button>
                  )}
                </div>

                <textarea
                  value={newBodyContent}
                  onChange={(e) => setNewBodyContent(e.target.value)}
                  rows={3}
                  placeholder="在此直接粘贴爆款笔记全部正文、前3秒Hook文案、口播脚本或段落金句..."
                  className="w-full bg-slate-900 border border-slate-700/90 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">爆款标题</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="例如：裸辞半年，我靠一人公司月入5W的5条冷酷真相"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">封面大字文案与排版特征</label>
                  <input
                    type="text"
                    value={newCoverText}
                    onChange={(e) => setNewCoverText(e.target.value)}
                    placeholder="例如：【真实复盘】5个搞钱真相，建议收藏！(黑底黄字/醒图粗黑)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-amber-400 mb-1">
                  ✍️ 我个人的手动心得与观察（这是经验库最核心的私人资产！）
                </label>
                <textarea
                  value={newMyInsights}
                  onChange={(e) => setNewMyInsights(e.target.value)}
                  rows={2}
                  placeholder="例如：我觉得它火在第一句没有寒暄直接扎心，封面黄黑撞色反差极大，评论区引流话术非常隐蔽自然..."
                  className="w-full bg-slate-950 border border-amber-500/30 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="submit-deconstruction-btn"
              onClick={handleDeconstructAndSave}
              disabled={loading || (!newTitle && !newBodyContent && !referenceImage)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI 手术刀级深度拆解分析中...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>AI {deconstructMode === 'deep' ? '深度' : '标准'}拆解并存入经验库</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Master Knowledge Items List + Detailed Deconstruction Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Items List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            <span>经验库沉淀列表 ({filteredItems.length})</span>
            <span className="text-[11px] text-slate-500">点击查看深度拆解与排版参数</span>
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                暂无匹配的经验沉淀，点击右上角录入第一篇爆款
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-1.5 mb-1">
                          {item.visualSpec && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {item.visualSpec.toolSource || '醒图/黄油规范'}
                            </span>
                          )}
                          {item.referenceImage && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-blue-500/20 text-blue-300">
                              含原图
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-bold text-slate-100 line-clamp-2 leading-relaxed">
                          {item.title}
                        </h3>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteKnowledgeItem(item.id);
                          if (selectedItem?.id === item.id) {
                            setSelectedItem(null);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors flex-shrink-0"
                        title="删除此项"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.coverText && (
                      <div className="mt-1.5 text-[11px] text-amber-400/90 line-clamp-1">
                        🎨 封面：{item.coverText}
                      </div>
                    )}

                    {item.myInsights && (
                      <div className="mt-1 text-[11px] text-slate-400 line-clamp-2 bg-slate-950 p-1.5 rounded border border-slate-800/60 italic">
                        💡 心得：{item.myInsights}
                      </div>
                    )}

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <div className="flex flex-wrap gap-1">
                        {item.tags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500">{item.createdAt}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Deep Deconstruction Master View */}
        <div className="lg:col-span-7">
          {selectedItem ? (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
              
              {/* Top Title & Multi-destination Sync Dispatcher */}
              <div className="border-b border-slate-800 pb-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        爆款反向工程与视觉提取报告
                      </span>
                      {selectedItem.visualSpec && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {selectedItem.visualSpec.toolSource} 排版对接就绪
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-white mt-1.5">
                      {selectedItem.title}
                    </h2>
                  </div>

                  {(selectedItem.deconstruction?.reusableTemplate || selectedItem.bodyContent || selectedItem.referenceImage || selectedItem.visualSpec) && (
                    <button
                      onClick={() =>
                        onApplyTemplateToEditor(
                          selectedItem.deconstruction?.reusableTemplate || selectedItem.bodyContent || '',
                          selectedItem.title,
                          selectedItem.visualSpec,
                          selectedItem.referenceImage
                        )
                      }
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex-shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>套用模板写新笔记</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Multi-destination One-Click Sync Action Bar */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] text-slate-400 font-semibold flex items-center space-x-1 pr-1">
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>一键内容同步分发：</span>
                  </span>

                  {/* Sync to Cover Editor */}
                  {(selectedItem.visualSpec || selectedItem.referenceImage) && onSyncToCoverEditor && (
                    <button
                      onClick={() => {
                        onSyncToCoverEditor(selectedItem);
                        showToast(`已将【${selectedItem.title}】的${selectedItem.referenceImage ? '参考图与' : ''}排版规范同步到封面工坊！`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <Palette className="w-3 h-3 text-purple-400" />
                      <span>同步到封面工坊</span>
                    </button>
                  )}

                  {/* Sync to Topic Matrix */}
                  {onSyncToTopicMatrix && (
                    <button
                      onClick={() => {
                        onSyncToTopicMatrix(selectedItem);
                        showToast(`已将拆解模型同步转化为【选题矩阵】！`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center space-x-1 transition-all"
                    >
                      <LayoutGrid className="w-3 h-3 text-blue-400" />
                      <span>同步到选题矩阵</span>
                    </button>
                  )}

                  {/* Sync to Master Prompt Engine */}
                  {selectedItem.reversePrompt && onSyncToMasterPrompt && (
                    <button
                      onClick={() => {
                        onSyncToMasterPrompt(selectedItem.reversePrompt!);
                        showToast(`已将反向生图 Prompt 发送到万能提示词引擎！`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-1 transition-all"
                    >
                      <Wand2 className="w-3 h-3 text-emerald-400" />
                      <span>同步到万能Prompt</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Reference Image Preview if exists */}
              {selectedItem.referenceImage && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>导入的爆款封面原图 / 参考源：</span>
                    </span>
                    <a
                      href={selectedItem.referenceImage}
                      download={`reference-${selectedItem.title.slice(0, 8)}.png`}
                      className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>保存图片</span>
                    </a>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-slate-800 max-h-56 bg-slate-900 flex justify-center">
                    <img
                      src={selectedItem.referenceImage}
                      alt="参考图"
                      className="max-h-56 w-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* XINGTU / BUTTERCAM VISUAL SPEC CARD (Requirements c & d) */}
              {selectedItem.visualSpec && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/30 via-slate-950 to-slate-950 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-purple-200">
                        【{selectedItem.visualSpec.toolSource}】设计排版与参数对接面板
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                      滤镜: {selectedItem.visualSpec.filterName || '高反差黑金'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {/* Font Spec */}
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] block">推荐字体与字重</span>
                      <div className="font-bold text-slate-100 flex items-center space-x-1">
                        <Type className="w-3 h-3 text-purple-400" />
                        <span>{selectedItem.visualSpec.fontStyle}</span>
                      </div>
                    </div>

                    {/* Layout Structure */}
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] block">视觉构图与板式</span>
                      <div className="font-bold text-slate-100">
                        {selectedItem.visualSpec.layoutStructure}
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] block">爆款色卡</span>
                      <div className="flex items-center space-x-1.5 pt-0.5">
                        <div 
                          className="w-4 h-4 rounded border border-slate-700" 
                          style={{ backgroundColor: selectedItem.visualSpec.colorPalette.bgColor }} 
                          title={`背景: ${selectedItem.visualSpec.colorPalette.bgColor}`}
                        />
                        <div 
                          className="w-4 h-4 rounded border border-slate-700" 
                          style={{ backgroundColor: selectedItem.visualSpec.colorPalette.titleColor }} 
                          title={`标题: ${selectedItem.visualSpec.colorPalette.titleColor}`}
                        />
                        <div 
                          className="w-4 h-4 rounded border border-slate-700" 
                          style={{ backgroundColor: selectedItem.visualSpec.colorPalette.highlightColor }} 
                          title={`高光: ${selectedItem.visualSpec.colorPalette.highlightColor}`}
                        />
                        <div 
                          className="w-4 h-4 rounded border border-slate-700" 
                          style={{ backgroundColor: selectedItem.visualSpec.colorPalette.badgeBg }} 
                          title={`标签: ${selectedItem.visualSpec.colorPalette.badgeBg}`}
                        />
                        <span className="text-[10px] text-slate-400 font-mono ml-1">4色配比</span>
                      </div>
                    </div>
                  </div>

                  {selectedItem.visualSpec.designNotes && (
                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      💡 <strong className="text-purple-300">排版复用要点：</strong>{selectedItem.visualSpec.designNotes}
                    </p>
                  )}
                </div>
              )}

              {/* REVERSE AI IMAGE PROMPT */}
              {selectedItem.reversePrompt && (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AI 反向生图 / 封面提示词 (Midjourney / Gemini 生图)：</span>
                    </span>
                    <button
                      onClick={() => copyText(selectedItem.reversePrompt!, 'prompt')}
                      className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:text-cyan-200"
                    >
                      {copiedKey === 'prompt' ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'prompt' ? '已复制 Prompt' : '复制生图 Prompt'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {selectedItem.reversePrompt}
                  </pre>
                </div>
              )}

              {/* 1. Core Logic */}
              {selectedItem.deconstruction?.coreLogic && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-blue-400 flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>核心底层爆火逻辑：</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedItem.deconstruction.coreLogic}
                  </p>
                </div>
              )}

              {/* 2. Hook Pattern & Formula */}
              {selectedItem.deconstruction?.hookPattern && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-rose-400">
                      🪝 抓眼球 Hook 剖析与提炼公式：
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">
                      {selectedItem.deconstruction.hookPattern.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedItem.deconstruction.hookPattern.analysis}
                  </p>
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-200">
                    公式：{selectedItem.deconstruction.hookPattern.formula}
                  </div>
                </div>
              )}

              {/* 3. Structure Flow */}
              {selectedItem.deconstruction?.structureFlow && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">三段式节奏结构流：</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {selectedItem.deconstruction.structureFlow.map((flow, fIdx) => (
                      <div key={fIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="font-bold text-amber-400">{flow.part}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{flow.function}</div>
                        <div className="text-[10px] text-slate-500">{flow.keyElements}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Cover Visual Logic */}
              {selectedItem.deconstruction?.coverVisualLogic && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-purple-400">🎨 封面排版与视觉辨识度拆解：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {selectedItem.deconstruction.coverVisualLogic}
                  </p>
                </div>
              )}

              {/* 5. Reusable Template */}
              {selectedItem.deconstruction?.reusableTemplate && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">万能文案填空模板：</span>
                    <button
                      onClick={() => copyText(selectedItem.deconstruction!.reusableTemplate, 'tpl')}
                      className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      {copiedKey === 'tpl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'tpl' ? '已复制' : '复制模板'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {selectedItem.deconstruction.reusableTemplate}
                  </pre>
                </div>
              )}

              {/* 6. Actionable Takeaways */}
              {selectedItem.deconstruction?.actionableTakeaways && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <span className="text-xs font-bold text-amber-400">🚀 本号落地执行清单：</span>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {selectedItem.deconstruction.actionableTakeaways.map((act, aIdx) => (
                      <li key={aIdx} className="flex items-start space-x-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 p-12 text-center text-slate-500">
              <FileText className="w-10 h-10 mx-auto text-slate-700 mb-2" />
              <p className="text-xs">在左侧选择一个素材查看深度拆解，或点击右上角录入新素材</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
