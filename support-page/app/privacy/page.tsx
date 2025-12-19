import { ArrowLeft } from 'lucide-react';
import { TrellisIcon } from '../components/TrellisIcon';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Trellis',
  description: 'Privacy Policy for Trellis, the AI-powered goal planning app.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-6 py-12 md:py-20">
      {/* Header */}
      <header className="flex flex-col items-center justify-center mb-12 text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-light-green shadow-sm mb-2">
          <TrellisIcon size={32} color="#2D5A3D" />
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-forest">
          Privacy Policy
        </h1>
        <p className="text-lg text-warm font-medium tracking-tight">
          Trellis - AI-Powered Goal Planning
        </p>
      </header>

      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sage hover:text-forest transition-colors mb-8"
      >
        <ArrowLeft size={18} />
        <span>Back to Support</span>
      </Link>

      {/* Content */}
      <main className="prose prose-lg max-w-none">
        <div className="bg-white border border-sand rounded-2xl p-8 md:p-10 shadow-sm space-y-8">

          {/* Effective Date */}
          <p className="text-warm text-sm">
            <strong>Effective Date:</strong> December 19, 2024
          </p>

          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">1. Introduction</h2>
            <p className="text-warm leading-relaxed">
              Welcome to Trellis. We respect your privacy and are committed to protecting your personal data.
              This privacy policy explains how we collect, use, and safeguard your information when you use our
              mobile application.
            </p>
            <p className="text-warm leading-relaxed mt-4">
              By using Trellis, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-bark mt-6 mb-3">Account Data</h3>
            <ul className="list-disc list-inside text-warm space-y-2">
              <li>Email address (via Google Sign-In)</li>
              <li>Name (from your Google profile)</li>
              <li>Profile picture (from your Google profile)</li>
            </ul>

            <h3 className="text-lg font-medium text-bark mt-6 mb-3">User-Generated Content</h3>
            <ul className="list-disc list-inside text-warm space-y-2">
              <li>Goals and their descriptions</li>
              <li>Task completion status and history</li>
              <li>Weekly check-in responses and feedback</li>
              <li>Schedule and availability preferences</li>
              <li>Experience level and timeline preferences</li>
            </ul>

            <h3 className="text-lg font-medium text-bark mt-6 mb-3">Usage Data</h3>
            <ul className="list-disc list-inside text-warm space-y-2">
              <li>App usage patterns and feature interactions</li>
              <li>Device information (operating system, device type)</li>
              <li>Progress and streak statistics</li>
            </ul>

            <h3 className="text-lg font-medium text-bark mt-6 mb-3">Third-Party Data</h3>
            <ul className="list-disc list-inside text-warm space-y-2">
              <li>Google Calendar events (only if you choose to connect your calendar)</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">3. How We Use Your Information</h2>
            <p className="text-warm leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2">
              <li>Create and manage your account</li>
              <li>Generate personalized AI-powered goal plans and weekly tasks</li>
              <li>Sync your tasks with Google Calendar (if enabled)</li>
              <li>Track your progress, streaks, and completion rates</li>
              <li>Adjust task intensity based on your weekly check-in feedback</li>
              <li>Improve and optimize the app experience</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">4. Third-Party Services</h2>
            <p className="text-warm leading-relaxed mb-4">
              Trellis uses the following third-party services to provide our features:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-warm text-sm">
                <thead>
                  <tr className="border-b border-sand">
                    <th className="text-left py-3 pr-4 font-semibold text-bark">Service</th>
                    <th className="text-left py-3 pr-4 font-semibold text-bark">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-sand">
                    <td className="py-3 pr-4">Google Sign-In</td>
                    <td className="py-3">Account authentication</td>
                  </tr>
                  <tr className="border-b border-sand">
                    <td className="py-3 pr-4">Google Calendar API</td>
                    <td className="py-3">Calendar synchronization (optional)</td>
                  </tr>
                  <tr className="border-b border-sand">
                    <td className="py-3 pr-4">Supabase</td>
                    <td className="py-3">Database and authentication services</td>
                  </tr>
                  <tr className="border-b border-sand">
                    <td className="py-3 pr-4">Google Gemini AI</td>
                    <td className="py-3">AI-powered plan generation</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-warm leading-relaxed mt-4">
              Each of these services has their own privacy policies. We encourage you to review them:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2 mt-2">
              <li>
                <a href="https://policies.google.com/privacy" className="text-forest hover:underline" target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://supabase.com/privacy" className="text-forest hover:underline" target="_blank" rel="noopener noreferrer">
                  Supabase Privacy Policy
                </a>
              </li>
            </ul>
          </section>

          {/* Data Storage & Security */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">5. Data Storage & Security</h2>
            <p className="text-warm leading-relaxed">
              Your data is stored on secure cloud servers provided by Supabase. We implement
              industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2 mt-4">
              <li>All data is encrypted in transit using HTTPS/TLS</li>
              <li>Data at rest is encrypted on our database servers</li>
              <li>Authentication tokens are securely stored on your device</li>
              <li>We regularly review and update our security practices</li>
            </ul>
            <p className="text-warm leading-relaxed mt-4">
              Your data is retained for as long as your account is active. If you delete your account,
              all associated data will be permanently removed from our servers.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">6. Data Sharing</h2>
            <p className="text-warm leading-relaxed">
              <strong className="text-bark">We do not sell your personal data to third parties.</strong>
            </p>
            <p className="text-warm leading-relaxed mt-4">
              We only share your data with the third-party services listed above, and only to the extent
              necessary to provide our app&apos;s features. We may also disclose your information if required
              by law or to protect our rights and safety.
            </p>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">7. Your Rights</h2>
            <p className="text-warm leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2">
              <li><strong className="text-bark">Access:</strong> You can view your data within the app at any time</li>
              <li><strong className="text-bark">Deletion:</strong> You can delete your account and all associated data in Settings &gt; Account &gt; Data Management</li>
              <li><strong className="text-bark">Correction:</strong> You can update your goals and preferences at any time</li>
              <li><strong className="text-bark">Portability:</strong> Contact us to request a copy of your data</li>
              <li><strong className="text-bark">Opt-out:</strong> You can disconnect Google Calendar integration at any time</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-warm leading-relaxed">
              Trellis is not intended for use by children under the age of 13. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and believe your
              child has provided us with personal information, please contact us immediately so we can
              delete that information.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">9. Changes to This Policy</h2>
            <p className="text-warm leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any significant
              changes by posting the new policy on this page and updating the &quot;Effective Date&quot; at the top.
              We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">10. Contact Us</h2>
            <p className="text-warm leading-relaxed">
              If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <p className="text-warm mt-4">
              <a href="mailto:trellisgoal@gmail.com" className="text-forest hover:underline font-medium">
                trellisgoal@gmail.com
              </a>
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-sand flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-warm">
        <div className="flex items-center gap-2">
          <TrellisIcon size={16} color="#6B8E6B" />
          <span className="font-medium">&copy; 2025 Trellis Inc.</span>
        </div>

        <div className="flex gap-6">
          <Link href="/privacy" className="text-forest font-medium">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-bark transition-colors">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
