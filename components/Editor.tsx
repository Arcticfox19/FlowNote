
import React, { useState, useEffect, useRef } from 'react';

interface EditorProps {
  onFinish: (content: string) => void;
  onToast: (msg: string) => void;
}

const Editor: React.FC<EditorProps> = ({ onFinish, onToast }) => {
  const [content, setContent] = useState('');
  const [opacity, setOpacity] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const lastTypedRef = useRef<number>(Date.now());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastTypedRef.current;
      
      // Fading logic: 
      // 3s -> 50%
      // 7s -> 10%
      if (content.length > 0) {
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
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Intercept Backspace and Delete
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      setIsShaking(true);
      onToast("Don't look back, keep flowing.");
      setTimeout(() => setIsShaking(false), 300);
      return;
    }

    // Refresh last typed timestamp
    lastTypedRef.current = Date.now();
    setOpacity(1);
  };

  const handleFinish = () => {
    if (content.trim()) {
      onFinish(content);
      setContent('');
      lastTypedRef.current = Date.now();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className={`w-full relative transition-opacity duration-1000 ${isShaking ? 'shake-animation' : ''}`}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
              setContent(e.target.value);
              lastTypedRef.current = Date.now();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Begin your flow..."
          style={{ opacity }}
          className="w-full h-80 bg-transparent border-none outline-none text-2xl leading-relaxed resize-none placeholder:opacity-20 transition-opacity duration-1000 font-light"
        />
        
        {content.length > 0 && opacity < 0.6 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-white/20 text-4xl font-bold tracking-tighter uppercase opacity-30">Keep Moving</span>
            </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleFinish}
          disabled={!content.trim()}
          className={`px-8 py-3 rounded-full border border-white/20 text-sm tracking-widest uppercase transition-all
            ${content.trim() ? 'hover:bg-white hover:text-[#222] cursor-pointer' : 'opacity-20 cursor-not-allowed'}
          `}
        >
          Finish & Seal
        </button>
      </div>
    </div>
  );
};

export default Editor;
