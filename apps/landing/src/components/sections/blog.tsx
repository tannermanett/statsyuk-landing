import BlogCard from "@/components/blog-card";
import Section from "@/components/section";
import Particles from "@/components/magicui/particles";
import { getBlogPosts } from "@/lib/blog";

export default async function BlogSection() {
  const allPosts = await getBlogPosts();

  const articles = await Promise.all(
    allPosts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  );

  return (
    <Section title="Blog" subtitle="Latest Articles" background={
      <Particles
        className="absolute inset-0"
        quantity={140}
        color={"#ba9343"}
        size={1}
        ease={40}
        staticity={60}
        vx={0.05}
        vy={0.02}
      />
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((data, idx) => (
          <BlogCard key={data.slug} data={data} priority={idx <= 1} />
        ))}
      </div>
    </Section>
  );
}
