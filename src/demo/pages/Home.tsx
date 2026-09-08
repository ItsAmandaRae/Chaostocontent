import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DemoProjectsTable from "../DemoProjectsTable";
import { useSeedData } from "../SeedDataProvider";

export default function DemoHome() {
  const navigate = useNavigate();
  const { projects, posts, profile } = useSeedData();

  const stats = [
    { value: projects.length.toString(), label: "Recordings" },
    { value: posts.length.toString(), label: "Posts Created" },
    { value: posts.filter((p) => p.status === "published").length.toString(), label: "Published" },
    { value: projects.filter((p) => p.status === "draft").length.toString(), label: "Drafts" },
  ];

  const recent = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display font-black text-2xl sm:text-3xl leading-tight tracking-[-0.5px] text-foreground mb-6 sm:mb-8">
          Welcome back, {profile.display_name.split(" ")[0]}
        </h1>

        <div className="relative bg-background overflow-hidden">
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

        <div className="mt-8 sm:mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="font-display font-black text-xl sm:text-2xl leading-tight tracking-[-0.5px] text-foreground">
              Recent Recordings
            </h2>
            <button
              onClick={() => navigate("/demo/recordings")}
              className="bg-highlight text-highlight-foreground border border-black h-12 lg:h-14 px-6 sm:px-8 rounded-full text-base lg:text-lg font-medium shadow-[4px_6px_0px_0px_black] sm:shadow-[6px_8px_0px_0px_black] hover:shadow-[4px_6px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_0px_black] active:translate-x-[6px] active:translate-y-[6px] transition-all duration-200 ease-out w-full sm:w-auto"
            >
              View all recordings
            </button>
          </div>
          <DemoProjectsTable projects={recent} />
        </div>
      </motion.div>
    </div>
  );
}
