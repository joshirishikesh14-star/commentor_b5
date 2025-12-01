import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export function TermsOfService() {
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
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
              <p className="text-slate-600 text-sm mt-1">Last updated: December 1, 2025</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Agreement to Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                By accessing or using Echo, you agree to be bound by these Terms of Service and our Privacy Policy.
                If you disagree with any part of these terms, you may not access or use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Description of Service</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Echo is a universal feedback and review platform that enables teams to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Collect and manage feedback on web applications</li>
                <li>Collaborate on application reviews with team members</li>
                <li>Track and organize comments, annotations, and bug reports</li>
                <li>Integrate with third-party services like Jira</li>
                <li>Invite testers and reviewers to provide feedback</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">User Accounts</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Registration</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                To use Echo, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Be at least 13 years old</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Account Security</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Maintaining the confidentiality of your password</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Ensuring your account information is current and accurate</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Acceptable Use</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">You agree NOT to:</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Upload or transmit viruses, malware, or harmful code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Collect or store personal data of other users without consent</li>
                <li>Use automated systems to access the service without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">User Content</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Your Content</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You retain ownership of all content you create on Echo, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Comments and feedback</li>
                <li>Annotations and screenshots</li>
                <li>Application data and configurations</li>
                <li>Workspace information</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">License to Us</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                By posting content on Echo, you grant us a worldwide, non-exclusive, royalty-free license to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Store, display, and transmit your content</li>
                <li>Make your content available to workspace members and invited users</li>
                <li>Use your content to provide and improve our services</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Content Responsibility</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You are solely responsible for your content and must ensure:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>You have the right to post the content</li>
                <li>Your content does not violate any laws or third-party rights</li>
                <li>Your content is not defamatory, obscene, or offensive</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Subscription and Payments</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Pricing</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Echo offers various subscription plans. Pricing is subject to change with notice.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Billing</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Subscriptions are billed monthly or annually</li>
                <li>Payment is due at the start of each billing cycle</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>You authorize us to charge your payment method</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Free Trial</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                New users receive a 14-day free trial. After the trial period, you will be charged unless you cancel.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Cancellation</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may cancel your subscription at any time. Your access will continue until the end of the current
                billing period. No refunds will be provided for partial months or unused service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Workspace Management</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Workspace owners have control over:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Adding or removing workspace members</li>
                <li>Managing applications and feedback</li>
                <li>Subscription and billing for the workspace</li>
                <li>Workspace settings and configurations</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                Members must comply with workspace policies set by the owner.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Intellectual Property</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Echo and its original content, features, and functionality are owned by us and are protected by
                international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our trademarks, service marks, and logos may not be used without our prior written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Third-Party Services</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Echo integrates with third-party services (Jira, OAuth providers, payment processors). Your use of
                these services is subject to their respective terms and conditions. We are not responsible for
                third-party services or content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Termination</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason,
                including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Breach of these Terms</li>
                <li>Fraudulent, illegal, or harmful activity</li>
                <li>Non-payment of fees</li>
                <li>At our sole discretion</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                Upon termination, your right to use the service will cease immediately. You may request export of your
                data within 30 days of termination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Disclaimer of Warranties</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Echo is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied,
                including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Merchantability or fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Uninterrupted or error-free service</li>
                <li>Security or freedom from viruses</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Limitation of Liability</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or
                indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Your use or inability to use the service</li>
                <li>Unauthorized access to or alteration of your data</li>
                <li>Third-party conduct or content</li>
                <li>Any other matter relating to the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Indemnification</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                You agree to indemnify and hold us harmless from any claims, damages, losses, liabilities, and expenses
                (including attorneys' fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>Your use of the service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Dispute Resolution</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Governing Law</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to
                conflict of law provisions.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Arbitration</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Any disputes arising from these Terms or your use of the service shall be resolved through binding
                arbitration, except for claims that may be brought in small claims court.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of any changes by posting
                the new Terms on this page and updating the "Last updated" date. Your continued use of the service
                after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">General Provisions</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Entire Agreement</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Echo.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Severability</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in
                full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Waiver</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those
                rights.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Assignment</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may not assign or transfer these Terms without our prior written consent. We may assign our rights
                without restriction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
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
                By using Echo, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
