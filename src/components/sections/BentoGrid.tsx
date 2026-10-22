import { motion } from "framer-motion";

const imgCentralIcon = "/images/86d144a90bf3bad61f5567cd6e249b24918ce3f4.svg";
const imgCentralIcon1 = "/images/c9b21e900912556a7c65d55650aee9fbf699fb0a.svg";
const imgCentralIcon2 = "/images/760ade2eab60ee1020f906dde8d7890b19856157.svg";
const imgCentralIcon3 = "/images/af37e1fa785053213344e411bbb07eed5678b1fa.svg";

export default function BentoGrid() {
  return (
    <section id="features" className="bg-white py-32 px-6 lg:px-0 overflow-hidden">
      <div className="container mx-auto max-w-[1152px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display font-black text-[1.6rem] min-[400px]:text-3xl sm:text-4xl lg:text-5xl leading-[0.9] tracking-[-0.96px] text-foreground uppercase mb-12 text-center break-words"
        >
          Total
          <br />
          transformation
        </motion.h2>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden bg-black">
            {/* Card 1: Studio Quality */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7 border border-black p-6 sm:p-8 lg:p-12 flex flex-col gap-6 sm:gap-8 lg:gap-10 bg-white rounded-bl-[32px] rounded-br-[32px] md:rounded-bl-none md:rounded-br-[32px]"
            >
              <div className="bg-highlight border border-black rounded-full p-2.5 sm:p-3 lg:p-3.5 w-fit">
                <img alt="" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" src={imgCentralIcon} />
              </div>
              <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
                <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight tracking-[-0.36px] text-black">
                   One Brain Dump Inbox
                </h3>
                <p className="text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 text-black">
                   Toss in voice notes, files, screenshots, links, or messy text. Everything stays private, searchable, and ready when your brain is not.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Hook Generation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-5 border border-black p-6 sm:p-8 lg:p-12 flex flex-col gap-6 sm:gap-8 lg:gap-10 bg-white rounded-[32px] md:rounded-none md:rounded-bl-[32px] -mt-[1px] md:mt-0 md:-ml-[1px]"
            >
              <div className="bg-secondary border border-black rounded-full p-2.5 sm:p-3 lg:p-3.5 w-fit">
                <img alt="" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" src={imgCentralIcon1} />
              </div>
              <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
                <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight tracking-[-0.36px] text-black">
                   On-Brand Drafts
                </h3>
                <p className="text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 text-black">
                   Brand DNA helps turn each raw thought into editable drafts that sound like you on every platform.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Auto-Threader */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-5 border border-black p-6 sm:p-8 lg:p-12 flex flex-col gap-6 sm:gap-8 lg:gap-10 bg-white rounded-[32px] md:rounded-none md:rounded-tr-[32px] -mt-[1px] md:-mt-[1px]"
            >
              <div className="bg-primary border border-black rounded-full p-2.5 sm:p-3 lg:p-3.5 w-fit">
                <img alt="" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" src={imgCentralIcon2} />
              </div>
              <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
                <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight tracking-[-0.36px] text-black">
                  Content Calendar
                </h3>
                <p className="text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 text-black">
                  Drop drafts onto a date and time, then see the whole month at a glance.
                </p>
              </div>
            </motion.div>

            {/* Card 4: Style Matching */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-7 border border-black p-6 sm:p-8 lg:p-12 flex flex-col gap-6 sm:gap-8 lg:gap-10 bg-white rounded-tl-[32px] rounded-tr-[32px] md:rounded-tr-none md:rounded-tl-[32px] -mt-[1px] md:-mt-[1px] md:-ml-[1px]"
            >
              <div className="bg-accent border border-black rounded-full p-2.5 sm:p-3 lg:p-3.5 w-fit">
                <img alt="" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" src={imgCentralIcon3} />
              </div>
              <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
                <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight tracking-[-0.36px] text-black">
                   Share Everywhere, Your Way
                </h3>
                <p className="text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 text-black">
                   Copy or open drafts for X, Instagram, TikTok, LinkedIn, Threads, Facebook, YouTube Shorts, and newsletters. You always approve the final post.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
