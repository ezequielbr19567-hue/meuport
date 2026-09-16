export type Language = "en" | "pt";

// `string` remains accepted for backwards compatibility with content saved by V2.
export type LocalizedText = string | {
  en: string;
  pt: string;
};

export type PortfolioCard = {
  title: LocalizedText;
  description: LocalizedText;
  image?: string;
  tags: LocalizedText[];
  highlight?: LocalizedText;
  video?: string;
};

export type RobloxGame = {
  label: LocalizedText;
  universeId?: string;
  role: LocalizedText;
  contribution: LocalizedText;
  url?: string;
  image?: string;
  manualVisits?: number;
};

export type PriceItem = {
  title: LocalizedText;
  price: LocalizedText;
  description: LocalizedText;
  features: LocalizedText[];
  highlight?: LocalizedText;
};

export type MediaItem = {
  title: LocalizedText;
  type: "image" | "video";
  url: string;
  description?: LocalizedText;
};

export type PortfolioContent = {
  owner: {
    displayName: string;
    username: string;
    status: LocalizedText;
    intro: LocalizedText;
    heroTitleTop: LocalizedText;
    heroTitleAccent: LocalizedText;
    heroTitleBottom: LocalizedText;
    builderPitch: LocalizedText;
    programmerPitch: LocalizedText;
  };
  links: {
    roblox: string;
    github: string;
    discord: string;
    email: string;
  };
  builderSkills: LocalizedText[];
  programmerSkills: LocalizedText[];
  builderProjects: PortfolioCard[];
  programmerProjects: PortfolioCard[];
  prices: PriceItem[];
  media: MediaItem[];
  games: RobloxGame[];
};

const i18n = (en: string, pt: string): LocalizedText => ({ en, pt });

export const defaultPortfolio: PortfolioContent = {
  owner: {
    displayName: "YOUR NAME",
    username: "@your_username",
    status: i18n("Available for projects", "Disponível para projetos"),
    intro: i18n(
      "Roblox Studio builder and developer focused on maps, environments, visual composition and technical support to turn ideas into polished experiences.",
      "Builder e developer de Roblox Studio com foco em mapas, ambientação, composição visual e suporte técnico para transformar ideias em experiências profissionais."
    ),
    heroTitleTop: i18n("I build", "Eu construo"),
    heroTitleAccent: i18n("worlds", "mundos"),
    heroTitleBottom: i18n("on Roblox.", "no Roblox."),
    builderPitch: i18n(
      "My main area is building: environments, composition, map structure, lighting and visual direction with a professional finish.",
      "Minha área principal é builder: cenários, composição, estruturação de mapas, iluminação e direção visual com acabamento profissional."
    ),
    programmerPitch: i18n(
      "Luau systems, modular architecture, interfaces and technical support for projects that need more than building alone.",
      "Sistemas em Luau, arquitetura modular, interfaces e suporte técnico para projetos que precisam ir além da construção."
    ),
  },

  links: {
    roblox: "https://www.roblox.com/users/SEU_ID/profile",
    github: "https://github.com/SEU_USUARIO",
    discord: "#",
    email: "mailto:seuemail@exemplo.com",
  },

  builderSkills: [
    i18n("Map Building", "Construção de mapas"),
    i18n("Environment Design", "Design de ambientes"),
    i18n("Lighting", "Iluminação"),
    i18n("Composition", "Composição"),
    i18n("Level Layout", "Layout de níveis"),
    i18n("World Detail", "Detalhamento"),
    i18n("Optimization", "Otimização"),
    i18n("Studio Workflow", "Workflow no Studio"),
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
      title: i18n("Futuristic Lobby", "Lobby Futurista"),
      description: i18n(
        "A lobby, hub or spawn built around strong visual identity, readable spaces and polished presentation.",
        "Lobby, hub ou spawn construído com foco em identidade visual, leitura do espaço e apresentação polida."
      ),
      image: "",
      tags: ["Builder", "Lighting", "Hub"],
      highlight: i18n("Builder showcase", "Showcase de builder"),
    },
    {
      title: i18n("Adventure Map", "Mapa de Aventura"),
      description: i18n(
        "Biomes, paths, landmarks and environmental storytelling shaped into a cohesive explorable world.",
        "Biomas, trilhas, landmarks e storytelling ambiental organizados em um mundo coeso e explorável."
      ),
      image: "",
      tags: ["Environment", "World", "Exploration"],
      highlight: i18n("Main build", "Construção principal"),
    },
    {
      title: i18n("Interior / Themed Area", "Interior / Área Temática"),
      description: i18n(
        "Ideal for interiors, arenas, cities or detailed themed areas focused on atmosphere and polish.",
        "Ideal para interiores, arenas, cidades ou áreas temáticas detalhadas com foco em atmosfera e acabamento."
      ),
      image: "",
      tags: ["Interior", "Detail", "Atmosphere"],
      highlight: i18n("Visual direction", "Direção visual"),
    },
  ],

  programmerProjects: [
    {
      title: i18n("Build Tools System", "Sistema de Build Tools"),
      description: i18n(
        "A technical project that complements building work: placement tools, editing utilities and organized workflows.",
        "Um projeto técnico que complementa o trabalho builder: ferramentas de placement, edição e workflows organizados."
      ),
      image: "",
      tags: ["Luau", "Tools", "Systems"],
      highlight: i18n("Programming", "Programação"),
    },
    {
      title: i18n("Quest System", "Sistema de Missões"),
      description: i18n(
        "A modular quest and progression system built in Luau with clear state management and UI integration.",
        "Sistema modular de missões e progressão em Luau, com gerenciamento claro de estado e integração com UI."
      ),
      image: "",
      tags: ["Luau", "Progression", "UI"],
      highlight: i18n("Luau system", "Sistema Luau"),
    },
  ],

  prices: [
    {
      title: i18n("Small Build", "Build pequeno"),
      price: i18n("From R$ 80", "R$ 80+"),
      description: i18n(
        "Simple lobbies, small areas, props or quick visual improvements.",
        "Lobbies simples, áreas pequenas, props ou ajustes visuais rápidos."
      ),
      features: [
        i18n("Fast delivery", "Entrega rápida"),
        i18n("Straightforward briefing", "Briefing direto"),
        i18n("1 revision", "1 revisão"),
      ],
    },
    {
      title: i18n("Medium Map", "Mapa médio"),
      price: i18n("From R$ 250", "R$ 250+"),
      description: i18n(
        "More complete maps with composition, lighting and a higher level of detail.",
        "Mapas mais completos com composição, iluminação e nível maior de detalhamento."
      ),
      features: [
        i18n("More detail", "Mais detalhes"),
        i18n("Milestone workflow", "Organização por etapas"),
        i18n("2 revisions", "2 revisões"),
      ],
      highlight: i18n("Most requested", "Mais pedido"),
    },
    {
      title: i18n("Custom Project", "Projeto custom"),
      price: i18n("Quote on request", "Sob consulta"),
      description: i18n(
        "For larger projects, ongoing collaboration or combined building + scripting work.",
        "Para projetos maiores, colaboração contínua ou trabalho combinado de build + scripting."
      ),
      features: [
        i18n("Custom scope", "Escopo personalizado"),
        i18n("Extended support", "Suporte maior"),
        i18n("Budget-based planning", "Planejamento por orçamento"),
      ],
    },
  ],

  media: [
    {
      title: i18n("Map screenshot", "Imagem do seu mapa"),
      type: "image",
      url: "",
      description: i18n(
        "Screenshots, renders and before-and-after comparisons from selected builds.",
        "Prints, renders e comparações de antes e depois de builds selecionadas."
      ),
    },
    {
      title: i18n("Showcase video", "Vídeo de showcase"),
      type: "video",
      url: "",
      description: i18n(
        "A closer look at movement, lighting and atmosphere inside the experience.",
        "Um olhar mais próximo sobre movimento, iluminação e atmosfera dentro da experiência."
      ),
    },
  ],

  games: [
    {
      label: i18n("Game I contributed to", "Jogo em que contribuí"),
      universeId: "",
      role: "Builder",
      contribution: i18n(
        "Environment building, map composition and production support for the experience.",
        "Construção de ambientes, composição de mapa e suporte de produção para a experiência."
      ),
      url: "#",
      manualVisits: 0,
      image: "",
    },
    {
      label: i18n("Another game", "Outro jogo"),
      universeId: "",
      role: i18n("Builder / Scripting support", "Builder / Suporte em scripting"),
      contribution: i18n(
        "Maps, environments, layout, optimization and technical support across production.",
        "Mapas, ambientação, layout, otimização e suporte técnico durante a produção."
      ),
      url: "#",
      manualVisits: 0,
      image: "",
    },
  ],
};
