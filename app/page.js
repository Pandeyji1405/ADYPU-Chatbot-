'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Volume2, ShieldCheck, Languages, BrainCircuit } from 'lucide-react';
import { GLOBAL_LANGUAGES, INDIAN_LANGUAGES, SPEECH_LOCALES } from '@/lib/language-support.js';

const BOT = 'bot';
const USER = 'user';

const KNOWLEDGE_COLUMNS = [
  {
    title: 'Deans',
    prompts: ['SoD dean name', 'SSD dean name', 'Law and Liberal Arts dean']
  },
  {
    title: 'Admissions',
    prompts: ['Admissions link', 'Admission process steps', 'Mandatory disclosures link']
  },
  {
    title: 'Fees',
    prompts: ['Hostel fee range', 'Fees PDF 2025-26', 'Hostel contact number']
  },
  {
    title: 'Placements',
    prompts: ['Who handles placements?', 'SPCR full form', 'Placements page link']
  },
  {
    title: 'Shortforms',
    prompts: ['SSD full form', 'SoD full form', 'SSD vs SoD difference']
  },
  {
    title: 'Officials',
    prompts: ['Vice Chancellor name', 'Registrar name', 'Registrar email']
  }
];

const INDIAN_LANG_LABEL = INDIAN_LANGUAGES.map((lang) => lang.name).join(', ');
const GLOBAL_LANG_LABEL = GLOBAL_LANGUAGES.map((lang) => lang.name).join(', ');

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function canUseSpeechRecognition() {
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

export default function Home() {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState([
    {
      role: BOT,
      text: 'Welcome to ADYPU. Ask queries by category: Deans, Admissions, Fees, Placements, SSD, SoD.',
      language: 'en',
      time: timestamp(),
      sources: []
    }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [detectedLang, setDetectedLang] = useState('en');
  const [voiceSupported, setVoiceSupported] = useState(false);

  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  const history = useMemo(() => {
    return messages
      .filter((m) => m.role === USER || m.role === BOT)
      .map((m) => ({ role: m.role === USER ? 'user' : 'assistant', content: m.text }))
      .slice(-10);
  }, [messages]);

  useEffect(() => {
    const storedKey = localStorage.getItem('adypu_openai_key');
    if (storedKey) setApiKey(storedKey);
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
    const message = rawMessage.trim();
    if (!message || isSending) return;

    const snapshotHistory = history;

    setMessages((prev) => [...prev, { role: USER, text: message, time: timestamp() }]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: snapshotHistory, apiKey })
      });

      if (!res.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await res.json();
      const botLang = data.language || 'en';
      setDetectedLang(botLang);

      const botMessage = {
        role: BOT,
        text: data.answer,
        language: botLang,
        time: timestamp(),
        sources: data.sources || []
      };

      setMessages((prev) => [...prev, botMessage]);
      speakText(botMessage.text, botMessage.language || 'en');
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: BOT,
          text: 'Network or server issue. Please try again in a few seconds.',
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

  function handleQuickPrompt(prompt) {
    submitMessage(prompt);
  }

  function toggleMic() {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    recognitionRef.current.lang = SPEECH_LOCALES[detectedLang] || 'en-US';
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

  return (
    <main className="app-root">
      <div className="light-layer" aria-hidden="true" />

      <section className="workspace">
        <motion.aside
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="control-panel glass-panel"
        >
          <header className="brand-row">
            <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="logo-shell">
              <img src="/adypu-logo.svg" alt="ADYPU Logo" className="logo" />
            </motion.div>

            <div className="brand-copy">
              <h1>ADYPU AI Assistant</h1>
              <p>Multilingual Professional Concierge</p>
            </div>
          </header>

          <div className="avatar-stage" aria-hidden="true">
            <div className="avatar-halo" />
            <div className="avatar-orb" />
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />
          </div>

          <section className="metric-grid">
            <article className="metric-card">
              <span className="metric-label">
                <Languages size={14} /> Detected Language
              </span>
              <strong>{detectedLang.toUpperCase()}</strong>
            </article>

            <article className="metric-card">
              <span className="metric-label">
                <BrainCircuit size={14} /> Knowledge Mode
              </span>
              <strong>RAG + Translation</strong>
            </article>

            <article className="metric-card">
              <span className="metric-label">
                <ShieldCheck size={14} /> Voice Input
              </span>
              <strong>{voiceSupported ? 'Enabled' : 'Not Supported'}</strong>
            </article>
          </section>

          <section className="metric-grid" style={{ marginTop: '0.4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span className="metric-label" style={{ fontSize: '0.7rem' }}>OpenAI API Key (Optional)</span>
              <input 
                type="password" 
                placeholder="sk-proj-..." 
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem('adypu_openai_key', e.target.value);
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', 
                  borderRadius: '10px', padding: '0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none'
                }}
              />
            </div>
          </section>

          <section className="knowledge-columns">
            <h3>Knowledge Columns</h3>
            <div className="topic-grid">
              {KNOWLEDGE_COLUMNS.map((column, i) => (
                <motion.article
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={column.title}
                  className="topic-card"
                >
                  <h4>{column.title}</h4>
                  <div className="topic-actions">
                    {column.prompts.map((prompt) => (
                      <button
                        key={`${column.title}-${prompt}`}
                        type="button"
                        className="topic-btn"
                        onClick={() => handleQuickPrompt(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        </motion.aside>

        <motion.section
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="chat-panel glass-panel"
        >
          <header className="chat-topbar">
            <div>
              <h2>ADYPU Multilingual Knowledge Desk</h2>
              <p>Official-information-first responses with retrieval grounding and language-aware support.</p>
            </div>

            <div className="status-group">
              <span className="status-pill">
                <ShieldCheck size={14} /> Official Data
              </span>
              <span className="status-pill">
                <BrainCircuit size={14} /> Exact Answer Mode
              </span>
            </div>
          </header>

          <div className="messages-scroll">
            <AnimatePresence initial={false}>
              {messages.map((message, idx) => (
                <motion.article
                  key={`${message.role}-${idx}`}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`message-row ${message.role === USER ? 'from-user' : 'from-bot'}`}
                >
                  <div className="bubble">
                    <div className="bubble-meta">
                      <span>{message.role === USER ? 'You' : 'ADYPU AI'}</span>
                      <time>{message.time || timestamp()}</time>
                    </div>

                    <p className="bubble-text">{message.text}</p>

                    {message.role === BOT && message.sources?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.4 }}
                        className="source-list"
                      >
                        {message.sources.map((source, sourceIndex) => (
                          <span key={`${source.title}-${sourceIndex}`} className="source-tag" title={source.title}>
                            {source.title}
                          </span>
                        ))}
                      </motion.div>
                    )}

                    {message.role === BOT && (
                      <button
                        type="button"
                        className="speak-inline"
                        title="Read aloud"
                        onClick={() => speakText(message.text, message.language || detectedLang || 'en')}
                      >
                        <Volume2 size={14} />
                        <span>Speak</span>
                      </button>
                    )}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="typing-row"
              >
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </motion.div>
            )}

            <div ref={endRef} />
          </div>

          <div className="composer-container">
            <form className="composer" onSubmit={sendMessage}>
              <button
                type="button"
                className={`icon-btn mic-btn ${isListening ? 'live' : ''}`}
                onClick={toggleMic}
                title="Voice input"
                disabled={!voiceSupported}
              >
                <Mic size={20} />
              </button>

              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your ADYPU query in any language..."
                aria-label="Chat input"
              />

              <button className="icon-btn send-btn" type="submit" disabled={isSending || !input.trim()}>
                <Send size={18} />
                <span>{isSending ? 'Sending' : 'Send'}</span>
              </button>
            </form>
          </div>
        </motion.section>
      </section>
    </main>
  );
}
