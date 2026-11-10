import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Thrive | ${title}`;
    
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
