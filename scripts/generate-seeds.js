#!/usr/bin/env node
/**
 * ThoughtChain - Association Seed Generator
 * 
 * Usage:
 *   node scripts/generate-seeds.js
 *   node scripts/generate-seeds.js --word=ocean
 *   node scripts/generate-seeds.js --openai (requires OPENAI_API_KEY env var)
 *
 * Generates the association JSON used by the game engine.
 */

const fs = require("fs");
const path = require("path");

// Fallback associations used only if --openai generation fails for a word.
// This is NOT the data the live game reads from — that's data/associations.ts,
// which has 20 ranked words per entry. This list is intentionally shorter;
// it's just an emergency backstop for the generator script.
const BASE_ASSOCIATIONS = {
  dog: ["bone", "cat", "pet", "bark", "puppy", "leash", "fur", "tail", "fetch", "friend"],
  cat: ["dog", "meow", "purr", "fur", "mouse", "kitten", "whiskers", "pet", "claw", "nap"],
  fish: ["water", "sea", "swim", "scales", "hook", "ocean", "shark", "fin", "pond", "net"],
  bird: ["fly", "wing", "nest", "egg", "feather", "sky", "sing", "tree", "beak", "sky"],
  horse: ["ride", "stable", "gallop", "saddle", "mane", "farm", "race", "hoof", "barn", "cowboy"],
  bone: ["dog", "skeleton", "break", "calcium", "marrow", "joint", "skull", "hard", "chew", "ghost"],
  skull: ["bone", "death", "pirate", "brain", "crossbones", "head", "skeleton", "danger", "dark", "tattoo"],
  heart: ["love", "blood", "beat", "chest", "pump", "emotion", "red", "valentine", "care", "life"],
  brain: ["mind", "think", "skull", "neuron", "smart", "head", "knowledge", "idea", "memory", "logic"],
  tree: ["leaf", "wood", "forest", "root", "branch", "shade", "climb", "bird", "park", "tall"],
  flower: ["bloom", "petal", "garden", "rose", "bee", "color", "plant", "spring", "gift", "smell"],
  sun: ["light", "warm", "bright", "sky", "shine", "hot", "yellow", "star", "day", "burn"],
  moon: ["night", "star", "glow", "sky", "dark", "orbit", "silver", "dream", "tide", "crescent"],
  water: ["wave", "drink", "ocean", "river", "blue", "swim", "wet", "flow", "rain", "clear"],
  fire: ["hot", "burn", "flame", "heat", "red", "wood", "smoke", "light", "danger", "warm"],
  book: ["read", "story", "page", "library", "learn", "author", "cover", "word", "knowledge", "shelf"],
  school: ["learn", "teacher", "class", "student", "book", "grade", "desk", "pencil", "rule", "friend"],
  love: ["heart", "care", "warm", "feel", "romantic", "deep", "true", "emotion", "bond", "sweet"],
  dream: ["sleep", "night", "wish", "imagine", "cloud", "hope", "deep", "float", "vision", "fantasy"],
  star: ["sky", "night", "bright", "shine", "wish", "space", "moon", "glow", "yellow", "famous"],
  music: ["sound", "song", "beat", "rhythm", "instrument", "listen", "feel", "guitar", "notes", "band"],
  ocean: ["water", "wave", "deep", "blue", "salt", "sea", "fish", "vast", "beach", "swim"],
  mountain: ["high", "climb", "peak", "snow", "rock", "tall", "trail", "hike", "cold", "nature"],
  child: ["school", "play", "young", "parent", "grow", "learn", "toy", "joy", "small", "innocent"],
  friend: ["trust", "loyal", "talk", "laugh", "share", "bond", "help", "care", "close", "fun"],
};

async function generateWithOpenAI(word) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("No OPENAI_API_KEY set. Using static generation.");
    return null;
  }

  const prompt = `List the top 20 words that most people would immediately associate with "${word}", ranked from strongest/most common association first to weakest last.
Return ONLY a JSON array of 20 strings, no explanation. Example: ["bone","cat","pet","bark","puppy","leash","fur","tail","fetch","friend","loyal","wag","collar","paw","vet","walk","kennel","breed","guard","puppy love"]`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 350,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const text = data.choices[0]?.message?.content?.trim();
    return JSON.parse(text);
  } catch (e) {
    console.error(`Failed to generate associations for "${word}":`, e.message);
    return null;
  }
}

function generatePhonetic(word) {
  // Simple heuristic-based associations for unknown words
  const vowels = "aeiou";
  const firstLetter = word[0].toLowerCase();
  const lastLetter = word[word.length - 1].toLowerCase();
  
  // Basic patterns
  const results = [];
  if (word.length < 4) results.push("small", "short", "little");
  if (word.length > 8) results.push("long", "complex", "word");
  if (vowels.includes(firstLetter)) results.push("open", "air", "start");
  
  return results.slice(0, 5);
}

async function main() {
  const args = process.argv.slice(2);
  const useOpenAI = args.includes("--openai");
  const targetWord = args.find(a => a.startsWith("--word="))?.split("=")[1];
  
  console.log("🧠 ThoughtChain Association Seed Generator\n");
  
  if (targetWord) {
    // Generate for a single word
    console.log(`Generating associations for: ${targetWord}`);
    let associations;
    
    if (useOpenAI) {
      associations = await generateWithOpenAI(targetWord);
    }
    
    if (!associations) {
      associations = BASE_ASSOCIATIONS[targetWord.toLowerCase()] || generatePhonetic(targetWord);
    }
    
    console.log(`\n"${targetWord}": ${JSON.stringify(associations)}`);
    return;
  }
  
  // Generate/validate the full map
  const words = Object.keys(BASE_ASSOCIATIONS);
  console.log(`Processing ${words.length} words...\n`);
  
  const result = { ...BASE_ASSOCIATIONS };
  
  if (useOpenAI) {
    for (const word of words) {
      process.stdout.write(`  ${word}... `);
      const ai = await generateWithOpenAI(word);
      if (ai) {
        result[word] = ai;
        console.log("✓ (AI)");
      } else {
        console.log("✓ (static)");
      }
      // Rate limit
      await new Promise(r => setTimeout(r, 200));
    }
  }
  
  // Write output
  const outputPath = path.join(__dirname, "../data/generated-associations.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  
  console.log(`\n✅ Generated ${Object.keys(result).length} word associations`);
  console.log(`📁 Saved to: ${outputPath}`);
  
  // Stats
  const avgAssociations = Object.values(result).reduce((sum, a) => sum + a.length, 0) / Object.keys(result).length;
  console.log(`📊 Average associations per word: ${avgAssociations.toFixed(1)}`);
  
  // Coverage check
  const allWords = new Set(Object.keys(result));
  let coveredByMap = 0;
  for (const assocs of Object.values(result)) {
    for (const w of assocs) {
      if (allWords.has(w)) coveredByMap++;
    }
  }
  console.log(`🔗 Inter-map coverage: ${coveredByMap} associations point to known words`);
}

main().catch(console.error);
