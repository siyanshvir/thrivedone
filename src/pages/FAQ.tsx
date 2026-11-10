import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Navbar } from "@/components/Navbar";

const faqs = [
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 5-7 business days within the US. Express shipping (2-3 business days) is available at checkout for an additional fee."
  },
  {
    question: "What is your return policy?",
    answer: "Since our products are tangible wellness items, we do not accept returns. However, if you receive a damaged or defective product, please contact us immediately for a replacement."
  },
  {
    question: "Are your products BPA-free?",
    answer: "Yes! All Thrive products are made with BPA-free, food-grade materials that are safe for everyday use."
  },
  {
    question: "How do I clean my water bottle?",
    answer: "Our bottles are dishwasher safe (top rack). For best results, we recommend hand washing with warm soapy water and letting it air dry."
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within the United States. We're working on expanding our shipping options to serve more customers worldwide."
  },

  {
    question: "What payment methods do you accept?",
    answer: "We accept Visa, MasterCard, American Express, Discover, and other major credit and debit cards. We also support bank transfers and digital payment methods."
  },
  {
    question: "Are the supplements vegan?",
    answer: "Our Surge IV electrolytes are vegan-friendly. Peak Protein contains whey protein, which is vegetarian but not vegan. Check individual product pages for detailed ingredient information."
  },
];

export default function FAQ() {
  usePageTitle("FAQ");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-black">

      <main className="flex-1 pt-44 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto pt-10">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center">
              Frequently Asked <span className="text-glacier">Questions</span>
            </h1>
            <p className="text-muted-foreground text-lg text-center mb-12">
              Got questions? We've got answers.
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="glass rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold text-lg">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-glacier transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-48" : "max-h-0"
                      }`}
                  >
                    <p className="px-6 pb-5 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">Still have questions?</p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-glacier hover:underline font-medium"
              >
                Contact our support team →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
