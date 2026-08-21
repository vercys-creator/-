import { Account, KnowledgeItem, TopicMatrix, DraftPost, DataReviewItem, CapturedIdea, InspirationNote, AccountMemoryItem } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_KNOWLEDGE_BASE, INITIAL_TOPIC_MATRIX, INITIAL_DRAFT_POSTS, INITIAL_DATA_REVIEWS, INITIAL_CAPTURED_IDEAS, INITIAL_ACCOUNT_MEMORIES } from '../data/initialData';

const STORAGE_KEYS = {
  ACCOUNTS: 'creator_os_accounts_v1',
  ACTIVE_ACCOUNT_ID: 'creator_os_active_account_id_v1',
  ACCOUNT_MEMORIES: 'creator_os_account_memories_v1',
  KNOWLEDGE_BASE: 'creator_os_knowledge_base_v1',
  TOPIC_MATRICES: 'creator_os_topic_matrices_v1',
  DRAFT_POSTS: 'creator_os_draft_posts_v1',
  DATA_REVIEWS: 'creator_os_data_reviews_v1',
  MASTER_PROMPTS_HISTORY: 'creator_os_master_prompts_history_v1',
  CAPTURED_IDEAS: 'creator_os_captured_ideas_v1',
  INSPIRATION_NOTES: 'creator_os_inspiration_notes_v1',
  inspirationNotes: 'creator_os_inspiration_notes_v1',
};

export const StorageService = {
  getAccounts(): Account[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return data ? JSON.parse(data) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  },

  saveAccounts(accounts: Account[]) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  getActiveAccountId(): string {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID);
    return id || (INITIAL_ACCOUNTS[0]?.id ?? 'acc-1');
  },

  setActiveAccountId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, id);
  },

  getAccountMemories(): AccountMemoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNT_MEMORIES);
      return data ? JSON.parse(data) : INITIAL_ACCOUNT_MEMORIES;
    } catch {
      return INITIAL_ACCOUNT_MEMORIES;
    }
  },

  saveAccountMemories(memories: AccountMemoryItem[]) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_MEMORIES, JSON.stringify(memories));
  },

  getKnowledgeBase(): KnowledgeItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASE);
      return data ? JSON.parse(data) : INITIAL_KNOWLEDGE_BASE;
    } catch {
      return INITIAL_KNOWLEDGE_BASE;
    }
  },

  saveKnowledgeBase(items: KnowledgeItem[]) {
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, JSON.stringify(items));
  },

  getTopicMatrices(): TopicMatrix[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPIC_MATRICES);
      return data ? JSON.parse(data) : [INITIAL_TOPIC_MATRIX];
    } catch {
      return [INITIAL_TOPIC_MATRIX];
    }
  },

  saveTopicMatrices(matrices: TopicMatrix[]) {
    localStorage.setItem(STORAGE_KEYS.TOPIC_MATRICES, JSON.stringify(matrices));
  },

  getDraftPosts(): DraftPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFT_POSTS);
      return data ? JSON.parse(data) : INITIAL_DRAFT_POSTS;
    } catch {
      return INITIAL_DRAFT_POSTS;
    }
  },

  saveDraftPosts(posts: DraftPost[]) {
    localStorage.setItem(STORAGE_KEYS.DRAFT_POSTS, JSON.stringify(posts));
  },

  getDataReviews(): DataReviewItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DATA_REVIEWS);
      return data ? JSON.parse(data) : INITIAL_DATA_REVIEWS;
    } catch {
      return INITIAL_DATA_REVIEWS;
    }
  },

  saveDataReviews(reviews: DataReviewItem[]) {
    localStorage.setItem(STORAGE_KEYS.DATA_REVIEWS, JSON.stringify(reviews));
  },

  getMasterPromptHistory(): any[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MASTER_PROMPTS_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMasterPromptHistory(history: any[]) {
    localStorage.setItem(STORAGE_KEYS.MASTER_PROMPTS_HISTORY, JSON.stringify(history));
  },

  getInspirationNotes(): CapturedIdea[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INSPIRATION_NOTES) || localStorage.getItem(STORAGE_KEYS.CAPTURED_IDEAS);
      return data ? JSON.parse(data) : INITIAL_CAPTURED_IDEAS;
    } catch {
      return INITIAL_CAPTURED_IDEAS;
    }
  },

  saveInspirationNotes(notes: CapturedIdea[]) {
    localStorage.setItem(STORAGE_KEYS.INSPIRATION_NOTES, JSON.stringify(notes));
    localStorage.setItem(STORAGE_KEYS.CAPTURED_IDEAS, JSON.stringify(notes));
  },

  getCapturedIdeas(): CapturedIdea[] {
    return this.getInspirationNotes();
  },

  saveCapturedIdeas(ideas: CapturedIdea[]) {
    this.saveInspirationNotes(ideas);
  },

  resetToDefault() {
    localStorage.clear();
    return {
      accounts: INITIAL_ACCOUNTS,
      knowledgeBase: INITIAL_KNOWLEDGE_BASE,
      topicMatrices: [INITIAL_TOPIC_MATRIX],
      draftPosts: INITIAL_DRAFT_POSTS,
      dataReviews: INITIAL_DATA_REVIEWS,
      capturedIdeas: INITIAL_CAPTURED_IDEAS,
      inspirationNotes: INITIAL_CAPTURED_IDEAS
    };
  }
};

export const getAccounts = () => StorageService.getAccounts();
export const saveAccounts = (accounts: Account[]) => StorageService.saveAccounts(accounts);
export const getActiveAccountId = () => StorageService.getActiveAccountId();
export const saveActiveAccountId = (id: string) => StorageService.setActiveAccountId(id);
export const getAccountMemories = () => StorageService.getAccountMemories();
export const saveAccountMemories = (memories: AccountMemoryItem[]) => StorageService.saveAccountMemories(memories);
export const getKnowledgeItems = () => StorageService.getKnowledgeBase();
export const saveKnowledgeItems = (items: KnowledgeItem[]) => StorageService.saveKnowledgeBase(items);
export const getTopicMatrices = () => StorageService.getTopicMatrices();
export const saveTopicMatrices = (matrices: TopicMatrix[]) => StorageService.saveTopicMatrices(matrices);
export const getDraftPosts = () => StorageService.getDraftPosts();
export const saveDraftPosts = (posts: DraftPost[]) => StorageService.saveDraftPosts(posts);
export const getDataReviews = () => StorageService.getDataReviews();
export const saveDataReviews = (reviews: DataReviewItem[]) => StorageService.saveDataReviews(reviews);
export const getInspirationNotes = () => StorageService.getInspirationNotes();
export const saveInspirationNotes = (notes: CapturedIdea[]) => StorageService.saveInspirationNotes(notes);
export const getCapturedIdeas = () => StorageService.getInspirationNotes();
export const saveCapturedIdeas = (ideas: CapturedIdea[]) => StorageService.saveInspirationNotes(ideas);

