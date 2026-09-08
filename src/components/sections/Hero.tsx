import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

const imgIcon = "/images/dd6c36abbd704b03e1997b404542ec260273d97c.svg";
export default function Hero() {
  return (
    <section className="relative min-h-[600px] lg:h-[832px] overflow-hidden">
      {/* Content */}
      <div className="container mx-auto px-6 lg:px-0 pt-12 sm:pt-16 lg:pt-24 max-w-[1152px] relative z-10">
        <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12">
          {/* Badge + Title + Description */}
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Badge */}
            <motion.div
              className="flex items-start gap-0 h-7 sm:h-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                <img alt="" className="w-full h-full" src={imgIcon} />
              </div>
              <div className="bg-white border border-black px-2 sm:px-3 py-1 h-7 sm:h-8 flex items-center">
                <p className="text-xs sm:text-sm lg:text-base font-normal text-black uppercase leading-tight font-mono">
                  <span className="hidden sm:inline">AUDIO-FIRST POSTING WORKSPACE</span>
                  <span className="sm:hidden">POSTING WORKSPACE</span>
                </p>
              </div>
            </motion.div>

            {/* Title */}
            <div className="flex flex-col font-display font-black text-4xl sm:text-5xl md:text-7xl lg:text-[120px] leading-[1.1] sm:leading-tight sm:leading-[80px] lg:leading-[112px] tracking-[-1.6px] sm:tracking-[-2px] lg:tracking-[-2.4px] text-black uppercase">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Record it.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Post it.
              </motion.p>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 text-black max-w-full sm:max-w-[480px]"
            >
              Upload your voice notes, keep them in one private library, write the posts they inspire, schedule them on a calendar, and share to X in one click. You stay in control — nothing is ever posted without you.
            </motion.p>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link to="/auth?mode=signup" className="bg-highlight text-highlight-foreground border border-black h-11 sm:h-12 lg:h-16 px-12 py-2.5 sm:py-2 lg:py-3 rounded-full text-base lg:text-lg font-medium shadow-[4px_6px_0px_0px_black] sm:shadow-[6px_8px_0px_0px_black] hover:shadow-[4px_6px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_0px_black] active:translate-x-[6px] active:translate-y-[6px] transition-all duration-200 ease-out w-full sm:w-auto inline-flex items-center justify-center">
              Start Creating Now
            </Link>
          </motion.div>
        </div>

        {/* Trusted By */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-row items-center gap-3 mt-12 sm:mt-14 lg:mt-16 mb-0"
        >
          <div className="flex items-center -space-x-3">
            <div className="border-2 border-black rounded-full w-7 h-7 sm:w-8 sm:h-8 relative z-30">
              <img alt="Creator avatar" className="w-full h-full rounded-full object-cover" src={avatar1} />
            </div>
            <div className="border-2 border-black rounded-full w-7 h-7 sm:w-8 sm:h-8 relative z-20">
              <img alt="Creator avatar" className="w-full h-full rounded-full object-cover" src={avatar2} />
            </div>
            <div className="border-2 border-black rounded-full w-7 h-7 sm:w-8 sm:h-8 relative z-10">
              <img alt="Creator avatar" className="w-full h-full rounded-full object-cover" src={avatar3} />
            </div>
          </div>
          <p className="text-base sm:text-lg text-black tracking-[-0.25px]">
            Built for people with more voice notes than posts
          </p>
        </motion.div>

        {/* Hero Illustration - Below content on mobile, absolute on desktop */}
        <div
          className="relative lg:absolute lg:left-[calc((100%-1152px)/2+512px)] lg:mt-0 lg:top-32 w-[320px] h-[294px] sm:w-[480px] sm:h-[441px] lg:w-[768px] lg:h-[704px] ml-0 sm:ml-6 lg:mx-0 max-w-[calc(100%-24px)] hero-illustration-mobile hero-illustration-spacing z-0 lg:z-10 pointer-events-none lg:pointer-events-auto origin-top-left scale-50 sm:scale-75 lg:scale-100"
        >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative w-full h-full"
        >
        {/* 64x64 Grid Modules */}
        <div className="absolute left-[640px] top-0 w-16 h-16 outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />
        <div className="absolute left-[640px] top-[32px] w-8 h-8 bg-primary outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />
        <div className="absolute left-[576px] top-[128px] w-16 h-16 bg-white outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />
        <div className="absolute left-[512px] top-[192px] w-16 h-16 outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />

        {[192, 256, 320, 384, 448, 512, 576, 640].map((x, i) => (
          <div key={`row4-${i}`} className="absolute w-16 h-16 outline outline-1 outline-black" style={{ left: `${x}px`, top: '256px', outlineOffset: '-0.5px' }} />
        ))}

        {[64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704].map((x, i) => (
          <div key={`row5-${i}`} className="absolute w-16 h-16 outline outline-1 outline-black" style={{ left: `${x}px`, top: '320px', outlineOffset: '-0.5px' }} />
        ))}

        {[64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704].map((x, i) => (
          <div key={`row6-${i}`} className="absolute w-16 h-16 outline outline-1 outline-black" style={{ left: `${x}px`, top: '384px', outlineOffset: '-0.5px' }} />
        ))}

        {[128, 192, 256, 320, 384, 448, 512, 576, 640].map((x, i) => (
          <div key={`row7-${i}`} className="absolute w-16 h-16 outline outline-1 outline-black" style={{ left: `${x}px`, top: '448px', outlineOffset: '-0.5px' }} />
        ))}

        {[192, 256].map((x, i) => (
          <div key={`row8a-${i}`} className="absolute w-16 h-16 outline outline-1 outline-black" style={{ left: `${x}px`, top: '512px', outlineOffset: '-0.5px' }} />
        ))}
        <div className="absolute left-[640px] top-[512px] w-16 h-16 bg-white outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />
        <div className="absolute left-0 top-[576px] w-16 h-16 bg-white outline outline-1 outline-black" style={{ outlineOffset: '-0.5px' }} />

        {[128, 192].map((x, i) => (
          <div key={`row10-${i}`} className="absolute w-16 h-16 outline outline-1 outline-black border-b border-black" style={{ left: `${x}px`, top: '640px', outlineOffset: '-0.5px' }} />
        ))}

        {/* Pink pill with waveform */}
        <div className="absolute w-[576px] h-48 left-[128px] top-[320px] bg-primary rounded-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] border-2 border-black" />

        {/* Animated vertical bars */}
        <div className="absolute left-[320px] top-[352px] h-[128px] flex items-center gap-[30px]">
          {[66, 98, 34, 128, 34, 98, 66, 82, 34, 128, 34].map((baseHeight, i) => (
            <motion.div
              key={i}
              className="w-0.5 bg-black rounded-full"
              animate={{
                height: [baseHeight * 0.5, Math.min(baseHeight, 128), baseHeight * 0.5]
              }}
              transition={{
                duration: 1.2,
                delay: i * 0.08,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Orange record button */}
        <div className="absolute w-32 h-32 left-[160px] top-[352px] bg-highlight rounded-full border-2 border-black flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.0017 25.3333V28M16.0017 25.3333C11.0974 25.3333 8.19749 22.3268 6.6875 20M16.0017 25.3333C20.906 25.3333 23.806 22.3268 25.316 20M21.3351 9.33333V14.6667C21.3351 17.6121 18.9472 20 16.0017 20C13.0562 20 10.6684 17.6121 10.6684 14.6667V9.33333C10.6684 6.38781 13.0562 4 16.0017 4C18.9472 4 21.3351 6.38781 21.3351 9.33333Z" stroke="black" strokeWidth="2" strokeLinecap="square"/>
          </svg>
        </div>
        <div className="absolute w-24 h-24 left-[176px] top-[368px] rounded-full border-2 border-primary" />
        <svg className="absolute left-[192px] top-[384px]" width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="31" stroke="black" strokeWidth="2"/>
        </svg>

        {/* Decorative stars */}
        <div className="absolute left-[544px] top-[160px] w-[64px] h-[64px]">
          <motion.svg
            className="absolute -left-[34px] -top-[34px] w-[132px] h-[132px]"
            viewBox="0 0 132 132"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{
              opacity: { duration: 0.5, delay: 0.5 },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
          >
            <defs>
              <path
                id="circlePath"
                d="M 66, 66 m -48, 0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0"
              />
            </defs>
            <text className="fill-black font-sans text-[10px] uppercase tracking-[0.275em]">
              <textPath href="#circlePath" startOffset="0%">
                AUDIO • TRANSFORM • PUBLISH • AUDIO • TRANSFORM • PUBLISH •
              </textPath>
            </text>
          </motion.svg>

          <motion.svg
            className="absolute inset-0 text-black"
            width="64" height="64"
            viewBox="0 0 64 64"
            fill="none"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <path d="M0 32C17.6731 32 32 46.3269 32 64C32 46.3269 46.3269 32 64 32C46.3269 32 32 17.6731 32 0C32 17.6731 17.6731 32 0 32Z" fill="currentColor"/>
          </motion.svg>
        </div>
        <motion.svg
          className="absolute left-[672px] top-[544px] text-black"
          width="64" height="64"
          viewBox="0 0 64 64"
          fill="none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <path d="M0 32C17.6731 32 32 46.3269 32 64C32 46.3269 46.3269 32 64 32C46.3269 32 32 17.6731 32 0C32 17.6731 17.6731 32 0 32Z" fill="currentColor"/>
        </motion.svg>
        <motion.svg
          className="absolute left-[160px] top-[608px] text-black"
          width="64" height="64"
          viewBox="0 0 64 64"
          fill="none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <path d="M0 32C17.6731 32 32 46.3269 32 64C32 46.3269 46.3269 32 64 32C46.3269 32 32 17.6731 32 0C32 17.6731 17.6731 32 0 32Z" fill="currentColor"/>
        </motion.svg>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
