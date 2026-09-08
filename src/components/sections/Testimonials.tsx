import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const imgQuoteIcon = "/images/55adc45085651a1581434a9fb485e536143865a6.svg";

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const rotation1 = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const rotation2 = useTransform(scrollYProgress, [0, 1], [180, 540]);

  const TILE_SIZE = 64;
  const GRID_COLUMNS = 9;
  const GRID_ROWS = 9;
  const GRID_WIDTH = GRID_COLUMNS * TILE_SIZE;
  const GRID_HEIGHT = GRID_ROWS * TILE_SIZE;
  const GRID_LEFT = 512;
  const GRID_TOP = 240;
  const KNOB_SIZE = 64;

  const KNOB_POSITIONS = [
    { left: 897, top: 240 },
    { left: 1025, top: 368 },
  ];

  const testimonials = [
    {
      quote: "I used to spend 2 hours writing threads. Now I just talk for 3 minutes on my morning walk. Game changer.",
      author: "Sarah J.",
      role: "Founder @ TechFlow",
      bgColor: "bg-[#49ffcb]",
      avatar: "/images/15d2a3cb41b76069bfd438c785ffec04bc13df19.png",
    },
    {
      quote: "The noise cancellation is witchcraft. Recorded in a busy airport and it sounded studio crisp.",
      author: "Mike R.",
      role: "VC Analyst",
      bgColor: "bg-white",
      avatar: "/images/89dac001bf88f8938b11636369b798131f5b271c.png",
    },
  ];

  return (
    <section ref={sectionRef} className="bg-[#f5f5f5] py-16 lg:py-32 px-6 lg:px-0 relative">
      <div className="container mx-auto max-w-[1152px] relative">
        {/* Grid Background */}
        <div
          className="absolute hidden lg:block"
          style={{
            left: `calc((100% - 1152px) / 2 + ${GRID_LEFT}px)`,
            top: `${GRID_TOP + 16}px`,
            width: `${GRID_WIDTH}px`,
            height: `${GRID_HEIGHT}px`,
            zIndex: 0,
          }}
        >
          <div className="flex relative">
            <div className="flex flex-col" style={{ marginTop: `${3 * TILE_SIZE}px` }}>
              {[...Array(3)].map((_, i) => (
                <div key={`col1-row${i}`} className="w-16 h-16 outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />
              ))}
            </div>
            <div className="flex flex-col" style={{ marginTop: `${2 * TILE_SIZE}px` }}>
              {[...Array(5)].map((_, i) => (
                <div key={`col2-row${i}`} className="w-16 h-16 outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />
              ))}
            </div>
            <div className="flex flex-col" style={{ marginTop: `${1 * TILE_SIZE}px` }}>
              {[...Array(7)].map((_, i) => (
                <div key={`col3-row${i}`} className="w-16 h-16 outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />
              ))}
            </div>
            <div className="flex flex-col">
              {[...Array(9)].map((_, i) => (
                <div key={`col4-row${i}`} className="w-16 h-16 outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />
              ))}
            </div>
            <div className="flex flex-col">
              {[...Array(9)].map((_, i) => (
                <div key={`col5-row${i}`} className="w-16 h-16 outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />
              ))}
            </div>
            <div className="flex flex-col">
              {[...Array(9)].map((_, i) => {
                let borderRadiusStyle: React.CSSProperties = {};
                // Row 5 (index 4): bottom-right corner for sparkle
                if (i === 4) borderRadiusStyle = { borderBottomRightRadius: '32px' };
                // Row 6 (index 5): top-right corner for sparkle
                else if (i === 5) borderRadiusStyle = { borderTopRightRadius: '32px' };
                return (
                  <div key={`col6-row${i}`} className="w-16 h-16 outline outline-1 outline-black" style={{ outlineOffset: '-0.5px', ...borderRadiusStyle }} />
                );
              })}
            </div>
            <div className="flex flex-col" style={{ marginTop: `${1 * TILE_SIZE}px` }}>
              {[...Array(7)].map((_, i) => {
                let borderRadiusStyle: React.CSSProperties = {};
                // Row 5 is index 3 in this column (starts at row 1): bottom-left corner
                if (i === 3) borderRadiusStyle = { borderBottomLeftRadius: '32px' };
                // Row 6 is index 4 in this column: top-left corner
                else if (i === 4) borderRadiusStyle = { borderTopLeftRadius: '32px' };
                return (
                  <div key={`col7-row${i}`} className="w-16 h-16 outline outline-1 outline-black" style={{ outlineOffset: '-0.5px', ...borderRadiusStyle }} />
                );
              })}
            </div>
            <div className="flex flex-col" style={{ marginTop: `${2 * TILE_SIZE}px` }}>
              {[...Array(5)].map((_, i) => (
                <div key={`col8-row${i}`} className="w-16 h-16 outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />
              ))}
            </div>
            <div className="flex flex-col" style={{ marginTop: `${3 * TILE_SIZE}px` }}>
              {[...Array(3)].map((_, i) => (
                <div key={`col9-row${i}`} className="w-16 h-16 outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />
              ))}
            </div>

            <div className="absolute" style={{ left: `${3 * TILE_SIZE}px`, top: `${3 * TILE_SIZE}px` }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M0.5 16.5C9.33656 16.5 16.5 23.6634 16.5 32.5C16.5 23.6634 23.6634 16.5 32.5 16.5C23.6634 16.5 16.5 9.33656 16.5 0.5C16.5 9.33656 9.33656 16.5 0.5 16.5Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Knobs */}
        {KNOB_POSITIONS.map((position, index) => {
          const rotation = index === 0 ? rotation1 : rotation2;
          return (
            <motion.div
              key={index}
              className="absolute hidden lg:block"
              style={{
                left: `calc((100% - 1152px) / 2 + ${position.left}px)`,
                top: `${position.top + 16}px`,
                width: `${KNOB_SIZE}px`,
                height: `${KNOB_SIZE}px`,
                rotate: rotation,
                zIndex: 1,
              }}
            >
              <div className="w-full h-full rounded-full bg-black" />
              <div
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -100%)',
                  width: '2px',
                  height: '32px',
                  backgroundColor: 'white',
                  zIndex: 2,
                }}
              />
            </motion.div>
          );
        })}

        {/* Content */}
        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-black text-3xl sm:text-4xl lg:text-5xl leading-[0.9] tracking-[-0.96px] text-black uppercase mb-12 sm:mb-14 lg:mb-16 text-center"
          >
            Don't take our word for it
          </motion.h2>

          <div className="flex flex-col gap-8 sm:gap-12 lg:gap-16">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${testimonial.bgColor} outline outline-1 outline-black p-6 sm:p-8 lg:p-16 flex flex-col gap-6 sm:gap-7 lg:gap-8 max-w-full lg:max-w-[769px] ${index === 1 ? 'lg:ml-auto' : ''}`}
                style={{ outlineOffset: '-0.5px' }}
              >
                <img alt="" className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" src={imgQuoteIcon} />
                <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12">
                  <p className="font-display font-black text-2xl sm:text-3xl lg:text-4xl leading-tight sm:leading-8 lg:leading-10 tracking-[-0.36px] text-black uppercase">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4 text-base sm:text-lg leading-5 sm:leading-6 text-black">
                    <img
                      alt={testimonial.author}
                      src={testimonial.avatar}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col">
                      <p className="font-bold text-sm sm:text-base lg:text-lg">{testimonial.author}</p>
                      <p className="font-normal text-sm sm:text-base lg:text-lg">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
