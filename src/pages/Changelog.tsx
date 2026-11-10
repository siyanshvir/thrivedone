import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Wrench, Rocket, Bug, Zap } from "lucide-react";
import { publicChangelogData } from "@/data/changelog";
import { usePageTitle } from "@/hooks/usePageTitle";

const typeConfig: { [key: string]: { color: string; icon: any; bg: string } } = {
    "Major Update": { color: "text-purple-400", icon: Rocket, bg: "bg-purple-500/10 border-purple-500/20" },
    "Major Updates": { color: "text-purple-400", icon: Rocket, bg: "bg-purple-500/10 border-purple-500/20" },
    "Infrastructure Migration": { color: "text-indigo-400", icon: Zap, bg: "bg-indigo-500/10 border-indigo-500/20" },
    "UI/UX Improvements": { color: "text-blue-400", icon: Sparkles, bg: "bg-blue-500/10 border-blue-500/20" },
    "Team Page & Infrastructure": { color: "text-emerald-400", icon: Zap, bg: "bg-emerald-500/10 border-emerald-500/20" },
    "Minor Updates": { color: "text-cyan-400", icon: Wrench, bg: "bg-cyan-500/10 border-cyan-500/20" },
    "Minor Fixes": { color: "text-amber-400", icon: Bug, bg: "bg-amber-500/10 border-amber-500/20" },
    "Bug fixes and patches": { color: "text-amber-400", icon: Bug, bg: "bg-amber-500/10 border-amber-500/20" },
    "Stable Release": { color: "text-green-400", icon: Sparkles, bg: "bg-green-500/10 border-green-500/20" },
    "Dev Push": { color: "text-orange-400", icon: Rocket, bg: "bg-orange-500/10 border-orange-500/20" },
    "Initial Launch": { color: "text-pink-400", icon: Rocket, bg: "bg-pink-500/10 border-pink-500/20" },
    "Supabase Tweaks and General Product Management Updates": { color: "text-indigo-400", icon: Wrench, bg: "bg-indigo-500/10 border-indigo-500/20" },
    "Updates": { color: "text-sky-400", icon: Wrench, bg: "bg-sky-500/10 border-sky-500/20" },
};

export default function Changelog() {
    usePageTitle("Changelog");
    const changes = publicChangelogData;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 lg:px-8 py-12">

                {/* Back Button */}
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>

                <div className="max-w-3xl mx-auto">
                    <h1 className="font-display text-4xl font-bold mb-2">Changelog</h1>
                    <p className="text-muted-foreground mb-12">
                        Track our latest updates, improvements, and releases.
                    </p>

                    <div className="space-y-12">
                        {changes.map((change, index) => {
                            const config = typeConfig[change.type] || { color: "text-gray-400", icon: Wrench, bg: "bg-gray-500/10 border-gray-500/20" };
                            const Icon = config.icon;
                            const isLatest = index === 0;

                            return (
                                <div key={change.version} className={`relative pl-8 border-l-2 ${isLatest ? 'border-primary' : 'border-border/50'}`}>
                                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${isLatest ? 'bg-primary' : 'bg-muted'} flex items-center justify-center`}>
                                        {isLatest && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <h2 className={`text-2xl font-bold font-display ${isLatest ? 'text-primary' : ''}`}>v{change.version}</h2>
                                        <Badge variant="outline" className={`text-xs ${config.bg} ${config.color} border`}>
                                            <Icon className="w-3 h-3 mr-1" />
                                            {change.type}
                                        </Badge>
                                        {isLatest && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Latest</Badge>}
                                        <span className="text-sm text-muted-foreground ml-auto">
                                            {change.date}
                                        </span>
                                    </div>

                                    <ul className="space-y-2">
                                        {change.items.map((item, i) => (
                                            <li key={i} className="text-muted-foreground flex items-start gap-3">
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
