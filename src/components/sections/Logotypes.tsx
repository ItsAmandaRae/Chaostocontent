import { motion } from "framer-motion";
import { FileAudio, FileText, Image, Link, MessageSquareText, Upload } from "lucide-react";

const inputs = [
  { label: "Voice note", icon: FileAudio },
  { label: "File", icon: Upload },
  { label: "Rant", icon: MessageSquareText },
  { label: "Text", icon: FileText },
  { label: "Screenshot", icon: Image },
  { label: "Link", icon: Link },
];

export default function Logotypes() {
  return (
    <section className="bg-white py-16 lg:pt-32 lg:pb-16 px-6 lg:px-0">
      <div className="container mx-auto max-w-[1152px]">
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 overflow-hidden bg-black">
            {inputs.map((input, index) => {
              const rowMobile = Math.floor(index / 2);
              const colMobile = index % 2;
              const rowSm = Math.floor(index / 3);
              const colSm = index % 3;
              const rowLg = Math.floor(index / 6);
              const colLg = index % 6;

              const marginClasses = [];

              if (rowMobile > 0) marginClasses.push('-mt-[1px]');
              if (colMobile > 0) marginClasses.push('-ml-[1px]');

              if (rowSm > 0) {
                marginClasses.push('sm:-mt-[1px]');
              } else if (rowMobile > 0) {
                marginClasses.push('sm:mt-0');
              }

              if (colSm > 0) {
                marginClasses.push('sm:-ml-[1px]');
              } else if (colMobile > 0) {
                marginClasses.push('sm:ml-0');
              }

              if (rowLg > 0) {
                marginClasses.push('lg:-mt-[1px]');
              } else {
                if (rowMobile > 0 || rowSm > 0) marginClasses.push('lg:mt-0');
              }

              if (colLg > 0) {
                marginClasses.push('lg:-ml-[1px]');
              } else {
                if (colMobile > 0 || colSm > 0) marginClasses.push('lg:ml-0');
              }

              return (
              <motion.div
                key={input.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`border border-black bg-white h-16 flex items-center justify-center gap-2 px-3 ${marginClasses.join(' ')}`}
              >
                <input.icon className="w-5 h-5 shrink-0" />
                <span className="font-display font-bold text-sm uppercase">{input.label}</span>
              </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
