import { motion, useReducedMotion } from "framer-motion";
import { Camera, FileText, Link2, Mic2, Send, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const floatTransition = (delay: number) => ({
  duration: 4.5,
  delay,
  repeat: Infinity,
  repeatType: "mirror" as const,
  ease: "easeInOut" as const,
});

function BrainMark() {
  return (
    <svg viewBox="0 0 260 220" className="h-full w-full" aria-hidden="true">
      <path
        d="M127 30c-23-20-60-4-57 27-29-3-46 33-25 53-21 18-9 55 19 57 2 27 38 35 58 18 21 20 59 8 58-20 29-8 36-45 14-62 17-23-3-57-31-55-3-30-40-41-59-20Z"
        className="fill-primary stroke-foreground"
        strokeWidth="4"
      />
      <path d="M127 31v154M91 52c22 8 26 24 18 41M73 82c17-3 30 5 36 20M65 123c17-7 34 1 42 13M88 170c-2-18 8-29 24-35M161 50c-20 9-24 25-16 42M181 81c-17-3-30 6-36 21M190 123c-18-7-34 1-43 14M168 170c2-18-8-29-23-35" className="fill-none stroke-foreground" strokeWidth="3" strokeLinecap="round" />
      <path d="M110 101c9 7 25 7 34 0M108 136c10-7 27-7 38 0" className="fill-none stroke-foreground" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const floating = (x: number, y: number, rotate: number) => reduceMotion ? {} : { x: [0, x, 0], y: [0, y, 0], rotate: [0, rotate, 0] };

  return (
    <section className="relative overflow-hidden border-b border-foreground bg-background">
      <div className="mx-auto grid max-w-[1152px] grid-cols-1 items-start gap-6 px-6 pb-12 pt-10 lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-0 lg:pb-16 lg:pt-20">
        <div className="relative z-20 flex flex-col items-start">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-7 inline-flex items-center gap-2 border border-foreground bg-highlight px-3 py-2 font-mono text-xs font-semibold uppercase sm:text-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Capture the chaos before it disappears
          </motion.div>

          <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.9] text-foreground sm:text-7xl sm:leading-[0.86] lg:text-[92px]">
            <motion.span className="block" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>Chaos in.</motion.span>
            <motion.span className="block" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>Content out.</motion.span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-7 max-w-[560px] text-base font-medium leading-7 text-foreground sm:text-lg">
            For creators, social media managers, and business owners whose best ideas live everywhere. Drop the notes, screenshots, links, files, rants, and voice memos here—then turn them into on-brand posts without the blank-page freeze.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
            <Link to="/auth?mode=signup" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border-2 border-foreground bg-highlight px-8 text-base font-bold text-highlight-foreground shadow-[6px_7px_0_0_oklch(var(--foreground))] transition-transform hover:translate-x-0.5 hover:translate-y-0.5">
              Start capturing <Send className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#features" className="inline-flex h-14 items-center justify-center rounded-full border-2 border-foreground bg-background px-8 text-base font-bold text-foreground transition-colors hover:bg-secondary">See how it works</a>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }} className="mt-9 max-w-[450px] border-l-4 border-highlight pl-4 text-sm font-bold leading-6 text-foreground sm:text-base">
            Built for busy brains with more ideas than finished posts
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.15 }} className="relative mx-auto h-[430px] w-full min-w-0 max-w-[620px] overflow-hidden sm:h-[540px] lg:h-[650px]" aria-label="Scattered ideas becoming organized content">
          <div className="absolute left-[14%] top-[15%] h-[68%] w-[68%] rounded-full border border-dashed border-foreground/30" />
          <div className="absolute left-[24%] top-[25%] h-[48%] w-[48%] rounded-full border border-foreground/20" />

          <motion.div animate={floating(-7, -12, -3)} transition={floatTransition(0)} className="absolute left-[4%] top-[8%] w-36 -rotate-6 border-2 border-foreground bg-secondary p-3 shadow-neo-sm sm:w-44">
            <div className="flex items-center gap-2 border-b border-foreground pb-2 text-xs font-bold uppercase"><Camera className="h-4 w-4" /> Screenshot</div>
            <div className="mt-3 aspect-video border border-foreground bg-background p-2"><div className="h-2 w-3/4 bg-primary" /><div className="mt-2 h-2 w-full bg-muted" /><div className="mt-2 h-2 w-2/3 bg-highlight" /></div>
          </motion.div>

          <motion.div animate={floating(8, -10, 4)} transition={floatTransition(0.4)} className="absolute right-[1%] top-[5%] w-40 rotate-6 border-2 border-foreground bg-primary p-4 shadow-neo-sm sm:w-48">
            <div className="flex items-center gap-2 text-xs font-bold uppercase"><FileText className="h-4 w-4" /> 1:13 AM note</div>
            <p className="mt-3 text-xs font-semibold leading-5">What if consistency isn’t a discipline problem—it’s a retrieval problem?</p>
          </motion.div>

          <motion.div animate={floating(-6, 10, 3)} transition={floatTransition(0.8)} className="absolute bottom-[12%] left-[1%] w-44 rotate-3 rounded-full border-2 border-foreground bg-background px-4 py-3 shadow-neo-sm sm:w-52">
            <div className="flex items-center gap-2 text-xs font-bold"><Mic2 className="h-4 w-4" /><span>VOICE THOUGHT · 0:47</span></div>
            <div className="mt-2 flex h-4 items-center gap-1">{[7, 13, 9, 16, 5, 12, 8, 15, 6, 11].map((h, i) => <span key={i} className="w-0.5 bg-foreground" style={{ height: h }} />)}</div>
          </motion.div>

          <motion.div animate={floating(7, 9, -4)} transition={floatTransition(1.2)} className="absolute bottom-[7%] right-[1%] w-48 -rotate-3 border-2 border-foreground bg-highlight p-3 shadow-neo-sm sm:w-56">
            <div className="flex items-center gap-2 text-xs font-bold uppercase"><Link2 className="h-4 w-4" /> Saved for later</div>
            <p className="mt-2 truncate font-mono text-[10px]">the-idea-i-will-need-next-week.com</p>
          </motion.div>

          <div className="absolute left-1/2 top-1/2 z-10 h-52 w-60 -translate-x-1/2 -translate-y-1/2 sm:h-64 sm:w-72">
            <BrainMark />
            <motion.div animate={reduceMotion ? {} : { rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute -inset-5 rounded-full border-2 border-dashed border-foreground" />
          </div>

          <motion.div animate={floating(3, -8, 4)} transition={floatTransition(0.2)} className="absolute left-[8%] top-[48%] grid h-11 w-11 place-items-center border-2 border-foreground bg-highlight shadow-neo-sm"><Sparkles className="h-5 w-5" /></motion.div>
          <motion.div animate={floating(-4, 8, -3)} transition={floatTransition(1)} className="absolute right-[10%] top-[45%] border-2 border-foreground bg-background px-3 py-2 font-mono text-[10px] font-bold uppercase shadow-neo-sm">Hook found</motion.div>

          <svg className="pointer-events-none absolute inset-0 h-full w-full text-foreground" viewBox="0 0 620 650" fill="none" aria-hidden="true">
            <path d="M150 135 C220 140 225 210 270 250M472 126 C405 150 402 215 355 250M155 500 C220 480 230 420 270 392M476 510 C410 482 399 428 354 390" stroke="currentColor" strokeWidth="2" strokeDasharray="7 8" />
            <path d="M499 304 C544 304 552 304 580 304" stroke="currentColor" strokeWidth="2" />
            <path d="m570 294 11 10-11 10" stroke="currentColor" strokeWidth="2" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}