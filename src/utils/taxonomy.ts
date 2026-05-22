export const PLANNED_CATEGORIES = [
  { name: "杂谈", slug: "misc", icon: "lucide:messages-square" },
  { name: "LLM", slug: "llm", icon: "lucide:brain-circuit" },
  { name: "C/C++", slug: "c-cpp", icon: "lucide:code-2" },
  { name: "AI infra", slug: "ai-infra", icon: "lucide:server-cog" },
  { name: "Agent", slug: "agent", icon: "lucide:bot" },
  { name: "日常", slug: "daily", icon: "lucide:coffee" },
  { name: "课题研究", slug: "research", icon: "lucide:microscope" },
] as const;

export type PlannedCategory = (typeof PLANNED_CATEGORIES)[number]["name"];

export function categoryToSlug(category: string): string {
  return (
    PLANNED_CATEGORIES.find((item) => item.name === category)?.slug ||
    encodeURIComponent(category.trim().toLowerCase().replace(/\s+/g, "-"))
  );
}

export function categoryFromSlug(slug: string): string {
  return PLANNED_CATEGORIES.find((item) => item.slug === slug)?.name || decodeURIComponent(slug);
}
