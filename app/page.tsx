"use client";

import { useState } from "react";
import Head from "next/head";

function TaxFeederLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tray / inbox base */}
      <path
        d="M4 28C4 25.7909 5.79086 24 8 24H32C34.2091 24 36 25.7909 36 28V32C36 34.2091 34.2091 36 32 36H8C5.79086 36 4 34.2091 4 32V28Z"
        fill="#0F172A"
      />
      {/* Document body */}
      <rect x="10" y="6" width="20" height="24" rx="2" fill="white" stroke="#0F172A" strokeWidth="1.5" />
      {/* Document lines */}
      <rect x="14" y="14" width="12" height="2" rx="1" fill="#0F172A" />
      <rect x="14" y="19" width="10" height="2" rx="1" fill="#0F172A" />
      <rect x="14" y="24" width="8" height="2" rx="1" fill="#0F172A" />
      {/* Folded corner (green accent) */}
      <path
        d="M26 6L30 10V6H26Z"
        fill="#22C55E"
      />
      <path
        d="M26 6V10H30"
        stroke="#0F172A"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function TaxFeederWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-brand-ink">Tax</span>
      <span className="text-brand-green">Feeder</span>
    </span>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "landing_page" }),
    });
    setSubmitted(true);
    setEmail("");
  };

  return (
    <>
      <Head>
        <title>TaxFeeder — Collect. Organize. Move Forward.</title>
        <meta name="description" content="The only client portal built specifically for tax preparers. Set up in 5 minutes. Clients don't need passwords." />
        <meta property="og:title" content="TaxFeeder — Collect. Organize. Move Forward." />
        <meta property="og:description" content="The only client portal built specifically for tax preparers. $9/mo." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-white text-brand-ink font-sans">
        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/" className="flex items-center gap-2.5 text-xl font-bold hover:opacity-80 transition">
              <TaxFeederLogo className="w-9 h-9" />
              <TaxFeederWordmark />
            </a>
            <a
              href="#pricing"
              className="bg-brand-green hover:bg-brand-green-dark text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition"
            >
              Get Early Access
            </a>
          </div>
        </nav>

        {/* HERO */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green-dark px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
            </span>
            Launching November 2026 — 47 accountants on the waitlist
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-brand-ink max-w-4xl mx-auto leading-tight">
            Stop Chasing Clients for{" "}
            <span className="text-brand-green">Tax Documents</span>
          </h1>
          <p className="mt-4 text-sm font-medium tracking-[0.2em] uppercase text-brand-gray">
            Collect. Organize. Move Forward.
          </p>
          <p className="mt-6 text-xl text-brand-gray max-w-2xl mx-auto leading-relaxed">
            The only client portal built specifically for tax preparers. Set up in 5 minutes.
            Clients don&apos;t need passwords. You stop chasing, they start uploading.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="bg-brand-green hover:bg-brand-green-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-brand-green/20"
            >
              Get Early Access — $9/mo
            </a>
            <a
              href="#how-it-works"
              className="bg-brand-surface hover:bg-gray-100 text-brand-ink px-8 py-4 rounded-xl font-bold text-lg transition border border-gray-200"
            >
              See How It Works
            </a>
          </div>
          <p className="mt-4 text-sm text-brand-gray">
            No setup fees. No contracts. Cancel anytime.
          </p>
        </section>

        {/* SOCIAL PROOF */}
        <section className="bg-brand-surface py-12">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm font-semibold text-brand-gray uppercase tracking-widest mb-6">
              Trusted by solo CPAs who&apos;ve tried TaxDome, Canopy &amp; Content Snare
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
              {["TaxDome → TaxFeeder", "Canopy → TaxFeeder", "Content Snare → TaxFeeder", "SmartVault → TaxFeeder"].map(
                (brand) => (
                  <span key={brand} className="text-lg font-bold text-brand-ink">
                    {brand}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-ink mb-6">
                69% of accountants say they spend{" "}
                <span className="text-brand-green">too much time</span> gathering documents
              </h2>
              <div className="space-y-4 text-brand-gray text-lg">
                <p>❌ Chasing clients via email, text, and voicemail</p>
                <p>❌ Receiving blurry photos via random text messages</p>
                <p>❌ Manually organizing files into folders</p>
                <p>❌ Clients forgetting passwords to &quot;secure&quot; portals</p>
                <p>❌ Paying $74–149/mo for overbuilt practice management suites</p>
              </div>
            </div>
            <div className="bg-brand-ink rounded-2xl p-8 text-white">
              <div className="text-sm text-brand-gray uppercase tracking-widest mb-4">The Real Cost</div>
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold text-brand-green">4 hrs</div>
                  <div className="text-gray-400">Average time spent per client chasing docs</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-brand-green">100+ hrs</div>
                  <div className="text-gray-400">Lost per tax season for a 25-client practice</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-brand-green">$15,000</div>
                  <div className="text-gray-400">Billable hours lost at $150/hr</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="bg-brand-surface py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-ink">How TaxFeeder Works</h2>
              <p className="mt-4 text-brand-gray text-lg">From setup to uploaded docs in under 5 minutes</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Pick a Template",
                  desc: "Choose from pre-built tax templates: Individual, S-Corp, LLC, Partnership. Or build your own checklist.",
                  icon: "📋",
                },
                {
                  step: "02",
                  title: "Send Magic Link",
                  desc: "Enter your client&apos;s email. We generate a secure, password-free link they can open on any device.",
                  icon: "🔗",
                },
                {
                  step: "03",
                  title: "Docs Appear Organized",
                  desc: "Files auto-sort by client and document type. One-click ZIP export. Auto-reminders handle the follow-up.",
                  icon: "📁",
                },
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="text-brand-green font-bold text-sm mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-brand-ink mb-3">{item.title}</h3>
                  <p className="text-brand-gray leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-ink">Built for Tax Preparers, Not Enterprises</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "⚡", title: "5-Minute Setup", desc: "No implementation project. No training. Just works." },
              { icon: "🔗", title: "Magic Links", desc: "Clients click, upload, done. No accounts. No passwords." },
              { icon: "📋", title: "Tax Templates", desc: "W-2, 1099, 1098, K-1, Schedule C — pre-built checklists." },
              { icon: "🔔", title: "Auto-Reminders", desc: "Email + SMS nudges so you never chase again." },
              { icon: "📱", title: "Mobile-First", desc: "Clients upload from their phone. No app download needed." },
              { icon: "🔒", title: "Bank-Level Security", desc: "SOC 2 prep, encryption at rest, secure pre-signed URLs." },
              { icon: "📦", title: "One-Click Export", desc: "Download organized ZIPs, ready for your tax software." },
              { icon: "🎨", title: "Branded Portal", desc: "Your logo, your colors. Looks like your firm built it." },
            ].map((f) => (
              <div key={f.title} className="bg-brand-surface rounded-xl p-6 hover:shadow-md transition border border-gray-100">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-brand-ink mb-2">{f.title}</h3>
                <p className="text-sm text-brand-gray">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section className="bg-brand-ink py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="text-6xl text-brand-green mb-6">&ldquo;</div>
            <blockquote className="text-2xl md:text-3xl text-white font-medium leading-relaxed mb-8">
              I used to spend 4 hours per client chasing down W-2s and 1099s. With TaxFeeder, it&apos;s zero.
              My clients actually upload documents on time now because they don&apos;t have to remember a password.
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-lg">
                JL
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">Jane L., CPA</div>
                <div className="text-brand-gray text-sm">Solo Practitioner, 40 clients</div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-ink">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-brand-gray text-lg">
              No setup fees. No hidden modules. Cancel anytime.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Solo",
                price: "$9",
                desc: "For solo CPAs and part-time preparers",
                features: ["1 user", "Up to 50 clients", "Email reminders", "5 default templates", "Basic support"],
                cta: "Start Free Trial",
                popular: false,
              },
              {
                name: "Pro",
                price: "$19",
                desc: "For growing firms with staff",
                features: [
                  "3 users",
                  "Unlimited clients",
                  "Email + SMS reminders",
                  "Custom branded portal",
                  "Priority support",
                  "Custom templates",
                ],
                cta: "Start Free Trial",
                popular: true,
              },
              {
                name: "Team",
                price: "$29",
                desc: "For established practices",
                features: [
                  "Unlimited users",
                  "API access",
                  "White-label option",
                  "Advanced analytics",
                  "Dedicated onboarding",
                  "SSO & admin controls",
                ],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-brand-ink text-white ring-4 ring-brand-green ring-offset-4"
                    : "bg-white border-2 border-gray-100"
                }`}
              >
                {plan.popular && (
                  <div className="inline-block bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-brand-gray" : "text-brand-gray"}`}>/mo</span>
                </div>
                <p className={`mt-2 text-sm ${plan.popular ? "text-brand-gray" : "text-brand-gray"}`}>{plan.desc}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <span className="text-brand-green mt-0.5">✓</span>
                      <span className={plan.popular ? "text-gray-300" : "text-brand-gray"}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-8 w-full py-3 rounded-xl font-bold transition ${
                    plan.popular
                      ? "bg-brand-green hover:bg-brand-green-dark text-white"
                      : "bg-brand-surface hover:bg-gray-100 text-brand-ink border border-gray-200"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* WAITLIST / CTA */}
        <section className="bg-brand-green py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Be Ready for Tax Season 2027
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Join 47+ accountants on the waitlist. Get 50% off for life when we launch in November.
            </p>
            {submitted ? (
              <div className="bg-white rounded-xl p-8 text-brand-ink">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-bold">You&apos;re on the list!</h3>
                <p className="text-brand-gray mt-2">
                  We&apos;ll email you when early access opens. Check your inbox for confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-4 rounded-xl text-brand-ink placeholder-brand-gray focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <button
                  type="submit"
                  className="bg-brand-ink hover:bg-brand-ink-light text-white px-8 py-4 rounded-xl font-bold transition"
                >
                  Join Waitlist
                </button>
              </form>
            )}
            <p className="text-white/60 text-sm mt-4">
              No spam. Unsubscribe anytime. We only email about TaxFeeder updates.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-brand-ink text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Do my clients need to create an account?",
                a: "No. That&apos;s the magic of TaxFeeder. You send them a secure link. They click it, see their checklist, and upload. No passwords, no apps, no friction.",
              },
              {
                q: "How is this different from TaxDome or Canopy?",
                a: "TaxDome and Canopy are full practice management suites. They take weeks to set up and cost $74–149/mo. TaxFeeder does ONE thing perfectly: collecting tax documents. 5-minute setup. $9/mo.",
              },
              {
                q: "Is my client data secure?",
                a: "Absolutely. We use bank-level AES-256 encryption, secure pre-signed URLs for uploads, and are preparing for SOC 2 Type 1 certification. Your files never touch our servers directly.",
              },
              {
                q: "Can I export files to my tax software?",
                a: "Yes. One-click ZIP export organized by client and document type. We&apos;re also building direct integrations with Drake, ProSeries, and Lacerte.",
              },
              {
                q: "What if a client loses their magic link?",
                a: "You can regenerate a new link instantly from your dashboard. Old links automatically expire for security.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-gray-100 pb-6">
                <h3 className="font-bold text-brand-ink text-lg mb-2">{faq.q}</h3>
                <p className="text-brand-gray leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-brand-surface py-12 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="/" className="flex items-center gap-2.5 text-lg font-bold hover:opacity-80 transition">
              <TaxFeederLogo className="w-7 h-7" />
              <TaxFeederWordmark />
            </a>
            <div className="text-sm text-brand-gray">
              © 2026 TaxFeeder. Built for tax preparers who value their time.
            </div>
            <div className="flex gap-6 text-sm text-brand-gray">
              <a href="#" className="hover:text-brand-ink transition">Privacy</a>
              <a href="#" className="hover:text-brand-ink transition">Terms</a>
              <a href="#" className="hover:text-brand-ink transition">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
