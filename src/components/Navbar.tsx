import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  Layers, 
  BookOpen, 
  Palette, 
  BarChart3, 
  ShieldCheck, 
  Plus, 
  ChevronDown, 
  Briefcase, 
  Zap, 
  RefreshCw,
  FolderSync,
  X,
  Brain
} from 'lucide-react';
import { Account } from '../types';
import { CreateAccountModal } from './CreateAccountModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onChangeTab?: (tab: string) => void;
  accounts: Account[];
  activeAccount: Account | null;
  onSelectAccount: (accountId: string) => void;
  onOpenCreateAccount?: () => void;
  onCreateAccount?: (newAcc: Account) => void;
  onOpenAuditModal?: () => void;
  auditHealthScore?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onChangeTab,
  accounts,
  activeAccount,
  onSelectAccount,
  onOpenCreateAccount,
  onCreateAccount,
  onOpenAuditModal,
  auditHealthScore = 88
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showInternalModal, setShowInternalModal] = useState(false);

  const changeTab = (tabId: string) => {
    if (setActiveTab) {
      setActiveTab(tabId);
    } else if (onChangeTab) {
      onChangeTab(tabId);
    }
  };

  const tabs = [
    { id: 'prompt', label: '万能提示词引擎', icon: Zap, badge: '第一性原理' },
    { id: 'positioning', label: '四维账号定位', icon: Compass },
    { id: 'memory', label: '专属记忆库', icon: Brain, badge: 'AI记忆' },
    { id: 'topics', label: '一周选题矩阵', icon: Layers },
    { id: 'knowledge', label: '爆款拆解经验库', icon: BookOpen },
    { id: 'editor', label: 'AI图文与封面编辑器', icon: Palette, badge: '醒图/黄油微调' },
    { id: 'review', label: '作品数据复盘', icon: BarChart3 },
  ];

  const handleOpenCreate = () => {
    setDropdownOpen(false);
    if (onOpenCreateAccount) {
      onOpenCreateAccount();
    } else {
      setShowInternalModal(true);
    }
  };

  const handleCreated = (newAcc: Account) => {
    if (onCreateAccount) {
      onCreateAccount(newAcc);
    }
    setShowInternalModal(false);
    changeTab('positioning');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Account Switcher */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  爆款工作台
                </span>
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  Master OS
                </span>
              </div>
            </div>

            {/* Account Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-xs text-slate-200"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium max-w-[120px] truncate">
                  {activeAccount ? activeAccount.name : '选择账号'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    切换当前工作账号
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          onSelectAccount(acc.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/70 transition-colors ${
                          activeAccount?.id === acc.id ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <div className="truncate">
                          <div className="truncate font-medium">{acc.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{acc.niche}</div>
                        </div>
                        {activeAccount?.id === acc.id && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-700/80 mt-1 pt-1.5 px-2">
                    <button
                      onClick={handleOpenCreate}
                      className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>孵化/新建新账号</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="hidden md:flex items-center space-x-1 overflow-x-auto py-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => changeTab(tab.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-950/20 text-slate-900 font-bold' : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Workflow Health Audit Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (onOpenAuditModal) {
                  onOpenAuditModal();
                } else {
                  changeTab('audit');
                }
              }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all shadow-sm group"
              title="智能自检与闭环监测"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">工作流自检</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-bold">
                {auditHealthScore}分
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap flex-shrink-0 transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* New Account Creation Fallback Modal */}
      <CreateAccountModal
        isOpen={showInternalModal}
        onClose={() => setShowInternalModal(false)}
        onCreateAccount={handleCreated}
      />
    </header>
  );
};
