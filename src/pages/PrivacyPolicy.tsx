import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-slate-600 text-sm mt-1">Last updated: December 1, 2025</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Introduction</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Welcome to Echo. We are committed to protecting your personal information and your right to privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                use our application feedback and review platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information We Collect</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Personal Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We collect personal information that you voluntarily provide when using our services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Account information (name, email address, password)</li>
                <li>Profile information (display name, avatar)</li>
                <li>Workspace and organization details</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Usage Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We automatically collect certain information when you use our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Log data (IP address, browser type, operating system)</li>
                <li>Device information</li>
                <li>Usage patterns and interactions with the platform</li>
                <li>Comments, feedback, and annotations you create</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">OAuth Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                When you sign in using Google or GitHub OAuth, we receive:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Your email address</li>
                <li>Your name and profile picture</li>
                <li>Basic profile information from the OAuth provider</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">How We Use Your Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Provide, operate, and maintain our services</li>
                <li>Process your transactions and manage subscriptions</li>
                <li>Send you updates, notifications, and invitations</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Improve and optimize our platform</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Sharing and Disclosure</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following situations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li><strong>With workspace members:</strong> When you collaborate on applications and feedback</li>
                <li><strong>With service providers:</strong> Third-party vendors who help us operate our platform (hosting, analytics, payment processing)</li>
                <li><strong>For legal compliance:</strong> When required by law or to protect our rights</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With your consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Security</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication with OAuth 2.0</li>
                <li>Regular security audits and updates</li>
                <li>Row-level security policies in our database</li>
                <li>Restricted access to personal information</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                However, no method of transmission over the internet or electronic storage is 100% secure.
                While we strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Retention</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We retain your information for as long as necessary to provide our services and fulfill the purposes
                outlined in this Privacy Policy. When you delete your account, we will delete your personal information
                within 30 days, except where we are required to retain it for legal compliance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Privacy Rights</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Data portability:</strong> Receive your data in a structured format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Withdraw consent:</strong> Revoke previously given consent</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                To exercise these rights, please contact us at the email address provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cookies and Tracking</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our platform and store certain
                information. Cookies are files with small amounts of data that are stored on your device. You can
                instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Third-Party Services</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our platform integrates with third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li><strong>Supabase:</strong> Database and authentication</li>
                <li><strong>Google OAuth:</strong> Authentication service</li>
                <li><strong>GitHub OAuth:</strong> Authentication service</li>
                <li><strong>Razorpay:</strong> Payment processing</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                These services have their own privacy policies. We encourage you to review their policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Children's Privacy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our services are not intended for children under the age of 13. We do not knowingly collect personal
                information from children under 13. If you are a parent or guardian and believe your child has provided
                us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">International Data Transfers</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Your information may be transferred to and maintained on servers located outside of your jurisdiction.
                We ensure appropriate safeguards are in place to protect your information in accordance with this
                Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review
                this Privacy Policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-slate-700">
                  <strong>Email:</strong> info@analyzthis.ai<br />
                  <strong>Support:</strong> info@analyzthis.ai
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-600 text-center">
                By using Echo, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
