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
    <div className="min-h-screen bg-gradient-to-br from-[#F2F2F2] via-white to-[#F2AEEE]/10">
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-[#5941F2]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#5941F2] to-[#F2AEEE] bg-clip-text text-transparent">Echo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-slate-700 hover:text-[#5941F2] font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-[#5941F2] to-[#F2AEEE] text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg hover:shadow-[#5941F2]/30 transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F2AEEE]/20 to-[#5941F2]/10 text-[#5941F2] px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-fade-in border border-[#5941F2]/20"
            style={{ animationDelay: '0.1s' }}
          >
            <Sparkles className="w-4 h-4" />
            Collaborative Feedback Made Simple
          </div>

          <h1
            className="text-6xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <span className="bg-gradient-to-r from-[#5941F2] via-[#F2AEEE] to-[#F2B035] bg-clip-text text-transparent">
              Feedback on Any Website,
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#F2B035] via-[#F24535] to-[#5941F2] bg-clip-text text-transparent">
              Just Like Figma
            </span>
          </h1>

          <p
            className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in"
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
              className="bg-gradient-to-r from-[#5941F2] to-[#F2AEEE] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-[#5941F2]/40 transition-all hover:scale-105 flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="bg-white text-[#5941F2] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gradient-to-r hover:from-[#F2B035]/10 hover:to-[#F2AEEE]/10 transition-all border-2 border-[#5941F2]/20 shadow-sm flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          <div
            className="mt-16 relative animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent h-32 bottom-0 z-10"></div>
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#5941F2]/10 overflow-hidden p-4">
              <div className="bg-gradient-to-br from-[#5941F2] via-[#F2AEEE] to-[#F2B035] rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-white mx-auto mb-4" />
                  <p className="text-white text-sm font-medium">Product Demo Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#5941F2] via-[#F2AEEE] to-[#F2B035] bg-clip-text text-transparent">
                Everything You Need for Better Feedback
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features that transform how teams collect and manage feedback
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#5941F2]/5 to-[#F2AEEE]/10 rounded-2xl p-8 border-2 border-[#5941F2]/20 hover:border-[#5941F2]/40 hover:shadow-xl hover:shadow-[#5941F2]/10 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-[#5941F2] to-[#F2AEEE] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#5941F2] to-[#F2AEEE] bg-clip-text text-transparent mb-3">Pin Anywhere</h3>
              <p className="text-slate-600 leading-relaxed">
                Click anywhere on any website to drop a comment pin. Capture exact context with spatial positioning.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#F2AEEE]/5 to-[#F2B035]/10 rounded-2xl p-8 border-2 border-[#F2AEEE]/30 hover:border-[#F2AEEE]/50 hover:shadow-xl hover:shadow-[#F2AEEE]/10 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-[#F2AEEE] to-[#F2B035] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F2AEEE] to-[#F2B035] bg-clip-text text-transparent mb-3">Real-Time Sync</h3>
              <p className="text-slate-600 leading-relaxed">
                See comments appear instantly across all team members. Collaborate live without refreshing.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#F2B035]/5 to-[#F24535]/10 rounded-2xl p-8 border-2 border-[#F2B035]/30 hover:border-[#F2B035]/50 hover:shadow-xl hover:shadow-[#F2B035]/10 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-[#F2B035] to-[#F24535] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F2B035] to-[#F24535] bg-clip-text text-transparent mb-3">Team Workspaces</h3>
              <p className="text-slate-600 leading-relaxed">
                Organize feedback by workspace with role-based access. Invite teammates, clients, and testers.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#F24535]/5 to-[#5941F2]/10 rounded-2xl p-8 border-2 border-[#F24535]/30 hover:border-[#F24535]/50 hover:shadow-xl hover:shadow-[#F24535]/10 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-[#F24535] to-[#5941F2] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F24535] to-[#5941F2] bg-clip-text text-transparent mb-3">Universal SDK</h3>
              <p className="text-slate-600 leading-relaxed">
                Works on any website. No code changes needed. Just share a review URL and start collecting feedback.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#5941F2]/5 to-[#F2B035]/10 rounded-2xl p-8 border-2 border-[#5941F2]/20 hover:border-[#5941F2]/40 hover:shadow-xl hover:shadow-[#5941F2]/10 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-[#5941F2] to-[#F2B035] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#5941F2] to-[#F2B035] bg-clip-text text-transparent mb-3">Secure & Private</h3>
              <p className="text-slate-600 leading-relaxed">
                Enterprise-grade security with row-level access control. Your feedback stays completely private.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#F2AEEE]/5 to-[#5941F2]/10 rounded-2xl p-8 border-2 border-[#F2AEEE]/30 hover:border-[#F2AEEE]/50 hover:shadow-xl hover:shadow-[#F2AEEE]/10 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-[#F2AEEE] to-[#5941F2] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F2AEEE] to-[#5941F2] bg-clip-text text-transparent mb-3">Thread Conversations</h3>
              <p className="text-slate-600 leading-relaxed">
                Organize feedback into threads. Reply, resolve, and track status. Never lose context again.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-[#5941F2] via-[#F2AEEE] to-[#F2B035] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by Teams Worldwide
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of teams shipping better products with Echo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F2B035] to-[#F24535]"></div>
                <div>
                  <div className="font-semibold">Sarah Chen</div>
                  <div className="text-sm text-white/80">Product Manager, TechCorp</div>
                </div>
              </div>
              <p className="text-white/95 leading-relaxed">
                "Echo transformed how we collect user feedback. The spatial commenting is brilliant - our designers and developers finally speak the same language."
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F2AEEE] to-[#5941F2]"></div>
                <div>
                  <div className="font-semibold">Marcus Rodriguez</div>
                  <div className="text-sm text-white/80">Engineering Lead, StartupXYZ</div>
                </div>
              </div>
              <p className="text-white/95 leading-relaxed">
                "We cut our bug reporting time by 70%. The automatic screenshots and precise location data mean no more 'it's broken somewhere' tickets."
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-white/80">Comments Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-white/80">Active Teams</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-white/80">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Support</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#5941F2] via-[#F2AEEE] to-[#F2B035] bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#F2F2F2] to-white rounded-2xl p-8 border-2 border-slate-200 hover:border-[#5941F2]/30 transition-all hover:shadow-lg">
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#5941F2] to-[#F2AEEE] bg-clip-text text-transparent mb-2">Free</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">$0</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#5941F2] flex-shrink-0" />
                  <span className="text-slate-700">Up to 3 apps</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#5941F2] flex-shrink-0" />
                  <span className="text-slate-700">100 comments/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#5941F2] flex-shrink-0" />
                  <span className="text-slate-700">5 team members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#5941F2] flex-shrink-0" />
                  <span className="text-slate-700">Basic integrations</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="block text-center bg-white text-[#5941F2] px-6 py-3 rounded-lg font-semibold hover:bg-gradient-to-r hover:from-[#5941F2]/5 hover:to-[#F2AEEE]/5 transition-colors border-2 border-[#5941F2]/20"
              >
                Start Free
              </Link>
            </div>

            <div className="bg-gradient-to-br from-[#5941F2] via-[#F2AEEE] to-[#F2B035] rounded-2xl p-8 text-white border-2 border-white relative shadow-2xl shadow-[#5941F2]/30">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#F2B035] to-[#F24535] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$49</span>
                  <span className="text-white/90">/month</span>
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
                className="block text-center bg-white text-[#5941F2] px-6 py-3 rounded-lg font-semibold hover:bg-[#F2F2F2] transition-colors shadow-lg"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-[#F2B035] via-[#F24535] to-[#5941F2] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Feedback Process?
          </h2>
          <p className="text-xl text-white/95 mb-10 max-w-2xl mx-auto">
            Join teams shipping better products with contextual, collaborative feedback.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-[#5941F2] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#F2F2F2] transition-all hover:scale-105 shadow-2xl"
          >
            Get Started for Free
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="mt-6 text-white/90 text-sm">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#5941F2]" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#5941F2] to-[#F2AEEE] bg-clip-text text-transparent">Echo</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
            2025 Echo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
