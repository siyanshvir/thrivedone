import { useState, useEffect } from 'react';

export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the section with the highest intersection ratio
        let maxRatio = 0;
        let maxSection: string | null = null;

        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            maxSection = entry.target.id;
          }
        });

        if (maxSection && maxRatio > 0.3) {
          setActiveSection(maxSection);
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionIds]);

  return activeSection;
}
