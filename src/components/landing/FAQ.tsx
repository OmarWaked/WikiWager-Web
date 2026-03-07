'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';

const faqs = [
  {
    question: 'How does WikiWager work?',
    answer:
      "Each day you're given passages from real Wikipedia articles with a hidden link. Your job is to guess which Wikipedia article the passage connects to. Get it right to build your streak and multiply your score!",
  },
  {
    question: 'Is it free to play?',
    answer:
      'Yes! You get free guesses every 12 hours. Extra guesses are available in the store if you want to keep playing.',
  },
  {
    question: 'What is the streak multiplier?',
    answer:
      'Every correct answer increases your multiplier by 1.5x, compounding each round. So after 5 correct answers in a row, you\'re earning over 7x the base points! But be careful — one wrong answer resets it back to 1x.',
  },
  {
    question: 'Can I play with friends?',
    answer:
      'Yes! Challenge friends head-to-head, compete on global and friends-only leaderboards, and share referral codes to earn bonus guesses.',
  },
  {
    question: 'How do I earn more guesses?',
    answer:
      'You earn free guesses through daily rewards, achievements, streak milestones, and referring friends. You can also purchase additional guesses in the store.',
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span
          className={`text-base sm:text-lg font-semibold transition-colors duration-200 ${
            isOpen ? 'text-neon-violet-light' : 'text-soft-white group-hover:text-neon-violet-light/70'
          }`}
        >
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className={`text-xl ml-4 flex-shrink-0 transition-colors duration-200 ${
            isOpen ? 'text-neon-violet-light' : 'text-muted-gray'
          }`}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-muted-gray text-sm leading-relaxed pb-5 pr-8">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="faq" className="py-20 px-4 max-w-3xl mx-auto">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
          FAQ
        </h2>
        <p className="text-muted-gray text-lg">Got questions? We&apos;ve got answers.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass rounded-2xl p-6 sm:p-8"
      >
        {faqs.map((faq, i) => (
          <FAQItem
            key={i}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </motion.div>
    </section>
  );
}
