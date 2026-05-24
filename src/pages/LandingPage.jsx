import React, { useState } from 'react';
import './LandingPage.css';

/* ─── Hero gradient text ─── */
const GradText = ({ children }) => (
  <span style={{
    background: 'linear-gradient(135deg,#ffffff 0%,#a8cfe8 60%,#6eaad0 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
  }}>{children}</span>
);

const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const navLinks = [
  { label: 'Solutions', href: '#solutions' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const faqs = [
    { q: 'Is my clinic data secure?', a: 'Yes — all data is AES-256 encrypted at rest and in transit via TLS 1.3. We are SOC-2 compliant and never share patient information.' },
    { q: 'Is there a free trial?', a: 'Absolutely. Start a 14-day free trial with no credit card required. Full feature access from day one.' },
    { q: 'Can I manage multiple clinic branches?', a: 'Yes. Professional and Enterprise plans support multi-clinic access with role-based permissions per branch.' },
    { q: 'Can I export patient data and reports?', a: 'Export records, prescriptions, and analytics as PDF or CSV any time from the dashboard.' },
    { q: 'Does SevaFlow work offline?', a: 'Core read operations are cached locally. Full offline write support is on our Q3 2025 roadmap.' },
  ];

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════
          DARK NAVBAR (sticky, over the video hero)
      ═══════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#020b12]/80">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-semibold tracking-tight text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Seva<span style={{ color: '#6eaad0' }}>Flow</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Login</a>
            <button className="rounded-full px-6 py-2.5 text-sm font-medium text-[#020b12] cursor-pointer transition-transform hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#e0f0ff,#b8d8f0,#fff)' }}>
              Book Demo
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/60 hover:text-white p-2">
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 px-4 py-4 flex flex-col gap-4 bg-[#020b12]/95">
            {navLinks.map(l => <a key={l.label} href={l.href} className="text-sm text-white/60 hover:text-white" onClick={() => setMenuOpen(false)}>{l.label}</a>)}
            <a href="/login" className="text-sm text-white/60 hover:text-white">Login</a>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════
          1. DARK VIDEO HERO
      ═══════════════════════════════════════════ */}
      <div className="relative min-h-screen flex flex-col bg-[#020b12] overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#020b12]/60 via-transparent to-[#020b12] z-0" />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-24">
          <span className="inline-flex items-center gap-1 border border-white/10 text-white/50 text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 bg-white/5">
            <Icon name="verified" className="text-[16px]" /> Next-Gen Clinic Operations
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[0.95] tracking-[-2px] max-w-5xl mb-6 text-white fr"
            style={{ fontFamily: "'Instrument Serif', serif" }}>
            Manage Patient Records<br />
            <GradText>& Prescriptions Faster</GradText>
          </h1>
          <p className="text-white/55 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10 fr-1">
            Reduce repetitive work and keep clinic workflows organized — from appointments to AI-powered prescriptions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fr-2">
            <button className="rounded-full px-10 py-4 text-base font-medium text-[#020b12] cursor-pointer transition-transform hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#e0f0ff,#b8d8f0,#fff)' }}>
              Book Demo
            </button>
            <button className="rounded-full px-10 py-4 text-base font-medium text-white/80 border border-white/15 backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
              Start Free Trial
            </button>
          </div>
          <p className="text-white/25 text-xs mt-6 tracking-wide fr-3">No credit card required · 14-day free trial · Cancel anytime</p>
        </div>

        <div className="relative z-10 pb-16 flex justify-center gap-12 text-center">
          {[['500+','Clinics onboarded'],['2M+','Prescriptions generated'],['99.9%','Uptime SLA']].map(([n,l]) => (
            <div key={n}>
              <div className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "'Instrument Serif', serif" }}><GradText>{n}</GradText></div>
              <div className="text-white/35 text-xs mt-1 tracking-wide uppercase">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          LIGHT CLINICAL SECTIONS START HERE
      ═══════════════════════════════════════════ */}

      {/* 2. PRODUCT PREVIEW */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold text-[#0b1c30] mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>See SevaFlow in action</h2>
            <p className="text-[#3e484f] max-w-xl mx-auto">Explore integrated modules that unify your entire medical practice into a single source of truth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'groups', tag: 'Unified CRM', title: 'Patient Lifecycle', desc: 'Manage relationships from the first touch to post-care follow-ups seamlessly.', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&auto=format&fit=crop' },
              { icon: 'medication', tag: 'Intelligent Rx', title: 'Rx Builder', desc: 'AI-assisted prescription drafting with built-in interaction alerts and history.', img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80&auto=format&fit=crop' },
              { icon: 'history', tag: 'Timeline', title: 'Clinical History', desc: 'A vertical timeline of every intervention, scan, and lab result in one view.', img: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80&auto=format&fit=crop' },
            ].map(c => (
              <div key={c.title} className="group bg-white border border-[#bdc8d1]/30 rounded-xl overflow-hidden shadow-sm hover:-translate-y-1 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 text-[#00668a]">
                    <Icon name={c.icon} />
                    <span className="text-xs font-semibold uppercase tracking-wider">{c.tag}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0b1c30] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{c.title}</h3>
                  <p className="text-[#3e484f] text-sm leading-relaxed">{c.desc}</p>
                </div>
                <img src={c.img} alt={c.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section id="solutions" className="py-20 bg-[#f8f9ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-[#00668a] text-xs font-semibold uppercase tracking-widest">System Strengths</span>
              <h2 className="text-[32px] font-bold text-[#0b1c30] mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Built for how clinics actually work</h2>
            </div>
            <p className="text-[#3e484f] max-w-sm text-sm leading-relaxed">We eliminated the friction in the patient journey, automating everything but the care.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: 'event_available', title: 'Smart Scheduling', desc: 'Optimized booking that reduces idle time between appointments.' },
              { icon: 'receipt_long', title: 'Auto Billing', desc: 'Automated invoicing and GST compliance in real-time.' },
              { icon: 'shield', title: 'HIPAA Ready', desc: 'Enterprise-grade security ensuring absolute data sovereignty.' },
              { icon: 'analytics', title: 'Ops Analytics', desc: 'Visualized performance data for smarter administrative decisions.' },
              { icon: 'smart_toy', title: 'AI Assistance', desc: 'Neural OCR and Voice-to-Text for instant record digitization.' },
              { icon: 'group', title: 'Multi-User Access', desc: 'Role-based permissions for doctors, nurses, and admins.' },
              { icon: 'whatsapp', title: 'WhatsApp Reminders', desc: 'Automated patient reminders sent 24h before every appointment.' },
              { icon: 'folder_shared', title: 'Patient CRM', desc: 'Full lifecycle tracking from first visit to long-term follow-ups.' },
            ].map(f => (
              <div key={f.title} className="bg-[#eff4ff] p-6 rounded-xl border border-[#bdc8d1]/30 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-[#00668a] rounded-lg flex items-center justify-center text-white mb-4">
                  <Icon name={f.icon} />
                </div>
                <h4 className="font-bold text-[#0b1c30] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{f.title}</h4>
                <p className="text-[#3e484f] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="text-center mb-12">
            <span className="text-[#00668a] text-xs font-semibold uppercase tracking-widest">Get started in minutes</span>
            <h2 className="text-[32px] font-bold text-[#0b1c30] mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Three steps to a smarter clinic</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', icon: 'add_business', title: 'Create Your Clinic', desc: 'Sign up, configure your clinic profile, add team members and fee structure in minutes.' },
              { num: '02', icon: 'person_add', title: 'Add Patients', desc: 'Import existing records or add new patients. Instant search and a complete CRM ready from day one.' },
              { num: '03', icon: 'description', title: 'Prescribe & Track', desc: 'Use smart Rx templates, Voice input, or Neural OCR. Track every follow-up automatically.' },
            ].map((s, i) => (
              <div key={s.num} className="relative bg-[#eff4ff] rounded-xl p-8 border border-[#bdc8d1]/30">
                {i < 2 && <div className="hidden md:block absolute top-10 right-0 translate-x-full w-8 border-t-2 border-dashed border-[#bdc8d1]/40 z-10" />}
                <div className="text-5xl font-black text-[#00668a]/10 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>{s.num}</div>
                <div className="w-10 h-10 bg-[#00668a] rounded-lg flex items-center justify-center text-white mb-4">
                  <Icon name={s.icon} />
                </div>
                <h3 className="font-bold text-[#0b1c30] text-lg mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{s.title}</h3>
                <p className="text-[#3e484f] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AI INNOVATION HUB */}
      <section className="py-20 bg-[#dce9ff] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.06] pointer-events-none flex items-center justify-end pr-8">
          <Icon name="neurology" className="text-[320px] text-[#00668a]" />
        </div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 relative z-10">
          <div className="text-center mb-16">
            <span className="bg-[#38bdf8]/20 text-[#00668a] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">The Crown Jewel</span>
            <h2 className="text-[32px] font-bold text-[#0b1c30] mt-4" style={{ fontFamily: 'Manrope, sans-serif' }}>AI Innovation Hub</h2>
            <p className="text-[#3e484f] max-w-2xl mx-auto mt-2 text-sm leading-relaxed">SevaFlow's intelligence engine transforms raw clinical data into proactive care strategies.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'document_scanner', title: 'Neural OCR', desc: 'Instant digitization of physical records with 99.8% medical term accuracy. Stop manual entry today.' },
              { icon: 'mic', title: 'Voice-to-Text Rx', desc: 'Ambient clinical documentation. Record patient encounters and let SevaFlow draft the notes in English/Hindi.' },
              { icon: 'monitoring', title: 'Condition Tracker', desc: 'Predictive modeling for chronic conditions, alerting you before minor issues become major complications.' },
            ].map(f => (
              <div key={f.title} className="group bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#38bdf8]/20 rounded-lg text-[#00668a]">
                    <Icon name={f.icon} className="text-[28px]" />
                  </div>
                  <h3 className="font-bold text-[#0b1c30] text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>{f.title}</h3>
                </div>
                <p className="text-[#3e484f] text-sm leading-relaxed mb-4">{f.desc}</p>
                <div className="h-1 bg-[#bdc8d1]/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00668a] w-0 group-hover:w-full transition-all duration-1000 ease-out" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ROI SECTION */}
      <section className="py-20 bg-[#00668a] text-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <h2 className="text-[32px] font-bold mb-16" style={{ fontFamily: 'Manrope, sans-serif' }}>Real ROI for real clinics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { stat: '70%', label: 'Operational Efficiency', desc: 'Reduction in paperwork and manual processing time across all clinical departments.' },
              { stat: '3x', label: 'Patient Retention', desc: 'Increase in follow-up compliance through automated clinical engagement.' },
              { stat: '100%', label: 'Data Security', desc: 'Compliant encrypted storage for all patient records and diagnostic imaging files.' },
            ].map((r, i) => (
              <div key={r.stat} className={`py-6 ${i === 1 ? 'border-y md:border-y-0 md:border-x border-white/20' : ''}`}>
                <div className="text-[64px] font-black leading-none mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>{r.stat}</div>
                <p className="text-xs uppercase tracking-widest text-[#c4e7ff] font-semibold mb-3">{r.label}</p>
                <p className="text-white/80 text-sm leading-relaxed max-w-xs mx-auto">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. COMPARISON TABLE */}
      <section className="py-20 bg-[#f8f9ff]">
        <div className="max-w-[800px] mx-auto px-4 md:px-16">
          <h2 className="text-[32px] font-bold text-[#0b1c30] text-center mb-12" style={{ fontFamily: 'Manrope, sans-serif' }}>From broken to brilliant</h2>
          <div className="bg-white rounded-2xl border border-[#bdc8d1]/30 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#eff4ff]">
                <tr>
                  <th className="p-6 text-xs font-semibold text-[#3e484f] uppercase tracking-wider">The Problem</th>
                  <th className="p-6 text-xs font-semibold text-[#00668a] uppercase tracking-wider">The SevaFlow Way</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#bdc8d1]/15">
                {[
                  ['Fragmented data in legacy EMRs', 'Unified clinical command center'],
                  ['Manual Rx cross-checking', 'AI-driven interaction alerts'],
                  ['Lost patient follow-ups', 'Automated CRM engagement'],
                  ['Scattered paper records', 'Neural OCR instant digitization'],
                  ['No billing automation', 'Direct prescription-to-invoice sync'],
                ].map(([prob, sol]) => (
                  <tr key={prob}>
                    <td className="p-5">
                      <div className="flex items-start gap-3">
                        <Icon name="cancel" className="text-[#ba1a1a] text-[20px] mt-0.5 shrink-0" />
                        <span className="text-sm text-[#3e484f]">{prob}</span>
                      </div>
                    </td>
                    <td className="p-5 bg-[#38bdf8]/5">
                      <div className="flex items-start gap-3">
                        <Icon name="check_circle" className="text-[#00668a] text-[20px] mt-0.5 shrink-0" />
                        <span className="text-sm font-medium text-[#0b1c30]">{sol}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-20 bg-[#eff4ff]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="text-center mb-12">
            <span className="text-[#00668a] text-xs font-semibold uppercase tracking-widest">Pilot Users</span>
            <h2 className="text-[32px] font-bold text-[#0b1c30] mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Feedback from early adopters</h2>
            <p className="text-[#3e484f] text-sm mt-2">Real quotes from pilot clinic users. Wider testimonials coming soon.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: 'SevaFlow cut my administrative time in half. I can finally focus on patients instead of paperwork.', name: 'Dr. Priya Nair', role: 'General Physician, Kochi', initials: 'PN' },
              { quote: 'The WhatsApp reminder system eliminated nearly all our no-shows. Incredible ROI from day one.', name: 'Dr. Ramesh Gupta', role: 'Pediatrician, Jaipur', initials: 'RG' },
              { quote: 'The AI OCR feature is unreal. We digitized 3 years of physical files in a single afternoon.', name: 'Dr. Amandeep Singh', role: 'Clinic Owner, Ludhiana', initials: 'AS' },
            ].map(t => (
              <div key={t.name} className="bg-white p-8 rounded-xl shadow-sm border border-[#bdc8d1]/20 hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-1 text-[#00668a] mb-5">
                  {[...Array(5)].map((_, i) => <Icon key={i} name="star" className="text-[18px]" />)}
                </div>
                <p className="text-[#0b1c30] italic mb-6 text-sm leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#38bdf8]/20 flex items-center justify-center text-[#00668a] font-bold text-sm">{t.initials}</div>
                  <div>
                    <div className="font-semibold text-[#0b1c30] text-sm">{t.name}</div>
                    <div className="text-[#3e484f] text-xs mt-0.5">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PRICING */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-[#0b1c30]" style={{ fontFamily: 'Manrope, sans-serif' }}>Simple, Clinical Pricing</h2>
            <p className="text-[#3e484f] mt-2">Choose the plan that fits your practice. All plans include a 14-day free trial.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: '₹999', period: '/mo', pop: false, features: ['1 doctor account', 'Up to 500 patients', 'Prescription builder', 'Basic appointments', 'PDF export'] },
              { name: 'Professional', price: '₹2,499', period: '/mo', pop: true, features: ['Up to 5 doctors', 'Unlimited patients', 'WhatsApp reminders', 'GST billing & analytics', 'Neural OCR + Voice Rx', 'AI Innovation Hub'] },
              { name: 'Enterprise', price: 'Custom', period: '', pop: false, features: ['Unlimited doctors & branches', 'Dedicated support SLA', 'Custom integrations', 'White-label ready', 'HIPAA / DPDPA compliance'] },
            ].map((p, i) => (
              <div key={p.name} className={`relative rounded-xl p-8 border shadow-sm ${p.pop ? 'border-2 border-[#00668a] md:scale-105 z-10 bg-white' : 'border-[#bdc8d1]/30 bg-white'}`}>
                {p.pop && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00668a] text-white px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="text-xs text-[#3e484f] font-semibold uppercase tracking-wider mb-2">{p.name}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-[#0b1c30]" style={{ fontFamily: 'Manrope, sans-serif' }}>{p.price}</span>
                  <span className="text-[#3e484f] text-sm">{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#0b1c30]">
                      <Icon name="check_circle" className="text-[#00668a] text-[18px] shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${p.pop ? 'bg-[#00668a] text-white hover:brightness-110' : 'border border-[#00668a] text-[#00668a] hover:bg-[#38bdf8]/10'}`}>
                  {i === 2 ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-20 bg-[#f8f9ff]">
        <div className="max-w-[720px] mx-auto px-4 md:px-16">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold text-[#0b1c30]" style={{ fontFamily: 'Manrope, sans-serif' }}>Frequently asked questions</h2>
          </div>
          <div className="divide-y divide-[#bdc8d1]/30">
            {faqs.map((f, i) => (
              <div key={i} className="py-5">
                <button className="w-full flex justify-between items-center text-left gap-4 text-[#0b1c30] font-medium text-sm hover:text-[#00668a] transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <Icon name={openFaq === i ? 'remove' : 'add'} className="text-[#00668a] shrink-0" />
                </button>
                {openFaq === i && <p className="mt-4 text-sm text-[#3e484f] leading-relaxed">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="py-24 bg-[#dce9ff]">
        <div className="max-w-[800px] mx-auto px-4 md:px-16 text-center">
          <h2 className="text-[40px] font-bold text-[#0b1c30] mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Ready to focus on your patients?</h2>
          <p className="text-[#3e484f] text-lg mb-10 leading-relaxed">Join 500+ clinics worldwide who have upgraded their operations with SevaFlow.</p>
          <button className="bg-[#00668a] text-white font-bold px-16 py-5 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-base"
            style={{ fontFamily: 'Manrope, sans-serif' }}>
            Get Started Instantly
          </button>
          <p className="mt-4 text-xs text-[#3e484f]">No credit card required for 14-day trial.</p>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer id="contact" className="bg-[#eff4ff] border-t border-[#bdc8d1]/30 py-12">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Icon name="monitor_heart" className="text-[#00668a] text-[28px]" />
            <span className="text-xl font-bold text-[#00668a]" style={{ fontFamily: 'Manrope, sans-serif' }}>SevaFlow</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {['Solutions', 'Security', 'Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
              <a key={l} href="#" className="text-xs text-[#3e484f] hover:text-[#00668a] transition-colors font-medium">{l}</a>
            ))}
          </div>
          <p className="text-xs text-[#3e484f]">© {new Date().getFullYear()} SevaFlow. Precision Healthcare Systems.</p>
        </div>
      </footer>

    </div>
  );
}
