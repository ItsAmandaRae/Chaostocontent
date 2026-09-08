import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const testimonials = [
  {
    quote: "I used to spend 2 hours writing threads. Now I just talk for 3 minutes on my morning walk. Game changer!",
    author: 'Sarah K.',
    role: 'Content Creator',
    color: 'bg-secondary',
  },
  {
    quote: "The noise cancellation is witchcraft. Recorded in a busy airport and it sounded studio crisp!",
    author: 'Mark T.',
    role: 'Podcaster',
    color: 'bg-background',
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-16 md:py-20 border-b-4 border-foreground" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="font-body text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase leading-tight tracking-tight mt-2">
            Don't Take Our
            <br />
            Word For It
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`neo-card ${testimonial.color}`}
            >
              {/* Large quote mark */}
              <div className="mb-2">
                <span className="font-display text-5xl md:text-6xl font-bold leading-none">"</span>
              </div>
              
              <blockquote className="font-display text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-6">
                {testimonial.quote}
              </blockquote>
              
              <div className="pt-4 border-t-2 border-foreground/20">
                <p className="font-display font-bold text-sm">{testimonial.author}</p>
                <p className="font-body text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;