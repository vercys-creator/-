import React, { useState } from 'react';
import { 
  BarChart3, 
  Plus, 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  Link2, 
  Calendar, 
  Eye, 
  Heart, 
  Bookmark, 
  MessageCircle, 
  Share2, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Trash2,
  Sliders,
  ArrowRight,
  Download,
  FileSpreadsheet,
  FileCode,
  Filter,
  Check
} from 'lucide-react';
import { Account, DataReviewItem } from '../types';

interface DataReviewViewProps {
  activeAccount: Account | null;
  dataReviews: DataReviewItem[];
  onAddReview: (review: DataReviewItem) => void;
  onDeleteReview: (id: string) => void;
  onSendIterativePromptToMaster?: (prompt: string) => void;
}

export const DataReviewView: React.FC<DataReviewViewProps> = ({
  activeAccount,
  dataReviews,
  onAddReview,
  onDeleteReview,
  onSendIterativePromptToMaster
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');
  const [filterByAccount, setFilterByAccount] = useState<boolean>(true);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Filter reviews by account or all
  const displayedReviews = filterByAccount && activeAccount
    ? dataReviews.filter(r => !r.accountId || r.accountId === activeAccount.id)
    : dataReviews;

  const [selectedReview, setSelectedReview] = useState<DataReviewItem | null>(
    displayedReviews[0] || dataReviews[0] || null
  );

  // Form State
  const [postTitle, setPostTitle] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [platform, setPlatform] = useState('小红书');
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [views, setViews] = useState<number>(5000);
  const [likes, setLikes] = useState<number>(280);
  const [comments, setComments] = useState<number>(35);
  const [collects, setCollects] = useState<number>(340);
  const [shares, setShares] = useState<number>(45);
  const [conversions, setConversions] = useState<number>(12);
  const [loading, setLoading] = useState(false);

  // Real-time metric calculation for form
  const currentEngagementRate = views > 0
    ? (((likes + comments + collects + shares) / views) * 100).toFixed(1)
    : '0.0';
  const currentCollectToLike = likes > 0
    ? (collects / likes).toFixed(2)
    : '0.00';

  const handleDiagnoseAndSave = async () => {
    if (!postTitle.trim()) return;

    setLoading(true);
    const postPayload = {
      postTitle,
      postUrl,
      platform,
      publishDate,
      views,
      likes,
      comments,
      collects,
      shares,
      conversions,
      accountNiche: activeAccount?.niche || '通用'
    };

    try {
      const response = await fetch('/api/ai/data-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postData: postPayload,
          historicalAverage: {
            avgViews: 8000,
            avgEngagementRate: '8.5%',
            avgCollectToLike: '0.85'
          }
        })
      });

      const data = await response.json();
      if (data.result) {
        const newReview: DataReviewItem = {
          id: `rev-${Date.now()}`,
          accountId: activeAccount?.id || 'acc-1',
          postTitle,
          postUrl,
          platform,
          publishDate,
          views,
          likes,
          comments,
          collects,
          shares,
          conversions,
          diagnosis: data.result,
          createdAt: new Date().toISOString().split('T')[0]
        };

        onAddReview(newReview);
        setSelectedReview(newReview);
        setIsAddingNew(false);

        // Reset
        setPostTitle('');
        setPostUrl('');
      }
    } catch (error) {
      console.error('Failed to run data review diagnosis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper for CSV export
  const exportToCSV = () => {
    const targetItems = exportScope === 'current' && activeAccount
      ? dataReviews.filter(r => !r.accountId || r.accountId === activeAccount.id)
      : dataReviews;

    if (targetItems.length === 0) {
      alert('暂无符合条件的数据复盘记录可导出');
      return;
    }

    const headers = [
      '序号',
      '所属账号',
      '作品标题',
      '发布平台',
      '发布日期',
      '作品在线链接',
      '播放/浏览量',
      '点赞数',
      '评论数',
      '收藏数',
      '转发数',
      '转化线索数',
      '互动率(%)',
      '赞藏比',
      '评级表现',
      '核心瓶颈定位',
      '封面与标题诊断',
      '开头Hook诊断',
      '互动与转化诊断',
      '下次迭代Prompt建议'
    ];

    const escapeCsvField = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = targetItems.map((item, idx) => {
      const rate = (((item.likes + item.comments + item.collects + item.shares) / (item.views || 1)) * 100).toFixed(2);
      const collectLike = (item.collects / (item.likes || 1)).toFixed(2);
      const diag = item.diagnosis;

      return [
        idx + 1,
        activeAccount?.name || item.accountId || '默认账号',
        item.postTitle,
        item.platform,
        item.publishDate,
        item.postUrl || '',
        item.views,
        item.likes,
        item.comments,
        item.collects,
        item.shares,
        item.conversions,
        rate,
        collectLike,
        diag?.performanceLevel || '',
        diag?.coreBottleneck || '',
        diag?.deepDiagnosis?.coverAndTitle || '',
        diag?.deepDiagnosis?.contentAndHook || '',
        diag?.deepDiagnosis?.ctaAndConversion || '',
        diag?.iterativePromptForNextPost || ''
      ].map(escapeCsvField).join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsvField).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${activeAccount?.name || '全量账号'}_数据复盘汇总_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportMenu(false);
    setExportSuccessMsg(`已成功导出 ${targetItems.length} 条复盘记录为 CSV`);
    setTimeout(() => setExportSuccessMsg(null), 3000);
  };

  // Helper for JSON export
  const exportToJSON = () => {
    const targetItems = exportScope === 'current' && activeAccount
      ? dataReviews.filter(r => !r.accountId || r.accountId === activeAccount.id)
      : dataReviews;

    if (targetItems.length === 0) {
      alert('暂无符合条件的数据复盘记录可导出');
      return;
    }

    const exportPayload = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        accountName: activeAccount?.name || '全量账号',
        accountId: activeAccount?.id || 'all',
        totalRecords: targetItems.length,
        version: '1.0.0'
      },
      records: targetItems
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${activeAccount?.name || '全量账号'}_数据复盘汇总_${new Date().toISOString().split('T')[0]}.json`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportMenu(false);
    setExportSuccessMsg(`已成功导出 ${targetItems.length} 条复盘记录为 JSON`);
    setTimeout(() => setExportSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>数据导入与定期深度复盘系统</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              导入作品数据与链接，AI 找出病根并输出下一次优化 Prompt
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              通过互动率、收藏点赞比与完读率算法，精准判断是封面/标题差、还是正文不留人、还是CTA漏斗缺失。支持一键导出 CSV / JSON 供外部数据洞察。
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                id="export-data-reviews-btn"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>导出复盘记录</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white">选择导出范围与格式</span>
                    <span className="text-[11px] text-slate-400">
                      共 {displayedReviews.length} 条记录
                    </span>
                  </div>

                  {/* Scope Selector */}
                  <div className="space-y-1.5 text-xs">
                    <label className="text-slate-400 text-[11px] block font-medium">数据导出范围：</label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setExportScope('current')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                          exportScope === 'current'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        当前账号 ({activeAccount ? dataReviews.filter(r => !r.accountId || r.accountId === activeAccount.id).length : 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportScope('all')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                          exportScope === 'all'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        全部账号 ({dataReviews.length})
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      id="export-csv-btn"
                      type="button"
                      onClick={exportToCSV}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-white text-xs font-medium transition-all group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <div className="font-bold text-slate-100">导出为 CSV 表格</div>
                          <div className="text-[10px] text-slate-400">适配 Excel、Numbers、飞书多维表格</div>
                        </div>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
                    </button>

                    <button
                      id="export-json-btn"
                      type="button"
                      onClick={exportToJSON}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-white text-xs font-medium transition-all group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FileCode className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <div className="font-bold text-slate-100">导出为 JSON 文件</div>
                          <div className="text-[10px] text-slate-400">保留完整多维度结构化诊断数据</div>
                        </div>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>导入新作品数据复盘</span>
            </button>
          </div>
        </div>

        {/* Export Success Banner */}
        {exportSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Add New Data Review Form */}
      {isAddingNew && (
        <div className="rounded-2xl bg-slate-900 border-2 border-amber-500/40 p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">导入已发布作品与实际数据</h2>
            </div>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              取消
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-300 mb-1">作品标题</label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="例如：裸辞半年，我靠一人公司月入5W的5条冷酷真相"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">发布平台</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="小红书">小红书</option>
                <option value="抖音/快手">抖音 / 快手</option>
                <option value="微信视频号">微信视频号</option>
                <option value="微信公众号">微信公众号</option>
                <option value="B站">B站</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-300 mb-1">作品在线链接 (URL)</label>
              <input
                type="text"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://xhslink.com/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">发布日期</label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>

          {/* Metric Inputs Grid */}
          <div>
            <div className="text-xs font-bold text-amber-400 mb-2 flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>输入平台后台核心数据看板：</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">播放 / 浏览量</span>
                <input
                  type="number"
                  value={views}
                  onChange={(e) => setViews(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">点赞数</span>
                <input
                  type="number"
                  value={likes}
                  onChange={(e) => setLikes(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">评论数</span>
                <input
                  type="number"
                  value={comments}
                  onChange={(e) => setComments(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">收藏数</span>
                <input
                  type="number"
                  value={collects}
                  onChange={(e) => setCollects(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">转发 / 分享数</span>
                <input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">私信 / 转化线索数</span>
                <input
                  type="number"
                  value={conversions}
                  onChange={(e) => setConversions(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-bold"
                />
              </div>
            </div>

            {/* Calculated Real-time Ratio Preview */}
            <div className="mt-3 flex items-center space-x-4 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <div>
                <span>实时互动率：</span>
                <strong className="text-amber-400 ml-1">{currentEngagementRate}%</strong>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span>收藏点赞比：</span>
                <strong className={`ml-1 ${Number(currentCollectToLike) >= 1 ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {currentCollectToLike} {Number(currentCollectToLike) >= 1 ? '(硬核干货)' : ''}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleDiagnoseAndSave}
              disabled={loading || !postTitle.trim()}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI 正在手术刀级复盘诊断...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>AI 诊断病根并输出改进清单</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Review Grid: List on Left, Diagnostic Report on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Published Posts List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>已复盘作品 ({displayedReviews.length})</span>
              {activeAccount && (
                <button
                  type="button"
                  onClick={() => setFilterByAccount(!filterByAccount)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center space-x-1 transition-colors ${
                    filterByAccount
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  <span>{filterByAccount ? `当前: ${activeAccount.name}` : '全部账号'}</span>
                </button>
              )}
            </div>
            <span className="text-[11px] text-slate-500">点击查看诊断</span>
          </div>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {displayedReviews.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                当前账号暂无复盘记录，可点击上方按钮导入
              </div>
            ) : (
              displayedReviews.map((rev) => {
                const isSelected = selectedReview?.id === rev.id;
                const rate = (((rev.likes + rev.comments + rev.collects + rev.shares) / (rev.views || 1)) * 100).toFixed(1);
                const collectLike = (rev.collects / (rev.likes || 1)).toFixed(2);
                
                const isSLevel = rev.diagnosis?.performanceLevel?.includes('S级');
                const isCLevel = rev.diagnosis?.performanceLevel?.includes('C级');

                return (
                  <div
                    key={rev.id}
                    onClick={() => setSelectedReview(rev)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold mr-1.5 ${
                          isSLevel ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          isCLevel ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {rev.diagnosis?.performanceLevel?.slice(0, 5) || '已复盘'}
                        </span>
                        <span className="text-xs font-bold text-slate-100">{rev.postTitle}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteReview(rev.id);
                          if (selectedReview?.id === rev.id) setSelectedReview(null);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metrics Bar */}
                    <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 text-[10px] block">浏览</span>
                        <span className="font-bold text-slate-200">{rev.views}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">点赞</span>
                        <span className="font-bold text-slate-200">{rev.likes}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">收藏</span>
                        <span className="font-bold text-slate-200">{rev.collects}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">互动率</span>
                        <span className="font-bold text-amber-400">{rate}%</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{rev.platform} · {rev.publishDate}</span>
                      <span>收赞比: {collectLike}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Diagnostic Report */}
        <div className="lg:col-span-7">
          {selectedReview && selectedReview.diagnosis ? (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
              
              {/* Header Badge & Title */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-500 text-slate-950">
                      {selectedReview.diagnosis.performanceLevel}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      互动率: {selectedReview.diagnosis.calculatedMetrics?.engagementRate} · 收赞比: {selectedReview.diagnosis.calculatedMetrics?.collectToLikeRatio}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1.5">
                    {selectedReview.postTitle}
                  </h2>
                </div>

                {selectedReview.postUrl && (
                  <a
                    href={selectedReview.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-xs text-amber-400 hover:underline flex-shrink-0"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>查看原帖</span>
                  </a>
                )}
              </div>

              {/* Core Bottleneck Alert */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                <div className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>最大核心瓶颈与病根定位：</span>
                </div>
                <p className="text-xs text-rose-100 font-medium leading-relaxed">
                  {selectedReview.diagnosis.coreBottleneck}
                </p>
              </div>

              {/* Deep Diagnosis Across 3 Stages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-blue-400">1. 封面与标题点击率：</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedReview.diagnosis.deepDiagnosis?.coverAndTitle}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400">2. 开头Hook与完读率：</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedReview.diagnosis.deepDiagnosis?.contentAndHook}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400">3. 互动率与商业转化：</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedReview.diagnosis.deepDiagnosis?.ctaAndConversion}
                  </p>
                </div>

              </div>

              {/* Actionable Fixes (P0, P1, P2) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-200">优先级改进清单（下一次发帖前必改）：</span>
                <div className="space-y-2">
                  {selectedReview.diagnosis.actionableFixes?.map((fix, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                            {fix.priority}
                          </span>
                          <span className="font-bold text-slate-100">{fix.action}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 pl-8">
                          预期收益：{fix.expectedImpact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Iterative Prompt for Next Post */}
              {selectedReview.diagnosis.iterativePromptForNextPost && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">
                      🔄 针对本次复盘为下篇定制的优化 Prompt 建议：
                    </span>
                    {onSendIterativePromptToMaster && (
                      <button
                        onClick={() =>
                          onSendIterativePromptToMaster(
                            selectedReview.diagnosis!.iterativePromptForNextPost
                          )
                        }
                        className="text-xs text-amber-400 hover:text-amber-200 font-semibold underline flex items-center space-x-1"
                      >
                        <span>带入万能提示词引擎 →</span>
                      </button>
                    )}
                  </div>
                  <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {selectedReview.diagnosis.iterativePromptForNextPost}
                  </pre>
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 p-12 text-center text-slate-500">
              <BarChart3 className="w-10 h-10 mx-auto text-slate-700 mb-2" />
              <p className="text-xs">在左侧选择一篇作品查看复盘报告，或点击右上角导入新数据</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
