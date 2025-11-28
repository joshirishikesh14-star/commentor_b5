import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Zap, Users, Shield, Check, ArrowRight, Play, Target, Globe, Sparkles } from 'lucide-react';

export function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedThread, setSelectedThread] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F8]">
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-slate-900" />
            <span className="text-xl font-bold text-slate-900">Echo</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
              Pricing
            </a>
            <Link
              to="/login"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-medium text-slate-700 mb-8">
            <Sparkles className="w-4 h-4 text-slate-900" />
            Collaborative Feedback Made Simple
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Feedback on Any Website,
            </span>
            <br />
            <span className="text-slate-900">Just Like Figma</span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Pin contextual feedback directly on any web application. Collaborate with your team in real-time,
            track issues, and ship better products faster.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F8] to-transparent h-32 bottom-0 z-10 pointer-events-none"></div>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center text-sm font-medium text-slate-300">
                  app.example.com
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 p-8 relative" style={{ minHeight: '500px' }}>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded"></div>
                    <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-100 rounded w-4/6"></div>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedThread(selectedThread === 1 ? null : 1)}
                  className={`absolute top-32 left-12 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-all ${selectedThread === 1 ? 'ring-4 ring-blue-400' : ''}`}
                  title="Comment thread"
                >
                  3
                </div>

                <div
                  onClick={() => setSelectedThread(selectedThread === 2 ? null : 2)}
                  className={`absolute top-48 right-16 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-all ${selectedThread === 2 ? 'ring-4 ring-blue-400' : ''}`}
                  title="Resolved comment"
                >
                  1
                </div>

                <div
                  onClick={() => setSelectedThread(selectedThread === 3 ? null : 3)}
                  className={`absolute bottom-24 left-1/4 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-all ${selectedThread === 3 ? 'ring-4 ring-blue-400 animate-none' : 'animate-pulse'}`}
                  title="New comment"
                >
                  1
                </div>

                <div className="absolute bottom-12 right-12 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                    5
                  </div>
                </div>

{selectedThread === 1 && (
                  <div className="absolute top-24 left-20 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Thread Details</div>
                        <div className="text-xs text-blue-100">3 comments</div>
                      </div>
                      <button onClick={() => setSelectedThread(null)} className="text-white opacity-80 hover:opacity-100 text-xl">×</button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-900">Sarah Chen</div>
                            <div className="text-xs text-slate-500">2 hours ago</div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700">The spacing here feels a bit tight, can we increase it?</p>
                        <div className="mt-2">
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs">Open</span>
                        </div>
                      </div>
                      <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                        <div className="bg-white rounded-lg p-2 border border-slate-100">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400"></div>
                            <div className="text-xs font-medium text-slate-900">Mike Johnson</div>
                            <div className="text-xs text-slate-400">1 hour ago</div>
                          </div>
                          <p className="text-xs text-slate-600">Good catch! I'll increase padding to 24px</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-slate-100">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-400"></div>
                            <div className="text-xs font-medium text-slate-900">Lisa Park</div>
                            <div className="text-xs text-slate-400">30 min ago</div>
                          </div>
                          <p className="text-xs text-slate-600">+1, looks much better with more space</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedThread === 2 && (
                  <div className="absolute top-40 right-24 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-10">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Resolved Thread</div>
                        <div className="text-xs text-green-100">1 comment</div>
                      </div>
                      <button onClick={() => setSelectedThread(null)} className="text-white opacity-80 hover:opacity-100 text-xl">×</button>
                    </div>
                    <div className="p-4">
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-900">Alex Rivera</div>
                            <div className="text-xs text-slate-500">1 day ago</div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700">Button alignment looks perfect now! ✓</p>
                        <div className="mt-2">
                          <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-medium">✓ Resolved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedThread === 3 && (
                  <div className="absolute bottom-32 left-1/4 ml-10 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          New Comment
                          <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                        </div>
                        <div className="text-xs text-blue-100">Just added</div>
                      </div>
                      <button onClick={() => setSelectedThread(null)} className="text-white opacity-80 hover:opacity-100 text-xl">×</button>
                    </div>
                    <div className="p-4">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-900">Emma Davis</div>
                            <div className="text-xs text-slate-500">Just now</div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700">Should we add an icon here for better clarity?</p>
                        <div className="mt-2">
                          <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-xs font-medium">New</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 text-xs text-slate-600 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                  <span className="font-semibold">💡 Tip:</span> Click the dots to view comments
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Everything You Need for Better Feedback
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features that transform how teams collect and manage feedback
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-purple-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Pin Anywhere</h3>
              <p className="text-slate-600 leading-relaxed">
                Click anywhere on any website to drop a comment pin. Capture exact context with spatial positioning.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50/50 to-yellow-50/50 rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-pink-100 to-yellow-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-pink-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Real-Time Sync</h3>
              <p className="text-slate-600 leading-relaxed">
                See comments appear instantly across all team members. Collaborate live without refreshing.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50/50 to-orange-50/50 rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-yellow-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Team Workspaces</h3>
              <p className="text-slate-600 leading-relaxed">
                Organize feedback by workspace with role-based access. Invite teammates, clients, and testers.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-orange-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Universal SDK</h3>
              <p className="text-slate-600 leading-relaxed">
                Works on any website. No code changes needed. Just share a review URL and start collecting feedback.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-blue-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Secure & Private</h3>
              <p className="text-slate-600 leading-relaxed">
                Enterprise-grade security with row-level access control. Your feedback stays completely private.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-indigo-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Thread Conversations</h3>
              <p className="text-slate-600 leading-relaxed">
                Organize feedback into threads. Reply, resolve, and track status. Never lose context again.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Trusted by Teams Worldwide
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands of teams shipping better products with Echo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400"></div>
                <div>
                  <div className="font-semibold text-slate-900">Sarah Chen</div>
                  <div className="text-sm text-slate-600">Product Manager, TechCorp</div>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">
                "Echo transformed how we collect user feedback. The spatial commenting is brilliant - our designers and developers finally speak the same language."
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400"></div>
                <div>
                  <div className="font-semibold text-slate-900">Marcus Rodriguez</div>
                  <div className="text-sm text-slate-600">Engineering Lead, StartupXYZ</div>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">
                "We cut our bug reporting time by 70%. The automatic screenshots and precise location data mean no more 'it's broken somewhere' tickets."
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold mb-2 text-slate-900">10k+</div>
              <div className="text-slate-600">Comments Created</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold mb-2 text-slate-900">500+</div>
              <div className="text-slate-600">Active Teams</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold mb-2 text-slate-900">99.9%</div>
              <div className="text-slate-600">Uptime</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold mb-2 text-slate-900">24/7</div>
              <div className="text-slate-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-lg">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">$0</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-slate-900 flex-shrink-0" />
                  <span className="text-slate-700">Up to 3 apps</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-slate-900 flex-shrink-0" />
                  <span className="text-slate-700">100 comments/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-slate-900 flex-shrink-0" />
                  <span className="text-slate-700">5 team members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-slate-900 flex-shrink-0" />
                  <span className="text-slate-700">Basic integrations</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="block text-center bg-slate-100 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors border border-slate-200"
              >
                Start Free
              </Link>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 text-white relative shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$49</span>
                  <span className="text-slate-400">/month</span>
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
                className="block text-center bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-lg"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Ready to Transform Your Feedback Process?
          </h2>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Join teams shipping better products with contextual, collaborative feedback.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-xl"
          >
            Get Started for Free
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="mt-6 text-slate-600 text-sm">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-slate-500" />
              <span className="text-xl font-bold text-white">Echo</span>
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
