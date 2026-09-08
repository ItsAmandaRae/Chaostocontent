import { motion } from "framer-motion";
import { toast } from "sonner";
import { Twitter, Linkedin, Instagram, Facebook, Newspaper, Rss, Check } from "lucide-react";
import { DemoBanner } from "@/components/DemoNotice";
import { useSeedData } from "../SeedDataProvider";

const platforms = [
  { id: "twitter", name: "X / Twitter", icon: Twitter },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "facebook", name: "Facebook", icon: Facebook },
  { id: "threads", name: "Threads", icon: Newspaper },
  { id: "newsletter", name: "Newsletter", icon: Rss },
];

export default function DemoChannels() {
  const { channels } = useSeedData();
  const connectedMap = new Map(channels.map((c) => [c.platform, c]));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="font-display font-black text-2xl sm:text-3xl leading-tight tracking-[-0.5px] text-foreground">
            Channels
          </h1>
          <p className="text-muted-foreground max-w-md">
            Connect the platforms where you want to publish content from your recordings.
          </p>
        </div>

        <DemoBanner title="Publishing is manual by design">
          <p>
            A channel stores the platform and handle you post as. When a post is ready, we open the platform's
            composer with your text pre-filled — you hit post, then confirm it here. Nothing is sent on your behalf
            in the background.
          </p>
        </DemoBanner>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const connected = connectedMap.get(platform.id);
            const Icon = platform.icon;

            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="border border-black bg-white p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border border-black flex items-center justify-center bg-secondary">
                      <Icon className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {connected ? "Connected handle" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  {connected && (
                    <div className="w-6 h-6 bg-primary border border-black flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-3">
                  {connected?.handle && <p className="text-sm font-medium">@{connected.handle}</p>}

                  <div className="flex items-center gap-2">
                    {connected && (
                      <span
                        className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide border border-black ${
                          connected.is_default ? "bg-primary" : "bg-white"
                        }`}
                      >
                        {connected.is_default ? "Default" : "Set Default"}
                      </span>
                    )}
                    <button
                      onClick={() => toast.info("Connecting channels is disabled in the demo")}
                      className="flex-1 px-4 py-2 border border-black bg-black text-white font-medium hover:bg-white hover:text-black transition-colors"
                    >
                      {connected ? "Edit" : "Connect"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
