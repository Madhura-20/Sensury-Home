import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Home, Menu, X } from 'lucide-react';
import { AppPage } from '../types/sensury';
import { useSensury } from '../context/SensuryContext';
import { ResilientImage } from '../components/ResilientImage';
import { TAMIL_NADU_DISTRICTS } from '../data/referenceCatalog';

interface LandingPageProps {
  onNavigate: (page: AppPage, authMode?: 'login' | 'register') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { user, submitPublicInquiry } = useSensury();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Chennai');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGetStarted = () => {
    setMobileMenuOpen(false);
    if (user) {
      onNavigate('planner');
    } else {
      onNavigate('auth', 'register');
    }
  };

  const handleLogin = () => {
    setMobileMenuOpen(false);
    if (user) {
      onNavigate('dashboard');
    } else {
      onNavigate('auth', 'login');
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (name.trim().length < 2 || !email.includes('@') || message.trim().length < 5) {
      setErrorMsg('Please enter your name, a valid email address, and a brief message.');
      return;
    }
    setSubmitting(true);
    try {
      await submitPublicInquiry({ name, email, district, message });
      setSubmitStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setSubmitStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send inquiry right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F233D]">
      {/* Navigation Header: Warm White, Deep Navy, Subtle Natural Green */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur border-b border-[#E6E2DA]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Brand Logo + Wordmark */}
          <button
            type="button"
            onClick={() => scrollToSection('top')}
            className="inline-flex items-center gap-2.5 text-[#0F233D] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-[#0F233D] text-[#FAF8F5] flex items-center justify-center shrink-0">
              <Home className="w-4 h-4" strokeWidth={2} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">SENSURY HOME</span>
          </button>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#475569]">
            <button
              type="button"
              onClick={() => scrollToSection('top')}
              className="hover:text-[#0F233D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-[#0F233D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('journey');
              }}
              className="hover:text-[#0F233D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Construction Guide
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('materials');
              }}
              className="hover:text-[#0F233D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Materials
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('calculator');
              }}
              className="hover:text-[#0F233D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Cost Calculator
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="hover:text-[#0F233D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              About Us
            </button>
          </nav>

          {/* Actions + Mobile Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleLogin}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-[#0F233D] border border-[#CBD5E1] bg-white rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {user ? 'Dashboard' : 'Login'}
            </button>
            <button
              type="button"
              onClick={handleGetStarted}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1F5F46] rounded-lg hover:bg-[#174A36] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {user ? 'Open Planner' : 'Get Started'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 text-[#0F233D] rounded-lg hover:bg-[#EFECE6] cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Tablet & Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E6E2DA] bg-white px-4 py-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium text-[#0F233D]">
              <button
                type="button"
                onClick={() => scrollToSection('top')}
                className="text-left px-3 py-2 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="text-left px-3 py-2 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('journey');
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
              >
                Construction Guide
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('materials');
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
              >
                Materials
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('calculator');
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cost Calculator
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className="text-left px-3 py-2 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
              >
                About Us
              </button>
            </div>
            <div className="pt-2 border-t border-[#E6E2DA] flex gap-3">
              <button
                type="button"
                onClick={handleLogin}
                className="flex-1 py-2.5 text-sm font-semibold text-[#0F233D] border border-[#CBD5E1] rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
              >
                {user ? 'Dashboard' : 'Login'}
              </button>
              <button
                type="button"
                onClick={handleGetStarted}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#1F5F46] rounded-lg hover:bg-[#174A36] cursor-pointer"
              >
                {user ? 'Open Planner' : 'Get Started'}
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 pb-16 lg:pt-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-semibold text-[#1F5F46] mb-3">
                SENSURY HOME · Home is where Mom is.
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-[#0F233D] leading-[1.08] text-balance mb-5">
                Plan, understand, and complete your dream home with confidence.
              </h1>
              <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl mb-8">
                A home is filled with memories, safety, and belonging. SENSURY HOME helps families
                and first-time builders across Tamil Nadu and India plan budgets, understand
                construction stages, compare materials, and track progress—even with zero prior
                building knowledge.
              </p>

              {/* Prominent Primary Actions: Get Started & Login */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#1F5F46] rounded-lg hover:bg-[#174A36] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{user ? 'Go to Home Planner' : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="px-6 py-3.5 text-sm font-semibold text-[#0F233D] bg-white border border-[#0F233D]/25 rounded-lg hover:bg-[#0F233D] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {user ? 'Open Dashboard' : 'Login'}
                </button>
              </div>
              <p className="text-xs text-[#475569] mt-4">
                Built for Tamil Nadu &amp; India · Bilingual AI guidance in English and தமிழ்
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] rounded-xl overflow-hidden border border-[#E6E2DA] bg-[#EFECE6]">
                <ResilientImage
                  src="/src/assets/images/hero_modern_indian_home_1795756111859.jpg"
                  alt="Modern Indian family home with warm teakwood accents, courtyard greenery, and sunlit veranda"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Grounded 4-column Platform Scope Strip */}
          <div className="mt-12 pt-8 border-t border-[#E6E2DA] grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="font-mono-num text-2xl font-semibold text-[#0F233D]">18 Stages</p>
              <p className="text-sm text-[#475569] mt-1">Step-by-step guide from plot checks to handover</p>
            </div>
            <div>
              <p className="font-mono-num text-2xl font-semibold text-[#0F233D]">13 Categories</p>
              <p className="text-sm text-[#475569] mt-1">Materials knowledge centre with BIS standards</p>
            </div>
            <div>
              <p className="font-mono-num text-2xl font-semibold text-[#0F233D]">10 Calculators</p>
              <p className="text-sm text-[#475569] mt-1">Preliminary cost, cement, steel, brick &amp; labour</p>
            </div>
            <div>
              <p className="font-mono-num text-2xl font-semibold text-[#0F233D]">English &amp; தமிழ்</p>
              <p className="text-sm text-[#475569] mt-1">Gemini-powered assistant for clear guidance</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-[#E6E2DA] bg-white py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold text-[#1F5F46] mb-2">Platform Features</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F233D] text-balance">
                Everything a family needs to plan, verify, and manage a home build.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured Marquee Service */}
              <div className="lg:col-span-2 bg-[#FAF8F5] border border-[#E6E2DA] rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="p-7 sm:p-8 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#1F5F46] mb-2">01 · Home Planning</p>
                    <h3 className="font-display text-2xl font-semibold text-[#0F233D] mb-3">
                      My Home Planner &amp; Feasibility Brief
                    </h3>
                    <p className="text-sm text-[#475569] leading-relaxed">
                      Enter your plot dimensions, DTCP or CMDA approval type, floors, rooms, and
                      budget. Review built-up feasibility and save a tailored preliminary planning brief.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('planner')}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1F5F46] hover:underline cursor-pointer w-fit"
                  >
                    <span>Open Home Planner</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="min-h-[240px]">
                  <ResilientImage
                    src="/src/assets/images/blueprint_planning_desk_1795756111942.jpg"
                    alt="Residential architectural floor plan and material samples"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Materials Knowledge Centre */}
              <div className="bg-[#FAF8F5] border border-[#E6E2DA] rounded-xl overflow-hidden flex flex-col justify-between">
                <div className="h-44 overflow-hidden border-b border-[#E6E2DA]">
                  <ResilientImage
                    src="/src/assets/images/material_cement_steel_1795756112948.jpg"
                    alt="Cement, TMT steel reinforcement bars, clay bricks, and stone aggregates"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#1F5F46] mb-2">02 · Material Literacy</p>
                    <h3 className="font-display text-xl font-semibold text-[#0F233D] mb-2">
                      Materials Knowledge &amp; Comparison
                    </h3>
                    <p className="text-sm text-[#475569] leading-relaxed">
                      Understand PPC vs OPC cement, Fe 500D vs 550D steel, bricks vs AAC blocks, and
                      compare products side by side with clear IS standards.
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => onNavigate('materials')}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F5F46] hover:underline cursor-pointer"
                    >
                      <span>Materials Centre</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('compare')}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F233D] hover:underline cursor-pointer"
                    >
                      <span>Compare</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Cost & Quantity Calculator */}
              <div className="bg-[#FAF8F5] border border-[#E6E2DA] rounded-xl p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-[#1F5F46] mb-2">03 · Transparent Estimates</p>
                  <h3 className="font-display text-xl font-semibold text-[#0F233D] mb-2">
                    Cost &amp; Quantity Calculators
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Calculate indicative construction cost, cement bags, steel tonnage, bricks,
                    sand, concrete, tiles, paint, labour, and stage-wise expenses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('calculator')}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1F5F46] hover:underline cursor-pointer w-fit"
                >
                  <span>Open Cost Calculator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Execution Tracker, Documents & AI Guide */}
              <div className="lg:col-span-2 bg-[#FAF8F5] border border-[#E6E2DA] rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="min-h-[220px] order-2 md:order-1">
                  <ResilientImage
                    src="/src/assets/images/construction_site_progress_1795756113177.jpg"
                    alt="Organized residential house construction with reinforced concrete frame and brick walls"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-7 sm:p-8 flex flex-col justify-between order-1 md:order-2">
                  <div>
                    <p className="text-xs font-medium text-[#1F5F46] mb-2">04 · Execution &amp; Guidance</p>
                    <h3 className="font-display text-2xl font-semibold text-[#0F233D] mb-3">
                      Progress Tracker, Permits &amp; Bilingual AI
                    </h3>
                    <p className="text-sm text-[#475569] leading-relaxed">
                      Organize Patta/CMDA approvals, record bills and site photos, compare contractor
                      quotations, and ask our Gemini AI assistant questions in English or Tamil.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => onNavigate('tracker')}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F5F46] hover:underline cursor-pointer"
                    >
                      <span>Progress Tracker</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('documents')}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F233D] hover:underline cursor-pointer"
                    >
                      <span>Documents</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('assistant')}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F233D] hover:underline cursor-pointer"
                    >
                      <span>AI Assistant</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="border-t border-[#E6E2DA] py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold text-[#1F5F46] mb-2">How It Works</p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F233D]">
                  Your step-by-step home-building journey, simplified.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('journey')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0F233D] bg-white border border-[#CBD5E1] rounded-lg hover:bg-[#0F233D] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Read 18-Stage Construction Guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  num: '01.',
                  phase: 'Stages 1 – 6',
                  title: 'Land, Legal & Planning',
                  body: 'Check plot suitability, Patta/Chitta/FMB/EC records, plan your budget, finalize architecture, structural design, and CMDA/DTCP permits.',
                },
                {
                  num: '02.',
                  phase: 'Stages 7 – 9',
                  title: 'Foundation & Concrete Frame',
                  body: 'Mark site lines cleanly, complete excavation and anti-termite footing beds, raise plinth beams above road level, and cast RCC columns and slabs.',
                },
                {
                  num: '03.',
                  phase: 'Stages 10 – 12',
                  title: 'Walls, Plumbing & Wiring',
                  body: 'Build brick or AAC walls, lay concealed electrical conduits and pressure-tested CPVC/uPVC plumbing lines, and finish internal and external plaster.',
                },
                {
                  num: '04.',
                  phase: 'Stages 13 – 18',
                  title: 'Finishes, Quality & Handover',
                  body: 'Complete waterproofing, tiles, doors, windows, painting, rainwater harvesting, snag inspection, and collect warranties and completion keys.',
                },
              ].map((step) => (
                <div key={step.num} className="bg-white border border-[#E6E2DA] rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-mono-num font-bold text-[#1F5F46]">{step.num}</span>
                      <span className="text-[#475569]">{step.phase}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#0F233D] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#475569] leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="border-t border-[#E6E2DA] bg-white py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold text-[#1F5F46] mb-2">About SENSURY HOME</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F233D] mb-4">
                Inspired by family, trust, and the true meaning of home.
              </h2>
              <p className="text-base text-[#475569] leading-relaxed mb-4">
                Our mission is to help everyone plan, understand, manage, and complete their dream
                home construction—even if they have never stepped onto a building site before.
              </p>
              <p className="text-sm text-[#475569] leading-relaxed">
                Starting with regional guidance tailored for Tamil Nadu and expanding across India,
                SENSURY HOME replaces intimidating construction jargon with clear explanations,
                honest cost breakdowns, and organized project tracking.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  title: 'Clear Source Transparency',
                  desc: 'We separate Indian Standard references, manufacturer specifications, supplier inputs, and AI explanations so you always know what is verified.',
                },
                {
                  title: 'Designed for First-Time Builders',
                  desc: 'Every stage, calculator formula, and document check is written in plain language so families can review contractor quotes with confidence.',
                },
                {
                  title: 'Tamil Nadu Context First',
                  desc: 'Includes Patta, Chitta, FMB, EC, TNCDBR 2019 setback awareness, CMDA/DTCP permits, and M-Sand/P-Sand guidance.',
                },
                {
                  title: 'Respect for Qualified Engineers',
                  desc: 'SENSURY HOME prepares you to make informed choices while recommending licensed Architects, Structural Engineers, and Advocates for safety-critical sign-offs.',
                },
              ].map((card) => (
                <div key={card.title} className="bg-[#FAF8F5] border border-[#E6E2DA] rounded-xl p-6">
                  <h3 className="font-display text-base font-semibold text-[#0F233D] mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="border-t border-[#E6E2DA] py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold text-[#1F5F46] mb-2">Contact Us</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F233D] mb-4">
                Have a question about getting started?
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-6">
                Share your district and what stage of planning or building you are exploring. Your
                inquiry is saved directly to our platform database.
              </p>
              <div className="text-sm text-[#475569] space-y-2 border-t border-[#E6E2DA] pt-5">
                <p>
                  <span className="font-semibold text-[#0F233D]">Focus Region:</span> Tamil Nadu &amp; India
                </p>
                <p>
                  <span className="font-semibold text-[#0F233D]">Brand Promise:</span> Home is where Mom is.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              {submitStatus === 'success' ? (
                <div className="bg-white border border-[#E6E2DA] rounded-xl p-8">
                  <div className="flex items-center gap-2 text-[#1F5F46] font-semibold mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Inquiry received</span>
                  </div>
                  <p className="text-sm text-[#475569] mb-5">
                    Thank you for reaching out to SENSURY HOME. Your note has been recorded safely.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitStatus('idle')}
                    className="px-4 py-2 text-sm font-semibold text-[#0F233D] border border-[#E6E2DA] bg-[#FAF8F5] rounded-lg hover:bg-[#EFECE6] cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleInquiry}
                  className="bg-white border border-[#E6E2DA] rounded-xl p-6 sm:p-8 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#0F233D] mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Karthik Sundaram"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#E6E2DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F5F46]/25 focus:border-[#1F5F46]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#0F233D] mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#E6E2DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F5F46]/25 focus:border-[#1F5F46]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F233D] mb-1.5">
                      District / City
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#E6E2DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F5F46]/25 focus:border-[#1F5F46]"
                    >
                      {TAMIL_NADU_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F233D] mb-1.5">
                      Message
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your plot, planned budget, or question..."
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#E6E2DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F5F46]/25 focus:border-[#1F5F46]"
                    />
                  </div>
                  {errorMsg && <p className="text-xs text-[#DC2626]">{errorMsg}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1F5F46] rounded-lg hover:bg-[#174A36] disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {submitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Professional Deep Navy Footer */}
      <footer className="bg-[#0F233D] text-[#FAF8F5] py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/15">
          <div className="md:col-span-5">
            <div className="inline-flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 rounded-lg bg-[#1F5F46] text-white flex items-center justify-center">
                <Home className="w-4 h-4" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight">SENSURY HOME</span>
            </div>
            <p className="text-sm font-medium text-[#A7F3D0] mb-3">Home is where Mom is.</p>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Helping every family plan, understand, manage, and complete their dream home
              construction with clarity and trust.
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-semibold text-slate-300 mb-3">Platform Navigation</p>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm text-slate-200">
              <button type="button" onClick={() => scrollToSection('top')} className="text-left hover:text-white cursor-pointer">
                Home
              </button>
              <button type="button" onClick={() => scrollToSection('features')} className="text-left hover:text-white cursor-pointer">
                Features
              </button>
              <button type="button" onClick={() => onNavigate('journey')} className="text-left hover:text-white cursor-pointer">
                Construction Guide
              </button>
              <button type="button" onClick={() => onNavigate('materials')} className="text-left hover:text-white cursor-pointer">
                Materials
              </button>
              <button type="button" onClick={() => onNavigate('calculator')} className="text-left hover:text-white cursor-pointer">
                Cost Calculator
              </button>
              <button type="button" onClick={() => scrollToSection('about')} className="text-left hover:text-white cursor-pointer">
                About Us
              </button>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-sm text-slate-200">
            <p className="text-xs font-semibold text-slate-300 mb-3">Account &amp; Region</p>
            <p>Region: Tamil Nadu &amp; India</p>
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="block text-left text-slate-200 hover:text-white underline underline-offset-4 cursor-pointer"
            >
              Contact Inquiry Form
            </button>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGetStarted}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1F5F46] rounded-md hover:bg-[#174A36] cursor-pointer"
              >
                {user ? 'Home Planner' : 'Get Started'}
              </button>
              <button
                type="button"
                onClick={handleLogin}
                className="px-3.5 py-1.5 text-xs font-semibold text-white border border-white/30 rounded-md hover:bg-white/10 cursor-pointer"
              >
                {user ? 'Dashboard' : 'Login'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-300">
          <p>© {new Date().getFullYear()} SENSURY HOME. All rights reserved.</p>
          <p>Preliminary educational guidance — verify structural &amp; legal decisions with qualified professionals.</p>
        </div>
      </footer>
    </div>
  );
}
