export interface Project {
  name: string;
  href: string;
  description: string;
  featured?: boolean;
  /** Where the thing actually stands today — "still use it daily",
      "dead", "abandoned when the display broke". Four honest words are
      worth more here than the description above them, because nobody can
      guess them from the outside. Omit rather than pad: a missing status
      renders nothing. */
  status?: string;
  /** Year, for layouts that interleave projects with posts and jobs on one
      timeline. Only set where I could source it from your own writing —
      undated projects sort to the end rather than get a guessed year. */
  year?: number;
}

// TODO(sam): fill in `status` on the rest of these. I only wrote the one I
// could source from your own writing (the Cloudflare rewrite note in
// course-scheduler-vps.md) — the others are yours to answer, and guessing
// them would defeat the point.
export const projects: Project[] = [
  {
    name: "courseflow",
    href: "https://courseflow.smccl.ca",
    description:
      "A simple tool to browse and schedule UVic courses.",
    featured: true,
    status: "live — rewritten for Cloudflare Workers, D1, and Durable Objects",
    year: 2026,
  },
  {
    name: "mildred",
    href: "https://github.com/sammcclenaghan/mildred",
    description:
      "An agent that runs plain-English rules for you, sandboxed with Apple containers.",
    featured: true,
    year: 2026,
  },
  {
    name: "git-fad",
    href: "https://github.com/sammcclenaghan/git-fad",
    description: "Git add with fuzzy searching, built in Rust.",
    featured: true,
    year: 2025,
  },
  {
    name: "job tracker",
    href: "https://github.com/sammcclenaghan/job_tracker",
    description:
      "A job application tracker with AI-powered job posting parsing and organization, built with Ruby on Rails.",
    featured: true,
  },
  {
    name: "photograph",
    href: "https://github.com/sammcclenaghan/photograph",
    description:
      "A photography portfolio and gallery app built with Next.js, React and PostgreSQL.",
  },
  {
    name: "uvic scholarships",
    href: "https://github.com/sammcclenaghan/uvic-scholarships",
    description:
      "A fast search tool for University of Victoria scholarships.",
  },
];
