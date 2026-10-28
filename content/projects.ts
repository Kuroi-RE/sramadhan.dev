import { Projects, ProjectsSchema } from "@/lib/schemas";

export const projects: Projects = ProjectsSchema.parse([
  {
    id: "piopio",
    date: "2024-09-18",
    thumbnail: "/placeholder-project.png",
    name: {
      id: "PioPio Notch",
      en: "PioPio Notch",
    },
    description: {
      id: "Aplikasi Dynamic Island desktop modern dengan visualisator musik dan lirik.",
      en: "Modern desktop Dynamic Island application with music visualizer and lyrics.",
    },
    githubUrl: "https://github.com/Kuroi-RE/piopio",
    demoUrl: "",
  },
  {
    id: "sramadhan-cv",
    date: "2024-10-24",
    thumbnail: "/placeholder-project.png",
    name: {
      id: "Portfolio Bergaya OS",
      en: "Desktop OS Portfolio",
    },
    description: {
      id: "Portfolio interaktif dengan simulasi desktop web, audio player, terminal, dan chatbot.",
      en: "Interactive desktop web portfolio with audio player, terminal, and AI chatbot.",
    },
    githubUrl: "https://github.com/sramadhan/sramadhan.cv",
    demoUrl: "https://sramadhan.cv",
  },
]);
