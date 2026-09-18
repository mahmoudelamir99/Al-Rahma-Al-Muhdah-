import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import JobsSection from "@/components/JobsSection";
import Footer from "@/components/Footer";
import RequestJobSection from "@/components/RequestJobSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <RequestJobSection />
        <JobsSection />
      </main>
      <Footer />
    </>
  );
}
