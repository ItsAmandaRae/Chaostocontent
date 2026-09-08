import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProjectsTable from "@/components/ProjectsTable";

interface Project {
  id: string;
  title: string;
  status: "draft" | "processing" | "ready" | "published";
  created_at: string;
  updated_at: string;
}

const defaultProjects: Project[] = [
  {
    id: "default-1",
    title: "Welcome to Your Dashboard",
    status: "ready",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "default-2",
    title: "Sample Podcast Episode",
    status: "published",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "default-3",
    title: "Interview Draft",
    status: "draft",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "default-4",
    title: "Weekly Update Recording",
    status: "processing",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "default-5",
    title: "Team Meeting Notes",
    status: "draft",
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 345600000).toISOString(),
  },
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });
    
    if (!error && data) {
      setProjects(data as Project[]);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (!session?.user) {
          navigate("/auth");
        } else {
          fetchProjects();
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchProjects();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Use default projects if user has none
  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  // Calculate stats from display projects
  const stats = [
    { value: displayProjects.length.toString(), label: "Recordings" },
    { value: displayProjects.filter(p => p.status !== "draft").length.toString(), label: "Posts Created" },
    { value: displayProjects.filter(p => p.status === "published").length.toString(), label: "Published" },
    { value: displayProjects.filter(p => p.status === "draft").length.toString(), label: "Drafts" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display font-black text-2xl sm:text-3xl leading-tight tracking-[-0.5px] text-foreground mb-6 sm:mb-8">
            Welcome to your Dashboard
          </h1>

          {/* Stat cards - matching home page Achievements style */}
          <div className="relative bg-background overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 bg-black">
              {stats.map((stat, index) => {
                const isTopRow = index < 2;
                const isBottomRow = index >= 2;
                const isRightCol = index % 2 === 1;
                const isLeftCol = index % 2 === 0;

                const marginClasses: string[] = [];
                if (isBottomRow) marginClasses.push('-mt-[1px]');
                if (isRightCol) marginClasses.push('-ml-[1px]');
                if (index > 0) marginClasses.push('lg:-ml-[1px]');
                if (isBottomRow) marginClasses.push('lg:mt-0');

                const roundedClasses: string[] = [];
                if (isTopRow && isRightCol) roundedClasses.push('rounded-bl-[24px] sm:rounded-bl-[32px]');
                if (isTopRow && isLeftCol) roundedClasses.push('rounded-br-[24px] sm:rounded-br-[32px]');
                if (isBottomRow && isLeftCol) roundedClasses.push('rounded-tr-[24px] sm:rounded-tr-[32px]');
                if (isBottomRow && isRightCol) roundedClasses.push('rounded-tl-[24px] sm:rounded-tl-[32px]');

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white border border-black ${marginClasses.join(' ')} ${roundedClasses.join(' ')} flex flex-col gap-2 sm:gap-3 items-start justify-start px-4 sm:px-6 py-4 sm:py-6 lg:py-8`}
                  >
                    <p className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-[-0.96px] text-black">
                      {stat.value}
                    </p>
                    <p className="text-sm sm:text-base lg:text-lg leading-5 sm:leading-6 text-black">
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Projects Section with inline header and CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 sm:mt-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="font-display font-black text-xl sm:text-2xl leading-tight tracking-[-0.5px] text-foreground">
                Your Projects
              </h2>
              <button className="bg-highlight text-highlight-foreground border border-black h-12 lg:h-14 px-6 sm:px-8 rounded-full text-base lg:text-lg font-medium shadow-[4px_6px_0px_0px_black] sm:shadow-[6px_8px_0px_0px_black] hover:shadow-[4px_6px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_0px_black] active:translate-x-[6px] active:translate-y-[6px] transition-all duration-200 ease-out w-full sm:w-auto">
                Start Recording
              </button>
            </div>
            <ProjectsTable projects={displayProjects} onRefresh={fetchProjects} />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
