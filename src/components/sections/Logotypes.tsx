import { motion } from "framer-motion";
import CastosLogo from "@/components/logos/CastosLogo";

// Bump this to force-refresh cached logo assets.
const LOGO_ASSET_VERSION = "2";

const logoRiverside = "/images/logos/riverside.svg";
const logoDescript = "/images/logos/descript.svg";
const logoAlitu = "/images/logos/alito.svg";
const logoCastos = `/images/logos/castos.svg?v=${LOGO_ASSET_VERSION}`;
const logoSpotify = "/images/logos/spotify.svg";
const logoZencastr = "/images/logos/zencastr.svg";

interface LogoConfig {
  name: string;
  src?: string;
  top: string;
  height: string;
  width?: string;
  inline?: boolean;
}

const logos: LogoConfig[] = [
  {
    name: "Riverside",
    src: logoRiverside,
    top: "19px",
    height: "25px",
    width: "143.269px",
  },
  {
    name: "Descript",
    src: logoDescript,
    top: "15.5px",
    height: "31px",
    width: "130.262px",
  },
  {
    name: "Alitu",
    src: logoAlitu,
    top: "18.5016px",
    height: "27px",
    width: "59.42px",
  },
  {
    name: "Castos",
    // Inline to avoid any browser/CDN caching issues with static SVG files.
    inline: true,
    src: logoCastos,
    top: "12.5px",
    height: "38px",
    width: "113.05px",
  },
  {
    name: "Spotify",
    src: logoSpotify,
    top: "15.5px",
    height: "27px",
    width: "112px",
  },
  {
    name: "Zencastr",
    src: logoZencastr,
    top: "21.5px",
    height: "17px",
    width: "114.364px",
  },
];

export default function Logotypes() {
  return (
    <section className="bg-white py-16 lg:pt-32 lg:pb-16 px-6 lg:px-0">
      <div className="container mx-auto max-w-[1152px]">
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 overflow-hidden bg-black">
            {logos.map((logo, index) => {
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
                key={logo.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`border border-black bg-white h-16 overflow-hidden relative ${marginClasses.join(' ')}`}
              >
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    top: logo.top,
                    height: logo.height,
                    width: logo.width || 'auto'
                  }}
                >
                  {logo.inline ? (
                    <CastosLogo className="block h-full w-auto" />
                  ) : (
                    <img
                      alt={logo.name}
                      className="block h-full w-auto object-contain"
                      src={logo.src}
                    />
                  )}
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
