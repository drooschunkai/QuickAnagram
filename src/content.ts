export const ABOUT_CONTENT = {
  mission: "At LetterHub, our mission is to provide the fastest, cleanest, and most reliable word tools on the web. We believe that technology should empower creativity and learning, not get in the way.",
  history: "LetterHub started as a small personal project to solve a 'vowel dump' issue in a family game night. It has since evolved into a high-performance web app used by thousands of competitive players globally.",
  values: ["Performance First", "Minimalist Design", "Dictionary Accuracy", "Privacy Focused"]
};

export const POLICY_CONTENT = {
  title: "Privacy Policy",
  lastUpdated: "June 29, 2026",
  sections: [
    {
      title: "Our Brand & Domain Integration",
      content: "UnscramblerHub is the primary word solver tool under our official LetterHub software suite. You can find all of our official word tools, tactical guides, and list resources directly at our primary domain: https://unscramblerhub.com."
    },
    {
      title: "We Value Your Privacy (Local-First)",
      content: "Our word unscrambler and anagram solver are designed to run entirely inside your browser (client-side). When you enter letters, the calculations happen on your own device. We never transmit, store, or process your letter queries on our servers."
    },
    {
      title: "Google AdSense & Cookie Disclosures",
      content: "To keep our tools 100% free, we display programmatic ads served by third-party networks, including Google AdSense. These networks use tracking mechanisms such as cookies (like the DoubleClick cookie) to serve ads based on your visits to https://unscramblerhub.com and other websites across the Internet."
    },
    {
      title: "How to Opt Out of Personalized Ads",
      content: "You are always in control of your digital profile. You can turn off personalized ad targeting by visiting Google Ads Settings (https://adssettings.google.com). To opt out of tracking cookies from hundreds of ad networks at once, you can also use the Network Advertising Initiative (NAI) consumer opt-out tool at https://optout.networkadvertising.org."
    },
    {
      title: "Dictionary Lookups",
      content: "When you use our Dictionary search card to look up a word definition, that specific term is sent to the Free Dictionary API (https://dictionaryapi.dev) to retrieve the meaning. We do not store, track, or share any personal search histories or session information."
    }
  ]
};

export const TERMS_CONTENT = {
  title: "Terms of Service",
  lastUpdated: "May 13, 2026",
  sections: [
    {
      title: "Fair Usage",
      content: "LetterHub is provided free of charge for personal use. While we encourage using our tools for training and learning, we advise users to follow the specific rules of any competitive game they are participating in."
    },
    {
      title: "Dictionary Disclaimer",
      content: "Dictionaries are updated frequently. While we aim for high accuracy, we do not guarantee that every word found is valid in every specific version of Scrabble or other word games."
    },
    {
      title: "Availability",
      content: "We strive to maintain 100% uptime through our lightweight architecture, but we cannot be held responsible for any temporary service interruptions."
    }
  ]
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
    question: "How do I use LetterHub to unscramble words?",
    answer: "Simply enter your letters into the search bar at the top of the page. You can enter up to 15 characters, including blank tiles (represented by spaces or question marks). Press 'Process' to see a list of all possible words grouped by length."
  },
  {
    question: "Is LetterHub free to use?",
    answer: "Yes, LetterHub is completely free. We provide high-performance word solving tools without requiring any subscription or payment."
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
    question: "Is there a mobile app for LetterHub?",
    answer: "LetterHub is a Progressive Web App (PWA), meaning you can 'Add to Home Screen' on your mobile device for an app-like experience without needing to download anything from an app store."
  },
  {
    question: "Does LetterHub store my searches?",
    answer: "No, your privacy is important to us. All word calculations are performed locally on your device (client-side), and we do not store or track the specific letters you choose to unscramble."
  }
];
