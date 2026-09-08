import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'How does the noise cancellation work?',
    answer: "Our AI-powered noise cancellation uses advanced machine learning models trained on millions of audio samples. It can distinguish between your voice and background noise in real-time, filtering out traffic, crowds, wind, and other common distractions while preserving the clarity of your speech.",
  },
  {
    question: 'Can I export to multiple platforms at once?',
    answer: "Absolutely! LOUDIO supports export to all major platforms including Twitter/X, LinkedIn, Notion, Google Docs, and more. You can set up custom export templates and push to multiple destinations with a single click.",
  },
  {
    question: 'What languages are supported?',
    answer: "We currently support over 30 languages including English, Spanish, French, German, Portuguese, Japanese, Korean, Chinese, and many more. Our accuracy rates are consistently above 95% across all supported languages.",
  },
  {
    question: 'Is there a limit on recording length?',
    answer: "Free users can record up to 2 minutes per session. Pro users enjoy unlimited recording length - we've had users successfully transcribe 4+ hour podcasts and meetings without any issues.",
  },
  {
    question: 'How accurate is the transcription?',
    answer: "Our transcription accuracy averages 99% for clear audio in supported languages. Even with background noise, our AI cleanup feature maintains 95%+ accuracy.",
  },
];

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 md:py-20 border-b-4 border-foreground" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase leading-tight tracking-tight">
            Frequently Asked
            <br />
            Questions
          </h2>
        </motion.div>

        <div className="max-w-xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full bg-background border-4 border-foreground p-4 text-left flex items-center justify-between gap-4 hover:bg-muted transition-colors"
                style={{ boxShadow: openIndex === index ? 'none' : '4px 4px 0 0 hsl(var(--foreground))' }}
              >
                <span className="font-display font-bold text-sm">{faq.question}</span>
                <div className="w-6 h-6 bg-muted border-2 border-foreground flex items-center justify-center flex-shrink-0">
                  {openIndex === index ? <Minus size={14} /> : <Plus size={14} />}
                </div>
              </button>
              
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-4 border-t-0 border-foreground bg-muted">
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
