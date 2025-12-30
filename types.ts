
export interface FlowNoteEntry {
  id: string;
  content: string;
  createdAt: number;
  lockDuration: number; 
}

export type Language = 'en' | 'zh';
export type Theme = 'dark' | 'warm' | 'blue';

export const translations = {
  en: {
    finishAndSeal: "Finish & Seal",
    setSealDuration: "Set Seal Duration",
    hours: "Hours",
    min: "Min",
    sec: "Sec",
    back: "Back",
    seal: "Seal",
    beginFlow: "Begin your flow...",
    keepMoving: "Keep Moving",
    vaultTitle: "The Vault",
    emptyVault: "Your repository is currently empty.",
    encryptedCapsule: "Encrypted Time Capsule",
    unlockedThought: "Unlocked Thought",
    words: "words",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    dontLookBack: "Don't look back, keep flowing.",
    entrySealed: "Entry sealed.",
    thoughtRefined: "Thought refined and saved.",
    refine: "Refine typos",
    refining: "Refining...",
    original: "Original",
    polished: "Polished Version",
    usePolished: "Apply Refinement",
    aiRefineError: "Refinement failed. Please try again."
  },
  zh: {
    finishAndSeal: "完成并封存",
    setSealDuration: "设定封存时长",
    hours: "小时",
    min: "分钟",
    sec: "秒钟",
    back: "返回",
    seal: "封存",
    beginFlow: "开始你的心流...",
    keepMoving: "继续写，不要停",
    vaultTitle: "封存库",
    emptyVault: "库中目前空空如也。",
    encryptedCapsule: "加密的时间胶囊",
    unlockedThought: "已解锁的灵感",
    words: "字",
    cancel: "取消",
    saveChanges: "保存修改",
    dontLookBack: "不要回头，保持心流。",
    entrySealed: "灵感已封存。",
    thoughtRefined: "灵感已优化并保存。",
    refine: "修正错字",
    refining: "正在修正...",
    original: "原始版",
    polished: "修正版",
    usePolished: "应用修正",
    aiRefineError: "修正失败，请重试。"
  }
};
