# Translation System

This directory contains translation files for the Thrive Social website.

## Supported Languages

- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇵🇹 Portuguese (pt)
- 🇯🇵 Japanese (ja)
- 🇨🇳 Chinese (zh)
- 🇰🇷 Korean (ko)
- 🇸🇦 Arabic (ar)
- 🇷🇺 Russian (ru)
- 🇮🇳 Hindi (hi)

## How It Works

1. **IP Detection**: When a user visits the site, their IP address is used to detect their country
2. **Language Suggestion**: If the detected country uses a non-English language, a beautiful toast notification appears
3. **User Choice**: Users can select their preferred language from the toast or dismiss it
4. **Persistent Storage**: The selected language is saved in localStorage
5. **Manual Change**: Users can change language anytime using the language selector in the navbar

## Adding New Translations

1. Create a new JSON file with the language code (e.g., `nl.json` for Dutch)
2. Copy the structure from `en.json`
3. Translate all values
4. Add the language code to the `Language` type in `src/contexts/LanguageContext.tsx`
5. Add the language to the arrays in:
   - `src/components/LanguageSelectorToast.tsx`
   - `src/components/LanguageSelector.tsx`
   - `src/services/languageDetection.ts` (add country mappings and display info)

## Translation Keys

All translation keys follow the pattern: `section.key`

Examples:
- `nav.home` - Navigation items
- `hero.title` - Hero section
- `product.addToCart` - Product actions
- `cart.total` - Cart information
- `common.loading` - Common UI elements

## Usage in Components

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return <h1>{t('hero.title')}</h1>;
}
```
