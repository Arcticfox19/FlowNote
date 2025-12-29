
import React, { useState, useEffect, useCallback } from 'react';
import { FlowNoteEntry, Language, Theme, translations } from './types';
import Editor from './components/Editor';
import Vault from './components/Vault';
import { Toast } from './components/Toast';

const App: React.FC = () => {
  const [entries, setEntries] = useState<FlowNoteEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');

  const t = translations[lang];

  useEffect(() => {
    const saved = localStorage.getItem('flownote_vault');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved notes", e);
      }
    }
    
    const savedLang = localStorage.getItem('flownote_lang') as Language;
    if (savedLang) setLang(savedLang);
    
    const savedTheme = localStorage.getItem('flownote_theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.body.className = `theme-${theme} overflow-x-hidden custom-scrollbar`;
  }, [theme]);

  const toggleLang = () => {
    const next = lang === 'en' ? 'zh' : 'en';
    setLang(next);
    localStorage.setItem('flownote_lang', next);
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('flownote_theme', newTheme);
  };

  const saveToVault = useCallback((content: string, lockDuration: number) => {
    if (!content.trim()) return;

    const newEntry: FlowNoteEntry = {
      id: crypto.randomUUID(),
      content: content.trim(),
      createdAt: Date.now(),
      lockDuration: lockDuration,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('flownote_vault', JSON.stringify(updated));
    showToast(t.entrySealed);
  }, [entries, t]);

  const updateEntry = useCallback((id: string, newContent: string) => {
    const updated = entries.map(entry => 
      entry.id === id ? { ...entry, content: newContent } : entry
    );
    setEntries(updated);
    localStorage.setItem('flownote_vault', JSON.stringify(updated));
    showToast(t.thoughtRefined);
  }, [entries, t]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center px-4 py-8 max-w-4xl mx-auto transition-colors duration-500`}>
      {/* Top Controls Toolbar */}
      <div className="w-full flex justify-end gap-6 mb-4 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <div className="flex gap-4 items-center">
          {['dark', 'warm', 'blue'].map((th) => {
            const isActive = theme === th;

            return (
              <div key={th} className="relative w-5 h-5">
                {/* 增强型呼吸光晕 */}
                {isActive && (
                  <div
                    className={`
                      absolute inset-0 rounded-full
                      scale-[1.2] blur-md opacity-80
                      animate-pulse
                      ${th === 'dark'
                        ? 'bg-current'
                        : th === 'warm'
                        ? 'bg-[#6b4c38]'
                        : 'bg-[#3f4959]'}
                    `}
                  />
                )}

                {/* 实际按钮 */}
                <button
                  onClick={() => changeTheme(th as Theme)}
                  title={th.charAt(0).toUpperCase() + th.slice(1)}
                  className={`
                    relative z-10
                    w-5 h-5 rounded-full border border-current
                    transition-all duration-300
                    ${th === 'dark'
                      ? 'bg-[#222]'
                      : th === 'warm'
                      ? 'bg-[#f4f1ea]'
                      : 'bg-[#f0f7ff]'}
                    ${isActive
                      ? 'scale-110 opacity-100 ring-0.8 ring-current ring-offset-1 ring-offset-transparent'
                      : 'opacity-40 hover:opacity-100'}
                  `}
                />
              </div>
            )
          })}
        </div>

        <button 
            onClick={toggleLang}
            className="text-[10px] uppercase tracking-widest font-bold hover:underline flex items-center"
        >
            {lang === 'en' ? '中文' : 'EN'}
        </button>
      </div>

      <header className="w-full text-center mb-12">
        <h1 className="text-4xl font-light tracking-widest mb-2">FLOWNOTE</h1>
        <p className="text-sm italic opacity-60">Don't look back. Just write.</p>
      </header>

      <main className="w-full flex-grow flex flex-col gap-12">
        <Editor onFinish={saveToVault} onToast={showToast} lang={lang} />
        
        <div className="w-full h-px bg-current opacity-10 my-8"></div>
        
        <Vault entries={entries} onUpdate={updateEntry} lang={lang} />
      </main>

      <footer className="mt-20 py-8 text-xs opacity-30 text-center">
        &copy; {new Date().getFullYear()} FlowNote Studio. A Zen Experiment.
      </footer>

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
};

export default App;
