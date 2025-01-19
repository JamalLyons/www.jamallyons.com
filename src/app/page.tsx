import Hero from "./components/Hero";
import Technologies from "./components/Technologies";
import Projects from "./components/Projects";
import Blogs from "./components/Blogs";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12">
      <Hero />
      <Projects />
      <Technologies />
      <Blogs />
      <Footer />
    </main>
  );
}
