
import React, { useState, useEffect } from 'react';
import { FlowNoteEntry, Language, translations } from '../types';
import { GoogleGenAI } from "@google/genai";

interface VaultProps {
  entries: FlowNoteEntry[];
  onUpdate: (id: string, content: string) => void;
  lang: Language;
}

const VaultItem: React.FC<{ entry: FlowNoteEntry; onUpdate: (id: string, content: string) => void; lang: Language }> = ({ entry, onUpdate, lang }) => {
  const t = translations[lang];
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);
  const [polishedContent, setPolishedContent] = useState<string | null>(null);

  // Sync internal edit buffer when entry content changes (e.g., after AI refinement)
  useEffect(() => {
    setEditContent(entry.content);
  }, [entry.content]);

  useEffect(() => {
    const update = () => {
      const diff = (entry.lockDuration || 60000) - (Date.now() - entry.createdAt);
      setTimeLeft(Math.max(0, diff));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [entry.createdAt, entry.lockDuration]);

  const isLocked = timeLeft > 0;

  const handleSave = () => {
    onUpdate(entry.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(entry.content);
    setIsEditing(false);
    setPolishedContent(null);
  };

  const handleApplyPolished = () => {
    if (polishedContent) {
      onUpdate(entry.id, polishedContent);
      setPolishedContent(null);
      setIsRefining(false);
    }
  };

  const handleRefine = async () => {
    setIsRefining(true);
    setPolishedContent(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: entry.content,
        config: {
          systemInstruction: `You are a precision proofreader. 
          Tasks: 
          1. Fix ONLY obvious typos and spelling mistakes.
          2. Remove unintentional duplicate words (e.g., "the the").
          3. DO NOT change vocabulary, style, tone, or sentence structure.
          4. DO NOT add missing punctuation unless it's a critical error.
          5. Return ONLY the corrected text without any commentary or explanations.`,
        },
      });
      const text = response.text;
      if (text) {
        setPolishedContent(text.trim());
      }
    } catch (error) {
      console.error("AI Refinement Error:", error);
      alert(t.aiRefineError);
    } finally {
      setIsRefining(false);
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    if (s < 60) return `${s}${lang === 'en' ? 's' : '秒'}`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}${lang === 'en' ? 'm' : '分'} ${s % 60}${lang === 'en' ? 's' : '秒'}`;
    const h = Math.floor(m / 60);
    return `${h}${lang === 'en' ? 'h' : '时'} ${m % 60}${lang === 'en' ? 'm' : '分'}`;
  };

  return (
    <div className="w-full border-b border-current/5 py-4 transition-all duration-300">
      <div 
        className={`flex items-center justify-between cursor-pointer group`}
        onClick={() => !isLocked && !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col">
          <span className="text-xs opacity-40 uppercase tracking-widest">
            {new Date(entry.createdAt).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')}
          </span>
          <span className={`text-lg font-light ${isLocked ? 'opacity-30' : 'group-hover:opacity-100 transition-opacity'}`}>
             {isLocked ? t.encryptedCapsule : `${t.unlockedThought} (${entry.content.split(/\s+/).filter(Boolean).length} ${t.words})`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isLocked ? (
            <div className="flex items-center gap-2 text-amber-500/80 text-xs font-mono">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>{formatTimeRemaining(timeLeft)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               {!isEditing && isExpanded && (
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRefine(); }}
                    disabled={isRefining}
                    className={`opacity-40 hover:opacity-100 transition-opacity p-1 ${isRefining ? 'animate-pulse' : ''}`}
                    title={t.refine}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 16 6-12 6 12"></path><path d="M8 12h8"></path><path d="m16 20 2 2 4-4"></path></svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                    className="opacity-40 hover:opacity-100 transition-opacity p-1"
                    title="Edit entry"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                </div>
              )}
              <div className="text-green-500/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isLocked && isExpanded && (
        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {isEditing ? (
            <div className="p-6 bg-current/5 rounded-lg flex flex-col gap-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                className="w-full min-h-[150px] bg-current/10 border border-current/10 rounded-md p-4 text-current font-light text-lg focus:outline-none focus:border-current/30 transition-colors resize-y"
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 text-xs uppercase tracking-widest btn-primary-filled rounded transition-colors"
                >
                  {t.saveChanges}
                </button>
              </div>
            </div>
          ) : polishedContent ? (
            <div className="flex flex-col gap-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-widest opacity-30 px-4">{t.original}</span>
                  <div className="p-6 bg-current/5 border border-current/5 rounded-lg leading-relaxed font-light text-xl whitespace-pre-wrap opacity-60">
                    {entry.content}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-widest opacity-60 text-indigo-400 px-4 font-bold">{t.polished}</span>
                  <div className="p-6 bg-current/[0.08] border border-indigo-400/20 rounded-lg leading-relaxed font-light text-xl whitespace-pre-wrap">
                    {polishedContent}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setPolishedContent(null)}
                  className="px-4 py-2 text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={handleApplyPolished}
                  className="px-4 py-2 text-xs uppercase tracking-widest btn-primary-filled rounded transition-all shadow-lg"
                >
                  {t.usePolished}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-current/5 rounded-lg text-current">
              <div className="leading-relaxed font-light text-xl whitespace-pre-wrap opacity-80">
                {isRefining ? (
                  <div className="flex items-center gap-3 py-4 text-sm opacity-40 tracking-widest uppercase italic">
                    <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
                    {t.refining}
                  </div>
                ) : (
                  entry.content
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Vault: React.FC<VaultProps> = ({ entries, onUpdate, lang }) => {
  const t = translations[lang];
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl tracking-widest opacity-80 uppercase">{t.vaultTitle}</h2>
        <div className="flex-grow h-px bg-current opacity-10"></div>
      </div>
      
      {entries.length === 0 ? (
        <div className="text-center py-20 opacity-20 italic">
          {t.emptyVault}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map(entry => (
            <VaultItem key={entry.id} entry={entry} onUpdate={onUpdate} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Vault;
