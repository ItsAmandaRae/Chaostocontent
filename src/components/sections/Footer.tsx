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
                  <text className="fill-[#F9D4F4] font-sans text-[8px] uppercase tracking-[0.275em]">
                    <textPath href="#footerCirclePath" startOffset="0%">
                      AUDIO • TRANSFORM • PUBLISH • AUDIO • TRANSFORM • PUBLISH •
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
                Turning the chaos of spoken word into the clarity of written thought.
              </p>
              <div className="flex gap-2 items-center text-[#F9D4F4]">
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
                © 2026 Loudio Inc. All rights reserved.
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

            {/* Large Logo */}
            <div className="w-full overflow-hidden aspect-[1312/224]">
              <svg width="1312" height="224" viewBox="0 0 1312 224" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain">
                <path fillRule="evenodd" clipRule="evenodd" d="M313.653 0C351.71 0 382.811 10.6545 406.956 31.964C431.201 53.1734 443.323 79.6855 443.323 111.499C443.323 143.214 431.102 169.726 406.658 191.036C382.215 212.345 351.213 223 313.653 223C275.498 223 244.298 212.395 220.054 191.186C195.908 169.976 183.836 143.414 183.836 111.499C183.836 79.5854 195.908 53.0238 220.054 31.8144C244.298 10.605 275.498 8.94857e-05 313.653 0ZM313.653 69.4808C299.147 69.4809 287.224 73.3834 277.884 81.1867C268.543 88.9901 263.873 99.0942 263.873 111.499C263.873 123.905 268.543 134.01 277.884 141.813C287.224 149.517 299.147 153.369 313.653 153.369C328.061 153.369 339.936 149.467 349.276 141.664C358.616 133.86 363.286 123.805 363.286 111.499C363.286 98.9942 358.616 88.8901 349.276 81.1867C339.936 73.3832 328.061 69.4808 313.653 69.4808Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M1182.33 0C1220.39 9.30385e-05 1251.49 10.6546 1275.63 31.964C1299.88 53.1734 1312 79.6855 1312 111.499C1312 143.214 1299.78 169.726 1275.33 191.036C1250.89 212.345 1219.89 223 1182.33 223C1144.18 223 1112.98 212.395 1088.73 191.186C1064.59 169.976 1052.51 143.414 1052.51 111.499C1052.51 79.5854 1064.59 53.0238 1088.73 31.8144C1112.98 10.6049 1144.18 0 1182.33 0ZM1182.33 69.4808C1167.82 69.4808 1155.9 73.3833 1146.56 81.1867C1137.22 88.9901 1132.55 99.0942 1132.55 111.499C1132.55 123.905 1137.22 134.01 1146.56 141.813C1155.9 149.517 1167.82 153.369 1182.33 153.369C1196.74 153.369 1208.61 149.467 1217.95 141.664C1227.29 133.86 1231.96 123.805 1231.96 111.499C1231.96 98.9942 1227.29 88.8901 1217.95 81.1867C1208.61 73.3833 1196.74 69.4809 1182.33 69.4808Z" fill="white"/>
                <path d="M536.544 124.105C536.544 133.909 539.078 141.463 544.145 146.765C549.312 152.067 556.913 154.719 566.949 154.719C576.984 154.719 584.536 152.118 589.604 146.915C594.771 141.613 597.354 134.009 597.354 124.105V4.05121H677.094L677.242 127.406C677.242 157.42 667.554 180.881 648.179 197.788C628.803 214.596 601.677 222.999 566.8 222.999C532.222 222.999 505.145 214.596 485.57 197.788C466.095 180.881 456.358 157.42 456.358 127.406V4.05121H536.544V124.105Z" fill="white"/>
                <path d="M80.1862 150.667H183.176V218.948H0V4.05121H80.1862V150.667Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M811.101 4.05121C848.76 4.05121 879.115 13.9055 902.168 33.6142C925.319 53.2229 936.896 79.1347 936.896 111.349C936.896 143.863 925.319 169.926 902.168 189.534C879.016 209.143 848.66 218.948 811.101 218.948H702.597V4.05121H811.101ZM782.783 155.319H805.736C821.038 155.419 832.912 151.718 841.358 144.214C849.903 136.611 854.175 126.055 854.175 112.549C854.175 99.1437 850.102 88.4889 841.954 80.5855C833.806 72.682 821.684 68.73 805.587 68.73H782.783V155.319Z" fill="white"/>
                <path d="M1034.89 218.948H954.553V4.05121H1034.89V218.948Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
