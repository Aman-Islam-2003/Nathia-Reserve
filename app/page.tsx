import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Numbers } from "@/components/Numbers";
import { Residences } from "@/components/Residences";
import { Register } from "@/components/Register";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Numbers />
        <Residences />
        <Register />
      </main>
      <Footer />
    </>
  );
}
