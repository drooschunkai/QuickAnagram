export const ABOUT_CONTENT = {
  mission: "At QuickAnagram, our mission is to provide the fastest, cleanest, and most reliable word tools on the web. We believe that technology should empower creativity and learning, not get in the way.",
  history: "QuickAnagram started as a small personal project to solve a 'vowel dump' issue in a family game night. It has since evolved into a high-performance web app used by thousands of competitive players globally.",
  values: ["Performance First", "Minimalist Design", "Dictionary Accuracy", "Privacy Focused"]
};

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is a word unscrambler?",
    answer: "A word unscrambler is a tool that takes a set of jumbled letters and identifies all valid words that can be formed using those letters. It is commonly used for games like Scrabble, Words with Friends, and crossword puzzles."
  },
  {
    question: "How do I use QuickAnagram to unscramble words?",
    answer: "Simply enter your letters into the search bar at the top of the page. You can enter up to 15 characters, including blank tiles (represented by spaces or question marks). Press 'Process' to see a list of all possible words grouped by length."
  },
  {
    question: "Is QuickAnagram free to use?",
    answer: "Yes, QuickAnagram is completely free. We provide high-performance word solving tools without requiring any subscription or payment."
  },
  {
    question: "What dictionary does this word solver use?",
    answer: "We use a comprehensive dictionary based on standard English word lists, including many words used in competitive Scrabble (like the SOWPODS list) to ensure maximum accuracy for all players."
  },
  {
    question: "Can I use this for Anagrams?",
    answer: "Absolutely! Switch to 'Anagram' mode to find words that use every single letter of your input. This is perfect for solving daily jumbles or finding clever aliases."
  },
  {
    question: "Is there a mobile app for QuickAnagram?",
    answer: "QuickAnagram is a Progressive Web App (PWA), meaning you can 'Add to Home Screen' on your mobile device for an app-like experience without needing to download anything from an app store."
  },
  {
    question: "Does QuickAnagram store my searches?",
    answer: "No, your privacy is important to us. All word calculations are performed locally on your device (client-side), and we do not store or track the specific letters you choose to unscramble."
  }
];
