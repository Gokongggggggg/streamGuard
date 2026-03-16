/**
 * Judol (Gambling Spam) Filter
 * 
 * INPUT:  string (donation message)
 * OUTPUT: { blocked: boolean, reason: string, confidence: number, layer: string }
 * 
 * This is the module the NLP team works on.
 * The interface is simple: filterMessage(text) → result
 * 
 * Filter pipeline:
 *   Layer 1: Text normalization (decode obfuscation)
 *   Layer 2: Keyword & regex matching
 *   Layer 3: ML classification (future/optional)
 */

// ══════════════════════════════════════════
// LAYER 1: Text Normalization
// ══════════════════════════════════════════

const LEET_MAP = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "9": "g",
  "@": "a",
  "$": "s",
  "!": "i",
  "+": "t",
};

function normalizeText(text) {
  let normalized = text.toLowerCase();

  // Replace leetspeak characters
  for (const [leet, letter] of Object.entries(LEET_MAP)) {
    // Escape special regex characters
    const escaped = leet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    normalized = normalized.replace(new RegExp(escaped, "g"), letter);
  }

  // Remove excessive spaces between characters (e.g., "s l o t" → "slot")
  // Detect when single chars are separated by spaces
  normalized = normalized.replace(/\b(\w)\s+(?=\w\b)/g, (match, char) => {
    // Only collapse if it looks like spaced-out letters (3+ single chars in a row)
    return char;
  });

  // Simpler approach: also create a version with ALL spaces removed for matching
  const noSpaces = normalized.replace(/\s+/g, "");

  // Remove common separators used for obfuscation
  const noSeparators = normalized.replace(/[.\-_*~|\/\\]/g, "");

  // Remove repeated characters (e.g., "slooot" → "slot")
  const deduped = noSeparators.replace(/(.)\1{2,}/g, "$1");

  return {
    original: text,
    normalized,
    noSpaces,
    noSeparators,
    deduped,
  };
}

// ══════════════════════════════════════════
// LAYER 2: Keyword & Regex Matching
// ══════════════════════════════════════════

// Gambling-related keywords (Indonesian context)
// HIGH confidence — these are almost always gambling spam
const JUDOL_KEYWORDS_HIGH = [
  "gacor", "maxwin", "scatter", "jackpot",
  "togel", "judol", "judi online", "judi slot",
  "poker online", "baccarat", "roulette",
  "freebet", "freechip",
  "rtp live", "rtp slot", "bocoran slot",
  "pola slot", "pola gacor", "jam gacor",
  "anti rungkad", "auto maxwin",
  "link alternatif",
  "bonus new member",
  "pinjol", "pinjaman online",
  "tanpa bi checking",
];

// MEDIUM confidence — only flag when combined with other signals
const JUDOL_KEYWORDS_CONTEXT = [
  "slot",     // could be "time slot" in normal context
  "casino",
  "deposit",  // could be normal banking
  "withdraw", // could be normal banking
  "turnover",
  "minimal deposit", "min depo",
  "daftar sekarang",
  "cair cepat",
  "tanpa jaminan",
];

// Regex patterns for harder-to-catch variants
const JUDOL_PATTERNS = [
  /s\s*l\s*o\s*t/i,                    // s l o t (spaced out)
  /g\s*a\s*c\s*o\s*r/i,                // g a c o r
  /m\s*a\s*x\s*w\s*i\s*n/i,            // m a x w i n
  /\b\w+slot\w*\.com\b/i,              // domains: *slot*.com
  /\b\w+gacor\w*\.com\b/i,             // domains: *gacor*.com
  /\b\w+(bet|casino|poker)\w*\.\w+\b/i, // domains: *bet*.*, *casino*.*
  /deposit\s*\d+\s*(rb|ribu|k)/i,      // "deposit 10rb", "deposit 25k"
  /bonus\s*\d+\s*%/i,                  // "bonus 100%"
  /wa\s*:?\s*0\d{9,12}/i,              // WhatsApp numbers in promos
  /link\s*:\s*https?:\/\//i,           // "link: http://..."
];

function checkKeywords(textVariants) {
  const textsToCheck = [
    textVariants.normalized,
    textVariants.noSpaces,
    textVariants.noSeparators,
    textVariants.deduped,
  ];

  // Check high-confidence keywords first
  for (const keyword of JUDOL_KEYWORDS_HIGH) {
    for (const text of textsToCheck) {
      if (text.includes(keyword.toLowerCase())) {
        return { matched: true, keyword, confidence: 0.95, matchedIn: text };
      }
    }
  }

  // Check context-dependent keywords — need at least 2 matches to block
  const contextMatches = [];
  for (const keyword of JUDOL_KEYWORDS_CONTEXT) {
    for (const text of textsToCheck) {
      if (text.includes(keyword.toLowerCase())) {
        contextMatches.push(keyword);
        break; // found in at least one variant, move to next keyword
      }
    }
  }

  if (contextMatches.length >= 2) {
    return { matched: true, keyword: contextMatches.join(" + "), confidence: 0.8, matchedIn: textsToCheck[0] };
  }

  return { matched: false };
}

function checkPatterns(textVariants) {
  const textsToCheck = [
    textVariants.original,
    textVariants.normalized,
    textVariants.noSpaces,
  ];

  for (const pattern of JUDOL_PATTERNS) {
    for (const text of textsToCheck) {
      const match = text.match(pattern);
      if (match) {
        return { matched: true, pattern: pattern.toString(), matchedText: match[0] };
      }
    }
  }
  return { matched: false };
}

// ══════════════════════════════════════════
// MAIN FILTER FUNCTION
// ══════════════════════════════════════════

/**
 * Filter a donation message for gambling spam
 * 
 * @param {string} message - The donation message text
 * @param {string[]} customBlocklist - Additional words to block (from streamer settings)
 * @returns {{ blocked: boolean, reason: string, confidence: number, layer: string }}
 */
function filterMessage(message, customBlocklist = []) {
  // Empty messages are fine
  if (!message || message.trim() === "") {
    return { blocked: false, reason: "empty message", confidence: 1.0, layer: "none" };
  }

  // Layer 1: Normalize
  const variants = normalizeText(message);

  // Layer 2a: Custom blocklist (streamer's own words)
  if (customBlocklist.length > 0) {
    const lowerMessage = variants.normalized;
    for (const word of customBlocklist) {
      if (lowerMessage.includes(word.toLowerCase())) {
        return {
          blocked: true,
          reason: `Custom blocklist match: "${word}"`,
          confidence: 1.0,
          layer: "custom_blocklist",
        };
      }
    }
  }

  // Layer 2b: Keyword matching
  const keywordResult = checkKeywords(variants);
  if (keywordResult.matched) {
    return {
      blocked: true,
      reason: `Keyword match: "${keywordResult.keyword}"`,
      confidence: keywordResult.confidence,
      layer: "keyword",
    };
  }

  // Layer 2c: Regex pattern matching
  const patternResult = checkPatterns(variants);
  if (patternResult.matched) {
    return {
      blocked: true,
      reason: `Pattern match: ${patternResult.matchedText}`,
      confidence: 0.85,
      layer: "regex",
    };
  }

  // Layer 3: ML classification (TODO — NLP team implements this)
  // const mlResult = classifyWithML(message);
  // if (mlResult.isJudol && mlResult.confidence > 0.7) {
  //   return { blocked: true, reason: "ML classifier", confidence: mlResult.confidence, layer: "ml" };
  // }

  // Passed all layers
  return { blocked: false, reason: "clean", confidence: 0.9, layer: "none" };
}

module.exports = { filterMessage, normalizeText };
