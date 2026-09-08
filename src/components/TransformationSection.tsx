import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    iconBg: 'bg-highlight',
    title: 'Studio Quality, Everywhere',
    description: "Our advanced AI filters out background noise, wind, and traffic. Record while walking, driving, or in a cafe. We make it sound like you were in a booth.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.9976 0.825195L3.33398 23.8826H14.9977V35.1985L32.6488 11.9998H20.9976V0.825195Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    iconBg: 'bg-primary',
    title: 'Hook Generation',
    description: "We don't just transcribe. We find the 'viral' moment in your rant and front-load it.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M4.5 4.5H31.5V31.5H4.5V4.5ZM10.5 22.5H25.5V25.5H10.5V22.5ZM10.5 10.5V16.5H16.5V10.5H10.5Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    iconBg: 'bg-secondary',
    title: 'Auto-Threader',
    description: 'Long recording? We automatically break it down into a perfectly threaded sequence.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25.5 3C22.1863 3 19.5 5.68629 19.5 9C19.5 9.47891 19.5564 9.94564 19.663 10.3935L13.4309 13.9547C12.3348 12.7548 10.7563 12 9 12C5.68629 12 3 14.6863 3 18C3 21.3137 5.68629 24 9 24C10.7563 24 12.3348 23.2452 13.4309 22.0454L19.663 25.6065C19.5564 26.0544 19.5 26.5211 19.5 27C19.5 30.3137 22.1863 33 25.5 33C28.8137 33 31.5 30.3137 31.5 27C31.5 23.6863 28.8137 21 25.5 21C23.7437 21 22.1652 21.7548 21.069 22.9546L14.837 19.3935C14.9436 18.9456 15 18.4789 15 18C15 17.5211 14.9436 17.0544 14.837 16.6065L21.069 13.0453C22.1652 14.2452 23.7437 15 25.5 15C28.8137 15 31.5 12.3137 31.5 9C31.5 5.68629 28.8137 3 25.5 3Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    iconBg: 'bg-accent',
    title: 'Style Matching',
    description: 'Train the AI on your previous best-performing posts. It learns your tone, sentence structure, and vocabulary to write exactly like you.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.5 33H16.5V25.5H19.5V33Z" fill="currentColor"/>
        <path d="M20.1211 18.0005L8.45361 29.6679L6.33252 27.5469L14.3789 19.5005H3V16.5005H14.3789L6.33252 8.4541L8.45361 6.33301L20.1211 18.0005Z" fill="currentColor"/>
        <path d="M29.6675 27.545L27.5465 29.666L22.2422 24.3633L24.3648 22.2422L29.6675 27.545Z" fill="currentColor"/>
        <path d="M33 19.5H25.5V16.5H33V19.5Z" fill="currentColor"/>
        <path d="M29.6675 8.4541L24.3648 13.7568L22.2422 11.6357L27.5465 6.33301L29.6675 8.4541Z" fill="currentColor"/>
        <path d="M19.5 10.5H16.5V3H19.5V10.5Z" fill="currentColor"/>
      </svg>
    ),
  },
];

const TransformationSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="py-16 md:py-32 px-4 md:px-8 lg:px-36" ref={ref}>
      <div className="container mx-auto flex flex-col items-center gap-8 md:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[1152px]"
        >
          <h2 className="font-display text-4xl md:text-5xl font-black uppercase leading-tight">
            Total<br />Transformation
          </h2>
        </motion.div>

        <div className="w-full max-w-[1152px] relative">
          {/* Grid layout - 12 columns on desktop, single column on mobile/tablet */}
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Block 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0 }}
              className="md:col-span-7 p-6 md:p-12 border border-foreground flex flex-col gap-6 md:gap-10"
            >
              <div className={`p-3 md:p-3.5 ${features[0].iconBg} rounded-full border-2 border-foreground inline-flex w-fit text-foreground`}>
                {features[0].icon}
              </div>
              <div className="flex flex-col gap-4 md:gap-6">
                <h3 className="font-display text-xl md:text-4xl font-black leading-tight">{features[0].title}</h3>
                <p className="font-body text-base md:text-xl text-foreground leading-6 md:leading-7">{features[0].description}</p>
              </div>
            </motion.div>

            {/* Block 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-5 p-6 md:p-12 border border-foreground border-t-0 md:border-t md:border-l-0 flex flex-col gap-6 md:gap-10"
            >
              <div className={`p-3 md:p-3.5 ${features[1].iconBg} rounded-full border-2 border-foreground inline-flex w-fit text-foreground`}>
                {features[1].icon}
              </div>
              <div className="flex flex-col gap-4 md:gap-6">
                <h3 className="font-display text-xl md:text-4xl font-black leading-tight">{features[1].title}</h3>
                <p className="font-body text-base md:text-xl text-foreground leading-6 md:leading-7">{features[1].description}</p>
              </div>
            </motion.div>

            {/* Block 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-5 p-6 md:p-12 border border-foreground border-t-0 flex flex-col gap-6 md:gap-10"
            >
              <div className={`p-3 md:p-3.5 ${features[2].iconBg} rounded-full border-2 border-foreground inline-flex w-fit text-foreground`}>
                {features[2].icon}
              </div>
              <div className="flex flex-col gap-4 md:gap-6">
                <h3 className="font-display text-xl md:text-4xl font-black leading-tight">{features[2].title}</h3>
                <p className="font-body text-base md:text-xl text-foreground leading-6 md:leading-7">{features[2].description}</p>
              </div>
            </motion.div>

            {/* Block 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-7 p-6 md:p-12 border border-foreground border-t-0 md:border-l-0 flex flex-col gap-6 md:gap-10"
            >
              <div className={`p-3 md:p-3.5 ${features[3].iconBg} rounded-full border-2 border-foreground inline-flex w-fit text-foreground`}>
                {features[3].icon}
              </div>
              <div className="flex flex-col gap-4 md:gap-6">
                <h3 className="font-display text-xl md:text-4xl font-black leading-tight">{features[3].title}</h3>
                <p className="font-body text-base md:text-xl text-foreground leading-6 md:leading-7">{features[3].description}</p>
              </div>
            </motion.div>
          </div>

          {/* Desktop halfsparks - horizontal, hidden on mobile */}
          <div className="hidden md:block absolute left-[calc(58.33%-32px)] top-[50%] -translate-y-full z-10">
            <svg width="64" height="32" viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 0C32 17.6731 17.6731 32 0 32H64C46.3269 32 32 17.6731 32 0Z" fill="currentColor" className="text-foreground"/>
            </svg>
          </div>
          <div className="hidden md:block absolute left-[calc(41.67%-32px)] top-[calc(50%+32px)] -translate-y-full z-10">
            <svg width="64" height="32" viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0C17.6731 0 32 14.3269 32 32C32 14.3269 46.3269 0 64 0H0Z" fill="currentColor" className="text-foreground"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransformationSection;
