import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Heart, Leaf, Shield, Zap, Target, Users, Sparkles } from "lucide-react";
import { ProductService } from "@/services/ProductService";
import { CustomCursor } from "@/components/CustomCursor";
import { Navbar } from "@/components/Navbar";

export default function About() {
  const navigate = useNavigate();
  const [productCount, setProductCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const products = await ProductService.getAllProducts();
        const inStoreCount = products.filter(p => p.status === 'In Store').length;
        setProductCount(inStoreCount);
      } catch (error) {
        console.error('Error fetching product count:', error);
        setProductCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProductCount();
  }, []);

  const missionPillars = [
    {
      icon: Heart,
      title: "Health First",
      desc: "Every product we create is designed with your health and wellness at the forefront."
    },
    {
      icon: Leaf,
      title: "Sustainability",
      desc: "We're committed to reducing our environmental impact through sustainable materials and practices."
    },
    {
      icon: Shield,
      title: "Quality",
      desc: "From sourcing to manufacturing, we maintain the highest standards to deliver products you can trust."
    },
    {
      icon: Users,
      title: "Community",
      desc: "Building a community of wellness-minded individuals who support and inspire each other."
    },
  ];

  const stats = [
    { value: loading ? "..." : productCount.toString(), label: "Products Available" },
    { value: "1500+", label: "Products Sold" },
    { value: "500+", label: "Customers Served" },
    { value: "1", label: "Year Strong" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <CustomCursor />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        {/* Spotlight Effect */}
        <div className="absolute inset-0 z-[1]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-glacier/30 via-glacier/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-glacier" />
              <span className="text-sm font-medium tracking-wider uppercase">Our Story</span>
            </div>
            <h1
              className="font-display text-6xl md:text-9xl font-black mb-8 tracking-[0.2em] uppercase"
              data-cursor="EST. 2025"
              data-cursor-color="#2EB9DF"
            >
              THRIVE
            </h1>
            <p className="text-white/60 text-lg md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Advancing human potential through cleaner, smarter, and more sustainable wellness solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                variant="hero"
                size="lg"
                className="rounded-full px-12 py-8 bg-white text-black font-black hover:bg-glacier transition-all hover:scale-105"
                onClick={() => navigate('/shop')}
                data-cursor="View Shop"
                data-cursor-color="#ffffff"
              >
                <span className="text-white">Explore Products</span>
                <ArrowRight className="ml-2 w-6 h-6 text-white" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-12 py-8 border-2 border-white/20 hover:border-glacier hover:bg-glacier/5 hover:text-glacier transition-all duration-300 font-bold"
                onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}
                data-cursor="Read Mission"
                data-cursor-color="#2EB9DF"
              >
                Our Mission
              </Button>
            </div>
          </div>
        </div>

        <button
          onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 group"
          data-cursor="Scroll Down"
        >
          <ChevronDown className="w-10 h-10 text-white/40 group-hover:text-glacier transition-colors animate-bounce" />
        </button>
      </section>

      {/* Stats Section */}
      <section id="story" className="py-32 px-4 relative bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="group cursor-default" data-cursor={stat.label}>
                <div className="text-5xl md:text-7xl font-black text-white mb-4 group-hover:text-glacier transition-colors duration-500">
                  {stat.value}
                </div>
                <div className="text-white/40 text-sm uppercase tracking-[0.2em] font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-32 px-4 bg-black border-y border-white/20">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-[0.1em] uppercase" data-cursor="Our Why">The Drive</h2>
          <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-3xl mx-auto italic">
            "At Thrive, we believe wellness should be a birthright, not a luxury. We're here to bridge the gap between human performance and sustainable living."
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {missionPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="group bg-white/5 border border-white/40 rounded-3xl p-10 hover:border-glacier/40 transition-all duration-500 hover:-translate-y-4"
                data-cursor={pillar.title}
                data-cursor-color="#2EB9DF"
              >
                <div className="w-16 h-16 mb-8 rounded-2xl bg-glacier/10 border border-glacier/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <pillar.icon className="w-8 h-8 text-glacier" />
                </div>
                <h3 className="font-bold text-2xl mb-4 group-hover:text-glacier transition-colors">{pillar.title}</h3>
                <p className="text-white/50 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section - Redefined as "Commitment" */}
      <section className="py-32 px-4 bg-black border-b border-white/20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-12 tracking-[0.1em] uppercase cursor-pointer" data-cursor="Our Promise" data-cursor-color="#2EB9DF">Our Commitment</h2>
          <p className="text-white/60 text-lg mb-20 max-w-2xl mx-auto">
            We don't just sell products; we cultivate a lifestyle. Every member of our team is dedicated to your health and the health of our planet.
          </p>

          <div className="grid gap-8">
            <div
              className="bg-gradient-to-br from-glacier/10 via-transparent to-transparent border border-white/20 rounded-[3rem] p-12 md:p-20 text-left relative overflow-hidden"
              data-cursor="Quality First"
              data-cursor-color="#2EB9DF"
            >
              <div className="absolute top-0 right-0 p-8">
                <Shield className="w-32 h-32 text-white/[0.03] rotate-12" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-6 text-glacier tracking-wider uppercase">Lab Tested & Trusted</h3>
                <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-2xl">
                  Every batch of our supplements undergoes rigorous third-party laboratory testing to ensure purity,
                  strength, and safety. We believe in radical transparency—from sourcing to your front door.
                </p>
                <Button
                  variant="link"
                  className="p-0 text-white hover:text-glacier flex items-center gap-2 group"
                  onClick={() => navigate('/team')}
                >
                  Meet the team behind the quality
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            <div
              className="bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent border border-white/20 rounded-[3rem] p-12 md:p-20 text-left relative overflow-hidden"
              data-cursor="Planet Conscious"
              data-cursor-color="#10b981"
            >
              <div className="absolute top-0 right-0 p-8">
                <Leaf className="w-32 h-32 text-white/[0.03] -rotate-12" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-6 text-emerald-400 tracking-wider uppercase">Ethical Sourcing</h3>
                <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-2xl">
                  We partner with farmers and suppliers who share our dedication to environmental stewardship and fair labor.
                  By choosing Thrive, you're supporting a supply chain that respects both people and the planet.
                </p>
                <div className="flex gap-4">
                  <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold">100% Vegan</div>
                  <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold">Plastic Neutral</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black/5 blur-3xl rounded-full scale-150 -translate-y-1/2"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">Ready to <span className="text-glacier">Thrive</span>?</h2>
          <p className="text-white/60 mb-12 text-xl">
            Join 500+ wellness advocates who've already transformed their daily routine.
          </p>
          <Button
            variant="hero"
            size="lg"
            className="rounded-full px-12 py-8 bg-white text-black font-black hover:bg-glacier transition-all hover:scale-110 shadow-2xl shadow-glacier/20"
            asChild
            data-cursor="Enter Shop"
            data-cursor-color="#2EB9DF"
          >
            <Link to="/shop">
              <span className="text-white">Shop Now</span>
              <ArrowRight className="ml-2 w-6 h-6 text-white" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
