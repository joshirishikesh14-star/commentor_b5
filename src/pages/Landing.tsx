import { Link } from 'react-router-dom';
import { MessageSquare, Check, ArrowRight, Star, Zap, Users, Shield, Target, BarChart3 } from 'lucide-react';

export function Landing() {
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

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-medium text-slate-700 mb-8">
              <Star className="w-4 h-4 text-slate-900" />
              Collaboration Platform
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-slate-900">
              Smarter Feedback.
              <br />
              Stronger Collaboration.
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
              Pin contextual feedback directly on any web application.
              Track issues, collaborate with your team, and ship better products faster.
            </p>

            <div className="flex items-center justify-center gap-4 mb-16">
              <Link
                to="/signup"
                className="bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FAF9F8]/50 to-[#FAF9F8] z-10 pointer-events-none"></div>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 p-8">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-sm font-semibold text-slate-900">Promotion Analysis</div>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-2">486</div>
                    <div className="text-sm text-slate-500">Active Threads</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-sm font-semibold text-slate-900">Store Order Analysis</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-20 w-8 bg-gradient-to-t from-purple-300 to-purple-200 rounded-md"></div>
                      <div className="h-20 w-8 bg-gradient-to-t from-pink-300 to-pink-200 rounded-md"></div>
                      <div className="h-20 w-8 bg-gradient-to-t from-yellow-300 to-yellow-200 rounded-md"></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-yellow-700" />
                      </div>
                      <div className="text-sm font-semibold text-slate-900">On Track Deals</div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">$24,120</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-slate-900">Recent Activity</div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Sarah commented on Homepage Hero Section</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Marcus resolved 3 feedback threads</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>New app "Dashboard v2" was created</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center justify-center gap-12 opacity-60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500 font-medium">Basecamp</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500 font-medium">Lighthouse</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500 font-medium">Behance</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500 font-medium">Dribbble</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500 font-medium">Metacode</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-medium text-slate-700 mb-6">
                Visual Feedback
              </div>
              <h2 className="text-5xl font-bold text-slate-900 mb-6">
                Collecting Feedback
                <br />
                Just Got Easier.
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Pin comments anywhere on your web app. Every piece of feedback includes context:
                screenshots, page location, and element details. No more confusion about what needs to change.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 mb-1">Linear Exp 10</div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <Star className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">$24,120</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                  <div className="text-sm font-semibold text-slate-900 mb-4">Store Order Analysis</div>
                  <div className="flex items-end justify-between gap-3 h-32">
                    <div className="flex-1 bg-gradient-to-t from-purple-400 to-purple-200 rounded-t-lg" style={{ height: '45%' }}></div>
                    <div className="flex-1 bg-gradient-to-t from-pink-400 to-pink-200 rounded-t-lg" style={{ height: '85%' }}></div>
                    <div className="flex-1 bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-t-lg" style={{ height: '65%' }}></div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs text-slate-600">
                    <span>5.0k</span>
                    <span>7.2k</span>
                    <span>4.8k</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 rounded-3xl p-12 border border-slate-200">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-slate-700 mb-6 shadow-sm">
                Core Features
              </div>
              <h2 className="text-5xl font-bold text-slate-900 mb-4">
                What Can Our Feedback
                <br />
                Platform Do For You?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-yellow-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Spatial Comments & Pins</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Click anywhere on your web app to drop a comment pin with exact positioning and context
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Easy To Collaborate</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Real-time collaboration with threaded conversations. Reply, resolve, and track every piece of feedback
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Made With Teams/CSS</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Integrates seamlessly with Jira, Notion, and GitHub. Export feedback to your existing workflow
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-medium text-slate-700 mb-6">
              Our Testimonial
            </div>
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Trusted by teams worldwide to collect better feedback and ship faster
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <div className="flex gap-1 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">
                "Using GetCRM CRM Is One Of The Best Decisions We've Ever Made. We've Cut Costs And Keeps Getting Smarter."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                <div>
                  <div className="font-semibold text-slate-900">Erica Barker</div>
                  <div className="text-sm text-slate-500">Marketing Director</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <div className="flex gap-1 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">
                "GetCRM Is Created For Sales People, It's The Kind Of Tool Every Team Wishes To Try So To Make It Easy."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full"></div>
                <div>
                  <div className="font-semibold text-slate-900">Henry Jacks</div>
                  <div className="text-sm text-slate-500">Product Manager</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <div className="text-6xl font-bold text-slate-900 mb-2">$2.5M</div>
              <div className="text-slate-600 text-sm mb-4">
                More Revenue
              </div>
              <p className="text-slate-700 leading-relaxed">
                Using GetCRM CRM Is One Of The Best Decisions We've Ever Made. We've Cut Costs And Annual Revenue Explode.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <div className="text-6xl font-bold text-slate-900 mb-2">45%</div>
              <div className="text-slate-600 text-sm">
                More Revenue
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-8 text-white col-span-2">
              <h3 className="text-3xl font-bold mb-4">
                GetCRM Helps You Build
                <br />
                Beautiful Website
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5" />
                  <span>Simply Copy & Paste</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5" />
                  <span>Easy To Customize</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5" />
                  <span>Made With Teams/CSS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-medium text-slate-700 mb-6">
              Our Plan
            </div>
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              Feedback Platform FAQs
            </h2>
            <p className="text-lg text-slate-600">
              Simple pricing that scales with your team
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-slate-300 transition-all">
              <div className="mb-8">
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
                  <span className="text-slate-700">100 comments per month</span>
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
                className="block text-center bg-slate-100 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 text-white relative">
              <div className="absolute -top-4 right-8 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <div className="mb-8">
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
                className="block text-center bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <details className="bg-white rounded-xl p-6 border border-slate-200 cursor-pointer">
              <summary className="font-semibold text-slate-900 text-lg">
                How do I integrate feedback with other tools?
              </summary>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Echo integrates seamlessly with Jira, Notion, and GitHub. Connect your accounts in settings and feedback will sync automatically to your existing workflow.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 border border-slate-200 cursor-pointer">
              <summary className="font-semibold text-slate-900 text-lg">
                Is there a free trial available?
              </summary>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Yes! All new accounts get a 14-day free trial with full access to Pro features. No credit card required.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 border border-slate-200 cursor-pointer">
              <summary className="font-semibold text-slate-900 text-lg">
                Is feedback platform suitable for small businesses?
              </summary>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Absolutely! Our Free plan is perfect for small teams and startups. As you grow, you can easily upgrade to Pro for unlimited access.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Are You Interested
            <br />
            With Echo?
          </h2>
          <p className="text-lg text-slate-600 mb-10">
            Join thousands of teams collecting better feedback and shipping faster products
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-slate-800 transition-all"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-pink-100 via-purple-100 to-yellow-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-7 h-7 text-slate-900" />
                <span className="text-xl font-bold text-slate-900">Echo</span>
              </div>
              <p className="text-slate-600 max-w-xs">
                Collaborative feedback platform for modern teams
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Company</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-slate-600 hover:text-slate-900 text-sm">About Us</a>
                  <a href="#" className="block text-slate-600 hover:text-slate-900 text-sm">About Us</a>
                  <a href="#" className="block text-slate-600 hover:text-slate-900 text-sm">Contact</a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Career</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-slate-600 hover:text-slate-900 text-sm">Jobs</a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Legal Information</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-slate-600 hover:text-slate-900 text-sm">Privacy Policy</a>
                  <a href="#" className="block text-slate-600 hover:text-slate-900 text-sm">Terms of Service</a>
                  <a href="#" className="block text-slate-600 hover:text-slate-900 text-sm">Submit Complaints</a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-300 flex justify-between items-center">
            <p className="text-sm text-slate-600">© 2025 Echo. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                <span className="text-slate-900 text-sm font-bold">f</span>
              </a>
              <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                <span className="text-slate-900 text-sm font-bold">in</span>
              </a>
              <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                <span className="text-slate-900 text-sm font-bold">tw</span>
              </a>
              <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                <span className="text-slate-900 text-sm font-bold">yt</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
