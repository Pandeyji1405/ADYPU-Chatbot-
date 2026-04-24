'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Mic, Send, Volume2, ShieldCheck, Languages, BrainCircuit, Terminal, Command, Zap, MessageSquare, Database, Sparkles, Paintbrush } from 'lucide-react';
import ThemeSelect from '@/app/components/theme-select.js';
import { SPEECH_LOCALES } from '@/lib/language-support.js';
import { SAATHI_LANGUAGE_WELCOME_BLOCK, SAATHI_SUPPORTED_LANGUAGES } from '@/lib/saathi.js';

const BOT = 'bot';
const USER = 'user';

const KNOWLEDGE_COLUMNS = [
  { title: 'Courses', prompts: ['What undergraduate courses are available at ADYPU?', 'What courses are available in SOE?', 'What postgraduate courses are available at ADYPU?'] },
  { title: 'Deans', prompts: ['Who is the SoD dean?', 'Who is the SSD dean?', 'Who is the Law and Liberal Arts dean?'] },
  { title: 'Admissions', prompts: ['What is the admissions link?', 'What are the admission process steps?', 'What is the mandatory disclosures link?'] },
  { title: 'Fees', prompts: ['What is the hostel fee range?', 'What is the fees PDF 2025-26 link?', 'What is the hostel contact number?'] },
  { title: 'Placements', prompts: ['Who handles placements?', 'What is the full form of SPCR?', 'What is the placements page link?'] },
  { title: 'Shortforms', prompts: ['What is the full form of SSD?', 'What is the full form of SoD?', 'What is the difference between SSD and SoD?'] },
  { title: 'Officials', prompts: ['Who is the Vice Chancellor?', 'Who is the Registrar?', 'What is the Registrar email?'] }
];

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function canUseSpeechRecognition() {
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

function safeLocalStorageGet(key) {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function safeLocalStorageSet(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
}

function createSessionId() {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID().replace(/-/g, '');
  }
  return `${Date.now()}${Math.random().toString(16).slice(2)}`;
}

// Helper to render markdown-like text securely
const formatBotMessage = (text) => {
  if (!text) return null;
  
  const parts = text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>;
    if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
    if (line.startsWith('# ')) return <h1 key={i}>{line.replace('# ', '')}</h1>;
    if (line.startsWith('- ')) return <li key={i}>{line.replace('- ', '')}</li>;
    if (line.match(/\[([^\]]+)\]\(([^)]+)\)/)) {
      const matches = [...line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
      if (matches.length > 0) {
        let result = line;
        return (
          <p key={i} dangerouslySetInnerHTML={{
            __html: result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
          }} />
        );
      }
    }
    return <p key={i}>{line}</p>;
  });
  
  return parts;
};

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState([]); 
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [detectedLang, setDetectedLang] = useState('en');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [session, setSession] = useState({ id: '', language: '', consent: 'unknown', audioPrompt: false, audioText: '' });

  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  const history = useMemo(() => {
    return messages
      .filter((m) => m.role === USER || m.role === BOT)
      .map((m) => ({ role: m.role === USER ? 'user' : 'assistant', content: m.text }))
      .slice(-10);
  }, [messages]);

  const canSend = Boolean(input.trim()) && !isSending;
  const languageOptions = useMemo(
    () => SAATHI_SUPPORTED_LANGUAGES.map((lang) => ({ value: lang.code, label: lang.label })),
    []
  );
  const activeLanguageCode = session.language || detectedLang || 'en';
  const activeLanguageLabel =
    languageOptions.find((lang) => lang.value === activeLanguageCode)?.label || activeLanguageCode.toUpperCase();

  useEffect(() => {
    const storedKey = safeLocalStorageGet('adypu_openai_key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  useEffect(() => {
    const storedId = safeLocalStorageGet('adypu_saathi_session_id');
    const storedLang = safeLocalStorageGet('adypu_saathi_language') || '';
    const storedConsent = safeLocalStorageGet('adypu_saathi_consent') || 'unknown';

    const id = storedId || createSessionId();
    safeLocalStorageSet('adypu_saathi_session_id', id);

    setSession((prev) => ({ ...prev, id, language: storedLang, consent: storedConsent }));
    if (storedLang) setDetectedLang(storedLang);

    setMessages((prev) => {
      if (prev.length > 0) return prev;
      if (!storedLang) {
        return [{ role: BOT, text: SAATHI_LANGUAGE_WELCOME_BLOCK, language: 'en', time: timestamp(), sources: [] }];
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    const supported = canUseSpeechRecognition();
    setVoiceSupported(supported);
    if (!supported) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  async function submitMessage(rawMessage) {
    const message = String(rawMessage || '').trim();
    if (!message || isSending) return;

    if (message === '1' && session.audioPrompt && session.audioText) {
      speakText(session.audioText, session.language || detectedLang);
      setInput('');
      return;
    }

    const snapshotHistory = history;

    setMessages((prev) => [...prev, { role: USER, text: message, time: timestamp() }]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: snapshotHistory,
          apiKey,
          sessionId: session.id,
          preferredLanguage: session.language || undefined,
          consent: session.consent
        })
      });

      if (!res.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await res.json();
      const botLang = data.language || 'en';
      setDetectedLang(botLang);

      if (data.session) {
        const nextSession = {
          ...session,
          ...data.session,
          language: data.session.language || session.language,
          consent: data.session.consent || session.consent
        };
        setSession(nextSession);
        if (nextSession.id) safeLocalStorageSet('adypu_saathi_session_id', nextSession.id);
        if (nextSession.language) safeLocalStorageSet('adypu_saathi_language', nextSession.language);
        if (nextSession.consent) safeLocalStorageSet('adypu_saathi_consent', nextSession.consent);
      }

      const botMessage = {
        role: BOT,
        text: data.answer,
        language: botLang,
        time: timestamp(),
        sources: data.sources || [],
        audioPrompt: Boolean(data.session?.audioPrompt),
        audioText: data.session?.audioText || ''
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: BOT,
          text: 'Network anomaly detected. Please re-check connection protocols.',
          language: 'en',
          time: timestamp(),
          sources: []
        }
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function sendMessage(event) {
    event?.preventDefault();
    submitMessage(input);
  }

  function handleLanguageChange(event) {
    const nextLanguage = event.target.value;
    setDetectedLang(nextLanguage);
    setSession((prev) => ({ ...prev, language: nextLanguage }));
    safeLocalStorageSet('adypu_saathi_language', nextLanguage);
  }

  function handleQuickPrompt(prompt) {
    submitMessage(prompt);
  }

  function toggleMic() {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    recognitionRef.current.lang = SPEECH_LOCALES[session.language || detectedLang] || 'en-US';
    recognitionRef.current.start();
  }

  function speakText(text, lang) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LOCALES[lang] || 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const targetBase = utterance.lang.split('-')[0].toLowerCase();
    const matched = voices.find((voice) => voice.lang.toLowerCase().startsWith(targetBase));
    if (matched) utterance.voice = matched;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="chat-page-wrapper">
      <div className="body-background" />
      <div className="grid-overlay" />
      <div className="noise-overlay" />
      
      <main className="app-root">
        <div className="workspace-container">
          
          <motion.aside 
            initial={false}
            animate={{ x: 0, opacity: 1 }} 
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="sidebar glass-panel"
          >
            <div className="brand-section">
              <div className="logo-container" style={{ background: 'linear-gradient(135deg, var(--adypu-red), var(--adypu-red-dark))', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Terminal size={24} color="white" />
              </div>
              <div className="brand-text">
                <h1>ADYPU Saathi</h1>
                <p style={{ color: 'var(--adypu-gold)' }}>Official Campus Assistant</p>
              </div>
            </div>

            <div className="metrics-dashboard">
              <div className="metric-item">
                <div className="metric-header"><Languages size={14}/> Lang Protocol</div>
                <div className="metric-value">{activeLanguageLabel}</div>
                <select
                  className="api-key-input"
                  value={activeLanguageCode}
                  onChange={handleLanguageChange}
                  aria-label="Preferred language"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="metric-item">
                <div className="metric-header"><Database size={14}/> Core Engine</div>
                <div className="metric-value">RAG 2.0 + Neural Sync</div>
              </div>
              <div className="metric-item">
                <div className="metric-header"><Command size={14}/> OpenAI API Array</div>
                <input 
                  type="password" 
                  className="api-key-input"
                  placeholder="Insert Key (sk-proj-...)" 
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    safeLocalStorageSet('adypu_openai_key', e.target.value);
                  }}
                />
              </div>
              <div className="metric-item">
                <div className="metric-header"><Paintbrush size={14}/> UI Theme</div>
                <ThemeSelect selectClassName="api-key-input" ariaLabel="UI theme" />
              </div>
            </div>

            <div className="prompts-section">
              <div className="section-title">
                <Sparkles size={14} /> Intelligence Index
              </div>
              
              <motion.div 
                className="prompts-grid"
                variants={containerVariants}
                initial={false}
                animate="show"
              >
                {KNOWLEDGE_COLUMNS.map((col, idx) => (
                  <motion.div variants={itemVariants} key={col.title} className="prompt-category">
                    <div className="category-name">{col.title}</div>
                    <div className="prompt-list">
                      {col.prompts.map(prompt => (
                        <button key={prompt} className="prompt-btn" onClick={() => handleQuickPrompt(prompt)}>
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.aside>

          <motion.section 
            initial={false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="chat-area glass-panel"
          >
            <header className="chat-header">
              <div className="chat-header-info">
                <h2>Saathi Chat <div className="pulse-dot" style={{ backgroundColor: 'var(--adypu-gold)', boxShadow: '0 0 10px var(--adypu-gold)' }} /></h2>
                <p>Verified ADYPU assistance ready for your questions.</p>
              </div>
              <div className="status-badges">
                <Link className="badge badge-link" href="/">
                  <ArrowLeft size={14} aria-hidden="true" /> Landing
                </Link>
                <div className="badge active"><ShieldCheck size={14} /> Verified Grounding</div>
                <div className="badge"><Zap size={14} /> High-Speed Mode</div>
              </div>
            </header>

            <div className="chat-messages">
              {messages.length === 0 && (
                <motion.div 
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="greeting-hero"
                >
                  <motion.div 
                    animate={{ rotateY: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="greeting-icon"
                  >
                    <BrainCircuit />
                  </motion.div>
                  <h2>Welcome to ADYPU Saathi</h2>
                  <p>The official multilingual campus assistant for ADYPU. Select a prompt or type your question to get verified university information.</p>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((message, idx) => (
                  <motion.div
                    key={`${message.time}-${idx}`}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className={`message-wrapper ${message.role === USER ? 'message-user' : 'message-bot'}`}
                  >
                    <div className="message-content">
                      <div className="message-meta">
                        {message.role === USER ? (
                          <>User Authority <span style={{opacity: 0.5}}>{message.time}</span></>
                        ) : (
                          <><Terminal size={12} color="var(--adypu-red)"/> Nexus AI <span style={{opacity: 0.5}}>{message.time}</span></>
                        )}
                      </div>
                      
                      <div className="message-bubble">
                        {message.role === BOT ? formatBotMessage(message.text) : <p>{message.text}</p>}
                      </div>

                      {message.role === BOT && message.sources?.length > 0 && (
                        <div className="sources-container">
                          {message.sources.map((s, i) => (
                            <span key={i} className="source-tag">
                              <Database size={10} /> {s.title}
                            </span>
                          ))}
                        </div>
                      )}

                      {message.role === BOT && (
                        <div className="action-bar">
                          <button 
                            className="action-btn"
                            onClick={() => speakText(message.audioText || message.text, message.language || detectedLang)}
                            title="Synthesize audio"
                          >
                            <Volume2 size={12}/> Audio Sync
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isSending && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="message-wrapper message-bot"
                >
                  <div className="message-content">
                    <div className="message-meta"><Terminal size={12} color="var(--adypu-red)"/> Nexus AI </div>
                    <div className="message-bubble" style={{ padding: '0.8rem 1rem'}}>
                      <div className="typing-indicator">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={endRef} />
            </div>

            <section className="chat-composer-section">
              <form className="chat-composer" onSubmit={sendMessage}>
                <button
                  type="button"
                  className={`composer-btn ${isListening ? 'active' : ''}`}
                  onClick={toggleMic}
                  disabled={!voiceSupported}
                  title="Voice input"
                >
                  <Mic size={20} />
                </button>
                <textarea 
                  className="chat-input"
                  placeholder="Initialize command sequence..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={1}
                />
                <button 
                  type="submit" 
                  className="composer-btn send"
                  onClick={sendMessage}
                  disabled={!canSend}
                  aria-label="Send message"
                  title="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
            </section>
          </motion.section>

        </div>
      </main>
    </div>
  );
}
