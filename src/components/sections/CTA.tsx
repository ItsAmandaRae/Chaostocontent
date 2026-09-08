import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function CTA() {
  const TILE_SIZE = 64;
  const ORANGE_BLOCK_HEIGHT = 640;
  const verticalTiles = ORANGE_BLOCK_HEIGHT / TILE_SIZE;

  return (
    <section className="pt-16 pb-0 lg:pt-32 lg:pb-0 w-full">
      <div className="w-full">
        {/* Main CTA Container */}
        <div
          className="relative bg-highlight border border-black overflow-hidden"
          style={{ height: `${ORANGE_BLOCK_HEIGHT}px` }}
        >
          <div className="flex items-start relative w-full h-full">
            {/* Left Grid Column - Hidden on mobile */}
            <div className="hidden lg:flex flex-col items-start relative shrink-0 w-16 bg-black">
              {[...Array(verticalTiles)].map((_, i) => {
                const isFirst = i === 0;
                const isLast = i === verticalTiles - 1;
                const isMiddle = !isFirst && !isLast;
                const borderClasses = isMiddle ? 'border-t' : '';

                return (
                  <div
                    key={`left-${i}`}
                    className={`w-16 h-16 outline outline-1 outline-black bg-highlight border-black ${borderClasses}`}
                    style={{ outlineOffset: '-0.5px' }}
                  />
                );
              })}
            </div>

            {/* Central Content */}
            <div className="basis-0 flex flex-col gap-6 sm:gap-8 lg:gap-12 grow items-center justify-center min-h-0 min-w-0 px-6 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-16 relative shrink-0 h-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col gap-6 sm:gap-7 lg:gap-8 items-center relative shrink-0 w-full"
              >
                <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-5xl leading-tight sm:leading-9 lg:leading-[48px] tracking-[-0.36px] lg:tracking-[-0.96px] text-black text-center uppercase">
                  Ready to find your voice?
                </h2>
                <div className="flex items-center relative shrink-0 w-full">
                  <p className="basis-0 font-normal grow leading-6 sm:leading-7 min-h-0 min-w-0 text-base sm:text-lg lg:text-xl text-black text-center">
                    Bring your voice notes. Leave with posts on the calendar and ready to share.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Link to="/auth?mode=signup" className="bg-black text-white border border-black h-11 sm:h-12 lg:h-16 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-2 lg:py-3 rounded-full text-sm sm:text-base lg:text-lg font-medium shadow-[0px_0px_0px_1px_white,6px_8px_0px_0px_black] hover:shadow-[0px_0px_0px_1px_white,4px_6px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[0px_0px_0px_1px_white,1px_1px_0px_0px_black] active:translate-x-[6px] active:translate-y-[6px] transition-all duration-200 ease-out inline-flex items-center justify-center">
                  Start Creating Now
                </Link>
              </motion.div>
            </div>

            {/* Right Grid Column - Hidden on mobile */}
            <div className="hidden lg:flex flex-col items-start relative shrink-0 w-16 bg-black">
              {[...Array(verticalTiles)].map((_, i) => {
                const isFirst = i === 0;
                const isLast = i === verticalTiles - 1;
                const isMiddle = !isFirst && !isLast;
                const borderClasses = isMiddle ? 'border-t' : '';

                return (
                  <div
                    key={`right-${i}`}
                    className={`w-16 h-16 outline outline-1 outline-black bg-highlight border-black ${borderClasses}`}
                    style={{ outlineOffset: '-0.5px' }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
