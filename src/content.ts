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
      title: "1. Brand Identity & Flagship Operations",
      content: "UnscramblerHub is the flagship web application engine operating under the official LetterHub software suite. Our services, databases, and word-game tutorials are located exclusively at our primary master apex domain: https://unscramblerhub.com. All operations, licensing, and database queries are unified under this flagship to satisfy manual compliance audits and indexation rules."
    },
    {
      title: "2. Client-Side Processing & Absolute Local Privacy",
      content: "Unlike traditional online dictionary databases that transmit and log search queries on remote servers, UnscramblerHub utilizes a modern, decentralized local-first architecture. When you input letters, Scrabble tiles, or anagram arrays, our letter-matching algorithms execute entirely inside your local browser sandbox. No jumbles, search queries, or user-input letters are ever transmitted, logged, or stored on our servers. This design pattern ensures complete user anonymity and eliminates server-side search tracking."
    },
    {
      title: "3. Programmatic Advertising & Cookie Disclosures (Google AdSense)",
      content: "To keep our premium word solvers and dictionaries 100% free for word game lovers globally, we serve programmatic advertisements through the Google AdSense network. To facilitate this monetization strategy, third-party vendors, including Google, utilize tracking cookies to serve relevant advertisements based on a user's prior visits to https://unscramblerhub.com and other resources across the Internet. Specifically, the use of the DoubleClick cookie enables Google and its partners to serve targeted ads based on comprehensive web-browsing metrics."
    },
    {
      title: "4. Comprehensive Opt-Out Instructions & User Control",
      content: "We respect your digital sovereignty. Users may easily manage or completely opt out of personalized programmatic advertising. You can opt out of Google's personalized ad targeting at any time by modifying your preferences in the official Google Ads Settings panel (https://adssettings.google.com). Additionally, you can opt out of third-party vendors' use of cookies for personalized advertising by visiting the Network Advertising Initiative (NAI) opt-out utility (https://optout.networkadvertising.org) and the Digital Advertising Alliance (DAA) portal (https://optout.aboutads.info)."
    },
    {
      title: "5. Browser Log Data & Standard Telemetry Metrics",
      content: "When accessing https://unscramblerhub.com, our host servers may automatically capture standard, non-personally identifiable technical log data. This telemetry includes your browser's User-Agent string, Internet Protocol (IP) address, Internet Service Provider (ISP), referring and exiting page URLs, platform category, and precise timestamps. This data is utilized solely for technical system optimization, DDoS prevention, security auditing, and maintaining the highest performance standards."
    },
    {
      title: "6. General Data Protection Regulation (GDPR) Compliance",
      content: "For users residing in the European Economic Area (EEA), we act as a Data Controller under standard GDPR guidelines. Because our word unscrambler tools run completely client-side on your device, we do not collect personal identifiers or search patterns. Our legal basis for displaying programmatic ads is your explicit consent. European users have the right to access, rectify, or delete any cached session data, withdraw consent for personalized cookies, or lodge a formal complaint with a competent supervisory authority."
    },
    {
      title: "7. California Consumer Privacy Act (CCPA) Rights",
      content: "Under the California Consumer Privacy Act (CCPA), California residents are entitled to specific disclosures regarding data collection and sale. We do not collect or sell user search terms or dictionary lookups, as our processing is strictly local. Any monetization tracking is limited to standard, network-authorized Google AdSense cookies. California users have the right to request disclosure of third-party tracking, opt out of personalized cookie targeting, and receive equal service without discrimination."
    },
    {
      title: "8. Children's Online Privacy Protection Act (COPPA) Statement",
      content: "Protecting the privacy of young children is a paramount legal and moral obligation. UnscramblerHub is designed as a family-friendly educational utility for word-game enthusiasts of all ages. We do not knowingly or intentionally collect, track, or solicit personal information from children under the age of 13. If you believe a child under 13 has interacted with our site in a way that transmits personal data, please contact us immediately so we can take swift corrective action."
    },
    {
      title: "9. Dictionary API Integrations & External Queries",
      content: "When utilizing our interactive Dictionary search page, requested terms are securely fetched from the Free Dictionary API (https://dictionaryapi.dev) via HTTPS. This query only contains the literal word being searched to retrieve definitions, phonetics, and grammar metrics. No personal profiles, IP mappings, or location markers are ever coupled with these lookup queries."
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
    question: "What is a word unscrambler and how does it optimize gameplay?",
    answer: "A word unscrambler is a sophisticated algorithmic utility designed to take any random or jumbled rack of characters and map them against a verified master lexicon database. By analyzing character frequencies and matching subsets of letters, the unscrambler identifies every valid word that can be formed. In competitive word gaming (such as Scrabble, Words with Friends, and tournaments), a high-quality unscrambler serves as an essential training assistant. It reveals high-scoring opportunities, helps players recognize suffix/prefix stems (like -ING, -ED, or UN-), and trains the brain to recognize anagram patterns sub-second. Using our tool helps bridge the gap between simple puzzle solving and high-tier tactical play."
  },
  {
    question: "How do I use UnscramblerHub to resolve complex letter combinations?",
    answer: "Using our flagship solver is extremely simple and fast. Navigate to the main search box at the top of the screen. Input your jumbled letters—supporting up to 15 characters. For games that include blank tiles or wildcards, you can enter spaces, asterisks (*), or question marks (?) to represent these blanks; our algorithm will automatically rotate through all letters from A-Z (or the Arabic alphabet in Arabic mode) to locate valid matches. Once you press 'Process' or press Enter, our system instantly groups all matched words by letter length. You can also expand the 'Options' panel to filter words that start with specific letters, end with particular suffixes, contain specific segments, or match a exact word length."
  },
  {
    question: "Is this word solver fully safe, secure, and free to use?",
    answer: "Yes, UnscramblerHub is 100% free of charge and does not require registration, email sign-ups, or subscriptions. Under our unified LetterHub software suite branding, we believe that web applications should respect user privacy. That is why our word-game engines are designed using a decentralized, client-side processing model. All anagram permutations and character matches are calculated locally in your browser sandbox. Your input letters and searches are never transmitted to any external server or recorded in any database. To maintain this high-performance, private infrastructure without charging our users, we display programmatic advertising served by Google AdSense, which uses secure third-party cookies."
  },
  {
    question: "Which official dictionary databases and lexicons are integrated?",
    answer: "To ensure that our matches are valid for competitive play, our database is built upon the industry's most trusted, official word lists. This includes SOWPODS (the standard international tournament word list used across Europe, Australia, and Canada) and TWL06 (the standard tournament word list utilized in North American Scrabble matches). By combining these comprehensive lexicons with our dynamic, multi-lingual database caches, we offer highly accurate results for Scrabble, Words with Friends, Wordle, and general anagram puzzles. For our Arabic database, we pull from curated frequency word lists filtered dynamically to ensure only clean, valid, standard Arabic vocabulary is returned."
  },
  {
    question: "What are 'Bingos' and how can this tool help find them?",
    answer: "In Scrabble and similar word games, a 'Bingo' occurs when a player successfully uses all seven tiles on their rack in a single turn. Achieving a Bingo grants a massive 50-point bonus (or 35 points in Words with Friends), which can completely shift the momentum of a competitive game. Finding these high-scoring words requires advanced visual scanning and anagram training. UnscramblerHub's lightning-fast character matching is optimized to find 7-letter words instantly from your jumbled rack. By practicing regularly with our jumble solver, you will train your pattern recognition to spot potential 7-letter stems and double-blank opportunities, dramatically increasing your average score per turn."
  },
  {
    question: "Can I use UnscramblerHub on mobile devices and tablet browsers?",
    answer: "Our application is engineered with a modern, responsive mobile-first layout that automatically adapts to any screen size. Whether you are playing on a high-resolution desktop monitor, an iPad, or a smartphone, the interface remains perfectly readable with comfortable, touch-friendly buttons. In fact, UnscramblerHub functions as a Progressive Web App (PWA). You can select 'Add to Home Screen' in your mobile Safari or Chrome browser settings, creating an app-like shortcut on your home screen. This allows you to launch the word solver instantly during your game nights, bypassing the need for heavy app store downloads while enjoying sub-millisecond local performance."
  },
  {
    question: "Why does the tool offer separate 'Unscramble' and 'Anagram' modes?",
    answer: "These two modes serve completely different gameplay and linguistic needs. 'Unscramble' mode is a broad search that looks for all possible words of *any* length that can be formed using a subset of your letters. For example, inputting 'CAT' will return CAT, ACT, AT, and TA. This is ideal for Scrabble where you want to find the best word of any length. On the other hand, 'Anagram' mode performs a strict one-to-one mapping where every single character in your input must be used exactly once in the resulting words. Inputting 'CAT' in Anagram mode will only return ACT and CAT. This is perfect for solving traditional anagram riddles, daily newspaper jumbles, and single-word cryptograms."
  }
];
