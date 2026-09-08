export const PLATFORM_LABELS: Record<string, string> = {
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  threads: "Threads",
  newsletter: "Newsletter",
};

export const platformLabel = (id: string) => PLATFORM_LABELS[id] ?? id;
