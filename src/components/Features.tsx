import { Zap, Shield, Leaf, Award, Truck, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Leaf,
    title: "100% Natural",
    description: "Pure, premium ingredients with no artificial fillers or additives.",
  },
  {
    icon: Shield,
    title: "Third-Party Tested",
    description: "Every batch verified for purity and potency by independent labs.",
  },
  {
    icon: Zap,
    title: "Fast Results",
    description: "Scientifically formulated for optimal absorption and effectiveness.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Manufactured in NSF-certified facilities with strict quality control.",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Complimentary delivery on all orders over $75 nationwide.",
  },
  {
    icon: HeartPulse,
    title: "Science-Backed",
    description: "Formulas developed with leading nutritional scientists.",
  },
];

export function Features() {
  return (
    <section id="science" className="py-24 bg-card relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-glacier/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-glacier/10 text-glacier text-sm font-medium mb-4">
            Why Choose Thrive
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            The <span className="text-gradient">Thrive</span> Difference
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to delivering the highest quality supplements that actually work.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "group p-8 rounded-2xl transition-all duration-300",
                "bg-background border border-border hover:border-primary/30",
                "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-glacier/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-glacier" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
