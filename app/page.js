import Link from 'next/link';
import { ArrowRight, BrainCircuit, Database, Languages, Mic, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

import styles from './page.module.css';

const FEATURE_CARDS = [
  {
    icon: <Languages size={20} aria-hidden="true" />,
    title: 'Multilingual onboarding',
    description: 'Explicit language selection with a multilingual welcome flow and translation support when keys are configured.'
  },
  {
    icon: <Sparkles size={20} aria-hidden="true" />,
    title: 'Intent + scripted flows',
    description: 'Examiner-friendly intent taxonomy (INT-01…INT-18) with structured responses for key campus tasks.'
  },
  {
    icon: <BrainCircuit size={20} aria-hidden="true" />,
    title: 'Grounded RAG answers',
    description: 'Retrieval over the local ADYPU knowledge base for accurate, citation-ready responses.'
  },
  {
    icon: <Database size={20} aria-hidden="true" />,
    title: 'Verified KB only',
    description: 'No web-search fallback — if something is out of scope, Saathi returns the strict official-contact fallback.'
  },
  {
    icon: <ShieldCheck size={20} aria-hidden="true" />,
    title: 'Consent-first logging',
    description: 'Session logging is consent-gated and designed to keep user privacy at the core.'
  },
  {
    icon: <Mic size={20} aria-hidden="true" />,
    title: 'Voice ready',
    description: 'Optional voice input (speech recognition) and audio playback (TTS) for faster campus support.'
  }
];

function FeatureCard({ icon, title, description }) {
  return (
    <div className={`${styles.card} glass-panel`}>
      <div className={styles.cardIcon}>{icon}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{description}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className="body-background" />
      <div className={styles.gridOverlay} aria-hidden="true" />
      <div className="noise-overlay" />

      <header className={`${styles.nav} glass-panel`}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.brand} aria-label="ADYPU Saathi home">
            <div className={styles.brandMark} aria-hidden="true">
              <img className={styles.brandLogo} src="/adypu-logo.svg" alt="" />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>ADYPU Saathi</span>
              <span className={styles.brandMeta}>Multilingual Campus Chatbot</span>
            </div>
          </Link>

          <nav className={styles.navLinks} aria-label="Landing page">
            <a className={styles.navLink} href="#features">
              Features
            </a>
            <a className={styles.navLink} href="#how">
              How it works
            </a>
            <a className={styles.navLink} href="#privacy">
              Privacy
            </a>
            <Link className={styles.navCta} href="/chat">
              Open chat <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <div className={styles.kicker}>
              <Terminal size={14} aria-hidden="true" />
              <span>Official-style ADYPU assistant demo</span>
            </div>

            <h1 className={styles.title}>
              Multilingual campus help,
              <span className={styles.titleAccent}> grounded in verified ADYPU knowledge.</span>
            </h1>

            <p className={styles.subtitle}>
              Designed for an examiner-ready walkthrough: language onboarding, consent gate, intent flows, KB-only grounding, and
              optional voice.
            </p>

            <div className={styles.actions}>
              <Link className={styles.primaryBtn} href="/chat">
                Start chatting <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a className={styles.secondaryBtn} href="#features">
                Explore features
              </a>
            </div>

            <ul className={styles.badges} aria-label="Highlights">
              <li className={styles.badge}>
                <Languages size={14} aria-hidden="true" /> Multilingual onboarding
              </li>
              <li className={styles.badge}>
                <Database size={14} aria-hidden="true" /> Verified KB only
              </li>
              <li className={styles.badge}>
                <Mic size={14} aria-hidden="true" /> Voice input + TTS
              </li>
            </ul>
          </div>

          <div className={styles.heroVisual}>
            <div className={`${styles.preview} glass-panel`} aria-label="Chat preview">
              <div className={styles.previewHeader}>
                <div className={styles.previewTitle}>
                  <div className={styles.previewOrb} aria-hidden="true">
                    <BrainCircuit size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <div className={styles.previewName}>Saathi Console</div>
                    <div className={styles.previewMeta}>KB-grounded • source aware</div>
                  </div>
                </div>
                <div className={styles.previewPill}>
                  <ShieldCheck size={14} aria-hidden="true" /> Consent-gated
                </div>
              </div>

              <div className={styles.previewBody}>
                <div className={styles.msgUser}>
                  <div className={styles.msgLabel}>You</div>
                  <div className={styles.bubbleUser}>Hostel fee range?</div>
                </div>

                <div className={styles.msgBot}>
                  <div className={styles.msgLabel}>Saathi</div>
                  <div className={styles.bubbleBot}>
                    I can answer using the verified ADYPU knowledge base. Here’s what I found, with sources you can click.
                  </div>
                  <div className={styles.chips} aria-label="Sources">
                    <span className={styles.chip}>Source: KB</span>
                    <span className={styles.chip}>Citations</span>
                    <span className={styles.chip}>No web search</span>
                  </div>
                </div>
              </div>

              <div className={styles.previewFooter} aria-hidden="true">
                <div className={styles.fakeInput}>
                  Ask about admissions, fees, contacts…
                  <span className={styles.cursor} />
                </div>
                <div className={styles.sendBtn}>
                  <ArrowRight size={16} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built for real campus questions</h2>
            <p className={styles.sectionSubtitle}>
              Saathi is opinionated by design: strict grounding, predictable flows, and a clean demo experience.
            </p>
          </div>

          <div className={styles.cardGrid}>
            {FEATURE_CARDS.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <section id="how" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <p className={styles.sectionSubtitle}>A simple flow that stays robust under live demo pressure.</p>
          </div>

          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepIndex}>1</span>
              <div>
                <div className={styles.stepTitle}>Choose your language</div>
                <div className={styles.stepDesc}>Saathi starts with a multilingual welcome and explicit selection.</div>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepIndex}>2</span>
              <div>
                <div className={styles.stepTitle}>Confirm consent</div>
                <div className={styles.stepDesc}>Session logging is only enabled after the user grants consent.</div>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepIndex}>3</span>
              <div>
                <div className={styles.stepTitle}>Ask your campus question</div>
                <div className={styles.stepDesc}>Intent routing + retrieval over local KB keeps answers grounded.</div>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepIndex}>4</span>
              <div>
                <div className={styles.stepTitle}>Get sources + optional audio</div>
                <div className={styles.stepDesc}>Cited sources in UI, with speech input and TTS where supported.</div>
              </div>
            </li>
          </ol>
        </section>

        <section id="privacy" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Privacy-first by default</h2>
            <p className={styles.sectionSubtitle}>Clear consent, minimal surprises, and a demo story you can defend.</p>
          </div>

          <div className={styles.privacyGrid}>
            <div className={`${styles.privacyCard} glass-panel`}>
              <div className={styles.privacyTop}>
                <ShieldCheck size={18} aria-hidden="true" />
                <h3 className={styles.privacyTitle}>Consent gate before any logging</h3>
              </div>
              <p className={styles.privacyDesc}>
                Until consent is granted, Saathi avoids storing session history and keeps the experience transparent.
              </p>
            </div>
            <div className={`${styles.privacyCard} glass-panel`}>
              <div className={styles.privacyTop}>
                <Database size={18} aria-hidden="true" />
                <h3 className={styles.privacyTitle}>Grounded answers (KB-only)</h3>
              </div>
              <p className={styles.privacyDesc}>
                Saathi is designed to use the bundled ADYPU knowledge files and return a strict official-contact fallback when
                out of scope.
              </p>
            </div>
          </div>

          <div className={styles.finalCta}>
            <div className={styles.finalCtaText}>
              <h3 className={styles.finalCtaTitle}>Ready to try the demo?</h3>
              <p className={styles.finalCtaDesc}>Open the chat console and ask about admissions, fees, officials, or contacts.</p>
            </div>
            <Link className={styles.finalCtaBtn} href="/chat">
              Open chat <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <img className={styles.footerLogo} src="/adypu-logo.svg" alt="" aria-hidden="true" />
            <span>ADYPU Saathi</span>
          </div>
          <div className={styles.footerMeta}>Next.js App Router • KB-grounded • Multilingual</div>
        </div>
      </footer>
    </div>
  );
}

