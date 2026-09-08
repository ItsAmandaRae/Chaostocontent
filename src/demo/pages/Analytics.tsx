import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format, subDays, isAfter } from "date-fns";
import { BarChart3, Activity } from "lucide-react";
import { useSeedData } from "../SeedDataProvider";

const ranges = ["7d", "30d", "90d", "all"] as const;

export default function DemoAnalytics() {
  const { projects, posts } = useSeedData();
  const [range, setRange] = useState<(typeof ranges)[number]>("30d");

  const cutoff = useMemo(() => {
    if (range === "all") return null;
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    return subDays(new Date(), days);
  }, [range]);

  const filteredProjects = useMemo(
    () => (cutoff ? projects.filter((p) => isAfter(new Date(p.created_at), cutoff)) : projects),
    [projects, cutoff]
  );

  const publishedThisMonth = useMemo(() => {
    const now = new Date();
    return posts.filter((p) => {
      if (!p.published_at) return false;
      const d = new Date(p.published_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [posts]);

  const chartData = useMemo(() => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    return Array.from({ length: days }, (_, i) => {
      const day = subDays(new Date(), days - i - 1);
      const label = format(day, days === 365 ? "MMM yyyy" : "MMM d");
      const count = projects.filter(
        (p) => format(new Date(p.created_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      ).length;
      const showLabel = days === 7 ? true : days === 30 ? i % 5 === 0 : days === 90 ? i % 10 === 0 : i % 60 === 0;
      return { label, count, showLabel, key: `${label}-${i}` };
    });
  }, [projects, range]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  const activity = useMemo(() => {
    const events = [
      ...projects.map((p) => ({ id: p.id, type: "recording" as const, title: p.title, date: p.created_at })),
      ...posts.map((p) => ({
        id: p.id,
        type: "post" as const,
        title: p.status,
        date: p.published_at || p.created_at,
      })),
    ];
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [projects, posts]);

  const stats = [
    { value: projects.length.toString(), label: "Total Recordings" },
    { value: posts.length.toString(), label: "Total Posts" },
    { value: publishedThisMonth.toString(), label: "Published This Month" },
    { value: filteredProjects.length.toString(), label: "Recordings in Range" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="font-display font-black text-2xl sm:text-3xl leading-tight tracking-[-0.5px] text-foreground">
            Analytics
          </h1>
          <div className="flex items-center gap-1">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-2 border border-black text-sm font-medium uppercase tracking-wide transition-colors ${
                  range === r ? "bg-primary text-black" : "bg-white hover:bg-secondary"
                }`}
              >
                {r === "all" ? "All" : r.replace("d", " days")}
              </button>
            ))}
          </div>
        </div>

        <div className="relative bg-background overflow-hidden mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 bg-black">
            {stats.map((stat, index) => {
              const isTopRow = index < 2;
              const isBottomRow = index >= 2;
              const isRightCol = index % 2 === 1;
              const isLeftCol = index % 2 === 0;

              const marginClasses: string[] = [];
              if (isBottomRow) marginClasses.push("-mt-[1px]");
              if (isRightCol) marginClasses.push("-ml-[1px]");
              if (index > 0) marginClasses.push("lg:-ml-[1px]");
              if (isBottomRow) marginClasses.push("lg:mt-0");

              const roundedClasses: string[] = [];
              if (isTopRow && isRightCol) roundedClasses.push("rounded-bl-[24px] sm:rounded-bl-[32px]");
              if (isTopRow && isLeftCol) roundedClasses.push("rounded-br-[24px] sm:rounded-br-[32px]");
              if (isBottomRow && isLeftCol) roundedClasses.push("rounded-tr-[24px] sm:rounded-tr-[32px]");
              if (isBottomRow && isRightCol) roundedClasses.push("rounded-tl-[24px] sm:rounded-tl-[32px]");

              return (
                <div
                  key={stat.label}
                  className={`bg-white border border-black ${marginClasses.join(" ")} ${roundedClasses.join(
                    " "
                  )} flex flex-col gap-2 sm:gap-3 items-start justify-start px-4 sm:px-6 py-4 sm:py-6 lg:py-8`}
                >
                  <p className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-[-0.96px] text-black">
                    {stat.value}
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg leading-5 sm:leading-6 text-black">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 border border-black bg-white p-5">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recordings Over Time
            </h2>
            <div className="flex items-end gap-2 h-48 sm:h-64">
              {chartData.map((d) => (
                <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary border border-black transition-all"
                    style={{ height: `${(d.count / maxCount) * 100}%` }}
                  />
                  <span
                    className={`text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap ${
                      d.showLabel ? "" : "invisible"
                    }`}
                  >
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-black bg-white p-5">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h2>
            <div className="space-y-3 max-h-[300px] overflow-auto">
              {activity.map((event) => (
                <div key={`${event.type}-${event.id}`} className="p-3 border border-black">
                  <p className="font-medium text-sm">
                    {event.type === "recording" ? "Recording created" : `Post ${event.title}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.type === "recording" ? event.title : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(event.date), "MMM d, yyyy")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
