# QuickAnagram ⚡

A lightning-fast, privacy-first word toolset designed for competitive Scrabble players, Wordle enthusiasts, and language lovers.

## 🚀 Mission
QuickAnagram was built to solve the performance and privacy issues of legacy word solvers. Most tools rely on slow server-side queries that track user inputs; QuickAnagram performs all computations **locally on the client**, ensuring instant results and total privacy.

## ✨ Key Features
- **Word Unscrambler**: Solves racks of up to 15 letters against a 370k+ word dictionary in milliseconds.
- **Anagram Solver**: Identifies perfect permutations of strings for puzzles and cryptic crosswords.
- **Integrated Dictionary**: Fetches definitions, phonetics, and usage examples via the Free Dictionary API.
- **SEO-Optimized Blog**: A content-heavy infrastructure with 30 targeted articles designed for AdSense integration and topological authority in the word-game niche.
- **Privacy-First**: No user letter inputs are ever sent to a server.

## 🛠️ Tech Stack
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (WCAG AA Compliant)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Source**: Local optimized dictionary (client-side)

## 🏗️ Architecture Highlights
- **Hash Routing**: Dynamic navigation without full-page reloads, providing a smooth app-like feel.
- **Edge Performance**: By downloading the dictionary object once, the app eliminates network latency for every subsequent search.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop views with a native Dark Mode implementation.

## 📦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```
