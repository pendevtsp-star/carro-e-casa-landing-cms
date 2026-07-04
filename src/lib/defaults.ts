export const defaultSiteSetting = {
  id: "main",
  businessName: "Carro & Casa",
  slogan: "Produtos premium para carro e casa",
  institutionalText:
    "A Carro & Casa reúne produtos premium para quem valoriza cuidado, proteção e acabamento de qualidade. Com atendimento especializado e um mix de marcas selecionadas, ajudamos clientes finais e profissionais a encontrarem as melhores soluções para carro e casa.",
  whatsappNumber: "558230287161",
  whatsappMessage:
    "Olá, vim pelo site da Carro & Casa e gostaria de atendimento.",
  instagramUrl: "https://www.instagram.com/lojacarroecasa/",
  address:
    "Av. Dona Constança de Góes Monteiro, 205 - Poço, Maceió - AL, 57036-370, Brasil",
  openingHours: "Seg a Sex: 8h-12h | 13h-17h | Sáb: 8h-12h",
  email: "comercial@lojacarroecasa.com.br",
  googleMapsUrl: "https://maps.google.com/?q=Av.%20Dona%20Constan%C3%A7a%20de%20G%C3%B3es%20Monteiro%2C%20205%20-%20Po%C3%A7o%2C%20Macei%C3%B3%20-%20AL",
  googleMapsEmbed: "",
  logoUrl: "/brand/logo-carro-casa.jpg",
  alternateLogoUrl: "",
  faviconUrl: "",
  primaryColor: "#f6c400",
  secondaryColor: "#05080a",
  backgroundColor: "#fffdf4",
  appAccessUrl: "https://app.lojacarroecasa.com.br",
  appAccessEnabled: false,
  appAccessLabel: "Acessar sistema",
};

export const defaultHero = {
  id: "main",
  title: "Produtos premium para cuidar do seu carro e da sua casa.",
  subtitle:
    "Marcas selecionadas, atendimento especializado e soluções de alta performance para limpeza, proteção e acabamento.",
  primaryButtonLabel: "Falar no WhatsApp",
  primaryButtonUrl: "",
  secondaryButtonLabel: "Ver Instagram",
  secondaryButtonUrl: "",
  badgeText: "+50 marcas premium",
  highlightText: "Atendimento especializado",
  imageUrl: "/generated/hero-care-studio.png",
  imageAlt:
    "Produtos premium de cuidado automotivo e limpeza organizados em estúdio",
};

export const defaultCarouselSlides = [
  {
    title: "Proteção, brilho e acabamento premium",
    subtitle:
      "Produtos selecionados para quem quer cuidar melhor do veículo, com orientação especializada.",
    imageUrl: "/generated/carousel-auto-care.png",
    imageAlt:
      "Carro preto com gotas de água e produtos automotivos genéricos sem marca",
    buttonLabel: "Falar sobre produtos automotivos",
    buttonUrl: "",
    isActive: true,
    order: 1,
  },
  {
    title: "Soluções práticas para o cuidado da casa",
    subtitle:
      "Itens para limpeza, conservação e proteção com a mesma curadoria premium da loja.",
    imageUrl: "/generated/carousel-home-care.png",
    imageAlt:
      "Bancada limpa com borrifadores genéricos, pano e esponja amarela",
    buttonLabel: "Falar sobre produtos para casa",
    buttonUrl: "",
    isActive: true,
    order: 2,
  },
];

export const defaultBrands = [
  {
    name: "Autolimpe",
    logoUrl: "/brand/logos/autolimpe.png",
    description: "Marca premium em destaque no mix da Carro & Casa.",
    officialUrl: "https://www.autolimpe.com/",
    isFeatured: true,
    order: 1,
  },
  {
    name: "Nasiol",
    logoUrl: "/brand/logos/nasiol.webp",
    description: "Soluções reconhecidas para proteção e acabamento.",
    officialUrl: "https://www.nasiol.com/",
    isFeatured: true,
    order: 2,
  },
  {
    name: "Vonixx",
    logoUrl: "/brand/logos/vonixx.webp",
    description: "Produtos para estética automotiva e cuidado profissional.",
    officialUrl: "https://www.vonixx.com.br/",
    isFeatured: true,
    order: 3,
  },
  {
    name: "Dimension",
    logoUrl: "/brand/logos/dimension.png",
    description: "Marca de cuidado automotivo em destaque.",
    officialUrl: "https://dimensioncarcare.com/",
    isFeatured: true,
    order: 4,
  },
];

export const defaultGoogleReviewSetting = {
  id: "main",
  isEnabled: true,
  sectionTitle: "Avaliações Google",
  sectionSubtitle:
    "A experiência de quem já conhece a Carro & Casa ajuda novos clientes a escolherem com confiança.",
  ratingAverage: 5,
  reviewCount: 0,
  googleProfileUrl: "https://share.google/2NRGZNwWO9DOtiIIt",
  reviewButtonLabel: "Avaliar no Google",
};

export const defaultGoogleReviews: Array<{
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  reviewUrl: string | null;
  isActive: boolean;
  order: number;
}> = [];

export const defaultCategories = [
  {
    name: "Cuidados automotivos",
    description:
      "Produtos para limpeza, proteção, brilho e conservação do seu veículo.",
    iconName: "Car",
    whatsappMessage:
      "Olá, gostaria de saber mais sobre produtos automotivos.",
    isActive: true,
    order: 1,
  },
  {
    name: "Estética profissional",
    description:
      "Soluções para detalhadores, lava-jatos e profissionais exigentes.",
    iconName: "Sparkles",
    whatsappMessage:
      "Olá, gostaria de saber mais sobre produtos para estética automotiva profissional.",
    isActive: true,
    order: 2,
  },
  {
    name: "Produtos para casa",
    description:
      "Itens selecionados para limpeza, cuidado e praticidade no dia a dia.",
    iconName: "Home",
    whatsappMessage: "Olá, gostaria de saber mais sobre produtos para casa.",
    isActive: true,
    order: 3,
  },
  {
    name: "Atendimento especializado",
    description:
      "Receba orientação para escolher o produto certo para sua necessidade.",
    iconName: "MessagesSquare",
    whatsappMessage:
      "Olá, vim pelo site da Carro & Casa e gostaria de atendimento.",
    isActive: true,
    order: 4,
  },
  {
    name: "Marcas premium",
    description: "Um mix selecionado com marcas reconhecidas no mercado.",
    iconName: "BadgeCheck",
    whatsappMessage:
      "Olá, gostaria de saber mais sobre marcas premium disponíveis.",
    isActive: true,
    order: 5,
  },
  {
    name: "Limpeza e proteção",
    description:
      "Soluções para manter superfícies protegidas, limpas e bem cuidadas.",
    iconName: "ShieldCheck",
    whatsappMessage:
      "Olá, gostaria de saber mais sobre limpeza e proteção.",
    isActive: true,
    order: 6,
  },
];

export const defaultFaqItems = [
  {
    question: "Vocês vendem produtos para estética automotiva profissional?",
    answer:
      "Sim. Trabalhamos com soluções para clientes finais e também para profissionais de estética automotiva, lava-jatos e detalhamento.",
    isActive: true,
    order: 1,
  },
  {
    question: "Vocês têm produtos para casa?",
    answer:
      "Sim. Além dos produtos automotivos, a Carro & Casa também oferece itens selecionados para cuidado, limpeza e conservação do lar.",
    isActive: true,
    order: 2,
  },
  {
    question: "Posso tirar dúvidas antes de comprar?",
    answer:
      "Sim. O atendimento pelo WhatsApp ajuda você a escolher o produto mais adequado para sua necessidade.",
    isActive: true,
    order: 3,
  },
  {
    question: "Quais marcas vocês trabalham?",
    answer:
      "A loja trabalha com mais de 50 marcas premium, incluindo Autolimpe, Nasiol, Vonixx e Dimension.",
    isActive: true,
    order: 4,
  },
  {
    question: "O atendimento é pelo WhatsApp?",
    answer:
      "Sim. Você pode clicar nos botões do site para iniciar o atendimento diretamente pelo WhatsApp.",
    isActive: true,
    order: 5,
  },
  {
    question: "Posso acompanhar novidades pelo Instagram?",
    answer:
      "Sim. Acompanhe o perfil oficial @lojacarroecasa para novidades, produtos e conteúdos da loja.",
    isActive: true,
    order: 6,
  },
];

export const defaultLegalPages = [
  {
    slug: "termos-de-uso",
    title: "Termos de Uso",
    content:
      "Estes Termos de Uso regulam o acesso ao site institucional da Carro & Casa. As informações apresentadas têm finalidade informativa e podem ser atualizadas a qualquer momento. O atendimento, disponibilidade de produtos, condições comerciais e demais detalhes são confirmados diretamente pelos canais oficiais da loja. Ao utilizar este site, você concorda em navegar de forma lícita, sem tentar comprometer sua segurança, disponibilidade ou integridade.",
    seoTitle: "Termos de Uso | Carro & Casa",
    seoDescription:
      "Termos de Uso do site institucional da Carro & Casa.",
  },
  {
    slug: "privacidade",
    title: "Política de Privacidade",
    content:
      "A Carro & Casa valoriza a privacidade dos visitantes. Este site pode coletar dados fornecidos voluntariamente, como mensagens enviadas por canais de contato, além de dados técnicos básicos de navegação. As informações são usadas para atendimento, melhoria da experiência e cumprimento de obrigações legais. Não vendemos dados pessoais. Para dúvidas sobre privacidade, entre em contato pelos canais oficiais da loja.",
    seoTitle: "Política de Privacidade | Carro & Casa",
    seoDescription:
      "Política de Privacidade em linguagem simples para visitantes da Carro & Casa.",
  },
];

export const defaultSeoSettings = [
  {
    page: "home",
    title: "Carro & Casa | Produtos premium para carro e casa",
    description:
      "Produtos premium para estética automotiva, limpeza, proteção, acabamento e cuidado da casa. Atendimento especializado pelo WhatsApp.",
    keywords:
      "Carro & Casa, estética automotiva, produtos automotivos, limpeza, proteção, Maceió",
    ogImageUrl: "/generated/hero-care-studio.png",
  },
  {
    page: "faq",
    title: "FAQ | Carro & Casa",
    description:
      "Dúvidas frequentes sobre atendimento, marcas e produtos da Carro & Casa.",
    keywords: "FAQ Carro & Casa, dúvidas, atendimento",
    ogImageUrl: "/generated/hero-care-studio.png",
  },
  {
    page: "termos-de-uso",
    title: "Termos de Uso | Carro & Casa",
    description: "Termos de Uso do site institucional da Carro & Casa.",
    keywords: "termos de uso, Carro & Casa",
    ogImageUrl: "/generated/hero-care-studio.png",
  },
  {
    page: "privacidade",
    title: "Política de Privacidade | Carro & Casa",
    description:
      "Política de Privacidade em linguagem simples para visitantes da Carro & Casa.",
    keywords: "privacidade, LGPD, Carro & Casa",
    ogImageUrl: "/generated/hero-care-studio.png",
  },
];
