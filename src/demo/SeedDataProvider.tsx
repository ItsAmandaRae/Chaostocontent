import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import {
  demoChannels,
  demoPosts,
  demoProfile,
  demoProjects,
  DemoChannel,
  DemoPost,
  DemoProfile,
  DemoProject,
} from "./seedData";

interface SeedDataValue {
  projects: DemoProject[];
  posts: DemoPost[];
  channels: DemoChannel[];
  profile: DemoProfile;
  setProfile: (p: DemoProfile) => void;
  updateProject: (id: string, patch: Partial<DemoProject>) => void;
  removeProject: (id: string) => void;
  removePost: (id: string) => void;
  reset: () => void;
}

const SeedDataContext = createContext<SeedDataValue | null>(null);

export function SeedDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<DemoProject[]>(demoProjects);
  const [posts, setPosts] = useState<DemoPost[]>(demoPosts);
  const [channels] = useState<DemoChannel[]>(demoChannels);
  const [profile, setProfile] = useState<DemoProfile>(demoProfile);

  const value = useMemo<SeedDataValue>(
    () => ({
      projects,
      posts,
      channels,
      profile,
      setProfile,
      updateProject: (id, patch) =>
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      removeProject: (id) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setPosts((prev) => prev.filter((p) => p.project_id !== id));
      },
      removePost: (id) => setPosts((prev) => prev.filter((p) => p.id !== id)),
      reset: () => {
        setProjects(demoProjects);
        setPosts(demoPosts);
        setProfile(demoProfile);
      },
    }),
    [projects, posts, channels, profile]
  );

  return <SeedDataContext.Provider value={value}>{children}</SeedDataContext.Provider>;
}

export function useSeedData() {
  const ctx = useContext(SeedDataContext);
  if (!ctx) throw new Error("useSeedData must be used inside a SeedDataProvider");
  return ctx;
}
