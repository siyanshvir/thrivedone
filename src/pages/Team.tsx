import { useEffect, useRef, useState } from "react";
import { CustomCursor } from "@/components/CustomCursor";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Team images from local public folder
const teamImageUrls: { [key: string]: string } = {
  "AlexWohlfahrt": "/team/AlexWohlfahrt.jpg",
  "AliceHo": "/team/AliceHo.jpg",
  "AnshJain": "/team/AnshJain.jpg",
  "CarterShaw": "/team/CarterShaw.jpg",
  "DumitruBusuioc": "/team/DumitruBusuioc.jpg",
  "EshanviSharma": "/team/EshanviSharma.jpg",
  "EthanHsu": "/team/EthanHsu.jpg",
  "GraceHelbing": "/team/GraceHelbing.jpg",
  "HitaKhandelwal": "/team/HitaKhandelwal.jpg",
  "IshaanManoor": "/team/IshaanManoor.jpg",
  "LilyElsea": "/team/LilyElsea.jpg",
  "MacyEvans": "/team/MacyEvans.jpg",
  "MaryHoward": "/team/MaryHoward.jpg",
  "MunisKodirova": "/team/MunisKodirova.jpg",
  "ReeceClavey": "/team/ReeceClavey.jpg",
  "RonikaGajulapalli": "/team/RonikaGajulapalli.jpg",
  "RyanLucas": "/team/RyanLucas.jpg",
  "SiyanshVirmani": "/team/SiyanshVirmani.jpg",
  "VinanyaPenumadula": "/team/VinanyaPenumadula.jpg",
};

const allTeamImages = [
  teamImageUrls["AliceHo"], teamImageUrls["LilyElsea"], teamImageUrls["HitaKhandelwal"],
  teamImageUrls["MacyEvans"], teamImageUrls["MaryHoward"], teamImageUrls["VinanyaPenumadula"],
  teamImageUrls["AnshJain"], teamImageUrls["SiyanshVirmani"], teamImageUrls["AlexWohlfahrt"],
  teamImageUrls["RonikaGajulapalli"], teamImageUrls["GraceHelbing"],
  teamImageUrls["DumitruBusuioc"], teamImageUrls["IshaanManoor"], teamImageUrls["ReeceClavey"],
  teamImageUrls["EshanviSharma"], teamImageUrls["CarterShaw"], teamImageUrls["EthanHsu"],
  teamImageUrls["MunisKodirova"], teamImageUrls["RyanLucas"]
];

const teamData = {
  leadership: [
    { name: "Alice Ho", role: "CEO", img: teamImageUrls["AliceHo"], bio: "Leading Thrive's vision with passion for wellness.", department: "leadership" },
    { name: "Lily Elsea", role: "CFO", img: teamImageUrls["LilyElsea"], bio: "Overseeing financial strategy and growth.", department: "accounting" },
    { name: "Hita Khandelwal", role: "CDO", img: teamImageUrls["HitaKhandelwal"], bio: "Shaping visual identity and UX.", department: "creative" },
    { name: "Macy Evans", role: "CAO", img: teamImageUrls["MacyEvans"], bio: "Ensuring operational excellence.", department: "leadership" },
    { name: "Mary Howard", role: "CMO", img: teamImageUrls["MaryHoward"], bio: "Driving brand awareness.", department: "marketing" },
    { name: "Vinanya Penumadula", role: "CSO", img: teamImageUrls["VinanyaPenumadula"], bio: "Leading sales initiatives.", department: "sales" },
  ],
  departments: [
    {
      name: "Accounting",
      members: [
        { name: "Ansh Jain", role: "Financial Analyst", img: teamImageUrls["AnshJain"], bio: "Crunching numbers and forecasting growth with precision." },
        { name: "Siyansh Virmani", role: "Accountant", img: teamImageUrls["SiyanshVirmani"], bio: "Keeping the books balanced and the finances flowing." },
        { name: "Alex Wohlfahrt", role: "Financial Associate", img: teamImageUrls["AlexWohlfahrt"], bio: "Supporting financial operations with attention to detail." },
      ]
    },
    {
      name: "Creative",
      members: [
        { name: "Ronika Gajulapalli", role: "Graphic Designer", img: teamImageUrls["RonikaGajulapalli"], bio: "Bringing bold ideas to life through stunning visuals." },
        { name: "Grace Helbing", role: "Graphic Designer", img: teamImageUrls["GraceHelbing"], bio: "Crafting seamless experiences that users love." },
      ]
    },
    {
      name: "Sales",
      members: [
        { name: "Dumitru Busuioc", role: "Sales Rep", img: teamImageUrls["DumitruBusuioc"], bio: "Building relationships and closing deals with confidence." },
        { name: "Ishaan Manoor", role: "Sales Person", img: teamImageUrls["IshaanManoor"], bio: "Driving revenue and connecting with customers." },
      ]
    },
    {
      name: "Marketing",
      members: [
        { name: "Reece Clavey", role: "Marketing Specialist", img: teamImageUrls["ReeceClavey"], bio: "Creating campaigns that resonate and convert." },
        { name: "Eshanvi Sharma", role: "Digital Marketer", img: teamImageUrls["EshanviSharma"], bio: "Mastering social media and digital engagement." },
        { name: "Carter Shaw", role: "Content Strategist", img: teamImageUrls["CarterShaw"], bio: "Telling stories that captivate and inspire action." },
      ]
    },
    {
      name: "HR",
      members: [
        { name: "Ethan Hsu", role: "HR Specialist", img: teamImageUrls["EthanHsu"], bio: "Nurturing talent and fostering a positive culture." },
        { name: "Munis Kodirova", role: "Talent Acquisition", img: teamImageUrls["MunisKodirova"], bio: "Finding the best people to join our mission." },
        { name: "Ryan Lucas", role: "HR Coordinator", img: teamImageUrls["RyanLucas"], bio: "Keeping the team organized and supported." },
      ]
    },
  ]
};

const departmentCardColors: { [key: string]: string } = {
  "Accounting": "from-green-500/20 to-emerald-700/40",
  "Creative": "from-blue-500/20 to-indigo-700/40",
  "Sales": "from-purple-500/20 to-violet-700/40",
  "Marketing": "from-pink-500/20 to-rose-700/40",
  "HR": "from-orange-400/20 to-amber-600/40",
};

const departmentColors: { [key: string]: string } = {
  "Accounting": "#10b981",  // emerald-500
  "Creative": "#3b82f6",    // blue-500
  "Sales": "#a855f7",       // purple-500
  "Marketing": "#ec4899",   // pink-500
  "HR": "#fb923c",          // orange-400
};

export default function Team() {
  const heroRef = useRef<HTMLElement>(null);
  const trailImagesRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mouse trail effect for hero section - images fall off page - Desktop only
  useEffect(() => {
    // Skip mouse trail on touch devices / small screens
    const isTouch = window.matchMedia?.('(pointer: coarse)').matches;
    const isSmallDevice = window.innerWidth < 768;
    if (isTouch || isSmallDevice) return;

    const hero = heroRef.current;
    const trailContainer = trailImagesRef.current;
    if (!hero || !trailContainer) return;

    let imageIndex = 0;
    let lastX = 0;
    let lastY = 0;
    const gap = 120; // Increased gap to give images time to load
    const imageCache = new Map<string, string>();
    const loadedImages = new Set<string>();
    let imagesPreloaded = false;

    // Pre-cache all images with proper loading
    const preloadImages = async () => {
      const loadPromises = allTeamImages.map(url => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            loadedImages.add(url);
            imageCache.set(url, url);
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${url}`);
            // Extract filename for debugging
            const filename = url.split('/').pop();
            console.warn(`Missing file: ${filename}`);
            resolve(); // Still resolve so we can continue
          };
          img.src = url;
        });
      });

      try {
        await Promise.all(loadPromises);
        imagesPreloaded = true;
        console.log(`Preloaded ${loadedImages.size} team images for mouse trail`);
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };

    preloadImages();

    const handleMouseMove = (e: MouseEvent) => {
      // Skip if images aren't preloaded yet
      if (!imagesPreloaded || loadedImages.size === 0) return;

      const rect = hero.getBoundingClientRect();

      // Check if mouse is within hero section (accounting for scroll)
      const isInHero = e.clientY >= rect.top && e.clientY <= rect.bottom;

      if (!isInHero) return;

      const distance = Math.sqrt(
        Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2)
      );

      if (distance > gap) {
        lastX = e.clientX;
        lastY = e.clientY;

        // Only use images that are fully loaded
        const loadedImageUrls = allTeamImages.filter(url => loadedImages.has(url));
        if (loadedImageUrls.length === 0) return; // Skip if no images loaded yet

        const imageUrl = loadedImageUrls[imageIndex % loadedImageUrls.length];
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'trail-image';
        const randomRotation = Math.random() * 30 - 15;
        const driftX = 140 + Math.random() * 260;
        const fallDistance = window.innerHeight + 200;

        img.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: 140px;
          height: 140px;
          object-fit: cover;
          object-position: center 30%;
          pointer-events: none;
          z-index: 50;
          transform: translate(-50%, -50%) scale(0) rotate(0deg);
          opacity: 0;
          border-radius: 15px;
          box-shadow: 0 15px 30px rgba(0,0,0,0.5);
          will-change: transform, opacity;
        `;

        trailContainer.appendChild(img);
        imageIndex++;

        // Appear animation - slower
        requestAnimationFrame(() => {
          img.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
          img.style.transform = `translate(-50%, -50%) scale(1) rotate(${randomRotation}deg)`;
          img.style.opacity = '0.9';
        });

        // Fall off page animation - much slower
        setTimeout(() => {
          img.style.transition = 'transform 2s ease-in, opacity 1.2s ease-in';
          img.style.transform = `translate(calc(-50% + ${driftX}px), calc(-50% + ${fallDistance}px)) scale(0.6) rotate(${randomRotation + (Math.random() * 60 - 30)}deg)`;
          img.style.opacity = '0';
          setTimeout(() => {
            if (img.parentNode) {
              img.remove();
            }
          }, 2000);
        }, 100);
      }
    };

    // Use throttled mouse move for better performance
    let ticking = false;
    const throttledMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleMouseMove(e);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', throttledMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      // Clean up any remaining trail images
      const trailImages = trailContainer.querySelectorAll('.trail-image');
      trailImages.forEach(img => img.remove());
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {!isMobile && <CustomCursor />}
      <div ref={trailImagesRef} className="pointer-events-none fixed inset-0 z-50" />

      {/* Hero with mouse trail */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-black border-b border-white/20">
        {/* Single blue spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_600px_at_50%_30%,rgba(100,180,255,0.15)_0%,transparent_70%)]" />

        <div className="relative z-10 text-center px-4">
          <p className="text-glacier text-sm tracking-[0.4em] uppercase mb-6 font-medium">The People Behind</p>
          <h1 className="text-7xl md:text-9xl font-black tracking-[0.08em] mb-8 animate-fade-in">
            THRIVE
          </h1>
          <p className="text-xl text-white/60 max-w-md mx-auto font-light">
            A passionate team dedicated to revolutionizing wellness
          </p>
        </div>

        <button
          onClick={() => document.getElementById('leadership')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20"
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </button>
      </section>

      {/* Leadership */}
      <section id="leadership" className="py-32 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-wide">Leadership</h2>
            <div className="w-20 h-1 bg-glacier mx-auto" />
          </div>

          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
              {teamData.leadership.map((person, i) => (
                <div
                  key={person.name}
                  className="group w-full max-w-[260px] animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  {...(!isMobile && { 'data-cursor': person.bio })}
                  onClick={() => {
                    const sectionId = person.department.toLowerCase();
                    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/5 transition-all duration-300 hover:border-glacier/30">
                    <div className="aspect-[3/4] overflow-hidden bg-gray-900">
                      <img
                        src={person.img}
                        alt={person.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                      <h4 className="font-bold text-lg">{person.name}</h4>
                      <p className="text-glacier/80 text-sm">{person.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          {teamData.departments.map((dept, deptIdx) => (
            <div key={dept.name} id={dept.name.toLowerCase()} className="mb-32 last:mb-0 scroll-mt-24">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-6xl font-black text-white/10">{String(deptIdx + 1).padStart(2, '0')}</span>
                  <h3 className="text-3xl md:text-4xl font-bold tracking-wide">{dept.name}</h3>
                </div>
                <p className="text-white/40 text-sm">{dept.members.length} members</p>
              </div>

              <div className="flex justify-center">
                <div className={cn(
                  "grid gap-6 justify-items-center",
                  dept.members.length === 2 ? "grid-cols-2 max-w-[540px]" : "grid-cols-2 md:grid-cols-3"
                )}>
                  {dept.members.map((member) => (
                    <div
                      key={member.name}
                      className="group w-full max-w-[260px]"
                      {...(!isMobile && {
                        'data-cursor': member.bio,
                        'data-cursor-color': departmentColors[dept.name]
                      })}
                    >
                      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${departmentCardColors[dept.name]} border border-white/10 transition-all duration-300 hover:border-white/30 hover:scale-105`}>
                        <div className="aspect-[3/4] overflow-hidden">
                          <img
                            src={member.img}
                            alt={member.name}
                            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                          <h4 className="font-bold text-lg">{member.name}</h4>
                          <p className="text-white/80 text-sm">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
