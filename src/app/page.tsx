import Hero from "./_components/Hero";
import TechStack from "./_components/TechStack";
import Projects from "./_components/Projects";
import Footer from "./_components/Footer";
import Blogs from "./_components/Blogs";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero />
        <TechStack />
        <Projects />
        <Blogs />
      </main>
      <Footer />
    </div>
  );
}
