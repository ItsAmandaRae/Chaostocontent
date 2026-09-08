import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const imgCentralIcon4 = "/images/16ebe483b1341621fe3a90f42527498a7ea05cb9.svg";
const imgCentralIcon5 = "/images/02a9ad77eb6e443b48fb881e01340ad8105a9021.svg";
const imgCentralIcon6 = "/images/4903e27ab62ddb3efd18c9bdb8874c99a2e55934.svg";
const imgDecoration = "/images/5606e316f4790543d398c5aecedbf2049b89e418.svg";

export default function UseCases() {
  const leftColRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  const [stickyMode, setStickyMode] = useState<"static" | "fixed" | "bottom">("static");
  const [fixedLeft, setFixedLeft] = useState(0);
  const [fixedWidth, setFixedWidth] = useState(0);
  const [leftContentHeight, setLeftContentHeight] = useState(0);
  const [leftColMinHeight, setLeftColMinHeight] = useState<number | null>(null);

  const HEADER_HEIGHT = 80;
  const DECORATIVE_IMAGE_HEIGHT = 256;

  const bottomTop = useMemo(() => {
    if (!leftColMinHeight) return 0;
    return Math.max(0, leftColMinHeight - leftContentHeight - DECORATIVE_IMAGE_HEIGHT - 32);
  }, [leftColMinHeight, leftContentHeight]);

  useEffect(() => {
    let raf = 0;

    const measureAndUpdate = () => {
      raf = 0;

      if (window.innerWidth < 1024) {
        setStickyMode("static");
        setLeftColMinHeight(null);
        return;
      }

      if (!leftColRef.current || !leftContentRef.current || !rightColRef.current) return;

      const scrollY = window.scrollY || window.pageYOffset || 0;

      const leftColRect = leftColRef.current.getBoundingClientRect();
      const leftContentRect = leftContentRef.current.getBoundingClientRect();
      const rightColRect = rightColRef.current.getBoundingClientRect();

      const leftColTop = scrollY + leftColRect.top;
      const rightColTop = scrollY + rightColRect.top;
      const rightColHeight = rightColRef.current.offsetHeight;

      const contentHeight = leftContentRef.current.offsetHeight;
      setLeftContentHeight(contentHeight);
      setLeftColMinHeight(rightColHeight);

      const startY = leftColTop - HEADER_HEIGHT;
      const endY = rightColTop + rightColHeight - contentHeight - HEADER_HEIGHT - DECORATIVE_IMAGE_HEIGHT - 32;

      if (scrollY < startY) {
        setStickyMode("static");
        return;
      }

      if (scrollY >= startY && scrollY < endY) {
        setStickyMode("fixed");
        setFixedLeft(leftContentRect.left);
        setFixedWidth(leftColRect.width);
        return;
      }

      setStickyMode("bottom");
    };

    const onScrollOrResize = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measureAndUpdate);
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    measureAndUpdate();

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <section id="how-it-works" className="py-16 lg:py-32 px-6 lg:px-0">
      <div className="container mx-auto max-w-[1152px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12">
          {/* Left Side */}
          <div
            ref={leftColRef}
            className="lg:col-span-5 relative"
            style={leftColMinHeight ? { minHeight: `${leftColMinHeight}px` } : undefined}
          >
            <div
              ref={leftContentRef}
              className="flex flex-col gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12 lg:mb-16"
              style={
                stickyMode === "fixed"
                  ? {
                      position: "fixed",
                      top: HEADER_HEIGHT + 32,
                      left: fixedLeft,
                      width: fixedWidth,
                      zIndex: 10,
                    }
                  : stickyMode === "bottom"
                    ? {
                        position: "absolute",
                        top: bottomTop,
                        left: 0,
                        right: 0,
                      }
                    : undefined
              }
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display font-black text-3xl sm:text-4xl lg:text-5xl leading-[0.9] tracking-[-0.96px] text-black uppercase mb-0"
              >
                Capture ideas
                <br />
                in the wild
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-base sm:text-lg lg:text-xl xl:text-2xl leading-6 sm:leading-7 lg:leading-8 text-black"
              >
                Great ideas rarely happen at a desk. Record them wherever they hit, then turn them into posts when you're back.
              </motion.p>
            </div>
            <div className="absolute bottom-0 left-0 w-64 h-64 hidden lg:block">
              <img alt="" className="w-full h-full" src={imgDecoration} />
            </div>
          </div>

          {/* Right Side - Cards */}
          <div ref={rightColRef} className="lg:col-span-7 relative bg-black overflow-hidden">
            <div className="flex flex-col gap-0">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white outline outline-1 outline-black border-t border-l border-r border-black p-6 sm:p-8 lg:p-16 flex flex-col gap-6 sm:gap-7 lg:gap-8 rounded-bl-[32px] rounded-br-[32px] lg:rounded-br-[32px]"
                style={{ outlineOffset: '-0.5px' }}
              >
                <img alt="" className="w-10 h-10 sm:w-12 sm:h-12" src={imgCentralIcon4} />
                <div className="flex flex-col gap-3 sm:gap-4">
                  <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight tracking-[-0.36px] text-black">
                    The Walking Thinker
                  </h3>
                  <p className="text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 text-black">
                    Ideas happen when you're moving, not sitting. Record the voice note, upload it, and write it up later.
                  </p>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-[#ffe730] outline outline-1 outline-black border-l border-r border-black p-6 sm:p-8 lg:p-16 flex flex-col gap-6 sm:gap-7 lg:gap-8 rounded-[32px] lg:rounded-[32px]"
                style={{ outlineOffset: '-0.5px' }}
              >
                <img alt="" className="w-10 h-10 sm:w-12 sm:h-12" src={imgCentralIcon5} />
                <div className="flex flex-col gap-3 sm:gap-4">
                  <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight tracking-[-0.36px] text-black">
                    The Commute Rant
                  </h3>
                  <p className="text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 text-black">
                    Stuck in traffic? Talk it out, then shape it into a post on the drive home.
                  </p>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white outline outline-1 outline-black border-b border-l border-r border-black p-6 sm:p-8 lg:p-16 flex flex-col gap-6 sm:gap-7 lg:gap-8 rounded-tl-[32px] rounded-tr-[32px] lg:rounded-tl-[32px] lg:rounded-tr-[32px]"
                style={{ outlineOffset: '-0.5px' }}
              >
                <img alt="" className="w-10 h-10 sm:w-12 sm:h-12" src={imgCentralIcon6} />
                <div className="flex flex-col gap-3 sm:gap-4">
                  <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight tracking-[-0.36px] text-black">
                    Post-Meeting Clarity
                  </h3>
                  <p className="text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 text-black">
                    Just finished a call and had a realization? Record it before the next meeting wipes your memory.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
