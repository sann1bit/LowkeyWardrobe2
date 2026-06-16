import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import {
  matchEntry,
  getEntry,
  MAIN_QUICK_REPLIES,
  WHATSAPP_LINK,
  WHATSAPP_DISPLAY,
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
const SESSION_MODE_KEY = 'luxe_ai_mode';
const NUDGE_KEY = 'luxe_ai_nudged';

/* ── helpers ──────────────────────────────────────────────── */

function renderText(text: string) {
  return text.split('\n').map((line, i, arr) => {
    const boldRe = /\*\*([^*]+)\*\*/g;
    const combined = line.replace(boldRe, (_, b) => `__B__${b}__B__`);
    const segs = combined.split(/(__B__.*?__B__)/g);

    const nodes = segs.map((seg, si) => {
      if (seg.startsWith('__B__') && seg.endsWith('__B__'))
        return <strong key={si} style={{ fontWeight: 600 }}>{seg.slice(5, -5)}</strong>;

      const linkParts: React.ReactNode[] = [];
      let lLast = 0;
      const lr = /\[([^\]]+)\]\((https?:\/\/[^\)]+|mailto:[^\)]+)\)/g;
      let m: RegExpExecArray | null;
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
      return <span key={si}>{linkParts}</span>;
    });

    return (
      <span key={i}>
        {nodes}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-[5px] px-3 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className="block w-[5px] h-[5px] rounded-full bg-[#999]"
          style={{ animation: `luxe-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

function QBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="px-3 py-[7px] border border-[#CCCCCC] text-[10px] tracking-[0.12em] uppercase text-[#111111] bg-[#FAFAF8] hover:bg-[#ECECEC] transition-colors"
      style={{ borderRadius: 0 }}>
      {label}
    </button>
  );
}

function loadSession(): Message[] {
  try { const r = sessionStorage.getItem(SESSION_KEY); if (r) return JSON.parse(r); } catch {}
  return [];
}
function saveSession(msgs: Message[]) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(msgs.filter(m => !m.isTyping))); } catch {}
}

const STATUS_LABELS: Record<string, string> = {
  pending:    '🟡 Pending — payment being verified',
  processing: '🔵 Processing — order confirmed, being packed',
  shipped:    '🚚 Shipped — on its way to you',
  delivered:  '✅ Delivered — order complete',
  cancelled:  '❌ Cancelled',
};

function formatOrder(o: Record<string, any>): string {
  const status = STATUS_LABELS[o.status] ?? o.status;
  const items = Array.isArray(o.items)
    ? o.items.map((it: any) => `• ${it.name}${it.size ? ` (${it.size})` : ''} × ${it.qty}`).join('\n')
    : '—';
  const date = o.created_at
    ? new Date(o.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  return [
    `**Order ${o.order_number}**`,
    ``,
    `📋 **Status:** ${status}`,
    `🛍️ **Items:**\n${items}`,
    `📅 **Placed:** ${date}`,
    `📍 **City:** ${o.city ?? '—'}`,
    `💳 **Payment:** ${o.payment_method?.toUpperCase() ?? '—'}`,
    `💰 **Total:** PKR ${Number(o.total).toLocaleString()}`,
    ``,
    `Need further help? WhatsApp us at [${WHATSAPP_DISPLAY}](${WHATSAPP_LINK}).`,
  ].join('\n');
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'bot',
  text: 'Welcome to **LUXE AI** — your Lowkey Wardrobe assistant.\n\nHow can I help you today? Choose a topic below or type your question.',
  followUps: MAIN_QUICK_REPLIES,
};

const ASK_ORDER_NUM: Message = {
  id: 'ask-order-num',
  role: 'bot',
  text: 'Please enter your **order number** (e.g. LKW-ABC123) and I\'ll fetch the live status for you.',
};

/* ── component ────────────────────────────────────────────── */

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadSession();
    return saved.length > 0 ? saved : [WELCOME];
  });
  // trackingMode: waiting for user to type an order number
  const [trackingMode, setTrackingMode] = useState(() => {
    try { return sessionStorage.getItem(SESSION_MODE_KEY) === 'tracking'; } catch { return false; }
  });
  const [input, setInput] = useState('');
  const [inputHint, setInputHint] = useState('Type a question…');
  const [nudge, setNudge] = useState(false);
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* persist tracking mode */
  useEffect(() => {
    try { sessionStorage.setItem(SESSION_MODE_KEY, trackingMode ? 'tracking' : ''); } catch {}
    setInputHint(trackingMode ? 'Enter your order number (LKW-…)' : 'Type a question…');
  }, [trackingMode]);

  /* auto-focus on open */
  useEffect(() => {
    if (open) {
      setNudge(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  /* nudge once after 5 s */
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

  /* scroll to bottom + save session */
  useEffect(() => {
    saveSession(messages);
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [messages, reducedMotion]);

  /* Esc closes */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* ── typing delay helpers ─── */

  const delay = reducedMotion ? 0 : 900;

  const pushTyping = () => {
    const id = `typing-${Date.now()}`;
    setMessages(p => [...p, { id, role: 'bot', text: '', isTyping: true }]);
    return id;
  };

  const replaceTyping = (id: string, msg: Omit<Message, 'id'>) => {
    setMessages(p => p.filter(m => m.id !== id).concat({ id: `bot-${Date.now()}`, ...msg }));
  };

  const addBotReply = useCallback((entry: ChatEntry) => {
    const tid = pushTyping();
    setTimeout(() => replaceTyping(tid, {
      role: 'bot',
      text: entry.answer,
      followUps: entry.followUps,
    }), delay);
  }, [delay]);

  const addFallback = useCallback(() => {
    const tid = pushTyping();
    setTimeout(() => replaceTyping(tid, {
      role: 'bot',
      text: `I'm not sure I have that one — but our team can help directly.\n\nMessage us on [WhatsApp ${WHATSAPP_DISPLAY}](${WHATSAPP_LINK}) or email [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`,
      followUps: MAIN_QUICK_REPLIES.slice(0, 3),
    }), delay);
  }, [delay]);

  /* ── live order lookup ──────────────────────────────────── */

  const lookupOrder = useCallback(async (rawInput: string) => {
    // extract candidate order number: LKW-XXXX or just anything uppercase
    const candidate = rawInput.trim().toUpperCase().replace(/\s+/g, '-');
    const tid = pushTyping();
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(candidate)}`);
      if (!res.ok) {
        setTimeout(() => replaceTyping(tid, {
          role: 'bot',
          text: `I couldn't find an order with number **${candidate}**.\n\nPlease double-check your order confirmation, or contact us directly:\n\n📱 [WhatsApp ${WHATSAPP_DISPLAY}](${WHATSAPP_LINK})`,
          followUps: ['contact', 'track_order'],
        }), delay);
      } else {
        const order = await res.json();
        setTimeout(() => replaceTyping(tid, {
          role: 'bot',
          text: formatOrder(order),
          followUps: ['shipping', 'contact'],
        }), delay);
      }
    } catch {
      setTimeout(() => replaceTyping(tid, {
        role: 'bot',
        text: `Couldn't reach the server right now. Please try again or contact us on [WhatsApp ${WHATSAPP_DISPLAY}](${WHATSAPP_LINK}).`,
        followUps: ['contact'],
      }), delay);
    }
    setTrackingMode(false);
  }, [delay]);

  /* ── send handler ────────────────────────────────────────── */

  const handleSend = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput('');
    setMessages(p => [...p, { id: `user-${Date.now()}`, role: 'user', text: trimmed }]);

    if (trackingMode) {
      lookupOrder(trimmed);
      return;
    }

    // also auto-detect LKW- prefixed order numbers at any time
    if (/^LKW-/i.test(trimmed)) {
      lookupOrder(trimmed);
      return;
    }

    const entry = matchEntry(trimmed);
    if (entry) addBotReply(entry);
    else addFallback();
  }, [trackingMode, lookupOrder, addBotReply, addFallback]);

  /* ── quick reply handler ─────────────────────────────────── */

  const handleQuickReply = useCallback((id: string) => {
    if (id === 'track_order') {
      // enter tracking flow
      setMessages(p => [
        ...p,
        { id: `user-${Date.now()}`, role: 'user', text: 'TRACK MY ORDER' },
        { ...ASK_ORDER_NUM, id: `ask-${Date.now()}` },
      ]);
      setTrackingMode(true);
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    const entry = getEntry(id);
    if (!entry) return;
    setMessages(p => [...p, { id: `user-${Date.now()}`, role: 'user', text: entry.question }]);
    addBotReply(entry);
  }, [addBotReply]);

  /* ── panel style ─────────────────────────────────────────── */

  const panelStyle: React.CSSProperties = reducedMotion
    ? { display: open ? 'flex' : 'none' }
    : {
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 250ms ease-in-out, transform 250ms ease-in-out',
      };

  /* ── render ──────────────────────────────────────────────── */

  return (
    <>
      <style>{`
        @keyframes luxe-dot-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* ── Chat Panel ── */}
      <div role="dialog" aria-label="LUXE AI Chat" aria-modal="true"
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
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#999999] mt-0.5">
              {trackingMode ? 'Awaiting order number…' : 'Lowkey Wardrobe Assistant'}
            </p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close chat"
            className="text-[#999999] hover:text-[#111111] transition-colors p-1">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {messages.map(msg => (
            <div key={msg.id}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] px-3 py-2.5 text-[13px] leading-[1.55]"
                  style={{
                    background: msg.role === 'user' ? 'transparent' : '#ECECEC',
                    border: msg.role === 'user' ? '1px solid #CCCCCC' : 'none',
                    color: '#111111',
                    borderRadius: '2px',
                    wordBreak: 'break-word',
                  }}>
                  {msg.isTyping
                    ? (reducedMotion ? <span className="text-[#999999]">...</span> : <TypingIndicator />)
                    : renderText(msg.text)}
                </div>
              </div>

              {/* Follow-up quick replies */}
              {msg.role === 'bot' && !msg.isTyping && msg.followUps && msg.followUps.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.followUps.map(id => {
                    const e = getEntry(id);
                    if (!e) return null;
                    return <QBtn key={id} label={e.question} onClick={() => handleQuickReply(id)} />;
                  })}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-[#EAEAEA] flex"
          style={{ background: trackingMode ? '#F5F5F0' : undefined }}>
          <input ref={inputRef} type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder={inputHint}
            className="flex-1 px-4 py-3.5 text-[13px] bg-transparent text-[#111111] placeholder-[#AAAAAA] outline-none"
            style={{ borderRadius: 0 }}
            aria-label="Your message" />
          <button onClick={() => handleSend(input)} disabled={!input.trim()}
            className="px-4 text-[#111111] hover:text-[#555555] transition-colors disabled:opacity-30"
            aria-label="Send message">
            <Send size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Nudge bubble */}
      {nudge && !open && (
        <div className="fixed bottom-[148px] right-5 z-[1999] max-w-[240px] px-4 py-3 border border-[#EAEAEA] bg-[#FAFAF8] text-[12px] text-[#111111] leading-[1.5]"
          style={{ borderRadius: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          Need help with sizing, shipping, or your order?
          <div className="absolute bottom-[-6px] right-[22px] w-[10px] h-[10px] border-b border-r border-[#EAEAEA] bg-[#FAFAF8]"
            style={{ transform: 'rotate(45deg)' }} />
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close LUXE AI chat' : 'Open LUXE AI chat'}
        className="fixed bottom-5 right-5 z-[2001] w-[52px] h-[52px] bg-[#111111] text-[#FAFAF8] flex items-center justify-center hover:bg-[#333333] transition-colors"
        style={{ borderRadius: 0 }}>
        {open ? <X size={18} strokeWidth={1.5} /> : <MessageSquare size={18} strokeWidth={1.5} />}
      </button>
    </>
  );
}
