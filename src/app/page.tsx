import Blogs from "@/components/Blogs";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12">
      <Hero />
      <Projects />
      <Blogs />
      <Footer />
    </main>
  );
}
