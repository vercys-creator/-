import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  Calendar, 
  Zap, 
  Layers, 
  BarChart, 
  Award,
  ArrowRight,
  Sliders
} from 'lucide-react';
import { Account, KnowledgeItem, TopicMatrix, DraftPost, DataReviewItem, WorkflowAuditReport } from '../types';

interface WorkflowAuditViewProps {
  activeAccount: Account | null;
  knowledgeBase: KnowledgeItem[];
  topicMatrices: TopicMatrix[];
  draftPosts: DraftPost[];
  dataReviews: DataReviewItem[];
}

export const WorkflowAuditView: React.FC<WorkflowAuditViewProps> = ({
  activeAccount,
  knowledgeBase,
  topicMatrices,
  draftPosts,
  dataReviews
}) => {
  const [loading, setLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<WorkflowAuditReport | null>({
    id: 'audit-initial',
    accountId: activeAccount?.id || 'acc-1',
    createdAt: new Date().toISOString().split('T')[0],
    overallHealthScore: 88,
    systemBottlenecks: [
      '选题矩阵中的反常识与争议性话题偏少，容易导致流量陷入垂直圈层自嗨',
      '封面大字对比度在手机信息流中仍有提升空间，需加强首图前3秒冲击力',
      '评论区引导资料包领取的转化动作话术还可以进一步精简和前置'
    ],
    dimensions: [
      {
        name: '账号定位清晰度与变现闭环',
        score: 92,
        status: 'good',
        findings: '四维定位底盘完整，受众焦虑靶心与后端咨询产品链路清晰。',
        actionItem: '保持每周对照定位校验一次发布内容是否偏离赛道。'
      },
      {
        name: '选题矩阵与情绪唤醒多样性',
        score: 84,
        status: 'warning',
        findings: '干货SOP类选题占比较高，避坑吐槽类与颠覆认知类选题覆盖率偏低。',
        actionItem: '在选题池中引入 30% 情绪破防或反常识认知选题以扩大公域破圈。'
      },
      {
        name: '经验库沉淀与公式复用率',
        score: 90,
        status: 'good',
        findings: '已建立手术刀级拆解框架，并提炼了可填空的爆款文案模板。',
        actionItem: '每看到同赛道百万赞爆款，第一时间录入拆解并标记标签。'
      },
      {
        name: '封面视觉辨识度与排版工业化',
        score: 86,
        status: 'good',
        findings: '封面采用了黑底黄字高对比度版式与贴纸微调，符合主流审美。',
        actionItem: '主标题控制在 10 字以内，副标题补充具体痛点。'
      },
      {
        name: '数据闭环与迭代敏捷度',
        score: 88,
        status: 'good',
        findings: '建立了收赞比与互动率监控，能够根据单篇数据自动输出下一次优化 Prompt。',
        actionItem: '坚持每周固定时间复盘近 7 天发帖数据并淘汰低效角度。'
      }
    ],
    next7DaysSprintPlan: [
      'Day 1-2：针对本赛道深挖 1 套包含“颠覆认知”与“避坑必看”的 7 天选题矩阵',
      'Day 3-4：运用 AI 创作台生成 3 篇图文，并在封面编辑器中精细调优 3:4 比例首图',
      'Day 5-6：发布第一批测试笔记，并在 24 小时后导入播放与收赞比数据进行诊断',
      'Day 7：召开一人工作流复盘会，更新经验库万能模板'
    ],
    masterPromptEvolutionSuggestion:
      '建议在万能提示词引擎中增加【受众情绪烈度】与【评论区钩子自动化匹配】两条先验参数。'
  });

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/workflow-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: activeAccount?.name || '主创作者账号',
          positioningSet: !!activeAccount?.positioning,
          knowledgeItemCount: knowledgeBase.length,
          topicMatrixCount: topicMatrices.length,
          draftPostCount: draftPosts.length,
          dataReviewCount: dataReviews.length,
          recentMetricsSummary: {
            totalReviewedPosts: dataReviews.length,
            averageEngagement: '9.2%'
          }
        })
      });

      const data = await response.json();
      if (data.result) {
        setAuditReport(data.result);
      }
    } catch (error) {
      console.error('Failed to run workflow audit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>一人企业·全链路工作流健康审计</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              自动监测【定位-选题-拆解-创作-复盘】全流程，出具诊断报告
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              AI 专家全面体检系统堵点，给出综合健康分、三大核心瓶颈与未来7天冲刺执行计划。
            </p>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex-shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI 正在全局扫描工作流...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>立即运行工作流全景审计</span>
              </>
            )}
          </button>
        </div>
      </div>

      {auditReport && (
        <div className="space-y-6">
          
          {/* Top Score & Bottleneck Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Score Card (4 Cols) */}
            <div className="md:col-span-4 rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <div className="text-4xl font-extrabold text-white tracking-tight">
                {auditReport.overallHealthScore}
                <span className="text-lg font-normal text-slate-400 ml-1">/ 100</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mt-1">
                工作流全景健康指数
              </span>
              <p className="text-[11px] text-slate-400 mt-2 max-w-xs leading-relaxed">
                定位清晰度、选题储备、经验库沉淀与数据反馈机制均处于高效健康运行状态。
              </p>
            </div>

            {/* Top 3 Bottlenecks (8 Cols) */}
            <div className="md:col-span-8 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 border-b border-slate-800 pb-3">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white">当前系统暴露的 3 大核心瓶颈与阻碍</h3>
              </div>

              <div className="space-y-2 text-xs">
                {auditReport.systemBottlenecks.map((btn, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-slate-200 flex items-start space-x-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{btn}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 5 Dimensional Health Breakdown */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">五大创作子系统健康度体检</h3>
              </div>
              <span className="text-xs text-slate-500">审计周期：近 7 天</span>
            </div>

            <div className="space-y-3">
              {auditReport.dimensions.map((dim, idx) => {
                const isGood = dim.status === 'good';
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isGood ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        )}
                        <span className="text-xs font-bold text-white">{dim.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {dim.score}分
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            isGood ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isGood ? '正常达标' : '重点优化'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed pl-6">
                      {dim.findings}
                    </p>

                    <div className="pl-6 text-xs text-amber-400/90 font-medium">
                      💡 改进建议：{dim.actionItem}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Sprint Plan & Master Prompt Suggestion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 7-Day Sprint */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-slate-800 pb-3">
                <Calendar className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white">未来 7 天创作者冲刺执行清单</h3>
              </div>

              <div className="space-y-2 text-xs">
                {auditReport.next7DaysSprintPlan.map((sprint, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-start space-x-2"
                  >
                    <span className="text-amber-400 font-bold">•</span>
                    <span className="leading-relaxed">{sprint}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Master Prompt Evolution */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-purple-400 border-b border-slate-800 pb-3">
                <Zap className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white">万能提示词引擎迭代方向</h3>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed font-sans">
                {auditReport.masterPromptEvolutionSuggestion}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs leading-relaxed">
                💡 
                工作台设计的第一性原则，就是通过持续复盘反哺底层 Prompt
                架构，让你输入的原始口语越来越省力，输出的爆款质量越来越稳定。
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
