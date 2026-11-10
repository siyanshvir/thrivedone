import { Instagram, Mail, ExternalLink, GitBranch } from "lucide-react";
import { Link } from "react-router-dom";
import { changelogData } from "@/data/changelog";
import { useEffect, useMemo, useState } from "react";
import { ProductService } from "@/services/ProductService";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/vei.thrive/", label: "Instagram" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@vei.thriveee", label: "TikTok" },
  { icon: Mail, href: "mailto:contact@thrivewellness.com", label: "Email" },
];

export function Footer() {
  const latestVersion = changelogData[0];
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    ProductService.getCategories({ includeEmpty: false })
      .then(setCategories)
      .catch(console.error);
  }, []);

  const categoryLinks = useMemo(() => {
    const slugify = (cat: string) =>
      cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    return (categories || [])
      .filter((cat) => cat && cat !== "Supplements")
      .map((cat) => ({ label: cat, href: `/shop/${slugify(cat)}` }))
      .slice(0, 4);
  }, [categories]);

  return (
    <footer className="bg-black border-t border-white/10 text-white">
      {/* Main footer content */}
      <div className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <img src="/Thrive.png" alt="Thrive" className="h-14 w-auto object-contain self-start" />
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Premium wellness products designed for those who demand more from life.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            {/* Version badge */}
            <Link
              to="/changelog"
              className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors w-fit"
            >
              <GitBranch className="w-3 h-3" />
              <span>v{latestVersion.version}</span>
              <span className="text-white/20">—</span>
              <span className="truncate max-w-[160px]">{latestVersion.type}</span>
            </Link>
          </div>

          {/* Spacer */}
          <div className="lg:col-span-1 hidden lg:block" />

          {/* Product Lines */}
          {categoryLinks.length > 0 && (
            <div className="lg:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Shop</h4>
              <ul className="space-y-2.5">
                {categoryLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-sm text-white/60 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/team" className="text-sm text-white/60 hover:text-white transition-colors">Our Team</Link></li>
              <li><Link to="/newsletter" className="text-sm text-white/60 hover:text-white transition-colors">Newsletter</Link></li>
              <li><Link to="/changelog" className="text-sm text-white/60 hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><Link to="/faq" className="text-sm text-white/60 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="text-sm text-white/60 hover:text-white transition-colors">Shipping</Link></li>
              <li><Link to="/contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors">Team Login</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25 text-center sm:text-left">
            © 2025–2026 Thrive Wellness. All rights reserved. &nbsp;·&nbsp; Educational purposes only — not a real store.
          </p>
          <div className="flex items-center gap-5 text-xs text-white/30">
            <Link to="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
