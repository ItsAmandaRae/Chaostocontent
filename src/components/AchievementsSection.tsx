import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

const stats = [
  { value: 42, suffix: 'dB', label: 'Noise reduction capability' },
  { value: 99, suffix: '%', label: 'Transcription accuracy rate' },
  { value: 30, suffix: '+', label: 'Languages fully supported' },
  { value: 2, prefix: '<', suffix: 's', label: 'Average processing time' },
];

const AchievementsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      stats.forEach((stat, index) => {
        const element = document.getElementById(`stat-${index}`);
        if (element) {
          gsap.fromTo(
            element,
            { innerText: 0 },
            {
              innerText: stat.value,
              duration: 2,
              delay: index * 0.2,
              ease: 'power2.out',
              snap: { innerText: 1 },
            }
          );
        }
      });
    }
  }, [isInView, hasAnimated]);

  return (
    <section className="py-16 md:py-20 bg-muted border-b-4 border-foreground" ref={ref}>
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-left"
            >
              <div className="font-display text-4xl md:text-5xl font-bold mb-1">
                {stat.prefix}
                <span id={`stat-${index}`}>0</span>
                {stat.suffix}
              </div>
              <p className="font-body text-sm text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
