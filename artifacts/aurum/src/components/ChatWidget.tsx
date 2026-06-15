import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import {
  chatbotData,
  matchEntry,
  getEntry,
  MAIN_QUICK_REPLIES,
  WHATSAPP_LINK,
  CONTACT_EMAIL,
  type ChatEntry,
} from '../data/chatbotData';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  followUps?: string[];
  isTyping?: boolean;
}

const SESSION_KEY = 'luxe_ai_chat';
const NUDGE_KEY = 'luxe_ai_nudged';

function renderText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts: React.ReactNode[] = [];
    let last = 0;
    const linkRe = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    const boldRe = /\*\*([^*]+)\*\*/g;

    const combined = line.replace(boldRe, (_, b) => `__BOLD__${b}__BOLD__`);
    const segments = combined.split(/(__BOLD__.*?__BOLD__)/g);

    const nodes: React.ReactNode[] = segments.map((seg, si) => {
      if (seg.startsWith('__BOLD__') && seg.endsWith('__BOLD__')) {
        return <strong key={si} style={{ fontWeight: 600 }}>{seg.slice(8, -8)}</strong>;
      }
      const linkParts: React.ReactNode[] = [];
      let lLast = 0;
      const origLine = line;
      let m: RegExpExecArray | null;
      const lr = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
      while ((m = lr.exec(seg)) !== null) {
        if (m.index > lLast) linkParts.push(seg.slice(lLast, m.index));
        linkParts.push(
          <a key={m.index} href={m[2]} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: 'underline', color: '#111111' }}>
            {m[1]}
          </a>
        );
        lLast = m.index + m[0].length;
      }
      if (lLast < seg.length) linkParts.push(seg.slice(lLast));
      return linkParts.length > 1 || linkParts[0] !== seg ? <span key={si}>{linkParts}</span> : seg;
    });

    const isLast = i === lines.length - 1;
    return (
      <span key={i}>
        {nodes}
        {!isLast && <br />}
      </span>
    );
  });
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-[5px] px-3 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="block w-[5px] h-[5px] rounded-full bg-[#999]"
          style={{
            animation: `luxe-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function QuickReplyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-[7px] border border-[#CCCCCC] text-[10px] tracking-[0.12em] uppercase text-[#111111] bg-[#FAFAF8] hover:bg-[#ECECEC] transition-colors"
      style={{ borderRadius: 0 }}
    >
      {label}
    </button>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function loadSession(): Message[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveSession(msgs: Message[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(msgs.filter(m => !m.isTyping)));
  } catch {}
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'bot',
  text: 'Welcome to **LUXE AI** — your Lowkey Wardrobe assistant.\n\nHow can I help you today? Choose a topic below or type your question.',
  followUps: MAIN_QUICK_REPLIES,
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadSession();
    return saved.length > 0 ? saved : [WELCOME];
  });
  const [input, setInput] = useState('');
  const [nudge, setNudge] = useState(false);
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNudge(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    if (sessionStorage.getItem(NUDGE_KEY)) return;
    const t = setTimeout(() => {
      if (!open) {
        setNudge(true);
        sessionStorage.setItem(NUDGE_KEY, '1');
        setTimeout(() => setNudge(false), 6000);
      }
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    saveSession(messages);
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [messages, reducedMotion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const addBotReply = useCallback((entry: ChatEntry) => {
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, { id: typingId, role: 'bot', text: '', isTyping: true }]);
    setTimeout(() => {
      setMessages(prev =>
        prev
          .filter(m => m.id !== typingId)
          .concat({
            id: `bot-${Date.now()}`,
            role: 'bot',
            text: entry.answer,
            followUps: entry.followUps,
          })
      );
    }, reducedMotion ? 0 : 900);
  }, [reducedMotion]);

  const addFallback = useCallback(() => {
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, { id: typingId, role: 'bot', text: '', isTyping: true }]);
    setTimeout(() => {
      setMessages(prev =>
        prev
          .filter(m => m.id !== typingId)
          .concat({
            id: `fallback-${Date.now()}`,
            role: 'bot',
            text: `I'm not sure I have that one — but our team can help directly.\n\nMessage us on [WhatsApp 03098080081](${WHATSAPP_LINK}) or email [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`,
            followUps: MAIN_QUICK_REPLIES.slice(0, 3),
          })
      );
    }, reducedMotion ? 0 : 900);
  }, [reducedMotion]);

  const handleSend = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput('');
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    const entry = matchEntry(trimmed);
    if (entry) addBotReply(entry);
    else addFallback();
  }, [addBotReply, addFallback]);

  const handleQuickReply = useCallback((id: string) => {
    const entry = getEntry(id);
    if (!entry) return;
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', text: entry.question };
    setMessages(prev => [...prev, userMsg]);
    addBotReply(entry);
  }, [addBotReply]);

  const panelStyle: React.CSSProperties = reducedMotion
    ? { display: open ? 'flex' : 'none' }
    : {
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 250ms ease-in-out, transform 250ms ease-in-out',
      };

  return (
    <>
      <style>{`
        @keyframes luxe-dot-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Chat Panel */}
      <div
        role="dialog"
        aria-label="LUXE AI Chat"
        aria-modal="true"
        className="fixed bottom-[84px] right-5 z-[2000] flex flex-col"
        style={{
          width: 'min(380px, calc(100vw - 24px))',
          height: 'min(560px, calc(100dvh - 100px))',
          background: '#FAFAF8',
          border: '1px solid #EAEAEA',
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
          borderRadius: 0,
          ...panelStyle,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA] flex-shrink-0">
          <div>
            <p className="font-serif italic text-[17px] text-[#111111] leading-none">LUXE AI</p>
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#999999] mt-0.5">Lowkey Wardrobe Assistant</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="text-[#999999] hover:text-[#111111] transition-colors p-1"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {messages.map(msg => (
            <div key={msg.id}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] px-3 py-2.5 text-[13px] leading-[1.55]"
                  style={{
                    background: msg.role === 'user' ? 'transparent' : '#ECECEC',
                    border: msg.role === 'user' ? '1px solid #CCCCCC' : 'none',
                    color: '#111111',
                    borderRadius: '2px',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.isTyping ? (
                    reducedMotion ? <span className="text-[#999999]">...</span> : <TypingIndicator />
                  ) : (
                    renderText(msg.text)
                  )}
                </div>
              </div>

              {/* Follow-up quick replies */}
              {msg.role === 'bot' && !msg.isTyping && msg.followUps && msg.followUps.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 ml-0">
                  {msg.followUps.map(id => {
                    const e = getEntry(id);
                    if (!e) return null;
                    return (
                      <QuickReplyButton
                        key={id}
                        label={e.question}
                        onClick={() => handleQuickReply(id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-[#EAEAEA] flex">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder="Type a question…"
            className="flex-1 px-4 py-3.5 text-[13px] bg-transparent text-[#111111] placeholder-[#AAAAAA] outline-none"
            style={{ borderRadius: 0 }}
            aria-label="Your message"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="px-4 text-[#111111] hover:text-[#555555] transition-colors disabled:opacity-30"
            aria-label="Send message"
          >
            <Send size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Nudge bubble */}
      {nudge && !open && (
        <div
          className="fixed bottom-[148px] right-5 z-[1999] max-w-[240px] px-4 py-3 border border-[#EAEAEA] bg-[#FAFAF8] text-[12px] text-[#111111] leading-[1.5]"
          style={{ borderRadius: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        >
          Need help with sizing, shipping, or your order?
          <div
            className="absolute bottom-[-6px] right-[22px] w-[10px] h-[10px] border-b border-r border-[#EAEAEA] bg-[#FAFAF8]"
            style={{ transform: 'rotate(45deg)' }}
          />
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close LUXE AI chat' : 'Open LUXE AI chat'}
        className="fixed bottom-5 right-5 z-[2001] w-[52px] h-[52px] bg-[#111111] text-[#FAFAF8] flex items-center justify-center hover:bg-[#333333] transition-colors"
        style={{ borderRadius: 0 }}
      >
        {open ? (
          <X size={18} strokeWidth={1.5} />
        ) : (
          <MessageSquare size={18} strokeWidth={1.5} />
        )}
      </button>
    </>
  );
}
