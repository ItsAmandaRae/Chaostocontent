import Header from '@/components/sections/Header';
import Hero from '@/components/sections/Hero';
import Logotypes from '@/components/sections/Logotypes';
import BentoGrid from '@/components/sections/BentoGrid';
import UseCases from '@/components/sections/UseCases';
import Achievements from '@/components/sections/Achievements';
import Testimonials from '@/components/sections/Testimonials';
import Pricing from '@/components/sections/Pricing';
import FAQ from '@/components/sections/FAQ';
import CTA from '@/components/sections/CTA';
import Footer from '@/components/sections/Footer';

const Index = () => {
  return (
    <div className="bg-white min-h-screen pt-20">
      <Header />
      <Hero />
      <Logotypes />
      <BentoGrid />
      <UseCases />
      <Achievements />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
