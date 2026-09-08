import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    icon: '✓',
    features: [
      '5 recordings per month',
      'Basic transcription',
      '2 minute max duration',
      'AI-free Transcription',
    ],
    cta: 'Start Free',
    color: 'bg-background',
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/mo',
    icon: '⚡',
    features: [
      'Up to 1 hour recording',
      'Studio-quality AI cleanup',
      'Unlimited recordings',
      'Style matching',
      '24 hour turn-around',
    ],
    cta: 'Upgrade Now',
    popular: true,
    color: 'bg-secondary',
  },
];

const PricingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="pricing" className="py-16 md:py-20 border-b-4 border-foreground" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="font-body text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Pricing
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase leading-tight tracking-tight mt-2">
            Simple Plans
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`neo-card ${plan.color} flex flex-col`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{plan.icon}</span>
                <span className="font-display text-sm font-bold">{plan.name}</span>
              </div>

              <div className="mb-5">
                <span className="font-display text-4xl md:text-5xl font-bold">{plan.price}</span>
                <span className="font-body text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-2.5 mb-6 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <span className="font-body text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full text-sm ${plan.popular ? 'neo-button-primary' : 'neo-button'}`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;