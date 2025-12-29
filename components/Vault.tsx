
import React, { useState, useEffect } from 'react';
import { FlowNoteEntry } from '../types';

interface VaultProps {
  entries: FlowNoteEntry[];
  onUpdate: (id: string, content: string) => void;
}

const LOCK_DURATION = 60000; // 60 seconds for demo

const VaultItem: React.FC<{ entry: FlowNoteEntry; onUpdate: (id: string, content: string) => void }> = ({ entry, onUpdate }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);

  useEffect(() => {
    const update = () => {
      const diff = LOCK_DURATION - (Date.now() - entry.createdAt);
      setTimeLeft(Math.max(0, diff));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [entry.createdAt]);

  const isLocked = timeLeft > 0;

  const handleSave = () => {
    onUpdate(entry.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(entry.content);
    setIsEditing(false);
  };

  return (
    <div className="w-full border-b border-white/5 py-4 transition-all duration-300">
      <div 
        className={`flex items-center justify-between cursor-pointer group`}
        onClick={() => !isLocked && !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col">
          <span className="text-xs opacity-40 uppercase tracking-widest">
            {new Date(entry.createdAt).toLocaleString()}
          </span>
          <span className={`text-lg font-light ${isLocked ? 'opacity-30' : 'group-hover:text-white transition-colors'}`}>
             {isLocked ? 'Encrypted Time Capsule' : `Unlocked Thought (${entry.content.split(/\s+/).filter(Boolean).length} words)`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isLocked ? (
            <div className="flex items-center gap-2 text-amber-500/80 text-xs font-mono">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>{Math.ceil(timeLeft / 1000)}s</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               {!isEditing && isExpanded && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  className="text-white/40 hover:text-white transition-colors p-1"
                  title="Edit entry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
              )}
              <div className="text-green-500/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isLocked && isExpanded && (
        <div className="mt-6 p-6 bg-white/5 rounded-lg text-white/80 animate-in fade-in slide-in-from-top-2 duration-300">
          {isEditing ? (
            <div className="flex flex-col gap-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                className="w-full min-h-[150px] bg-[#2a2a2a] border border-white/10 rounded-md p-4 text-white font-light text-lg focus:outline-none focus:border-white/30 transition-colors resize-y"
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 text-xs uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="leading-relaxed font-light text-xl whitespace-pre-wrap">
              {entry.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Vault: React.FC<VaultProps> = ({ entries, onUpdate }) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl tracking-widest opacity-80 uppercase">The Vault</h2>
        <div className="flex-grow h-px bg-white/10"></div>
      </div>
      
      {entries.length === 0 ? (
        <div className="text-center py-20 opacity-20 italic">
          Your repository is currently empty.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map(entry => (
            <VaultItem key={entry.id} entry={entry} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Vault;
