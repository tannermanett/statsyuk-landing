import React from "react";
import Image from "next/image";
import { FaTwitter, FaLinkedin } from "react-icons/fa";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Statsyuk",
  description: "Turn any hockey video into powerful insights for families, players, and coaches",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["SaaS", "Template", "Next.js", "React", "Tailwind CSS"],
  links: {
    email: "info@statsyuk.com",
    twitter: "https://twitter.com/statsyuk",
    discord: "https://discord.gg/statsyuk",
    github: "https://github.com/statsyuk",
    instagram: "https://instagram.com/statsyuk/",
    calendar: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Statsyuk%20intro%20call&details=I%27d%20like%20to%20learn%20more%20about%20Statsyuk&location=Google%20Meet&add=tanner%40statsyuk.ca,noah%40statsyuk.ca",
  },
  header: [
    {
      trigger: "Features",
      content: {
        main: {
          icon: <Image src="/logo.webp" alt="logo" width={24} height={24} className="h-6 w-6" />,
          title: "Product Overview",
          description: "See key parts of the product at a glance.",
          href: "#value",
        },
        items: [
          {
            href: "#value",
            title: "AI Pipeline",
            description: "Multi‑stage computer vision for precise tracking.",
          },
          {
            href: "#demo",
            title: "Demo Video",
            description: "Watch how we turn hockey video into insights.",
          },
          {
            href: "#nhl",
            title: "Pro‑Level Speed",
            description: "Compare to the game&apos;s best — built for youth.",
          },
          {
            href: "#advantage",
            title: "Broadcast Overlays",
            description: "Software‑only overlays on ice and boards.",
          },
          {
            href: "#who",
            title: "Who It’s For",
            description: "Players, coaches, parents, scouts, agents, teams.",
          },
        ],
      },
    },
    {
      trigger: "Solutions",
      content: {
        items: [
          {
            title: "Players",
            href: "#who",
            description: "See progress and set reachable goals.",
          },
          {
            title: "Coaches",
            href: "#who",
            description: "Evaluate, explain decisions, build trust.",
          },
          {
            title: "Parents",
            href: "#who",
            description: "Stay connected to goals and development.",
          },
          {
            title: "Teams",
            href: "#who",
            description: "Benchmark and align development across seasons.",
          },
          {
            title: "Waitlist",
            href: "#waitlist",
            description: "Be first to access the private beta.",
          },
        ],
      },
    },
    {
      href: "https://www.linkedin.com/company/statsyukanalytics",
      label: "LinkedIn",
      icon: <FaLinkedin />,
    },
    {
      href: "https://x.com/StatsyukHockey",
      label: "Twitter",
      icon: <FaTwitter />,
    },
  ],
  pricing: [
    {
      name: "BASIC",
      href: "#",
      price: "$19",
      period: "month",
      yearlyPrice: "$16",
      features: [
        "1 User",
        "5GB Storage",
        "Basic Support",
        "Limited API Access",
        "Standard Analytics",
      ],
      description: "Perfect for individuals and small projects",
      buttonText: "Subscribe",
      isPopular: false,
    },
    {
      name: "PRO",
      href: "#",
      price: "$49",
      period: "month",
      yearlyPrice: "$40",
      features: [
        "5 Users",
        "50GB Storage",
        "Priority Support",
        "Full API Access",
        "Advanced Analytics",
      ],
      description: "Ideal for growing businesses and teams",
      buttonText: "Subscribe",
      isPopular: true,
    },
    {
      name: "ENTERPRISE",
      href: "#",
      price: "$99",
      period: "month",
      yearlyPrice: "$82",
      features: [
        "Unlimited Users",
        "500GB Storage",
        "24/7 Premium Support",
        "Custom Integrations",
        "AI-Powered Insights",
      ],
      description: "For large-scale operations and high-volume users",
      buttonText: "Subscribe",
      isPopular: false,
    },
  ],
  faqs: [
    {
      question: "What is Statsyuk?",
      answer: (
        <span>
          Statsyuk is an AI-powered platform that turns any hockey video into powerful insights 
          for families, players, and coaches. No extra hardware required - just upload your 
          game footage and get automatic analysis.
        </span>
      ),
    },
    {
      question: "How can I get started with Statsyuk?",
      answer: (
        <span>
          Join our waitlist to be the first to access the private beta. We&apos;re currently 
          piloting with elite minor and junior programs across North America, with a full 
          launch coming soon.
        </span>
      ),
    },
    {
      question: "What types of insights does Statsyuk provide?",
      answer: (
        <span>
          Statsyuk tracks every shift and surfaces insights you won&apos;t find in a box score. 
          We analyze player performance, development trends, and provide objective data 
          to help players improve and coaches make better decisions.
        </span>
      ),
    },
    {
      question: "Is Statsyuk suitable for all skill levels?",
      answer: (
        <span>
          Yes, Statsyuk is designed for youth hockey players, junior programs, coaches, 
          and parents. Our platform makes pro-level insights accessible to every family, 
          player, and coach regardless of skill level.
        </span>
      ),
    },
    {
      question: "What kind of support does Statsyuk provide?",
      answer: (
        <span>
          Statsyuk provides comprehensive support including documentation, video tutorials, 
          and dedicated customer support. We’re committed to helping hockey families 
          understand and use our insights effectively.
        </span>
      ),
    },
  ],
  footer: [
    {
      title: "Social",
      links: [
        {
          href: "https://www.linkedin.com/company/statsyukanalytics",
          text: "LinkedIn",
          icon: <FaLinkedin />,
        },
        {
          href: "https://x.com/StatsyukHockey",
          text: "Twitter",
          icon: <FaTwitter />,
        },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;
