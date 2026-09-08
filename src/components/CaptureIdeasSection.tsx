import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const scenarios = [
  {
    icon: '🧠',
    title: 'The Walking Thinker',
    description: 'Ideas happen on your morning walk. Capture them before they vanish with one tap recording.',
    color: 'bg-secondary',
  },
  {
    icon: '🚗',
    title: 'The Commute Rant',
    description: 'Stuck in traffic? Turn frustration into content. Vent, plan, or brainstorm hands-free.',
    color: 'bg-primary',
  },
  {
    icon: '💬',
    title: 'Post-Meeting Clarity',
    description: "Just finished a call and now you're buzzing with insights? Capture the momentum before it fades.",
    color: 'bg-accent',
  },
];

const CaptureIdeasSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="py-16 md:py-20 border-b-4 border-foreground" ref={ref}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-tight tracking-tight mb-6">
              Capture
              <br />
              Ideas in
              <br />
              the Wild
            </h2>
            <p className="font-body text-base text-muted-foreground max-w-sm mb-8">
              Great ideas don't wait for you to sit down at your desk. 
              LOUDIO goes where you go, turning every moment of inspiration into actionable text.
            </p>

            {/* Idea notification card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="neo-card-secondary p-5 max-w-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-background border-2 border-foreground flex items-center justify-center text-sm">
                  💡
                </div>
                <span className="font-display font-bold text-sm">Idea Captured!</span>
              </div>
              <p className="font-body text-sm">
                "What if we could make the onboarding flow more like a conversation instead of a form..."
              </p>
            </motion.div>
          </motion.div>

          {/* Right Content - Scenario Cards with Timeline */}
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-5 top-8 bottom-8 w-0.5 border-l-2 border-dashed border-foreground/40 hidden md:block" />
            
            <div className="space-y-4">
              {scenarios.map((scenario, index) => (
                <motion.div
                  key={scenario.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-3 top-6 w-4 h-4 bg-foreground rounded-full hidden md:block z-10" />
                  
                  <div className={`neo-card ${scenario.color} ml-0 md:ml-12`}>
                    <h3 className="font-display text-base font-black mb-2">{scenario.title}</h3>
                    <p className="font-body text-sm leading-relaxed">{scenario.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaptureIdeasSection;