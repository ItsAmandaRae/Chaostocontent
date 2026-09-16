import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What can I add to Chaos To Content?",
    answer: "Voice notes, audio files, typed thoughts, rants, screenshots, photos, and links. Each one becomes a searchable Brain Dump you can turn into posts.",
  },
  {
    question: "Does it read and organize my Brain Dumps?",
    answer: "Yes. Audio is transcribed, screenshots are read, and every dump gets a useful title, summary, and tags so the good idea is easy to find later.",
  },
  {
    question: "Will the posts sound like me?",
    answer: "Your Brand DNA captures your audience, tone, real writing samples, offers, and words you never use. Drafts use that context instead of giving you generic AI copy.",
  },
  {
    question: "Does it publish automatically at the scheduled time?",
    answer: "No. Your calendar is a reminder system. Nothing leaves Chaos To Content until you choose to copy or open it and publish it yourself.",
  },
  {
    question: "Which platforms can it write for?",
    answer: "X, Instagram, TikTok, YouTube Shorts, LinkedIn, Threads, Facebook, and newsletters. Each draft is shaped for the platform instead of copied word for word.",
  },
  {
    question: "Who can access my Brain Dumps?",
    answer: "Only you. Your uploads and extracted ideas live in private storage scoped to your account.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-16 lg:py-32 px-6 lg:px-0">
      <div className="container mx-auto max-w-[896px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display font-black text-3xl sm:text-4xl lg:text-5xl leading-[0.9] tracking-[-0.96px] text-black uppercase text-center mb-12 sm:mb-14 lg:mb-16"
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="relative bg-black overflow-hidden">
          <div className="flex flex-col gap-0">
            {faqs.map((faq, index) => {
              const isFirst = index === 0;
              const isLast = index === faqs.length - 1;
              const isNotLast = !isLast;

              const borderClasses = [
                isFirst ? 'border-t' : '',
                isLast ? 'border-b' : '',
                'border-l border-r'
              ].filter(Boolean).join(' ');

              const roundedClasses = [];
              if (isFirst && isNotLast) roundedClasses.push('rounded-bl-[32px] rounded-br-[32px]');
              if (!isFirst && !isLast) roundedClasses.push('rounded-tl-[32px] rounded-tr-[32px] rounded-bl-[32px] rounded-br-[32px]');
              if (!isFirst && isLast) roundedClasses.push('rounded-tl-[32px] rounded-tr-[32px]');

              const isOpen = index === openIndex;

              return (
                <div
                  key={index}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className={`bg-white outline outline-1 outline-black ${borderClasses} ${roundedClasses.join(' ')} px-6 sm:px-10 lg:px-16 py-8 sm:py-10 lg:py-12 flex flex-col transition-all duration-300 cursor-pointer min-h-[96px]`}
                  style={{ outlineOffset: '-0.5px' }}
                >
                  <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-black tracking-[-0.24px] leading-tight sm:leading-snug">
                        {faq.question}
                      </p>
                    </div>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-6 lg:h-6 flex-shrink-0 transition-transform duration-300">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-full h-full transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <path
                          d="M4 12C10.6274 12 16 17.3726 16 24C16 17.3726 21.3726 12 28 12"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isOpen && faq.answer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden mt-6 sm:mt-7 lg:mt-8"
                      >
                        <p className="text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 text-black">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
