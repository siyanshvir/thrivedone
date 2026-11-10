import { createContext, useContext, useState, ReactNode } from 'react';

interface SectionColorContextType {
  sectionColor: string;
  setSectionColor: (color: string) => void;
}

const SectionColorContext = createContext<SectionColorContextType | undefined>(undefined);

export function SectionColorProvider({ children }: { children: ReactNode }) {
  const [sectionColor, setSectionColor] = useState('#0080ff'); // Default primary blue

  return (
    <SectionColorContext.Provider value={{ sectionColor, setSectionColor }}>
      {children}
    </SectionColorContext.Provider>
  );
}

export function useSectionColor() {
  const context = useContext(SectionColorContext);
  if (context === undefined) {
    throw new Error('useSectionColor must be used within a SectionColorProvider');
  }
  return context;
}
