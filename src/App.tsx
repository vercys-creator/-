import React, { useState, useEffect } from 'react';
import { 
  getAccounts, 
  saveAccounts, 
  getActiveAccountId, 
  saveActiveAccountId, 
  getKnowledgeItems, 
  saveKnowledgeItems, 
  getTopicMatrices, 
  saveTopicMatrices, 
  getDraftPosts, 
  saveDraftPosts, 
  getDataReviews, 
  saveDataReviews,
  getAccountMemories,
  saveAccountMemories
} from './utils/storage';
import { Account, KnowledgeItem, TopicMatrix, DraftPost, DataReviewItem, TopicDay, AccountMemoryItem } from './types';
import { Navbar } from './components/Navbar';
import { CreateAccountModal } from './components/CreateAccountModal';
import { MasterPromptView } from './components/MasterPromptView';
import { AccountPositioningView } from './components/AccountPositioningView';
import { AccountMemoryView } from './components/AccountMemoryView';
import { TopicMatrixView } from './components/TopicMatrixView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { ContentEditorView } from './components/ContentEditorView';
import { DataReviewView } from './components/DataReviewView';
import { WorkflowAuditView } from './components/WorkflowAuditView';
import { FloatingInspirationQuickCapture } from './components/FloatingInspirationQuickCapture';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    'prompt' | 'positioning' | 'memory' | 'topics' | 'knowledge' | 'editor' | 'review' | 'audit'
  >('prompt');

  // Multi-Account Data States
  const [accounts, setAccounts] = useState<Account[]>(() => getAccounts());
  const [activeAccountId, setActiveAccountId] = useState<string>(() => getActiveAccountId());
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>(() => getKnowledgeItems());
  const [accountMemories, setAccountMemories] = useState<AccountMemoryItem[]>(() => getAccountMemories());
  const [topicMatrices, setTopicMatrices] = useState<TopicMatrix[]>(() => getTopicMatrices());
  const [draftPosts, setDraftPosts] = useState<DraftPost[]>(() => getDraftPosts());
  const [dataReviews, setDataReviews] = useState<DataReviewItem[]>(() => getDataReviews());

  // Editor Cross-module prefill states
  const [editorPrefill, setEditorPrefill] = useState<{
    topic?: string;
    angle?: string;
    template?: string;
    visualSpec?: any;
    referenceImage?: string;
  }>({});

  // Master prompt prefill state
  const [masterPromptPrefill, setMasterPromptPrefill] = useState<string>('');

  // Global Create Account Modal State
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  // Active account object
  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0] || null;

  // Persist handlers
  const handleSelectAccount = (id: string) => {
    setActiveAccountId(id);
    saveActiveAccountId(id);
  };

  const handleCreateAccount = (newAcc: Account) => {
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    saveAccounts(updated);
    setActiveAccountId(newAcc.id);
    saveActiveAccountId(newAcc.id);
  };

  const handleUpdateAccount = (updatedAcc: Account) => {
    const updated = accounts.map((a) => (a.id === updatedAcc.id ? updatedAcc : a));
    setAccounts(updated);
    saveAccounts(updated);
  };

  const handleSaveTopicMatrix = (matrix: TopicMatrix) => {
    const updated = [matrix, ...topicMatrices];
    setTopicMatrices(updated);
    saveTopicMatrices(updated);
  };

  const handleAddMemory = (memory: AccountMemoryItem) => {
    const updated = [memory, ...accountMemories];
    setAccountMemories(updated);
    saveAccountMemories(updated);
  };

  const handleUpdateMemory = (updatedItem: AccountMemoryItem) => {
    const updated = accountMemories.map((m) => (m.id === updatedItem.id ? updatedItem : m));
    setAccountMemories(updated);
    saveAccountMemories(updated);
  };

  const handleDeleteMemory = (id: string) => {
    const updated = accountMemories.filter((m) => m.id !== id);
    setAccountMemories(updated);
    saveAccountMemories(updated);
  };

  const handleToggleMemory = (id: string) => {
    const updated = accountMemories.map((m) => (m.id === id ? { ...m, isEnabled: !m.isEnabled } : m));
    setAccountMemories(updated);
    saveAccountMemories(updated);
  };

  const handleAddKnowledgeItem = (item: KnowledgeItem) => {
    const updated = [item, ...knowledgeBase];
    setKnowledgeBase(updated);
    saveKnowledgeItems(updated);
  };

  const handleDeleteKnowledgeItem = (id: string) => {
    const updated = knowledgeBase.filter((k) => k.id !== id);
    setKnowledgeBase(updated);
    saveKnowledgeItems(updated);
  };

  const handleSaveDraftPost = (post: DraftPost) => {
    const updated = [post, ...draftPosts.filter((p) => p.id !== post.id)];
    setDraftPosts(updated);
    saveDraftPosts(updated);
  };

  const handleAddReview = (review: DataReviewItem) => {
    const updated = [review, ...dataReviews];
    setDataReviews(updated);
    saveDataReviews(updated);
  };

  const handleDeleteReview = (id: string) => {
    const updated = dataReviews.filter((r) => r.id !== id);
    setDataReviews(updated);
    saveDataReviews(updated);
  };

  // Cross-module actions
  const handleNavigateToTopics = (keyword: string) => {
    setActiveTab('topics');
  };

  const handleSendTopicToEditor = (topic: TopicDay, keyword: string) => {
    setEditorPrefill({
      topic: topic.headlineOptions[0] || `${keyword} · ${topic.angleType}`,
      angle: topic.targetEmotion || topic.angleType
    });
    setActiveTab('editor');
  };

  const handleApplyTemplateToEditor = (
    template: string, 
    title: string, 
    visualSpec?: any, 
    referenceImage?: string
  ) => {
    setEditorPrefill({
      topic: `基于【${title}】的爆款仿写`,
      template,
      visualSpec,
      referenceImage
    });
    setActiveTab('editor');
  };

  // Knowledge Base deep sync handlers
  const handleSyncToCoverEditor = (item: KnowledgeItem) => {
    setEditorPrefill({
      topic: item.title,
      template: item.deconstruction?.reusableTemplate || item.bodyContent,
      visualSpec: item.visualSpec,
      referenceImage: item.referenceImage
    });
    setActiveTab('editor');
  };

  const handleSyncToTopicMatrix = (item: KnowledgeItem) => {
    setActiveTab('topics');
  };

  const handleSyncToPositioning = (item: KnowledgeItem) => {
    setActiveTab('positioning');
  };

  const handleSyncToMasterPrompt = (item: KnowledgeItem) => {
    if (item.reversePrompt) {
      setMasterPromptPrefill(item.reversePrompt);
    } else {
      const hook = item.deconstruction?.hookPattern?.formula || item.coverText || '痛点反常识';
      const notes = item.myInsights || item.deconstruction?.coreLogic || '分步实操拆解';
      setMasterPromptPrefill(`请基于爆款经验【${item.title}】的拆解逻辑：\n核心钩子：${hook}\n逻辑骨架：${notes}\n生成一套适配我账号的高转化母指令与创作工作流。`);
    }
    setActiveTab('prompt');
  };

  const handleNavigateToDataReview = (post: DraftPost) => {
    setActiveTab('review');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 pb-16">
      
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onChangeTab={setActiveTab}
        accounts={accounts}
        activeAccount={activeAccount}
        onSelectAccount={handleSelectAccount}
        onOpenCreateAccount={() => setIsCreateAccountOpen(true)}
        onCreateAccount={handleCreateAccount}
      />

      {/* Main App Stage */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {activeTab === 'prompt' && (
          <MasterPromptView
            activeAccount={activeAccount}
            initialInput={masterPromptPrefill}
            onApplyToPositioning={() => setActiveTab('positioning')}
            onApplyToTopicMatrix={(kw) => {
              setActiveTab('topics');
            }}
          />
        )}

        {activeTab === 'positioning' && (
          <AccountPositioningView
            activeAccount={activeAccount}
            onUpdateAccount={handleUpdateAccount}
            onNavigateToTopics={handleNavigateToTopics}
            onOpenCreateAccount={() => setIsCreateAccountOpen(true)}
            onNavigateToMemory={() => setActiveTab('memory')}
            accountMemoriesCount={(accountMemories || []).filter((m) => m.accountId === activeAccount?.id || m.accountId === 'global' || !m.accountId).length}
          />
        )}

        {activeTab === 'memory' && (
          <AccountMemoryView
            activeAccount={activeAccount}
            accounts={accounts}
            memories={accountMemories}
            onSaveMemories={(updated) => {
              setAccountMemories(updated);
              saveAccountMemories(updated);
            }}
            onNavigateToTopics={(kw) => {
              setActiveTab('topics');
            }}
          />
        )}

        {activeTab === 'topics' && (
          <TopicMatrixView
            activeAccount={activeAccount}
            topicMatrices={topicMatrices}
            accountMemories={accountMemories}
            onSaveTopicMatrix={handleSaveTopicMatrix}
            onSendToEditor={handleSendTopicToEditor}
            onToggleMemory={handleToggleMemory}
            onNavigateToMemory={() => setActiveTab('memory')}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseView
            activeAccount={activeAccount}
            knowledgeBase={knowledgeBase}
            onAddKnowledgeItem={handleAddKnowledgeItem}
            onDeleteKnowledgeItem={handleDeleteKnowledgeItem}
            onApplyTemplateToEditor={handleApplyTemplateToEditor}
            onSyncToCoverEditor={handleSyncToCoverEditor}
            onSyncToTopicMatrix={handleSyncToTopicMatrix}
            onSyncToPositioning={handleSyncToPositioning}
            onSyncToMasterPrompt={handleSyncToMasterPrompt}
          />
        )}

        {activeTab === 'editor' && (
          <ContentEditorView
            activeAccount={activeAccount}
            initialTopic={editorPrefill.topic}
            initialAngle={editorPrefill.angle}
            initialTemplate={editorPrefill.template}
            initialVisualSpec={editorPrefill.visualSpec}
            initialReferenceImage={editorPrefill.referenceImage}
            knowledgeBase={knowledgeBase}
            onSaveDraftPost={handleSaveDraftPost}
            onNavigateToDataReview={handleNavigateToDataReview}
          />
        )}

        {activeTab === 'review' && (
          <DataReviewView
            activeAccount={activeAccount}
            dataReviews={dataReviews}
            onAddReview={handleAddReview}
            onDeleteReview={handleDeleteReview}
            onSendIterativePromptToMaster={(prompt) => {
              setMasterPromptPrefill(prompt);
              setActiveTab('prompt');
            }}
          />
        )}

        {activeTab === 'audit' && (
          <WorkflowAuditView
            activeAccount={activeAccount}
            knowledgeBase={knowledgeBase}
            topicMatrices={topicMatrices}
            draftPosts={draftPosts}
            dataReviews={dataReviews}
          />
        )}

      </main>

      {/* Floating Global Quick Entry for Inspirations & Viewpoints */}
      <FloatingInspirationQuickCapture
        activeAccount={activeAccount}
        knowledgeBase={knowledgeBase}
        onAddKnowledgeItem={handleAddKnowledgeItem}
        onNavigateToKnowledge={() => setActiveTab('knowledge')}
        onNavigateToEditor={handleApplyTemplateToEditor}
      />

      {/* Global Top-Level Create Account Modal (z-[9999] Stacking Guarantee) */}
      <CreateAccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        onCreateAccount={handleCreateAccount}
        onNavigateToPositioning={() => setActiveTab('positioning')}
      />

    </div>
  );
}
