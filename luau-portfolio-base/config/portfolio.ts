export type PortfolioProject = {
  title: string;
  description: string;
  image?: string;
  tags: string[];
  highlight?: string;
};

export type RobloxGame = {
  label: string;
  universeId?: string;
  role: string;
  contribution: string;
  url?: string;
  image?: string;
  manualVisits?: number;
};

export const portfolio = {
  owner: {
    displayName: "SEU NOME",
    username: "@seu_usuario",
    headline: "Luau Scripter & Roblox Developer",
    intro:
      "Crio sistemas, mecânicas e experiências em Luau para Roblox Studio, com foco em código organizado, responsivo e fácil de manter.",
    location: "Brasil",
    status: "Disponível para projetos",
  },

  links: {
    roblox: "https://www.roblox.com/users/SEU_ID/profile",
    github: "https://github.com/SEU_USUARIO",
    discord: "#",
    email: "mailto:seuemail@exemplo.com",
  },

  skills: [
    "Luau",
    "Roblox Studio",
    "RemoteEvents",
    "DataStore",
    "ModuleScripts",
    "UI Systems",
    "Game Systems",
    "Debugging",
  ],

  projects: [
    {
      title: "Sistema de Inventário",
      description:
        "Base para apresentar um sistema que você desenvolveu: organização, salvamento, UI e comunicação cliente-servidor.",
      image: "/projects/project-1.jpg",
      tags: ["Luau", "DataStore", "UI"],
      highlight: "Projeto demonstrativo",
    },
    {
      title: "Sistema de Combate",
      description:
        "Use este card para mostrar mecânicas, hitboxes, cooldowns, efeitos e arquitetura modular.",
      image: "/projects/project-2.jpg",
      tags: ["Luau", "Combat", "Modules"],
      highlight: "Substitua pelo seu projeto",
    },
    {
      title: "Sistema de Missões",
      description:
        "Uma terceira base para sistemas de quests, progressão, recompensas e interface.",
      image: "/projects/project-3.jpg",
      tags: ["Luau", "Progression", "UI"],
      highlight: "Substitua pelo seu projeto",
    },
  ] satisfies PortfolioProject[],

  // Preencha os Universe IDs dos jogos em que você contribuiu.
  // O site consulta o Roblox no servidor. Se deixar universeId vazio,
  // o card continua funcionando com os dados manuais.
  games: [
    {
      label: "Jogo em que contribuí",
      universeId: "",
      role: "Luau Scripter",
      contribution: "Descreva aqui exatamente o que você fez no jogo.",
      url: "#",
      manualVisits: 0,
    },
    {
      label: "Outro jogo",
      universeId: "",
      role: "Programmer",
      contribution: "Ex.: sistemas, interfaces, otimização, bug fixes etc.",
      url: "#",
      manualVisits: 0,
    },
  ] satisfies RobloxGame[],
};
