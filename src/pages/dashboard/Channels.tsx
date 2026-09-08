import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useOutletContext } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Twitter, Linkedin, Instagram, Facebook, Newspaper, Rss, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DemoBanner, NotWiredModal } from "@/components/DemoNotice";
import { handleSchema } from "@/lib/validation";

interface Channel {
  id: string;
  platform: string;
  handle: string | null;
  is_default: boolean | null;
  connected_at: string;
}

const platforms = [
  { id: "twitter", name: "X / Twitter", icon: Twitter },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "facebook", name: "Facebook", icon: Facebook },
  { id: "threads", name: "Threads", icon: Newspaper },
  { id: "newsletter", name: "Newsletter", icon: Rss },
];

export default function Channels() {
  const { user } = useOutletContext<{ user: User | null }>();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [connectOpen, setConnectOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchChannels = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("channels").select("*").eq("user_id", user!.id).order("connected_at", { ascending: false });
    if (!error && data) {
      setChannels(data as Channel[]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChannels();
    }
  }, [user]);

  const connectedMap = new Map(channels.map((c) => [c.platform, c]));

  const openConnect = (platformId: string) => {
    setSelectedPlatform(platformId);
    const existing = connectedMap.get(platformId);
    setHandle(existing?.handle || "");
    setConnectOpen(true);
  };

  const handleConnect = async () => {
    if (!selectedPlatform || !user) return;
    const parsed = handleSchema.safeParse(handle);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const cleanHandle = parsed.data.replace(/^@/, "");
    if (!platforms.some((p) => p.id === selectedPlatform)) {
      toast.error("Unknown platform");
      return;
    }
    setLoading(true);
    const existing = connectedMap.get(selectedPlatform);

    if (existing) {
      const { error } = await supabase
        .from("channels")
        .update({ handle: cleanHandle })
        .eq("id", existing.id)
        .eq("user_id", user.id);
      if (error) toast.error("Failed to update channel");
      else toast.success("Channel updated");
    } else {
      const { error } = await supabase.from("channels").insert({
        platform: selectedPlatform,
        handle: cleanHandle,
        is_default: channels.length === 0,
        user_id: user.id,
      });
      if (error) toast.error("Failed to connect channel");
      else toast.success("Channel connected");
    }

    setLoading(false);
    setConnectOpen(false);
    fetchChannels();
  };

  const toggleDefault = async (channel: Channel) => {
    const { error } = await supabase
      .from("channels")
      .update({ is_default: !channel.is_default })
      .eq("id", channel.id)
      .eq("user_id", user!.id);

    if (error) {
      toast.error("Failed to update default");
    } else {
      toast.success(channel.is_default ? "Removed default" : "Set as default");
      fetchChannels();
    }
  };

  const disconnect = async (channel: Channel) => {
    const { error } = await supabase.from("channels").delete().eq("id", channel.id).eq("user_id", user!.id);
    if (error) {
      toast.error("Failed to disconnect channel");
    } else {
      toast.success("Channel disconnected");
      fetchChannels();
    }
  };

  const platformName =
    platforms.find((p) => p.id === selectedPlatform)?.name ?? "This platform";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
            A channel stores the platform and handle you post as. When a post is ready, we open the
            platform's composer with your text pre-filled — you hit post, then confirm it here.
            Nothing is sent on your behalf in the background.
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
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary border border-black flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    </div>
                  )}

                </div>

                <div className="mt-auto space-y-3">
                  {connected?.handle && (
                    <p className="text-sm font-medium">@{connected.handle}</p>
                  )}

                  <div className="flex items-center gap-2">
                    {connected && (
                      <button
                        onClick={() => toggleDefault(connected)}
                        className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide border border-black transition-colors ${
                          connected.is_default ? "bg-primary" : "bg-white hover:bg-secondary"
                        }`}
                      >
                        {connected.is_default ? "Default" : "Set Default"}
                      </button>
                    )}
                    <button
                      onClick={() => openConnect(platform.id)}
                      className="flex-1 px-4 py-2 border border-black bg-black text-white font-medium hover:bg-white hover:text-black transition-colors"
                    >
                      {connected ? "Edit" : "Connect"}
                    </button>
                    {connected && (
                      <button
                        onClick={() => disconnect(connected)}
                        className="px-3 py-2 border border-black text-destructive hover:bg-destructive hover:text-white transition-colors"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <NotWiredModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        title={`Connect ${platformName}`}
        summary={`Save the handle you post as on ${platformName}. Posts assigned to this channel open ${platformName}'s composer with your text ready to send.`}
        steps={[
          "Save your handle so posts are attributed to the right account.",
          "Write a post and assign it to this channel.",
          "Schedule it on the content calendar for when you want it live.",
          `Hit Publish — we open ${platformName} with the text pre-filled.`,
          "Confirm \"I posted this\" (and paste the link) to mark it published.",
        ]}
        footer={
          <div>
            <p className="text-sm font-medium mb-2">
              Your handle on {platformName}
            </p>

            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@username"
              className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConnectOpen(false)}
                className="px-6 py-2 border border-black bg-white font-display font-bold hover:bg-secondary transition-colors rounded-full"
              >
                Close
              </button>
              <button
                onClick={handleConnect}
                disabled={loading || !handle.trim()}
                className="px-6 py-2 border border-black bg-primary font-display font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
              >
                {loading ? "Saving..." : "Save handle"}
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
}
