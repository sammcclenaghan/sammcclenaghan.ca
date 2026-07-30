// Home page copy, shared by index.astro and the structural variants under
// /v/*, so comparing layouts never means comparing different content.
//
// TODO(sam): the intro is still a draft in my words, not yours. See the
// note in index.astro.
export const intro = [
  "I'm a computer science student at the University of Victoria, currently building video infrastructure at Vertical City.",
  "I have a hard time using tools I don't understand. Every few months something I depend on turns out to be a black box — my editor, my resume toolchain, the fuzzy finder I'd used for years without knowing how it worked — so I rebuild a small version of it until it makes sense, then write the explanation I wish I'd had. Most of what's below started that way.",
  "I'm looking for a software internship for summer 2027.",
];

export const tagline =
  "I rebuild things I don't understand, then write the explanation I wish I'd had.";

// The question each post was actually chasing, keyed by post slug. Used by
// the /v/question layout, where the question is the headline and the post is
// the answer.
//
// TODO(sam): these are my paraphrases of your own titles and descriptions —
// several of your titles were already questions, which is what made the
// angle worth trying. Sharpen them into the way you'd actually ask.
export const questions: Record<string, string> = {
  "perceptual-hashing": "Why can't SHA-256 tell that two videos look identical?",
  "video-compression": "How small can you make a 30-second video?",
  vmaf: "How do you score 800 videos nobody has time to watch?",
  "neovim-native": "Do I actually understand my own editor?",
  "fuzzy-matching-rust": "Why does fuzzy matching feel like magic?",
  "typst-resume": "Why am I still editing a LaTeX template I don't understand?",
  "llm-filesystem": "What happens when an agent runs a shell command on my machine?",
  mildred: "How do you test something that answers differently every time?",
  "course-scheduler-vps": "Can one small Droplet run a real app?",
  mathia: "How strong is a password, actually?",
};

export interface Job {
  company: string;
  role: string;
  date: string;
  /** Short form for layouts with a narrow content column */
  years: string;
  note?: string;
}

export const work: Job[] = [
  {
    company: "Vertical City",
    role: "Software Engineer Intern",
    date: "May 2026 — Present",
    years: "2026 —",
    note: "Backend systems that deliver content to digital signage in elevators and lobbies, with a focus on request handling, data usage, and keeping screens in sync.",
  },
  {
    company: "Leanpub",
    role: "Full Stack Developer Intern",
    date: "May — Dec 2025",
    years: "2025",
  },
  {
    company: "Trustscience",
    role: "Application & APIs Developer Intern",
    date: "Jan — Aug 2024",
    years: "2024",
  },
  {
    company: "Trustscience",
    role: "Frontend Developer Intern",
    date: "Nov 2022 — Aug 2023",
    years: "2022 — 23",
  },
];
