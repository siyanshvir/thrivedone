import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Fitness Coach",
    content: "Iceberg has completely transformed my morning routine. The mental clarity I get is unmatched - I can focus for hours without the jitters.",
    rating: 5,
    product: "Iceberg",
  },
  {
    name: "Michael R.",
    role: "Marathon Runner",
    content: "Peak Protein is the cleanest protein I've ever used. No bloating, no weird aftertaste. Just pure gains.",
    rating: 5,
    product: "Peak Protein",
  },
  {
    name: "Emma L.",
    role: "Yoga Instructor",
    content: "Glacier has helped me achieve the deepest sleep of my life. I wake up feeling refreshed and ready to take on anything.",
    rating: 5,
    product: "Glacier",
  },
];

export function Testimonials() {
  return (
    <section id="stories" className="py-24 bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-glacier/10 text-glacier text-sm font-medium mb-4">
            Success Stories
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Real People, <span className="text-gradient">Real Results</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who've transformed their wellness journey with Thrive.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={cn(
                "group p-8 rounded-2xl transition-all duration-300",
                "bg-background border border-border hover:border-primary/30",
                "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-glacier/30 mb-4" />

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-glacier/10 text-glacier text-xs font-medium">
                  {testimonial.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
