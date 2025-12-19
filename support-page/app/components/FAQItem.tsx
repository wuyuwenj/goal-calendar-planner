'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
}

export function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`bg-white border border-sand rounded-xl overflow-hidden transition-all duration-200 hover:shadow-sm ${
        isOpen ? 'shadow-md' : ''
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-6 text-left cursor-pointer select-none"
      >
        <span className="text-lg font-semibold text-bark pr-4">{question}</span>
        <ChevronDown
          className={`text-sage transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          size={20}
          strokeWidth={1.5}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-0 text-warm leading-relaxed">{answer}</div>
      </div>
    </div>
  );
}
