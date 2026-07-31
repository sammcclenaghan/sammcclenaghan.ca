export interface Project {
  name: string;
  href: string;
  description: string;
  year: number;
}

export const projects: Project[] = [
  {
    name: "courseflow",
    href: "https://courseflow.smccl.ca",
    description:
      "Course search, live enrollment data, and conflict-free timetable building for UVic students.",
    year: 2026,
  },
  {
    name: "mildred",
    href: "https://github.com/sammcclenaghan/mildred",
    description:
      "Runs file organization rules written in plain English, sandboxed in Apple containers.",
    year: 2026,
  },
  {
    name: "uvic-scholarships",
    href: "https://github.com/sammcclenaghan/uvic-scholarships",
    description: "Fast search over University of Victoria scholarships.",
    year: 2025,
  },
  {
    name: "git-fad",
    href: "https://github.com/sammcclenaghan/git-fad",
    description: "git add with fuzzy searching, in Rust.",
    year: 2025,
  },
];
