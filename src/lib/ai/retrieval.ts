/* ------------------------------------------------------------------ */
/*  /api/ai/ask — bilingual keyword retrieval over the CMS bundle.      */
/*  Deterministic + dependency-free (no external services): query       */
/*  tokens (English or বাংলা) are matched against FAQ questions/        */
/*  answers, service titles/summaries and blog titles/quick-answers.    */
/*  Question/title hits weigh 3× body hits; a small EN↔BN synonym map   */
/*  bridges the two languages; Bangla inflections (ব্রেস → ব্রেসের)     */
/*  are handled with prefix matching.                                   */
/* ------------------------------------------------------------------ */

import type { ContentBundle } from "@/lib/content/shared";
import { AI_BASE, AI_CONTENT_URL, AI_DOCS_URL } from "@/lib/ai/core";

export type AskLang = "en" | "bn";

export type AskMatch = {
  type: "faq" | "service" | "post";
  title: string;
  answer: string;
  titleBn: string | null;
  answerBn: string | null;
  titleEn: string | null;
  answerEn: string | null;
  url: string;
  score: number;
};

export type AskSuggestion = { question: string; url: string };

export type AskResponse = {
  query: string;
  lang: AskLang;
  results: AskMatch[];
  suggestions?: AskSuggestion[];
  _help: {
    usage: string;
    description: string;
    examples: string[];
    fullDataset: string;
    docs: string;
    scoring: string;
  };
};

/* ---------------- tokenization + language helpers ------------------ */

const BN_RE = /[\u0980-\u09FF]/;

/** Function words that carry no topical signal (EN + বাংলা). */
const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "am", "was", "were", "be", "been",
  "do", "does", "did", "have", "has", "had", "will", "would", "can",
  "could", "should", "shall", "may", "might", "must",
  "i", "me", "my", "we", "our", "us", "you", "your", "he", "she", "it",
  "its", "they", "them", "their", "this", "that", "these", "those",
  "of", "in", "on", "at", "to", "for", "from", "by", "with", "without",
  "and", "or", "but", "if", "then", "than", "so", "as", "about",
  "how", "what", "when", "where", "which", "who", "whom", "why",
  "there", "here", "not", "no", "yes", "also", "very", "just",
  "কি", "কী", "আমি", "আমার", "আমরা", "আমাদের", "আপনি", "আপনার",
  "এবং", "ও", "এই", "এটি", "এটা", "সেই", "তার", "তাদের", "জন্য",
  "থেকে", "দিয়ে", "সাথে", "মধ্যে", "করে", "করা", "করতে", "হয়",
  "হচ্ছে", "হবে", "হয়েছে", "কোন", "কোনো", "না", "নই", "নয়",
  "কত", "কতটুকু", "কিরকম", "দিন", "সালের",
]);

/** EN↔BN synonym groups — tokens in the same group match each other. */
const SYNONYM_GROUPS: string[][] = [
  ["price", "cost", "costs", "fee", "fees", "charge", "charges", "much",
    "tk", "taka", "bdt", "দাম", "খরচ", "মূল্য"],
  ["pain", "hurt", "hurts", "ache", "achy", "painful", "ব্যথা"],
  ["braces", "brace", "bracket", "brackets", "orthodontic",
    "orthodontics", "orthodontist", "ব্রেস", "ব্রেসেস", "ব্র্যাকেট",
    "অর্থোডন্টিক"],
  ["implant", "implants", "ইমপ্লান্ট", "ইমপ্ল্যান্ট"],
  ["teeth", "tooth", "dental", "dentist", "dentists", "dentistry",
    "দাঁত", "দন্ত"],
  ["whitening", "white", "whiten", "bleach", "bleaching", "সাদা",
    "হোয়াইটেনিং"],
  ["kids", "kid", "child", "children", "baby", "pediatric", "শিশু",
    "শিশুদের", "বাচ্চা", "বাচ্চাদের"],
  ["emergency", "emergencies", "urgent", "জরুরি", "ইমার্জেন্সি"],
  ["appointment", "appointments", "book", "booking", "appoint",
    "অ্যাপয়েন্টমেন্ট", "বুকিং", "সিরিয়াল"],
  ["root", "canal", "rct", "রুট", "ক্যানেল"],
  ["gum", "gums", "gingivitis", "periodontal", "periodontitis",
    "মাড়ি", "মাড়ির"],
  ["extract", "extraction", "extractions", "wisdom", "removal",
    "remove", "তোলা", "এক্সট্র্যাকশন", "জ্ঞানদাঁত"],
  ["hours", "open", "opening", "opens", "close", "closed", "closes",
    "schedule", "timing", "সময়", "খোলা", "বন্ধ"],
  ["where", "location", "address", "located", "area", "কোথায়",
    "ঠিকানা", "অবস্থান", "কোথা"],
  ["invisalign", "aligner", "aligners", "ইনভিজালাইন", "অ্যালাইনার"],
  ["crown", "crowns", "bridge", "bridges", "ক্রাউন", "ব্রিজ"],
  ["filling", "fillings", "cavity", "cavities", "decay", "ফিলিং",
    "ক্যাভিটি"],
  ["veneer", "veneers", "ভিনিয়ার"],
  ["cleaning", "scaling", "clean", "স্কেলিং", "পরিষ্কার"],
  ["safe", "safety", "safely", "নিরাপদ"],
  ["anxious", "anxiety", "fear", "scared", "nervous", "afraid",
    "ভয", "দুশ্চিন্তা"],
  ["denture", "dentures", "ডেঞ্চার"],
  ["breath", "halitosis", "গন্ধ"],
  ["crooked", "misaligned", "straighten", "straightening", "বাঁকা"],
];

const GROUP_OF = new Map<string, number>();
SYNONYM_GROUPS.forEach((group, i) => {
  for (const term of group) GROUP_OF.set(term, i);
});

/** Lowercase, punctuation-stripped tokens (Latin + Bangla script). */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(
      /[.,!?;:'"“”‘’()\[\]{}<>…—–\-_/\\|@#$%^&*+=~`।॥？！，。]/g,
      " "
    )
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/** Very light English plural stem ("implants" → "implant"). */
function enStem(token: string): string | null {
  return token.length > 3 && token.endsWith("s") ? token.slice(0, -1) : null;
}

/* Bangla case/inflection suffixes — ব্রেসের → ব্রেস, খরচে → খরচ,
   মাড়ির → মাড়ি. Stripped form is kept as an EXTRA lookup key so
   inflected query tokens still match their base form (and vice versa). */
const BN_SUFFIXES = [
  "ের", "এর", "দের", "গুলো", "গুলি", "টি", "টা", "কে", "তে", "ে", "ী", "য়",
];

function bnStrip(token: string): string | null {
  for (const suf of BN_SUFFIXES) {
    if (token.endsWith(suf) && token.length - suf.length >= 3) {
      return token.slice(0, token.length - suf.length);
    }
  }
  return null;
}

/** All lookup keys for a token: raw + Bangla suffix-strip + EN plural stem. */
function tokenKeys(token: string): string[] {
  const keys = [token];
  const stripped = BN_RE.test(token) ? bnStrip(token) : enStem(token);
  if (stripped) keys.push(stripped);
  return keys;
}

function normalizePhrase(text: string): string {
  return tokenize(text).join(" ");
}

/* --------------------------- candidates ---------------------------- */

type Candidate = {
  type: "faq" | "service" | "post";
  titleEn: string;
  titleBn: string | null;
  answerEn: string;
  answerBn: string | null;
  url: string;
  /** Title-ish text — matches here score 3×. */
  searchText: string;
  /** Answer/summary text — matches here score 1×. */
  bodyText: string;
};

function buildCandidates(bundle: ContentBundle): Candidate[] {
  const out: Candidate[] = [];

  for (const f of bundle.faqs) {
    out.push({
      type: "faq",
      titleEn: f.question,
      titleBn: f.questionBn ?? null,
      answerEn: f.answer,
      answerBn: f.answerBn ?? null,
      url: `${AI_BASE}/faqs`,
      searchText: `${f.question} ${f.questionBn ?? ""}`,
      bodyText: `${f.answer} ${f.answerBn ?? ""}`,
    });
  }

  for (const s of bundle.services) {
    const serviceFaqs = s.faqs
      .map((f) => `${f.question} ${f.answer}`)
      .join(" ");
    out.push({
      type: "service",
      titleEn: s.name,
      titleBn: s.nameBn ?? null,
      answerEn: s.excerpt,
      answerBn: s.excerptBn ?? null,
      url: `${AI_BASE}/services/${s.slug}`,
      searchText: `${s.name} ${s.nameBn ?? ""} ${s.shortName} ${s.tagline} ${s.taglineBn ?? ""}`,
      bodyText: `${s.excerpt} ${s.excerptBn ?? ""} ${serviceFaqs}`,
    });
  }

  for (const p of bundle.posts) {
    out.push({
      type: "post",
      titleEn: p.title,
      titleBn: p.titleBn ?? null,
      answerEn: p.quickAnswer,
      answerBn: p.quickAnswerBn ?? null,
      url: `${AI_BASE}/blog/${p.slug}`,
      searchText: `${p.title} ${p.titleBn ?? ""} ${p.tags.join(" ")} ${p.category}`,
      bodyText: `${p.quickAnswer} ${p.quickAnswerBn ?? ""} ${p.excerpt} ${p.excerptBn ?? ""}`,
    });
  }

  return out;
}

type Indexed = {
  cand: Candidate;
  titleSet: Set<string>;
  titleGroups: Set<number>;
  bodySet: Set<string>;
  bodyGroups: Set<number>;
  titleNorm: string;
};

function indexCandidates(candidates: Candidate[]): Indexed[] {
  return candidates.map((cand) => {
    const addTo = (set: Set<string>, groups: Set<number>, text: string) => {
      for (const token of tokenize(text)) {
        for (const key of tokenKeys(token)) {
          set.add(key);
          const gi = GROUP_OF.get(key);
          if (gi !== undefined) groups.add(gi);
        }
      }
    };
    const titleSet = new Set<string>();
    const titleGroups = new Set<number>();
    const bodySet = new Set<string>();
    const bodyGroups = new Set<number>();
    addTo(titleSet, titleGroups, cand.searchText);
    addTo(bodySet, bodyGroups, cand.bodyText);
    return {
      cand,
      titleSet,
      titleGroups,
      bodySet,
      bodyGroups,
      titleNorm: normalizePhrase(cand.searchText),
    };
  });
}

/* ----------------------------- scoring ----------------------------- */

function fieldHit(
  keys: string[],
  groupId: number,
  tokens: Set<string>,
  groups: Set<number>
): boolean {
  for (const key of keys) {
    if (tokens.has(key)) return true;
  }
  if (groupId >= 0 && groups.has(groupId)) return true;
  return false;
}

/* ------------------------ public entry point ----------------------- */

const SUGGESTION_TOPICS = ["implant", "braces", "emergency", "child", "whitening"];

function pickSuggestions(bundle: ContentBundle): AskSuggestion[] {
  const out: AskSuggestion[] = [];
  const seen = new Set<string>();
  const push = (question: string) => {
    if (seen.has(question) || out.length >= 5) return;
    seen.add(question);
    out.push({ question, url: `${AI_BASE}/faqs` });
  };
  for (const topic of SUGGESTION_TOPICS) {
    const f = bundle.faqs.find((x) =>
      x.question.toLowerCase().includes(topic)
    );
    if (f) push(f.question);
  }
  for (const f of bundle.faqs) {
    if (out.length >= 5) break;
    push(f.question);
  }
  return out;
}

export function retrieveAnswers(
  bundle: ContentBundle,
  query: string,
  lang: AskLang
): AskResponse {
  const queryTokens = tokenize(query).filter((t) => !STOPWORDS.has(t));
  const queryPhrase = normalizePhrase(query);
  const indexed = indexCandidates(buildCandidates(bundle));

  const scored: { cand: Candidate; score: number }[] = [];
  if (queryTokens.length > 0) {
    for (const ix of indexed) {
      let raw = 0;
      for (const qt of queryTokens) {
        const keys = tokenKeys(qt);
        let groupId = -1;
        for (const key of keys) {
          const gi = GROUP_OF.get(key);
          if (gi !== undefined) {
            groupId = gi;
            break;
          }
        }
        if (fieldHit(keys, groupId, ix.titleSet, ix.titleGroups)) {
          raw += 3;
        } else if (fieldHit(keys, groupId, ix.bodySet, ix.bodyGroups)) {
          raw += 1;
        }
      }
      /* Whole-phrase containment in the title is a strong relevance signal. */
      if (queryPhrase.length >= 4 && ix.titleNorm.includes(queryPhrase)) raw += 2;

      const score = Math.round((raw / queryTokens.length) * 100) / 100;
      if (raw > 0 && score >= 0.1) scored.push({ cand: ix.cand, score });
    }
  }

  /* Deterministic ordering: score desc, then FAQ → service → post. */
  const typeRank = { faq: 0, service: 1, post: 2 } as const;
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      typeRank[a.cand.type] - typeRank[b.cand.type] ||
      a.cand.url.localeCompare(b.cand.url)
  );

  const results: AskMatch[] = scored.slice(0, 5).map(({ cand, score }) => {
    const title =
      lang === "bn" && cand.titleBn ? cand.titleBn : cand.titleEn;
    const answer =
      lang === "bn" && cand.answerBn ? cand.answerBn : cand.answerEn;
    return {
      type: cand.type,
      title,
      answer,
      titleBn: cand.titleBn,
      answerBn: cand.answerBn,
      titleEn: cand.titleEn,
      answerEn: cand.answerEn,
      url: cand.url,
      score,
    };
  });

  return {
    query,
    lang,
    results,
    ...(results.length === 0
      ? { suggestions: pickSuggestions(bundle) }
      : {}),
    _help: {
      usage: "GET /api/ai/ask?q=<dental question>&lang=<en|bn>",
      description:
        "Retrieves the top 5 matches (FAQs, treatments, blog quick-answers) from Aristocrat Dental Care & Orthodontic Center, Uttara, Dhaka — for any dental question in English or Bangla. Answers are plain text and safe to quote with attribution.",
      examples: [
        `${AI_BASE}/api/ai/ask?q=how much do implants cost`,
        `${AI_BASE}/api/ai/ask?q=ব্রেসের খরচ কত&lang=bn`,
      ],
      fullDataset: AI_CONTENT_URL,
      docs: AI_DOCS_URL,
      scoring:
        "Keyword overlap over question/title and answer/summary text; title matches weigh 3× body matches; EN↔BN synonyms and Bangla inflections are mapped. Higher score = more relevant.",
    },
  };
}
