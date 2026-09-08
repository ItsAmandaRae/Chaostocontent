import { motion } from "framer-motion";

export default function Achievements() {
  const stats = [
    { value: "50MB", label: "Per audio upload" },
    { value: "280", label: "Live character counter for X" },
    { value: "1-click", label: "Share to X, pre-filled" },
    { value: "0", label: "Posts sent without your approval" },
  ];

  return (
    <section className="py-16 lg:py-32 px-6 lg:px-0">
      <div className="container mx-auto max-w-[1152px]">
        <div className="relative bg-black overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {stats.map((stat, index) => {
              const isTopRow = index < 2;
              const isBottomRow = index >= 2;
              const isRightCol = index % 2 === 1;
              const isLeftCol = index % 2 === 0;

              const marginClasses = [];
              if (isBottomRow) marginClasses.push('-mt-[1px]');
              if (isRightCol) marginClasses.push('-ml-[1px]');
              if (index > 0) marginClasses.push('md:-ml-[1px]');
              if (isBottomRow) marginClasses.push('md:mt-0');

              const roundedClasses = [];
              if (isTopRow && isRightCol) roundedClasses.push('rounded-bl-[32px]');
              if (isTopRow && isLeftCol) roundedClasses.push('rounded-br-[32px]');
              if (isBottomRow && isLeftCol) roundedClasses.push('rounded-tr-[32px]');
              if (isBottomRow && isRightCol) roundedClasses.push('rounded-tl-[32px]');

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white border border-black ${marginClasses.join(' ')} ${roundedClasses.join(' ')} flex flex-col gap-3 sm:gap-4 items-start justify-start px-6 sm:px-8 py-6 sm:py-8 lg:py-12`}
                >
                  <p className="font-display font-black text-3xl sm:text-4xl lg:text-5xl leading-tight sm:leading-[40px] lg:leading-[48px] tracking-[-0.96px] text-black">
                    {stat.value}
                  </p>
                  <p className="text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 lg:leading-8 text-black max-w-[120px] sm:max-w-[140px] lg:max-w-none">
                    {stat.label.split(' ').map((word, i, arr) => {
                      const midPoint = Math.ceil(arr.length / 2);
                      if (i === midPoint) return <br key={i} />;
                      return <span key={i}>{word}{i < arr.length - 1 ? ' ' : ''}</span>;
                    })}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
