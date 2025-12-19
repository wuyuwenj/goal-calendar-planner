import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FAQItem } from './components/FAQItem';
import { TrellisIcon } from './components/TrellisIcon';

const faqs = [
  {
    question: 'How does Trellis create my plan?',
    answer: (
      <p>
        Trellis uses advanced AI to analyze your main goal description and your desired timeline. It breaks down complex ambitions into manageable, bite-sized weekly tasks, distributing them across your available days to prevent burnout while ensuring steady progress.
      </p>
    ),
  },
  {
    question: 'Can I change my schedule after creating a goal?',
    answer: (
      <p>
        Yes, absolutely. We know life is unpredictable. You can adjust your available days or specific task timings at any point in the{' '}
        <span className="text-forest font-medium">Plan Settings</span> tab. The AI will automatically redistribute pending tasks to fit your new schedule.
      </p>
    ),
  },
  {
    question: 'What happens during weekly check-ins?',
    answer: (
      <p>
        At the end of every week, Trellis prompts a quick review. You&apos;ll rate how difficult the week felt and mark completed tasks. Based on this feedback, the AI adjusts the intensity for the upcoming week—scaling up if you&apos;re cruising, or dialing back if you&apos;re overwhelmed.
      </p>
    ),
  },
  {
    question: 'How does the intensity adjustment work?',
    answer: (
      <p>
        Our algorithm monitors your completion streak and check-in feedback. If you consistently rate tasks as &quot;Too Easy,&quot; Trellis will slightly increase the volume or complexity of tasks. If you report &quot;High Stress,&quot; it immediately decompresses your schedule to help you recover stability.
      </p>
    ),
  },
  {
    question: 'How do I sync with Google Calendar?',
    answer: (
      <p>
        Go to <span className="text-forest font-medium">Settings &gt; Integrations</span> and toggle Google Calendar. You will be asked to authenticate your account. Once connected, Trellis tasks will appear as events in your calendar, and moving them in Google Calendar will update them in the app.
      </p>
    ),
  },
  {
    question: 'Is my data private and secure?',
    answer: (
      <p>
        Security is our top priority. Your goals and personal data are encrypted both in transit and at rest. We do not sell your data to third parties. The AI processing is stateless where possible to maximize privacy.
      </p>
    ),
  },
  {
    question: 'How do I delete my account?',
    answer: (
      <p>
        We&apos;re sorry to see you go. Navigate to{' '}
        <span className="text-forest font-medium">Settings &gt; Account &gt; Data Management</span>. Tap &quot;Delete Account&quot; at the bottom. This action is permanent and will remove all your goals, streaks, and history from our servers immediately.
      </p>
    ),
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-6 py-12 md:py-20">
      {/* Header */}
      <header className="flex flex-col items-center justify-center mb-16 text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-light-green shadow-sm mb-2">
          <TrellisIcon size={32} color="#2D5A3D" />
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-forest">
          Trellis
        </h1>
        <p className="text-lg text-warm font-medium tracking-tight">
          AI-Powered Goal Planning
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-grow space-y-12">
        {/* Intro Text */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            How can we help you grow?
          </h2>
          <p className="text-warm leading-relaxed">
            Find answers to common questions about managing your goals, syncing
            calendars, and maximizing your productivity with Trellis.
          </p>
        </div>

        {/* FAQ Section */}
        <section aria-label="Frequently Asked Questions" className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </section>

        {/* Contact Section */}
        <section className="mt-16 bg-white border border-sand rounded-2xl p-8 md:p-10 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-light-green mb-6">
            <Mail className="text-forest" size={24} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-bark mb-2 tracking-tight">
            Still need help?
          </h3>
          <p className="text-warm mb-8 max-w-sm mx-auto">
            Our support team is ready to help you get back on track with your
            goals.
          </p>

          <a
            href="mailto:trellisgoal@gmail.com?"
            className="inline-flex items-center justify-center gap-2 bg-forest hover:bg-[#1e3d29] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow group"
          >
            <span>Contact Support</span>
            <ArrowRight
              className="group-hover:translate-x-0.5 transition-transform"
              size={18}
              strokeWidth={1.5}
            />
          </a>
        </section>
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
          <Link href="/terms" className="hover:text-bark transition-colors">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
