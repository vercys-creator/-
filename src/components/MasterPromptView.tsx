import React, { useState } from 'react';
import { 
  Zap, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  BrainCircuit, 
  Target, 
  HelpCircle, 
  FileText, 
  ArrowRight, 
  RefreshCw,
  Lightbulb,
  Cpu,
  Layers,
  Compass
} from 'lucide-react';
import { Account } from '../types';

interface MasterPromptViewProps {
  activeAccount: Account | null;
  initialInput?: string;
  onApplyToTopicMatrix?: (keyword: string) => void;
  onApplyToPositioning?: () => void;
}

export const MasterPromptView: React.FC<MasterPromptViewProps> = ({
  activeAccount,
  initialInput,
  onApplyToTopicMatrix,
  onApplyToPositioning
}) => {
  const [rawInput, setRawInput] = useState(initialInput || '');

  React.useEffect(() => {
    if (initialInput) {
      setRawInput(initialInput);
    }
  }, [initialInput]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [parsedSections, setParsedSections] = useState<{
    understanding: string;
    missing: string;
    framework: string;
    masterPrompt: string;
  } | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const presetTemplates = [
    {
      title: '新手起号定位迷茫',
      prompt: '我现在想做一个关于职场搞钱的账号，目前只有一些大厂上班踩坑的零散经历。我发现很多同行都在做副业课程，但我不知道我自己的差异化在哪里，也不懂该怎么切入才能吸引精准粉丝，更担心起号之后没人买单。我最终想得到清晰的定位和变现路径，但不知道怎么从底层拆解。'
    },
    {
      title: '选题枯竭与流量瓶颈',
      prompt: '我目前做AI工具分享账号，发了10篇笔记，前两篇播放量有5000，后面直接掉到200播放。我发现自己不知道下周该发什么选题了，想凭借“工作流自动化”这个关键词深挖出一周有爆款潜力的切入角度，但是不知道用户到底关心什么痛点。'
    },
    {
      title: '看了爆款不知如何拆解',
      prompt: '我看到同赛道有一篇点赞5万的爆款笔记，标题是《普通人逆袭的3个真相》，封面很吸睛，评论区全是求资料的。我想把它拆解成我能复用的文案框架和封面排版，但我不知道除了抄它的话术之外，它的底层转化逻辑和心理钩子是什么。'
    },
    {
      title: '数据低迷需要找出病根',
      prompt: '我上周发了一篇耗费3天写的硬核干货，播放量有8000，但是点赞只有40个，收藏只有15个，评论区只有2个人。我不知道是封面标题的问题，还是正文太长太枯燥，或者开头前3秒没留住人？我需要一套严苛的数据诊断方法。'
    }
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const inputToUse = customPrompt || rawInput;
    if (!inputToUse.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setGeneratedContent(null);
    setParsedSections(null);

    try {
      const response = await fetch('/api/ai/master-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawThoughts: inputToUse,
          accountContext: activeAccount ? {
            name: activeAccount.name,
            niche: activeAccount.niche,
            stage: activeAccount.currentStage,
            positioning: activeAccount.positioning?.oneSentencePitch
          } : undefined
        })
      });

      const data = await response.json();
      if (data.result) {
        setGeneratedContent(data.result);
        parseResponse(data.result);
      } else if (data.error) {
        setErrorMessage(data.error);
      }
    } catch (error: any) {
      console.error('Failed to generate master prompt:', error);
      setErrorMessage(error?.message || '生成 Master Prompt 遇到网络或服务高峰，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const parseResponse = (text: string) => {
    const understandingMatch = text.match(/①\s*你对我真正需求的理解([\s\S]*?)(?=②|$)/i);
    const missingMatch = text.match(/②\s*我的原问题还缺少什么([\s\S]*?)(?=③|$)/i);
    const frameworkMatch = text.match(/③\s*推荐的分析框架([\s\S]*?)(?=④|$)/i);
    const masterPromptMatch = text.match(/④\s*最终\s*Master\s*Prompt([\s\S]*?)$/i);

    setParsedSections({
      understanding: understandingMatch ? understandingMatch[1].trim() : '',
      missing: missingMatch ? missingMatch[1].trim() : '',
      framework: frameworkMatch ? frameworkMatch[1].trim() : '',
      masterPrompt: masterPromptMatch ? masterPromptMatch[1].trim() : text
    });
  };

  const copyToClipboard = (content: string, sectionKey: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner / First Principles Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>第一性原理：万能提示词架构引擎</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              把口语化零散想法，蜕变成降维打击的 Master Prompt
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              无需费心整理结构——把你的真实困惑、初步判断、担心点直接写下。系统将作为你的 AI 提示词架构师，深度提炼核心诉求、补齐缺失维度，并输出可直接复制的极高水准指令。
            </p>
          </div>

          {activeAccount && (
            <div className="flex-shrink-0 bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs">
              <div className="text-slate-400">当前联动账号上下文：</div>
              <div className="font-semibold text-amber-400 mt-0.5">{activeAccount.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">{activeAccount.niche}</div>
            </div>
          )}
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center space-x-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>快速填入高频破局场景：</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {presetTemplates.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setRawInput(preset.prompt);
                handleGenerate(preset.prompt);
              }}
              className="text-left p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-all text-xs group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
                <span>{preset.title}</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </div>
              <div className="text-slate-400 mt-1 line-clamp-2 text-[11px]">
                {preset.prompt}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>输入你的原始想法、困惑与目标（越口语化、越真实越好）</span>
          </label>
          <span className="text-xs text-slate-400">支持自由倾倒所有零散判断与顾虑</span>
        </div>

        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={`例如：\n我现在想做一个________。\n目前已经有________。\n我发现的问题是________。\n我不懂的是________。\n我目前的判断是________。\n我比较担心________。\n我最终想得到的是________。\n但我不知道怎么问 AI 才能得到直击本质的深度方案...`}
          rows={6}
          className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-amber-500 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 leading-relaxed font-mono"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setRawInput('')}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            清空输入
          </button>

          <button
            onClick={() => handleGenerate()}
            disabled={loading || !rawInput.trim()}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI 架构师正在深度拆解与重构...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>生成最终 Master Prompt</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleGenerate()}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-semibold transition-colors"
            >
              点击重试
            </button>
          </div>
        )}
      </div>

      {/* Output Section: The 4-Tier Master Prompt Display */}
      {generatedContent && (
        <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">架构拆解与最终 Master Prompt</h2>
            </div>
            <button
              onClick={() => copyToClipboard(generatedContent, 'all')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copiedSection === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'all' ? '已复制全篇' : '复制完整架构分析'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Section 1: Real Demand Understanding */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  ① 真正需求洞察
                </span>
                <button
                  onClick={() => copyToClipboard(parsedSections?.understanding || '', 's1')}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  {copiedSection === 's1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {parsedSections?.understanding || '解析中...'}
              </div>
            </div>

            {/* Section 2: Missing Dimensions & Blind Spots */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  ② 原问题缺失维度与漏洞
                </span>
                <button
                  onClick={() => copyToClipboard(parsedSections?.missing || '', 's2')}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  {copiedSection === 's2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {parsedSections?.missing || '解析中...'}
              </div>
            </div>

            {/* Section 3: Recommended Framework */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ③ 推荐深度分析框架
                </span>
                <button
                  onClick={() => copyToClipboard(parsedSections?.framework || '', 's3')}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  {copiedSection === 's3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {parsedSections?.framework || '解析中...'}
              </div>
            </div>

          </div>

          {/* Section 4: The Copy-Ready Master Prompt */}
          <div className="rounded-2xl bg-slate-900 border-2 border-amber-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-md bg-amber-500 text-slate-950">
                    ④ 最终 Master Prompt
                  </span>
                  <span className="text-xs text-amber-400 font-medium">可以直接复制到 ChatGPT / Claude / DeepSeek 直接使用</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  具备多专家复合人设、反向质疑机制、量化指标约束与严苛落地执行模板
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(parsedSections?.masterPrompt || generatedContent, 'master')}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                >
                  {copiedSection === 'master' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSection === 'master' ? '已复制 Master Prompt！' : '一键复制 Master Prompt'}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto max-h-[500px]">
                {parsedSections?.masterPrompt || generatedContent}
              </pre>
            </div>

            {/* Quick Workbench Action Pipeline */}
            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400">下一步联动工作台：</span>
              
              {onApplyToPositioning && (
                <button
                  onClick={onApplyToPositioning}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>以此定位账号四维架构</span>
                </button>
              )}

              {onApplyToTopicMatrix && (
                <button
                  onClick={() => onApplyToTopicMatrix(activeAccount?.niche || '爆款破局')}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>以此生成一周爆款选题矩阵</span>
                </button>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
