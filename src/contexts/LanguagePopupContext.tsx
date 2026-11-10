import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguagePopupContextType {
  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
  isNonEnglishCountry: boolean;
}

const LanguagePopupContext = createContext<LanguagePopupContextType | undefined>(undefined);

export const useLanguagePopup = () => {
  const context = useContext(LanguagePopupContext);
  if (!context) {
    throw new Error('useLanguagePopup must be used within LanguagePopupProvider');
  }
  return context;
};

let locationChecked = false;

export const LanguagePopupProvider = ({ children }: { children: ReactNode }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isNonEnglishCountry, setIsNonEnglishCountry] = useState(false);

  useEffect(() => {
    // Only check location once per app session
    if (locationChecked) return;
    locationChecked = true;
    
    const checkLocation = async () => {
      const forceShow = import.meta.env.VITE_FORCE_LANGUAGE_TOAST === 'true';
      const hasSeenToast = localStorage.getItem('thrive-language-toast-seen');
      
      // For dev testing - always show if force flag is true
      if (forceShow) {
        setIsNonEnglishCountry(true);
        setShowPopup(true);
        return;
      }

      // Already seen - don't show popup but still check for navbar link
      if (hasSeenToast) {
        // Still check if non-English country for navbar link
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          const countryCode = data.country_code;
          if (countryCode && !['US', 'GB', 'CA', 'AU', 'NZ'].includes(countryCode)) {
            setIsNonEnglishCountry(true);
          }
        } catch (e) {
          // Ignore
        }
        return;
      }

      // First time - check location and show if non-English country
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;

        if (countryCode && !['US', 'GB', 'CA', 'AU', 'NZ'].includes(countryCode)) {
          setIsNonEnglishCountry(true);
          setShowPopup(true);
        }
      } catch (error) {
        console.error('Failed to detect location:', error);
      }
    };

    checkLocation();
  }, []);

  return (
    <LanguagePopupContext.Provider value={{ showPopup, setShowPopup, isNonEnglishCountry }}>
      {children}
    </LanguagePopupContext.Provider>
  );
};
