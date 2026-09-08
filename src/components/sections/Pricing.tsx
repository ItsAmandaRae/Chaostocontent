import { motion } from "framer-motion";

const imgSparkBlack = "/images/8455f203a4458ac2effb4aa09dfe1164f665446b.svg";

const icons = {
  tape2: "/images/icons/tape2.svg",
  noiseReduction: "/images/icons/noise-reduction.svg",
  squareLinesBottom: "/images/icons/square-lines-bottom.svg",
  xIcon: "/images/icons/x-icon.svg",
  infinity: "/images/icons/infinity.svg",
  voiceSparkle: "/images/icons/voice-sparkle.svg",
  speachToText: "/images/icons/speach-to-text.svg",
  thread: "/images/icons/thread.svg",
  imagine: "/images/icons/imagine.svg",
};

export default function Pricing() {
  const TILE_SIZE = 64;
  const TILES_PER_COLUMN = 7;

  const plans = [
    {
      name: "Free while in beta",
      price: "$0",
      features: [
        { text: "Unlimited audio uploads, 50MB each", icon: icons.tape2 },
        { text: "Private recording library with playback", icon: icons.noiseReduction },
        { text: "Post composer with character counts", icon: icons.squareLinesBottom },
        { text: "Content calendar + share to X", icon: icons.xIcon },
      ],
      buttonText: "Start Free",
      buttonStyle: "bg-white border border-black text-black",
      cardStyle: "bg-white",
    },
    {
      name: "Pro (planned)",
      price: "TBD",
      features: [
        { text: "In-browser recording", icon: icons.infinity },
        { text: "Automatic transcription", icon: icons.voiceSparkle },
        { text: "AI-assisted post drafts", icon: icons.speachToText },
        { text: "Thread splitting", icon: icons.thread },
        { text: "Tone and style presets", icon: icons.imagine },
      ],
      buttonText: "Not available yet",
      buttonStyle: "bg-black text-white",
      cardStyle: "bg-[#f9d4f4]",
    },
  ];

  return (
    <section id="pricing" className="py-16 lg:py-32 px-6 lg:px-0">
      <div className="container mx-auto max-w-[1152px]">
        <div className="flex flex-col gap-12 sm:gap-14 lg:gap-16">
          {/* Header */}
          <div className="flex flex-col gap-6 sm:gap-7 lg:gap-8 items-center">
            <div className="bg-white border border-black px-2 sm:px-2.5 pt-1 pb-1 h-7 sm:h-8">
              <p className="text-sm sm:text-base text-black text-center uppercase font-mono">
                Pricing
              </p>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl leading-[0.9] tracking-[-0.96px] text-black uppercase text-center">
              Simple Plans
            </h2>
          </div>

          {/* Plans with Grid Tiles */}
          <div className="relative w-full">
            {/* Plans Content Container */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 px-0 sm:px-4 lg:px-16">
              {/* Left Column - 7 tiles */}
              <div className="absolute left-0 top-0 flex flex-col hidden lg:flex">
                {[...Array(TILES_PER_COLUMN)].map((_, i) => (
                  <div
                    key={`left-${i}`}
                    className="w-16 h-16 outline outline-1 outline-black bg-white"
                    style={{ outlineOffset: '-0.5px' }}
                  />
                ))}
              </div>

              {/* Plans Cards */}
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`${plan.cardStyle} outline outline-1 outline-black px-6 sm:px-8 lg:px-16 pt-6 sm:pt-8 lg:pt-16 pb-8 lg:pb-16 flex flex-col gap-8 sm:gap-10 lg:gap-12 relative`}
                  style={{ outlineOffset: '-0.5px' }}
                >
                  {index === 1 && (
                    <>
                      <div className="absolute left-1/2 -translate-x-1/2 -top-6 sm:-top-7 lg:hidden w-12 h-12 sm:w-14 sm:h-14 z-10">
                        <img alt="" className="w-full h-full" src={imgSparkBlack} />
                      </div>
                      <div className="absolute -left-8 top-24 w-16 h-16 z-10 hidden lg:block">
                        <img alt="" className="w-full h-full" src={imgSparkBlack} />
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8">
                    <div className="flex flex-col gap-2">
                      <p className="text-base sm:text-lg lg:text-xl font-bold text-black">{plan.name}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="font-display font-black text-2xl sm:text-3xl lg:text-5xl leading-tight sm:leading-[36px] lg:leading-[48px] tracking-[-0.36px] sm:tracking-[-0.40px] lg:tracking-[-0.48px] text-black">
                          {plan.price}
                        </p>
                        {plan.price !== "TBD" && (
                          <span className="text-base sm:text-lg lg:text-xl font-medium text-black">/mo</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex gap-2 sm:gap-2.5 lg:gap-3 items-center">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center flex-shrink-0">
                            <img
                              alt=""
                              src={feature.icon}
                              className="w-full h-full"
                              style={{ filter: 'brightness(0)' }}
                            />
                          </div>
                          <p className="text-sm sm:text-base lg:text-xl leading-5 sm:leading-6 text-black">
                            {feature.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className={`${plan.buttonStyle} border border-black h-11 sm:h-12 lg:h-16 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-2 lg:py-3 rounded-full text-sm sm:text-base lg:text-lg font-medium ${index === 1 ? 'shadow-[0px_0px_0px_1px_white,6px_8px_0px_0px_black] hover:shadow-[0px_0px_0px_1px_white,4px_6px_0px_0px_black]' : 'shadow-[6px_8px_0px_0px_black] hover:shadow-[4px_6px_0px_0px_black]'} hover:translate-x-[2px] hover:translate-y-[2px] ${index === 1 ? 'active:shadow-[0px_0px_0px_1px_white,1px_1px_0px_0px_black]' : 'active:shadow-[1px_1px_0px_0px_black]'} active:translate-x-[6px] active:translate-y-[6px] transition-all duration-200 ease-out mt-auto`}>
                    {plan.buttonText}
                  </button>
                </motion.div>
              ))}

              {/* Center Column - 7 tiles */}
              <div className="absolute left-1/2 top-0 transform -translate-x-1/2 flex flex-col hidden md:flex py-8 lg:py-16">
                {[...Array(TILES_PER_COLUMN)].map((_, i) => (
                  <div
                    key={`center-${i}`}
                    className="w-16 h-16 outline outline-1 outline-black bg-white"
                    style={{ outlineOffset: '-0.5px' }}
                  />
                ))}
              </div>

              {/* Right Column - 7 tiles */}
              <div className="absolute right-0 top-0 flex flex-col hidden lg:flex">
                {[...Array(TILES_PER_COLUMN)].map((_, i) => (
                  <div
                    key={`right-${i}`}
                    className="w-16 h-16 outline outline-1 outline-black bg-white"
                    style={{ outlineOffset: '-0.5px' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
