
import React, { useState, useEffect, useCallback } from 'react';
import { FlowNoteEntry } from './types';
import Editor from './components/Editor';
import Vault from './components/Vault';
import { Toast } from './components/Toast';

const App: React.FC = () => {
  const [entries, setEntries] = useState<FlowNoteEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load entries from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('flownote_vault');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved notes", e);
      }
    }
  }, []);

  const saveToVault = useCallback((content: string) => {
    if (!content.trim()) return;

    const newEntry: FlowNoteEntry = {
      id: crypto.randomUUID(),
      content: content.trim(),
      createdAt: Date.now(),
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('flownote_vault', JSON.stringify(updated));
    showToast("Entry sealed in the Vault.");
  }, [entries]);

  const updateEntry = useCallback((id: string, newContent: string) => {
    const updated = entries.map(entry => 
      entry.id === id ? { ...entry, content: newContent } : entry
    );
    setEntries(updated);
    localStorage.setItem('flownote_vault', JSON.stringify(updated));
    showToast("Thought refined and saved.");
  }, [entries]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#222] text-[#ddd] px-4 py-8 max-w-4xl mx-auto">
      <header className="w-full text-center mb-12">
        <h1 className="text-4xl font-light tracking-widest text-white mb-2">FLOWNOTE</h1>
        <p className="text-sm italic opacity-60">Don't look back. Just write.</p>
      </header>

      <main className="w-full flex-grow flex flex-col gap-12">
        <Editor onFinish={saveToVault} onToast={showToast} />
        
        <div className="w-full h-px bg-white/10 my-8"></div>
        
        <Vault entries={entries} onUpdate={updateEntry} />
      </main>

      <footer className="mt-20 py-8 text-xs opacity-30 text-center">
        &copy; {new Date().getFullYear()} FlowNote Studio. A Zen Experiment.
      </footer>

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
};

export default App;
