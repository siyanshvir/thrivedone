import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check, FileText, Download, Bell, Sparkles, Send } from "lucide-react";
import { useState } from "react";
import { CustomCursor } from "@/components/CustomCursor";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            console.log(`Saved email to newsletter_subscribers.txt: ${email}`);
            setSubmitted(true);
        }
    };

    const newsletters = [
        {
            title: "January Edition",
            date: "January 2026",
            description: "New year, new wellness goals! Discover our latest products and exclusive offers.",
            file: "/newsletters/January Newsletter.pdf"
        },
        {
            title: "Holiday Update",
            date: "November 2025",
            description: "Latest product updates, wellness tips, and exclusive offers for the holiday season.",
            file: "/newsletters/November Newsletter.pdf"
        },
        {
            title: "Fall Collection",
            date: "October 2025",
            description: "Fall wellness guide, new product launches, and special promotions.",
            file: "/newsletters/October Newsletter.pdf"
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
            <CustomCursor />

            {/* Hero Section */}
            <section className="relative min-h-[80vh] w-full flex items-center justify-center overflow-hidden bg-black pt-40 pb-20">
                {/* Spotlight Effect */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-glacier/20 via-glacier/5 to-transparent rounded-full blur-3xl"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                </div>

                <div className="container relative z-10 mx-auto px-4 text-center">
                    {!submitted ? (
                        <div className="max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
                                <Sparkles className="w-4 h-4 text-glacier" />
                                <span className="text-sm font-medium tracking-wider uppercase">Stay Updated</span>
                            </div>

                            <h1 className="font-display text-5xl md:text-8xl font-black mb-8 tracking-[0.1em] uppercase">
                                Thrive <span className="text-glacier italic">Monthly</span>
                            </h1>

                            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed tracking-wide">
                                Join our inner circle for exclusive early access to product launches
                                and curated wellness tips.
                            </p>

                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto p-2 rounded-2xl sm:rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="flex-1 flex items-center px-4">
                                    <Mail className="w-5 h-5 text-white/40 mr-3" />
                                    <Input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-lg"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="rounded-xl sm:rounded-full px-10 py-6 bg-glacier text-white font-bold hover:bg-glacier/90 transition-all hover:scale-[1.02]"
                                    data-cursor="Join the list"
                                    data-cursor-color="#2EB9DF"
                                >
                                    <span className="text-white">Subscribe</span>
                                    <Send className="ml-2 w-4 h-4 text-white" />
                                </Button>
                            </form>

                            <div className="flex items-center justify-center gap-6 mt-12 text-white/40 text-sm">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-glacier" />
                                    <span>Monthly tips</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-glacier" />
                                    <span>Early access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-glacier" />
                                    <span>No spam</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto py-20 animate-scale-in">
                            <div className="w-24 h-24 rounded-3xl bg-glacier/20 border border-glacier/30 flex items-center justify-center mx-auto mb-8">
                                <Check className="w-12 h-12 text-glacier" />
                            </div>

                            <h1 className="font-display text-5xl md:text-6xl font-black mb-6 tracking-[0.1em] uppercase">You're on the list!</h1>

                            <p className="text-xl text-white/60 mb-12 leading-relaxed">
                                Welcome to the community. We've sent a confirmation email to <span className="text-white font-medium">{email}</span>.
                            </p>

                            <Button
                                variant="outline"
                                onClick={() => { setSubmitted(false); setEmail(""); }}
                                className="rounded-full px-10 py-6 border-white/10 hover:bg-white/5 text-lg"
                            >
                                Send another
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Past Issues Section */}
            <section className="py-32 px-4 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-[0.1em] uppercase cursor-pointer" data-cursor="Newsletter History" data-cursor-color="#2EB9DF">The Archives</h2>
                            <p className="text-white/50 text-xl leading-relaxed">
                                Missed an edition? Browse our past newsletters for wellness inspiration
                                and company milestones.
                            </p>
                        </div>
                        <div className="w-20 h-1 bg-glacier mb-4" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {newsletters.map((newsletter, index) => (
                            <div
                                key={index}
                                className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-glacier/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                                data-cursor={`View ${newsletter.title}`}
                                data-cursor-color="#2EB9DF"
                            >
                                {/* Decorative elements */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-glacier/5 rounded-full blur-3xl group-hover:bg-glacier/10 transition-colors"></div>

                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                        <FileText className="w-7 h-7 text-glacier" />
                                    </div>

                                    <div className="mb-8">
                                        <p className="text-glacier text-sm font-bold tracking-widest uppercase mb-2">{newsletter.date}</p>
                                        <h3 className="text-2xl font-bold mb-4">{newsletter.title}</h3>
                                        <p className="text-white/60 leading-relaxed">
                                            {newsletter.description}
                                        </p>
                                    </div>

                                    <a
                                        href={newsletter.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-white font-bold group/link"
                                        data-cursor="Download PDF"
                                        data-cursor-color="#2EB9DF"
                                    >
                                        <span className="relative">
                                            Download Issue
                                            <span className="absolute bottom-0 left-0 w-full h-px bg-glacier transform scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left"></span>
                                        </span>
                                        <Download className="w-5 h-5 group-hover/link:translate-y-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
