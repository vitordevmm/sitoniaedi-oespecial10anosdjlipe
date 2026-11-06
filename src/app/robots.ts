import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://sintoniaedicaoespecial.online";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/termos", "/llms.txt", "/llms-full.txt"],
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/perfil",
          "/perfil/",
          "/validar/",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "cohere-ai",
          "CCBot",
        ],
        allow: ["/", "/termos", "/llms.txt", "/llms-full.txt"],
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/perfil",
          "/perfil/",
          "/validar/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
