import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Zap, Users, Shield, Check, ArrowRight, Play, Target, Globe, Sparkles } from 'lucide-react';

export function Landing() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DCF0F2] via-[#D0D8D9] to-slate-100">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-[#D0D8D9] z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-[#BF8654]" />
            <span className="text-2xl font-bold text-[#402718]">Echo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[#402718] hover:text-[#260101] font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-[#BF8654] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#A67548] transition-all hover:scale-105 shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 bg-[#DCF0F2] text-[#402718] px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in border border-[#BF8654]/20"
            style={{ animationDelay: '0.1s' }}
          >
            <Sparkles className="w-4 h-4" />
            Collaborative Feedback Made Simple
          </div>

          <h1
            className="text-6xl md:text-7xl font-bold text-[#402718] mb-6 leading-tight animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            Feedback on Any Website,
            <br />
            <span className="bg-gradient-to-r from-[#BF8654] to-[#A67548] bg-clip-text text-transparent">
              Just Like Figma
            </span>
          </h1>

          <p
            className="text-xl text-[#402718]/70 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Pin contextual feedback directly on any web application. Collaborate with your team in real-time,
            track issues, and ship better products faster.
          </p>

          <div
            className="flex items-center justify-center gap-4 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            <Link
              to="/signup"
              className="bg-[#BF8654] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#A67548] transition-all hover:scale-105 shadow-lg shadow-[#BF8654]/30 flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="bg-white text-[#402718] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#DCF0F2] transition-all border border-[#D0D8D9] shadow-sm flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          <div
            className="mt-16 relative animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#DCF0F2] to-transparent h-32 bottom-0 z-10"></div>
            <div className="bg-white rounded-2xl shadow-2xl border border-[#D0D8D9] overflow-hidden p-4">
              <div className="bg-[#402718] rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-[#BF8654] mx-auto mb-4" />
                  <p className="text-[#DCF0F2] text-sm">Product Demo Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#402718] mb-4">
              Everything You Need for Better Feedback
            </h2>
            <p className="text-xl text-[#402718]/70 max-w-2xl mx-auto">
              Powerful features that transform how teams collect and manage feedback
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#DCF0F2] to-[#D0D8D9] rounded-2xl p-8 border border-[#BF8654]/20 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-[#BF8654] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#402718] mb-3">Pin Anywhere</h3>
              <p className="text-[#402718]/70 leading-relaxed">
                Click anywhere on any website to drop a comment pin. Capture exact context with spatial positioning.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#DCF0F2] to-[#D0D8D9] rounded-2xl p-8 border border-[#BF8654]/20 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-[#BF8654] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#402718] mb-3">Real-Time Sync</h3>
              <p className="text-[#402718]/70 leading-relaxed">
                See comments appear instantly across all team members. Collaborate live without refreshing.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#DCF0F2] to-[#D0D8D9] rounded-2xl p-8 border border-[#BF8654]/20 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-[#BF8654] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#402718] mb-3">Team Workspaces</h3>
              <p className="text-[#402718]/70 leading-relaxed">
                Organize feedback by workspace with role-based access. Invite teammates, clients, and testers.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#DCF0F2] to-[#D0D8D9] rounded-2xl p-8 border border-[#BF8654]/20 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-[#BF8654] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#402718] mb-3">Universal SDK</h3>
              <p className="text-[#402718]/70 leading-relaxed">
                Works on any website. No code changes needed. Just share a review URL and start collecting feedback.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#DCF0F2] to-[#D0D8D9] rounded-2xl p-8 border border-[#BF8654]/20 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-[#BF8654] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#402718] mb-3">Secure & Private</h3>
              <p className="text-[#402718]/70 leading-relaxed">
                Enterprise-grade security with row-level access control. Your feedback stays completely private.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#DCF0F2] to-[#D0D8D9] rounded-2xl p-8 border border-[#BF8654]/20 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-[#BF8654] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#402718] mb-3">Thread Conversations</h3>
              <p className="text-[#402718]/70 leading-relaxed">
                Organize feedback into threads. Reply, resolve, and track status. Never lose context again.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-[#402718] to-[#260101] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by Teams Worldwide
            </h2>
            <p className="text-xl text-[#DCF0F2] max-w-2xl mx-auto">
              Join thousands of teams shipping better products with Echo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-[#BF8654]/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#BF8654] to-[#A67548]"></div>
                <div>
                  <div className="font-semibold">Sarah Chen</div>
                  <div className="text-sm text-[#DCF0F2]/70">Product Manager, TechCorp</div>
                </div>
              </div>
              <p className="text-[#DCF0F2] leading-relaxed">
                "Echo transformed how we collect user feedback. The spatial commenting is brilliant - our designers and developers finally speak the same language."
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-[#BF8654]/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#BF8654] to-[#A67548]"></div>
                <div>
                  <div className="font-semibold">Marcus Rodriguez</div>
                  <div className="text-sm text-[#DCF0F2]/70">Engineering Lead, StartupXYZ</div>
                </div>
              </div>
              <p className="text-[#DCF0F2] leading-relaxed">
                "We cut our bug reporting time by 70%. The automatic screenshots and precise location data mean no more 'it's broken somewhere' tickets."
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#BF8654] mb-2">10k+</div>
              <div className="text-[#DCF0F2]/70">Comments Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#BF8654] mb-2">500+</div>
              <div className="text-[#DCF0F2]/70">Active Teams</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#BF8654] mb-2">99.9%</div>
              <div className="text-[#DCF0F2]/70">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#BF8654] mb-2">24/7</div>
              <div className="text-[#DCF0F2]/70">Support</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#402718] mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-[#402718]/70">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#DCF0F2] rounded-2xl p-8 border border-[#D0D8D9]">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#402718] mb-2">Free</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#402718]">$0</span>
                  <span className="text-[#402718]/70">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#BF8654] flex-shrink-0" />
                  <span className="text-[#402718]">Up to 3 apps</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#BF8654] flex-shrink-0" />
                  <span className="text-[#402718]">100 comments/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#BF8654] flex-shrink-0" />
                  <span className="text-[#402718]">5 team members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#BF8654] flex-shrink-0" />
                  <span className="text-[#402718]">Basic integrations</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="block text-center bg-white text-[#402718] px-6 py-3 rounded-lg font-semibold hover:bg-[#D0D8D9] transition-colors border border-[#D0D8D9]"
              >
                Start Free
              </Link>
            </div>

            <div className="bg-gradient-to-br from-[#BF8654] to-[#A67548] rounded-2xl p-8 text-white border-4 border-[#BF8654] relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#DCF0F2] text-[#402718] px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$49</span>
                  <span className="text-white/80">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                  <span>Unlimited apps</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                  <span>Unlimited comments</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                  <span>Unlimited team members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                  <span>Jira, Notion, GitHub sync</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="block text-center bg-white text-[#BF8654] px-6 py-3 rounded-lg font-semibold hover:bg-[#DCF0F2] transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-[#BF8654] to-[#A67548] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Feedback Process?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join teams shipping better products with contextual, collaborative feedback.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-[#BF8654] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#DCF0F2] transition-all hover:scale-105 shadow-xl"
          >
            Get Started for Free
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="mt-6 text-white/80 text-sm">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </section>

      <footer className="bg-[#260101] text-[#DCF0F2]/70 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#BF8654]" />
              <span className="text-xl font-bold text-white">Echo</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#402718] text-center text-sm">
            2025 Echo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
