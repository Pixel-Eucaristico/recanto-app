import { Book, Star, Sunset, Trees, Zap } from "lucide-react";

import Logo from "@/assets/img/logo.svg";

export const logoNavbar = {
  url: "",
  src: Logo.src,
  alt: "logo",
  title: "Recanto",
};

export const menuNavbar = [
  { title: "Início", url: "/" },
  {
    title: "Institucional",
    url: "#",
    items: [
      {
        title: "Quem Somos",
        description: "Conheça nossa história e missão",
        icon: Sunset,
        url: "#",
      },
      {
        title: "Nossa Senhora do Amor Misericordioso",
        description: "Conheça nossa Mãe e Padroeira",
        icon: Star, // ou Heart, Crown, etc.
        url: "/nossa-senhora",
      },
      {
        title: "Espiritualidade / Carisma",
        description: "Entenda nossa espiritualidade e carisma",
        icon: Trees,
        url: "/espritualidade",
      },
      {
        title: "Estrutura / Vida Comunitária",
        description: "Descubra nossa estrutura e vida comunitária",
        icon: Book,
        url: "#",
      },
    ],
  },
  {
    title: "Missão",
    url: "#",
    items: [
      {
        title: "Vocacional",
        description: "Acompanhe nosso processo de formação",
        icon: Zap,
        url: "#",
      },
      {
        title: "Ações / Projetos / Evangelização",
        description: "Participe de nossas ações e projetos",
        icon: Sunset,
        url: "#",
      },
    ],
  },
  {
    title: "Mídia",
    url: "#",
    items: [
      {
        title: "Blog",
        description: "Leia nossos artigos e notícias",
        icon: Trees,
        url: "#",
      },
      {
        title: "Redes Sociais",
        description: "Siga-nos nas redes sociais",
        icon: Book,
        url: "#",
      },
      {
        title: "Newsletter",
        description: "Inscreva-se para receber novidades",
        icon: Zap,
        url: "#",
      },
      {
        title: "Loja",
        description: "Conheça nossa loja online",
        icon: Sunset,
        url: "#",
      },
    ],
  },
  { title: "Doações", url: "#" },
  { title: "Contato", url: "#" },
  // {
  //   title: "Resources",
  //   url: "#",
  //   items: [
  //     {
  //       title: "Help Center",
  //       description: "Get all the answers you need right here",
  //       icon: Zap,
  //       url: "#",
  //     },
  //     {
  //       title: "Contact Us",
  //       description: "We are here to help you with any questions you have",
  //       icon: Sunset,
  //       url: "#",
  //     },
  //     {
  //       title: "Status",
  //       description: "Check the current status of our services and APIs",
  //       icon: Trees,
  //       url: "#",
  //     },
  //     {
  //       title: "Terms of Service",
  //       description: "Our terms and conditions for using our services",
  //       icon: Book,
  //       url: "#",
  //     },
  //   ],
  // },
];

export const mobileExtraLinksNavbar = [
  { name: "Press", url: "#" },
  { name: "Contact", url: "#" },
  { name: "Imprint", url: "#" },
  { name: "Sitemap", url: "#" },
];

export const authNavbar = {
  login: { text: "Log in", url: "#" },
  signup: { text: "Sign up", url: "#" },
};
