# System Architecture: QuickAnagram

## 1. Overview
QuickAnagram is a **Full-Client-Side (FCS)** web application. Unlike traditional word solvers that send user strings to a backend database, QuickAnagram loads its entire logic and dictionary into the browser environment.

## 2. Component Hierarchy
- **`App.tsx` (Entry/Controller)**: Manages global state (theme, view, input results) and implements a lightweight hash-based router.
- **`content.ts` & `blogData.ts` (Data Layers)**: Static stores for CMS content, FAQ, and the 30-article SEO library.
- **`BlogLayout.tsx` (Renderer)**: Decoupled component for rendering long-form typography with internal conversion CTAs.
- **UI Components**: Built with functional React components, styled via Tailwind CSS, and animated with Framer Motion.

## 3. Data Flow
### 3.1 Unscramble Life Cycle
1. **Bootstrap**: On first visit, the app fetches the dictionary (cached via browser).
2. **User Input**: User enters a string (e.g., "OELLH").
3. **Local Algorithm**:
   - Computes a frequency map of the input letters.
   - Iterates through the dictionary array.
   - For each word, it checks if its letter frequency map "fits" inside the input map.
4. **Display**: Results are sorted by length and rendered using virtualized-friendly lists.

### 3.2 Dictionary Lookup
1. **Trigger**: User clicks a word in results.
2. **API Call**: `fetch` request to `https://api.dictionaryapi.dev/api/v2/entries/en/[word]`.
3. **Response**: JSON is parsed and displayed in a global modal overlay to preserve scroll position on the main tool.

## 4. Routing Strategy
The application uses **Hash Routing** (`#about`, `#dictionary`). 
- **Benefits**: Works perfectly in isolated iFrame environments (like AI Studio) and avoids the need for complex server-side redirects on refresh.
- **Implementation**: Listens to the `hashchange` event to update the `view` state.

## 5. Algorithmic Optimization
The core unscrambler uses a **Frequency Analysis Algorithm**:
```typescript
function canForm(word: string, inputChars: Map<string, number>) {
  // Logic: wordChars[char] <= inputChars[char] for all char in word
}
```
This is significantly faster than generating permutations (which is `O(N!)`) as it remains constant relative to the dictionary size (`O(D)`), making it reliable for inputs up to 15-20 characters.

## 6. Development & Deployment
- **Bundler**: Vite + esbuild (for sub-second HMR and optimized production chunks).
- **Styling**: Tailwind CSS JIT (Just-In-Time) compiler to minimize the CSS footprint to < 10kb.
- **Static Intelligence**: SEO schema is injected directly into components to assist search crawlers during static site generation (SSG).
