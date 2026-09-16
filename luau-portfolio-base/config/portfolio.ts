export type PortfolioCard = {
  title: string;
  description: string;
  image?: string;
  tags: string[];
  highlight?: string;
  video?: string;
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

export type PriceItem = {
  title: string;
  price: string;
  description: string;
  features: string[];
  highlight?: string;
};

export type MediaItem = {
  title: string;
  type: "image" | "video";
  url: string;
  description?: string;
};

export type PortfolioContent = {
  owner: {
    displayName: string;
    username: string;
    status: string;
    intro: string;
    heroTitleTop: string;
    heroTitleAccent: string;
    heroTitleBottom: string;
    builderPitch: string;
    programmerPitch: string;
  };
  links: {
    roblox: string;
    github: string;
    discord: string;
    email: string;
  };
  builderSkills: string[];
  programmerSkills: string[];
  builderProjects: PortfolioCard[];
  programmerProjects: PortfolioCard[];
  prices: PriceItem[];
  media: MediaItem[];
  games: RobloxGame[];
};

export const defaultPortfolio: PortfolioContent = {
  owner: {
    displayName: "SEU NOME",
    username: "@seu_usuario",
    status: "Disponível para projetos",
    intro:
      "Builder e developer de Roblox Studio com foco em mapas, ambientação, composição visual e suporte técnico para transformar ideias em experiências fortes.",
    heroTitleTop: "Eu construo",
    heroTitleAccent: "mundos",
    heroTitleBottom: "no Roblox.",
    builderPitch:
      "Minha área principal é builder: cenários, composição, leitura visual, estruturação de mapas e ambientações com cara profissional.",
    programmerPitch:
      "A programação fica separada: sistemas em Luau, organização modular, interfaces e suporte técnico quando o projeto exige.",
  },

  links: {
    roblox: "https://www.roblox.com/users/SEU_ID/profile",
    github: "https://github.com/SEU_USUARIO",
    discord: "#",
    email: "mailto:seuemail@exemplo.com",
  },

  builderSkills: [
    "Map Building",
    "Environment Design",
    "Lighting",
    "Composition",
    "Level Layout",
    "World Detail",
    "Optimization",
    "Studio Workflow",
  ],

  programmerSkills: [
    "Luau",
    "RemoteEvents",
    "DataStore",
    "UI Systems",
    "ModuleScripts",
    "Game Systems",
  ],

  builderProjects: [
    {
      title: "Lobby Futurista",
      description:
        "Exemplo de card para apresentar um lobby, hub ou spawn que você construiu com foco em identidade visual e leitura do espaço.",
      image: "",
      tags: ["Builder", "Lighting", "Hub"],
      highlight: "Builder showcase",
    },
    {
      title: "Mapa de Aventura",
      description:
        "Use este card para mostrar biomas, trilhas, landmark principal, storytelling visual e organização do mapa.",
      image: "",
      tags: ["Environment", "World", "Exploration"],
      highlight: "Construção principal",
    },
    {
      title: "Interior / Área Temática",
      description:
        "Perfeito para apresentar interiores, arenas, cidades ou áreas decoradas com foco em atmosfera e detalhamento.",
      image: "",
      tags: ["Interior", "Detail", "Atmosphere"],
      highlight: "Visual direction",
    },
  ],

  programmerProjects: [
    {
      title: "Sistema de Build Tools",
      description:
        "Um exemplo de sistema técnico para complementar sua parte builder: ferramentas, edição, placement e organização.",
      image: "",
      tags: ["Luau", "Tools", "Systems"],
      highlight: "Programação",
    },
    {
      title: "Sistema de Missões",
      description:
        "Use este espaço para mostrar um sistema que você programou sem deixar a programação competir com a área builder.",
      image: "",
      tags: ["Luau", "Progression", "UI"],
      highlight: "Área separada",
    },
  ],

  prices: [
    {
      title: "Build pequeno",
      price: "R$ 80+",
      description: "Lobbies simples, áreas pequenas, props ou ajustes visuais rápidos.",
      features: ["Entrega rápida", "Briefing direto", "1 revisão"],
    },
    {
      title: "Mapa médio",
      price: "R$ 250+",
      description: "Mapas mais completos com composição, iluminação e detalhamento maior.",
      features: ["Mais detalhes", "Organização por etapas", "2 revisões"],
      highlight: "Mais pedido",
    },
    {
      title: "Projeto custom",
      price: "Sob consulta",
      description: "Para projetos maiores, colaboração contínua ou build + scripting.",
      features: ["Escopo personalizado", "Suporte maior", "Planejamento por orçamento"],
    },
  ],

  media: [
    {
      title: "Imagem do seu mapa",
      type: "image",
      url: "",
      description: "Adicione prints, renders ou antes/depois do seu trabalho.",
    },
    {
      title: "Vídeo de showcase",
      type: "video",
      url: "",
      description: "Cole um link incorporável do YouTube/Vimeo ou URL de vídeo público.",
    },
  ],

  games: [
    {
      label: "Jogo em que contribuí",
      universeId: "",
      role: "Builder",
      contribution: "Descreva aqui exatamente o que você fez no jogo.",
      url: "#",
      manualVisits: 0,
      image: "",
    },
    {
      label: "Outro jogo",
      universeId: "",
      role: "Builder / Scripting support",
      contribution: "Ex.: mapas, ambientação, layout, optimization e suporte em sistemas.",
      url: "#",
      manualVisits: 0,
      image: "",
    },
  ],
};
