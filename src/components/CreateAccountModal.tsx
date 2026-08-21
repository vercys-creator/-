import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Plus, 
  X, 
  Briefcase, 
  Globe, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Layers, 
  Compass,
  CheckCircle2
} from 'lucide-react';
import { Account } from '../types';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAccount: (account: Account) => void;
  onNavigateToPositioning?: () => void;
}

const NICHE_PRESETS = [
  {
    name: '个人商业化 / 职场破局',
    platform: '小红书 + 微信公众号',
    stage: '0-1万粉探索期',
    inspiration: '大厂/资深职场经历，通过拆解高客单咨询与一人企业变现逻辑，吸引高净值白领转型。'
  },
  {
    name: 'AI与效率生产力工具',
    platform: '小红书 + 抖音/视频号',
    stage: '起步破局期 (0-1万粉)',
    inspiration: '聚焦最新AI大模型与自动化工作流，输出保姆级实操SOP，变现知识社群与定制开发。'
  },
  {
    name: '副业实操与搞钱复盘',
    platform: '小红书 + 公众号',
    stage: '起步探索期',
    inspiration: '真金白银实操避坑指南，以真实数据复盘建立强信任感，沉淀私域客群。'
  },
  {
    name: '深度读书与认知升级',
    platform: '微信读书 + 视频号 + 小红书',
    stage: '成长期 (1-5万粉)',
    inspiration: '反常识认知切片+金句拆解，输出高信息密度脑图与书单，主打知识付费与训练营。'
  }
];

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onCreateAccount,
  onNavigateToPositioning
}) => {
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('个人商业化 / 职场破局');
  const [platform, setPlatform] = useState('小红书 / 微信公众号');
  const [stage, setStage] = useState('0-1万粉探索期');
  const [inspiration, setInspiration] = useState('');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number | null>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus on opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApplyPreset = (idx: number) => {
    const preset = NICHE_PRESETS[idx];
    setSelectedPresetIdx(idx);
    setNiche(preset.name);
    setPlatform(preset.platform);
    setStage(preset.stage);
    setInspiration(preset.inspiration);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      name: name.trim(),
      avatarIcon: 'Sparkles',
      niche: niche.trim(),
      targetPlatform: platform.trim(),
      currentStage: stage.trim(),
      inspiration: inspiration.trim(),
      positioning: {
        targetAudience: { primary: '', painPoints: [], desires: [] },
        personaAndTrust: { identity: '', tone: '', trustAnchor: '', slogan: '' },
        monetization: { frontend: '', backend: '', funnelLogic: '' },
        contentAndVisual: { primaryFormat: '', visualStyle: '', contentPillars: [] },
        oneSentencePitch: ''
      },
      createdAt: new Date().toISOString().split('T')[0]
    };

    onCreateAccount(newAccount);
    onClose();
    setName('');
    setInspiration('');

    if (onNavigateToPositioning) {
      onNavigateToPositioning();
    }
  };

  return (
    <div 
      id="create-account-global-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-account-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/80 p-6 sm:p-8 my-auto max-h-[92vh] overflow-y-auto z-10 text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="create-account-modal-title" className="text-lg font-bold text-white flex items-center space-x-2">
                <span>新建 / 孵化矩阵工作账号</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  多账号隔离
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                创建独立的内容IP定位、选题库与爆款经验沉淀系统
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="关闭窗口"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5 text-xs">
          
          {/* Quick Preset Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2 flex items-center justify-between">
              <span>快速选择赛道预设模板（一键填入）：</span>
              <span className="text-[11px] text-amber-400 font-normal">点击自动匹配行业经验</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {NICHE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(idx)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    selectedPresetIdx === idx
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-200'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-100 mb-0.5">
                    <span className="truncate">{preset.name}</span>
                    {selectedPresetIdx === idx && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{preset.platform} · {preset.stage}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-slate-200 font-semibold mb-1.5 flex items-center justify-between">
              <span>账号名称 / IP昵称 <span className="text-rose-400">*</span></span>
              <span className="text-[11px] text-slate-400">必填</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：老张商业认知、AI效率破局、一人企业实验周刊"
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all text-xs font-medium"
            />
          </div>

          {/* Domain & Stage in 2 Cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-200 font-semibold mb-1.5 flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>赛道领域 / 细分定位</span>
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="例如：个人商业化 / 职场跃迁"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1.5 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>主要发布平台</span>
              </label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="例如：小红书 + 微信公众号"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1.5 flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>当前账号发展阶段</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['起步探索期 (0-1万粉)', '稳步增长突破期 (1-5万粉)', '规模矩阵商业化 (5万粉+)'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-medium border text-center transition-all ${
                    stage === s
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Inspiration / Vision */}
          <div>
            <label className="block text-slate-200 font-semibold mb-1.5 flex items-center space-x-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>个人核心优势与变现构想 (选填)</span>
            </label>
            <textarea
              rows={3}
              value={inspiration}
              onChange={(e) => setInspiration(e.target.value)}
              placeholder="例如：5年资深大厂运营经验，深谙私域转化与用户心理；计划通过高密度干货拆解建立专业信任，沉淀后端高客单咨询..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all text-xs resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-lg shadow-orange-500/25 transition-all disabled:opacity-40 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>立即创建并开启定位</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
