import { ArrowLeft } from 'lucide-react';
import { TrellisIcon } from '../components/TrellisIcon';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - Trellis',
  description: 'Terms of Service for Trellis, the AI-powered goal planning app.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-6 py-12 md:py-20">
      {/* Header */}
      <header className="flex flex-col items-center justify-center mb-12 text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-light-green shadow-sm mb-2">
          <TrellisIcon size={32} color="#2D5A3D" />
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-forest">
          Terms of Service
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
            <h2 className="text-xl font-semibold text-bark mb-4">1. Acceptance of Terms</h2>
            <p className="text-warm leading-relaxed">
              By downloading, installing, or using Trellis (&quot;the App&quot;), you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the App.
            </p>
            <p className="text-warm leading-relaxed mt-4">
              We reserve the right to modify these Terms at any time. Continued use of the App after
              changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">2. Description of Service</h2>
            <p className="text-warm leading-relaxed">
              Trellis is an AI-powered goal planning application that helps users:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2 mt-4">
              <li>Set and track personal goals</li>
              <li>Receive AI-generated weekly task plans</li>
              <li>Monitor progress through weekly check-ins</li>
              <li>Sync tasks with Google Calendar (optional)</li>
              <li>Adjust goal intensity based on feedback</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">3. Account Registration</h2>
            <p className="text-warm leading-relaxed">
              To use Trellis, you must create an account using Google Sign-In. By creating an account, you agree that:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2 mt-4">
              <li>You are at least 9 years of age</li>
              <li>You will provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You will notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">4. Acceptable Use</h2>
            <p className="text-warm leading-relaxed">
              You agree to use Trellis only for lawful purposes. You may not:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2 mt-4">
              <li>Use the App for any illegal or unauthorized purpose</li>
              <li>Attempt to interfere with or disrupt the App&apos;s functionality</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated systems to access the App without permission</li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
            </ul>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">5. User Content</h2>
            <p className="text-warm leading-relaxed">
              You retain ownership of any content you create within the App, including goals,
              descriptions, and check-in responses (&quot;User Content&quot;).
            </p>
            <p className="text-warm leading-relaxed mt-4">
              By using the App, you grant us a limited license to use your User Content solely for
              the purpose of providing and improving our services. This includes processing your
              content through AI systems to generate personalized plans.
            </p>
            <p className="text-warm leading-relaxed mt-4">
              You are solely responsible for your User Content. You agree not to submit content that:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2 mt-4">
              <li>Is illegal, harmful, or offensive</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains personal information of others without consent</li>
            </ul>
          </section>

          {/* AI-Generated Content */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">6. AI-Generated Content</h2>
            <p className="text-warm leading-relaxed">
              Trellis uses artificial intelligence to generate task plans and recommendations.
              You acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2 mt-4">
              <li>AI-generated content is provided for informational purposes only</li>
              <li>We do not guarantee the accuracy or suitability of AI recommendations</li>
              <li>You are responsible for evaluating and deciding whether to follow any suggestions</li>
              <li>AI-generated plans should not replace professional advice (medical, legal, financial, etc.)</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">7. Third-Party Services</h2>
            <p className="text-warm leading-relaxed">
              Trellis integrates with third-party services including Google Sign-In and Google Calendar.
              Your use of these services is subject to their respective terms and privacy policies.
              We are not responsible for the practices of third-party services.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">8. Intellectual Property</h2>
            <p className="text-warm leading-relaxed">
              The App, including its design, features, code, and content (excluding User Content),
              is owned by Trellis and protected by intellectual property laws. You may not:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2 mt-4">
              <li>Copy, modify, or distribute the App</li>
              <li>Reverse engineer or decompile the App</li>
              <li>Use our trademarks without permission</li>
              <li>Remove any copyright or proprietary notices</li>
            </ul>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-warm leading-relaxed">
              THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2 mt-4">
              <li>The App will be uninterrupted or error-free</li>
              <li>Defects will be corrected</li>
              <li>The App is free of viruses or harmful components</li>
              <li>The results from using the App will meet your requirements</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">10. Limitation of Liability</h2>
            <p className="text-warm leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRELLIS SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-warm space-y-2 mt-4">
              <li>Loss of profits, data, or goodwill</li>
              <li>Service interruption or computer damage</li>
              <li>Any damages arising from your use of the App</li>
            </ul>
            <p className="text-warm leading-relaxed mt-4">
              Our total liability shall not exceed the amount you paid for the App in the twelve (12)
              months preceding the claim.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">11. Termination</h2>
            <p className="text-warm leading-relaxed">
              You may terminate your account at any time by deleting your account through the App settings.
            </p>
            <p className="text-warm leading-relaxed mt-4">
              We reserve the right to suspend or terminate your account at any time for violation of
              these Terms or for any other reason at our sole discretion. Upon termination, your right
              to use the App will immediately cease.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">12. Governing Law</h2>
            <p className="text-warm leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the
              United States, without regard to its conflict of law provisions. Any disputes arising
              from these Terms shall be resolved in the courts of competent jurisdiction.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">13. Changes to Terms</h2>
            <p className="text-warm leading-relaxed">
              We may update these Terms from time to time. We will notify you of significant changes
              by posting the new Terms on this page and updating the &quot;Effective Date.&quot; Your continued
              use of the App after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">14. Severability</h2>
            <p className="text-warm leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision
              shall be limited or eliminated to the minimum extent necessary, and the remaining
              provisions shall remain in full force and effect.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-bark mb-4">15. Contact Us</h2>
            <p className="text-warm leading-relaxed">
              If you have any questions about these Terms, please contact us at:
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
          <Link href="/privacy" className="hover:text-bark transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-forest font-medium">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
