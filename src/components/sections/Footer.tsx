import { motion } from "framer-motion";

const imgSparklePink = "/images/d1900bb633828b5f083acf134975649dfb4dc629.svg";
const imgEllipse7 = "/images/8b9a354c470d993df59a559e865c54bdb1aa638d.svg";

const footerLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const socialLinks = [
  {
    label: "X",
    href: "https://x.com/Lovable",
    ariaLabel: "Lovable on X",
    path: "M17.5652 3.25H20.5319L14.0505 10.6628L21.6753 20.75H15.7052L11.0291 14.6322L5.67867 20.75H2.71017L9.64264 12.8212L2.32812 3.25H8.44986L12.6766 8.84192L17.5652 3.25ZM16.524 18.9731H18.1679L7.55662 4.93359H5.79256L16.524 18.9731Z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/lovable/",
    ariaLabel: "Lovable on LinkedIn",
    path: "M19.65 3H4.35C3.99196 3 3.64858 3.14223 3.39541 3.39541C3.14223 3.64858 3 3.99196 3 4.35V19.65C3 20.008 3.14223 20.3514 3.39541 20.6046C3.64858 20.8578 3.99196 21 4.35 21H19.65C20.008 21 20.3514 20.8578 20.6046 20.6046C20.8578 20.3514 21 20.008 21 19.65V4.35C21 3.99196 20.8578 3.64858 20.6046 3.39541C20.3514 3.14223 20.008 3 19.65 3ZM8.4 18.3H6V10.2H8.4V18.3ZM7.2 8.85C6.4 8.85 5.75 8.2 5.75 7.4C5.75 6.6 6.4 5.95 7.2 5.95C8 5.95 8.65 6.6 8.65 7.4C8.65 8.2 8 8.85 7.2 8.85ZM18.3 18.3H15.9V13.95C15.9 12.9 15.5 12.3 14.6 12.3C13.85 12.3 13.4 12.8 13.2 13.3C13.13 13.48 13.11 13.72 13.11 13.97V18.3H10.71C10.71 18.3 10.74 10.95 10.71 10.2H13.11V11.35C13.43 10.85 14 10.13 15.3 10.13C16.9 10.13 18.3 11.2 18.3 13.62V18.3Z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/lovable.dev/",
    ariaLabel: "Lovable on Instagram",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07ZM12 6.85a5.15 5.15 0 1 0 0 10.3 5.15 5.15 0 0 0 0-10.3Zm0 8.5a3.35 3.35 0 1 1 0-6.7 3.35 3.35 0 0 1 0 6.7Zm6.55-8.7a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/lovable.dev/",
    ariaLabel: "Lovable on Facebook",
    path: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z",
  },
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-black pt-12 sm:pt-14 lg:pt-24 pb-32 px-6 lg:px-0">
      <div className="container mx-auto max-w-[1152px]">
        <div className="flex flex-col gap-12 sm:gap-14 lg:gap-24">
          {/* Top Content */}
          <div className="flex flex-col md:flex-row justify-between gap-8 sm:gap-10 lg:gap-12">
            {/* Left Side */}
            <div className="flex flex-col gap-5 sm:gap-6 max-w-full md:max-w-[320px] relative pt-16 sm:pt-20 lg:pt-24">
              <div className="absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24">
                <motion.svg
                  className="absolute -left-[32px] -top-[32px] w-[96px] h-[96px]"
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
                      id="footerCirclePath"
                      d="M 66, 66 m -32, 0 a 32,32 0 1,1 64,0 a 32,32 0 1,1 -64,0"
                    />
                  </defs>
                  <text className="fill-primary font-sans text-[8px] uppercase tracking-[0.275em]">
                    <textPath href="#footerCirclePath" startOffset="0%">
                      DUMP • SHAPE • PUBLISH • DUMP • SHAPE • PUBLISH •
                    </textPath>
                  </text>
                </motion.svg>

                <motion.div
                  className="absolute top-[16px] left-[16px] -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 z-20 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <img alt="" className="w-full h-full" src={imgSparklePink} />
                </motion.div>
              </div>

              <p className="text-sm sm:text-base leading-6 sm:leading-7 text-white opacity-75">
                Turning scattered thoughts into authentic, on-brand content.
              </p>
              <div className="flex gap-2 items-center text-primary">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <svg
                      role="img"
                      aria-label={social.label}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>

            </div>

            {/* Right Side - Links */}
            <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-full md:max-w-[200px]">
              <p className="text-sm sm:text-base font-medium text-white">Product</p>
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm sm:text-base text-white opacity-75 hover:opacity-100 transition-opacity"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="bg-[#242424] h-px w-full" />

          {/* Bottom Content */}
          <div className="flex flex-col gap-4 sm:gap-5 lg:gap-16">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
              <p className="text-sm sm:text-base text-white opacity-75 text-center md:text-left">
                © 2026 Chaos To Content. All rights reserved.
              </p>
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2">
                  <img alt="" className="w-full h-full" src={imgEllipse7} />
                </div>
                <p className="text-sm sm:text-base text-white opacity-75">
                  All systems operational
                </p>
              </div>
            </div>

            {/* Large wordmark */}
            <div className="w-full overflow-hidden border-t border-white/20 pt-8">
              <p className="font-display font-black uppercase text-white text-[clamp(3rem,10vw,8rem)] leading-[0.8] text-center">
                Chaos To Content
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
