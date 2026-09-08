import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

const HeroSection = () => {
  const [isTextState, setIsTextState] = useState(false);
  
  // Toggle between states every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTextState(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Text lines data (matching the design)
  const textLines = [
    { width: 66 }, { width: 98 }, { width: 26 }, { width: 42 },
    { width: 114 }, { width: 18 }, { width: 34 }, { width: 66 },
    { width: 50 }, { width: 74 }, { width: 98 }
  ];

  return <section className="pt-[160px] pb-16 md:pb-20 border-b-4 border-foreground">
      <div className="container mx-auto flex justify-center">
        <div className="w-full max-w-[1152px] grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} className="inline-flex justify-start items-center mb-6">
              <div className="w-[32px] h-[32px] bg-foreground border border-foreground flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 16C8.83656 16 16 23.1634 16 32C16 23.1634 23.1634 16 32 16C23.1634 16 16 8.83656 16 0C16 8.83656 8.83656 16 0 16Z" fill="white" />
                </svg>
              </div>
              <div className="px-2.5 h-[32px] bg-background border border-foreground border-l-0 flex justify-center items-center">
                <span className="font-body text-base font-medium leading-4">AI-POWERED CONTENT ENGINE</span>
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.1
          }} className="flex flex-col justify-start items-start mb-6 max-w-[1152px]">
              <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.9] lg:leading-[112px]">
                <span className="block whitespace-nowrap">Clarity in</span>
                <span className="block whitespace-nowrap">Every Word</span>
              </h1>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="w-full max-w-[480px] text-foreground text-xl font-normal font-body leading-7 mb-8">
              Record your raw thoughts. We clean the audio, transcribe accurately, and craft perfect post for X/Twitter. No typing required.
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.3
          }} className="mb-8">
              <button className="cta-pill">
                <span className="text-background text-lg font-medium font-body">Start 14-day Trial</span>
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }} className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['bg-green-400', 'bg-yellow-400', 'bg-blue-400', 'bg-purple-400'].map((color, i) => <div key={i} className={`w-8 h-8 rounded-full border-2 border-foreground ${color}`} />)}
              </div>
              <p className="font-body text-sm text-primary-foreground">
                Trusted by <span className="font-semibold text-foreground">2K</span> creators
              </p>
            </motion.div>
          </div>

          {/* Right Content - Hero Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, delay: 0.2 }} 
            className="relative w-[768px] h-[704px] mt-[32px]"
          >
            {/* 64x64 Grid Modules - Using outline with center stroke (outline-offset: -0.5px) */}
            {/* Row 0 (y=0): Single square at column 10 */}
            <div className="absolute left-[640px] top-0 w-16 h-16 outline outline-1 outline-foreground" style={{ outlineOffset: '-0.5px' }} />
            
            {/* Small pink square at column 10, offset */}
            <div className="absolute left-[640px] top-[32px] w-8 h-8 bg-[#F9D4F4] outline outline-1 outline-foreground" style={{ outlineOffset: '-0.5px' }} />
            
            {/* Row 2 (y=128): White filled square at column 9 */}
            <div className="absolute left-[576px] top-[128px] w-16 h-16 bg-background outline outline-1 outline-foreground" style={{ outlineOffset: '-0.5px' }} />
            
            {/* Row 3 (y=192): Square at column 8 */}
            <div className="absolute left-[512px] top-[192px] w-16 h-16 outline outline-1 outline-foreground" style={{ outlineOffset: '-0.5px' }} />
            
            {/* Row 4 (y=256): Grid row spanning columns 3-11 (8 cells) */}
            {[192, 256, 320, 384, 448, 512, 576, 640].map((x, i) => (
              <div key={`row4-${i}`} className="absolute w-16 h-16 outline outline-1 outline-foreground" style={{ left: `${x}px`, top: '256px', outlineOffset: '-0.5px' }} />
            ))}
            
            {/* Row 5 (y=320): Grid row spanning columns 1-11 (11 cells) */}
            {[64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704].map((x, i) => (
              <div key={`row5-${i}`} className="absolute w-16 h-16 outline outline-1 outline-foreground" style={{ left: `${x}px`, top: '320px', outlineOffset: '-0.5px' }} />
            ))}
            
            {/* Row 6 (y=384): Grid row spanning columns 1-11 (11 cells) */}
            {[64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704].map((x, i) => (
              <div key={`row6-${i}`} className="absolute w-16 h-16 outline outline-1 outline-foreground" style={{ left: `${x}px`, top: '384px', outlineOffset: '-0.5px' }} />
            ))}
            
            {/* Row 7 (y=448): Grid row spanning columns 2-10 (9 cells) */}
            {[128, 192, 256, 320, 384, 448, 512, 576, 640].map((x, i) => (
              <div key={`row7-${i}`} className="absolute w-16 h-16 outline outline-1 outline-foreground" style={{ left: `${x}px`, top: '448px', outlineOffset: '-0.5px' }} />
            ))}
            
            {/* Row 8 (y=512): Partial row - columns 3-4 and column 10 */}
            {[192, 256].map((x, i) => (
              <div key={`row8a-${i}`} className="absolute w-16 h-16 outline outline-1 outline-foreground" style={{ left: `${x}px`, top: '512px', outlineOffset: '-0.5px' }} />
            ))}
            <div className="absolute left-[640px] top-[512px] w-16 h-16 bg-background outline outline-1 outline-foreground" style={{ outlineOffset: '-0.5px' }} />
            
            {/* Row 9 (y=576): Single white filled square at column 0 */}
            <div className="absolute left-0 top-[576px] w-16 h-16 bg-background outline outline-1 outline-foreground" style={{ outlineOffset: '-0.5px' }} />
            
            {/* Row 10 (y=640): Two squares at columns 2-3 */}
            {[128, 192].map((x, i) => (
              <div key={`row10-${i}`} className="absolute w-16 h-16 outline outline-1 outline-foreground" style={{ left: `${x}px`, top: '640px', outlineOffset: '-0.5px' }} />
            ))}

            {/* Animated Pill - transitions between audio and text states */}
            <div className="absolute w-[576px] h-48 left-[128px] top-[320px]">
              {/* Pill background - animated color */}
              <motion.div 
                className="absolute inset-0 rounded-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] border-2 border-foreground"
                animate={{
                  backgroundColor: isTextState ? '#FDE047' : '#F9D4F4' // yellow-300 : pink
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
              
              {/* Audio waveform - visible in audio state */}
              <motion.div 
                className="absolute left-[192px] top-[32px] h-[128px] flex items-center gap-8"
                animate={{
                  opacity: isTextState ? 0 : 1,
                  x: isTextState ? -100 : 0
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                {[66, 98, 34, 128, 34, 98, 66, 82, 34, 128, 34].map((baseHeight, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-foreground rounded-full"
                    animate={{ 
                      height: isTextState ? 0 : [baseHeight * 0.5, Math.min(baseHeight, 128), baseHeight * 0.5] 
                    }}
                    transition={{
                      duration: 1.2,
                      delay: i * 0.08,
                      repeat: isTextState ? 0 : Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </motion.div>

              {/* Text lines - visible in text state */}
              <motion.div 
                className="absolute left-[64px] top-[64px] w-80 flex flex-wrap gap-x-8 gap-y-3"
                animate={{
                  opacity: isTextState ? 1 : 0,
                  x: isTextState ? 0 : 100
                }}
                transition={{ duration: 0.6, ease: 'easeInOut', delay: isTextState ? 0.3 : 0 }}
              >
                {textLines.map((line, i) => (
                  <motion.svg 
                    key={i} 
                    width={line.width} 
                    height="2" 
                    viewBox={`0 0 ${line.width} 2`} 
                    fill="none"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isTextState ? 1 : 0 }}
                    transition={{ duration: 0.4, delay: isTextState ? 0.4 + i * 0.05 : 0 }}
                    style={{ originX: 0 }}
                  >
                    <path d={`M1 1H${line.width - 1}`} stroke="black" strokeWidth="2" strokeLinecap="round"/>
                  </motion.svg>
                ))}
              </motion.div>

              {/* Animated button/dot - moves left to right */}
              <motion.div 
                className="absolute top-[32px] w-32 h-32"
                animate={{
                  left: isTextState ? 416 : 32  // Right position : Left position
                }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Outer circle - color changes */}
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-foreground"
                  animate={{
                    backgroundColor: isTextState ? '#5EEAD4' : '#EA580C' // teal-300 : orange-600
                  }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
                
                {/* Middle ring - color changes */}
                <motion.div 
                  className="absolute left-2 top-2 w-28 h-28 rounded-full border-2"
                  animate={{
                    borderColor: isTextState ? '#FFFFFF' : '#F9D4F4'
                  }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
                
                {/* Inner ring */}
                <motion.div 
                  className="absolute left-4 top-4 w-24 h-24 rounded-full border-2 border-foreground"
                  animate={{
                    opacity: isTextState ? 1 : 1
                  }}
                />
                
                {/* Icon container */}
                <div className="absolute left-8 top-8 w-16 h-16 flex items-center justify-center">
                  {/* Recording circles - visible in audio state */}
                  <motion.svg 
                    className="absolute inset-0"
                    width="64" 
                    height="64" 
                    viewBox="0 0 64 64" 
                    fill="none"
                    animate={{
                      opacity: isTextState ? 0 : 1,
                      scale: isTextState ? 0.5 : 1
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    <circle cx="32" cy="32" r="31" stroke="currentColor" strokeWidth="2"/>
                  </motion.svg>
                  
                  {/* Paper plane icon - visible in text state */}
                  <motion.div
                    animate={{
                      opacity: isTextState ? 1 : 0,
                      scale: isTextState ? 1 : 0.5,
                      rotate: isTextState ? 0 : -45
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut', delay: isTextState ? 0.2 : 0 }}
                  >
                    <Send size={48} strokeWidth={2} className="text-foreground" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Decorative stars */}
            {/* First star with rotating circular text */}
            <div className="absolute left-[544px] top-[160px] w-[64px] h-[64px]">
              {/* Rotating circular text */}
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
                <text className="fill-foreground font-body text-[12px] uppercase tracking-[0.275em]">
                  <textPath href="#circlePath">
                    AUDIO • TRANSFORM • PUBLISH • AUDIO • TRANSFORM • PUBLISH •
                  </textPath>
                </text>
              </motion.svg>
              
              {/* Star icon */}
              <motion.svg 
                className="absolute inset-0"
                width="64" height="64"
                viewBox="0 0 64 64" 
                fill="none"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <path d="M0 32C17.6731 32 32 46.3269 32 64C32 46.3269 46.3269 32 64 32C46.3269 32 32 17.6731 32 0C32 17.6731 17.6731 32 0 32Z" fill="currentColor"/>
              </motion.svg>
            </div>
            <motion.svg 
              className="absolute left-[672px] top-[544px]" 
              width="64" height="64"
              viewBox="0 0 64 64" 
              fill="none"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <path d="M0 32C17.6731 32 32 46.3269 32 64C32 46.3269 46.3269 32 64 32C46.3269 32 32 17.6731 32 0C32 17.6731 17.6731 32 0 32Z" fill="currentColor"/>
            </motion.svg>
            <motion.svg 
              className="absolute left-[160px] top-[608px]" 
              width="64" height="64"
              viewBox="0 0 64 64" 
              fill="none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <path d="M0 32C17.6731 32 32 46.3269 32 64C32 46.3269 46.3269 32 64 32C46.3269 32 32 17.6731 32 0C32 17.6731 17.6731 32 0 32Z" fill="currentColor"/>
            </motion.svg>
          </motion.div>
        </div>
      </div>
    </section>;
};
export default HeroSection;