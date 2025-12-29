
import React, { useState, useEffect, useRef } from 'react';
import { Language, translations } from '../types';

interface EditorProps {
  onFinish: (content: string, lockDuration: number) => void;
  onToast: (msg: string) => void;
  lang: Language;
}

const Editor: React.FC<EditorProps> = ({ onFinish, onToast, lang }) => {
  const t = translations[lang];
  const [content, setContent] = useState('');
  const [opacity, setOpacity] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(30);

  const lastTypedRef = useRef<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastTypedRef.current;
      
      if (content.length > 0 && !showTimerPicker) {
        if (elapsed > 7000) {
          setOpacity(0.1);
        } else if (elapsed > 3000) {
          setOpacity(0.5);
        } else {
          setOpacity(1);
        }
      } else {
        setOpacity(1);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [content, showTimerPicker]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      setIsShaking(true);
      onToast(t.dontLookBack);
      setTimeout(() => setIsShaking(false), 300);
      return;
    }

    lastTypedRef.current = Date.now();
    setOpacity(1);
  };

  const handleConfirmSeal = () => {
    const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
    if (content.trim()) {
      onFinish(content, totalMs);
      setContent('');
      setShowTimerPicker(false);
      lastTypedRef.current = Date.now();
      setHours(0);
      setMinutes(0);
      setSeconds(30);
    }
  };

  const TimeColumn = ({ label, value, setter, max }: { label: string, value: number, setter: (v: number) => void, max: number }) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">{label}</span>
      <div className="flex flex-col items-center">
        <button 
          onClick={() => setter(Math.min(max, value + 1))}
          className="p-2 opacity-30 hover:opacity-100 transition-opacity"
        >
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 11L10 2L19 11" stroke="currentColor" strokeWidth="2"/></svg>
        </button>
        <span className="text-4xl font-light font-mono w-16 text-center">{value.toString().padStart(2, '0')}</span>
        <button 
          onClick={() => setter(Math.max(0, value - 1))}
          className="p-2 opacity-30 hover:opacity-100 transition-opacity"
        >
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 1L10 10L1 1" stroke="currentColor" strokeWidth="2"/></svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center relative">
      <div className={`w-full relative transition-opacity duration-1000 ${isShaking ? 'shake-animation' : ''}`}>
        <textarea
          readOnly={showTimerPicker}
          value={content}
          onChange={(e) => {
              setContent(e.target.value);
              lastTypedRef.current = Date.now();
          }}
          onKeyDown={handleKeyDown}
          placeholder={t.beginFlow}
          style={{ opacity: showTimerPicker ? 0.2 : opacity }}
          className="w-full h-80 bg-transparent border-none outline-none text-2xl leading-relaxed resize-none placeholder:opacity-20 transition-opacity duration-1000 font-light"
        />
        
        {content.length > 0 && opacity < 0.6 && !showTimerPicker && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-current opacity-20 text-4xl font-bold tracking-tighter uppercase">{t.keepMoving}</span>
            </div>
        )}

        {showTimerPicker && (
          <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-current/10 backdrop-blur-xl p-8 rounded-3xl border border-current/10 shadow-2xl flex flex-col items-center gap-8 text-current">
              <h3 className="text-xs tracking-[0.3em] uppercase opacity-60">{t.setSealDuration}</h3>
              
              <div className="flex gap-4">
                <TimeColumn label={t.hours} value={hours} setter={setHours} max={23} />
                <div className="text-4xl self-center mt-4 opacity-20">:</div>
                <TimeColumn label={t.min} value={minutes} setter={setMinutes} max={59} />
                <div className="text-4xl self-center mt-4 opacity-20">:</div>
                <TimeColumn label={t.sec} value={seconds} setter={setSeconds} max={59} />
              </div>

              <div className="flex gap-6 mt-4 w-full">
                <button 
                  onClick={() => setShowTimerPicker(false)}
                  className="flex-1 py-3 text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                >
                  {t.back}
                </button>
                <button 
                  onClick={handleConfirmSeal}
                  className="flex-1 py-3 text-xs uppercase tracking-widest bg-current text-white dark:text-black rounded-full font-bold hover:bg-opacity-90 transition-all shadow-lg"
                >
                  {t.seal}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        {!showTimerPicker && (
          <button
            onClick={() => setShowTimerPicker(true)}
            disabled={!content.trim()}
            className={`px-8 py-3 rounded-full border border-current/20 text-sm tracking-widest uppercase transition-all
              ${content.trim() ? 'hover:bg-current hover:text-white dark:hover:text-black cursor-pointer' : 'opacity-20 cursor-not-allowed'}
            `}
          >
            {t.finishAndSeal}
          </button>
        )}
      </div>
    </div>
  );
};

export default Editor;
