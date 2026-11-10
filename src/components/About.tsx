import { Button } from "@/components/ui/button";
import { ArrowRight, Mountain, Snowflake, Target } from "lucide-react";

export function About() {
  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Story
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Born in the{" "}
              <span className="text-gradient">Mountains</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Thrive was founded with a simple mission: create wellness products that actually deliver results. Inspired by the pristine power of glacial landscapes, we set out to formulate supplements as pure and powerful as nature itself.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Every product is meticulously crafted using the finest ingredients, backed by science, and tested rigorously to ensure you get nothing but the best.
            </p>

            {/* Values */}
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <Mountain className="w-8 h-8 text-glacier mx-auto mb-2" />
                <p className="font-display font-bold text-foreground">Purity</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <Snowflake className="w-8 h-8 text-glacier mx-auto mb-2" />
                <p className="font-display font-bold text-foreground">Quality</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <Target className="w-8 h-8 text-glacier mx-auto mb-2" />
                <p className="font-display font-bold text-foreground">Results</p>
              </div>
            </div>

            <Button variant="hero" size="lg" className="rounded-full">
              Learn More About Us
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-card to-muted">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-glacier/10 to-transparent" />
              
              {/* Stats overlay */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
                <div className="glass rounded-2xl p-8 max-w-sm">
                  <p className="text-6xl md:text-7xl font-display font-bold text-foreground mb-2">
                    2019
                  </p>
                  <p className="text-lg text-muted-foreground mb-6">Founded</p>
                  
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
                    <div>
                      <p className="text-3xl font-display font-bold text-glacier">50K+</p>
                      <p className="text-sm text-muted-foreground">Customers</p>
                    </div>
                    <div>
                      <p className="text-3xl font-display font-bold text-glacier">12</p>
                      <p className="text-sm text-muted-foreground">Products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating decoration */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-glacier/20 blur-2xl animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-primary/20 blur-2xl animate-pulse delay-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
