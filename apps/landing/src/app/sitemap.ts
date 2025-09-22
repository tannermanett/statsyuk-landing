import { getBlogPosts } from "@/lib/blog";
import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPosts = await getBlogPosts();
  const headersList = await headers();
  let domain = headersList.get("host") as string;
  let protocol = "https";
  const basePath = "/landing";

  return [
    {
      url: `${protocol}://${domain}${basePath}`,
      lastModified: new Date(),
    },
    ...allPosts.map((post) => ({
      url: `${protocol}://${domain}${basePath}/blog/${post.slug}`,
      lastModified: new Date(),
    })),
  ];
}
