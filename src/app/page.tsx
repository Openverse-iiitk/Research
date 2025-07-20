import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Opportunities } from "@/components/opportunities";
import { Statistics } from "@/components/statistics";
import { BlogSection } from "@/components/blog-section";
import { AboutUs } from "@/components/about-us";

export default function Home() {
  return (
    <main>
      <Hero />
      <section id="features">
        <Features />
      </section>
      <section id="opportunities">
        <Opportunities />
      </section>
      <section id="statistics">
        <Statistics />
      </section>
      <section id="blog">
        <BlogSection />
      </section>
      <section id="team">
        <AboutUs />
      </section>
    </main>
  );
}
