import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-16 md:py-20 border-b-4 border-foreground" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative bg-primary border-4 border-foreground rounded-3xl text-center p-8 md:p-12 lg:p-16 max-w-3xl mx-auto overflow-hidden"
          style={{ boxShadow: '8px 8px 0 0 hsl(var(--foreground))' }}
        >
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-secondary border-2 border-foreground rounded-full" />
          <div className="absolute bottom-4 right-4 w-6 h-6 bg-accent border-2 border-foreground" />
          <div className="absolute top-1/2 -left-3 w-6 h-12 bg-secondary border-2 border-foreground rounded-full" />
          <div className="absolute top-1/4 -right-3 w-4 h-4 bg-accent border-2 border-foreground rounded-full" />
          
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4 relative z-10">
            Ready to find your voice?
          </h2>
          
          <p className="font-body text-sm md:text-base mb-8 max-w-md mx-auto relative z-10">
            Join thousands of creators who've transformed how they capture and share ideas.
          </p>

          <button className="neo-button bg-background text-sm md:text-base px-8 py-4 relative z-10">
            Get Started Free
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;