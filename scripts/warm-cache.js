#!/usr/bin/env node
/**
 * Cache warmer — pre-generates Gemini association lists for all daily seed words
 * and common English words so players never hit a cold cache.
 *
 * Run once after deploy:
 *   GEMINI_API_KEY=your-key node scripts/warm-cache.js
 *
 * Or warm specific words:
 *   GEMINI_API_KEY=your-key node scripts/warm-cache.js dog fire ocean
 */

const fs = require("fs");
const path = require("path");

const CACHE_PATH = path.join(__dirname, "../data/association-cache.json");
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";

// All the daily seed words + common association targets
const WORDS_TO_WARM = [
  // Daily seeds (from DAILY_SEEDS in associations.ts)
  "dog","sun","ocean","book","fire","dream","star","apple","rain","music",
  "heart","cloud","tree","night","water","mountain","gold","light","bird","snow",
  "cat","moon","river","school","wind","flower","city","rock","ice","love",
  "horse","earth","beach","food","storm","friend","forest","coffee","red","time",
  "eye","grass","computer","shadow","cake","parent","blue","sand","game","fear",
  "fish","sky","leaf","doctor","smoke","child","green","blood","toy","money",
  "brain","phone","seed","teacher","rain","bone","milk","car","key","run",
  "skull","house","bread","swim","ball","fly","internet","dark",

  // Common first-level associations that become game words
  "bark","burn","wave","beat","dark","sleep","warm","cold","heat","bright",
  "fast","slow","quiet","loud","soft","hard","deep","wide","tall","small",
  "walk","jump","talk","sing","write","draw","cook","eat","drink","wash",
  "work","play","read","watch","listen","speak","touch","smell","taste","feel",
  "happy","sad","angry","scared","excited","bored","tired","hungry","lonely","proud",
  "big","little","long","short","old","new","hot","cool","wet","dry",
  "black","white","yellow","orange","purple","pink","brown","gray",
  "cat","pet","puppy","kitten","fur","tail","paw","claw","whisker","meow",
  "wing","feather","nest","egg","beak","fly","soar","tweet","cage","flock",
  "swim","fin","scale","hook","pond","tank","aquarium","river","lake","stream",
  "gallop","ride","stable","saddle","hoof","mane","barn","farm","field","trail",
  "skeleton","break","calcium","marrow","joint","fracture","skull","x-ray","spine","rib",
  "beat","chest","pump","pulse","rhythm","love","emotion","soul","feeling","romance",
  "think","mind","neuron","idea","memory","logic","genius","focus","study","knowledge",
  "see","sight","vision","blink","pupil","iris","watch","glass","tear","lash",
  "wood","root","branch","shade","climb","trunk","oak","fruit","shelter","carbon",
  "bloom","petal","garden","rose","bee","pollen","bud","wedding","bouquet","vase",
  "rise","sunset","energy","beach","ray","tan","vitamin","solar","summer","daylight",
  "tide","orbit","crescent","phase","lunar","eclipse","werewolf","romance","calm","cycle",
  "drink","river","swim","flow","wet","thirst","lake","pool","splash","bottle",
  "flame","spark","camp","ash","blaze","ember","passion","alarm","candle","destroy",
  "soil","planet","dirt","world","continent","environment","gravity","mud","core","ecosystem",
  "story","page","library","author","chapter","fiction","paper","title","literature","novel",
  "drive","road","wheel","engine","gas","speed","seat","door","highway","traffic",
  "home","family","roof","room","wall","window","yard","building","kitchen","garden",
  "screen","text","call","ring","app","camera","smart","number","battery","signal",
  "lock","open","ring","secret","music","note","code","chain","password","unlock",
  "meal","taste","hunger","cook","kitchen","diet","plate","recipe","dinner","flavor",
  "fruit","juice","pie","sweet","healthy","bite","core","orchard","cider","seed",
  "butter","toast","wheat","bake","soft","sandwich","flour","oven","yeast","slice",
  "white","dairy","cream","glass","carton","cereal","bottle","yogurt","cheese","shake",
  "morning","cup","bean","espresso","brown","caffeine","mug","brew","latte","cafe",
  "birthday","frosting","slice","party","celebrate","sugar","candle","wedding","dessert","chocolate",
  "learn","teacher","class","student","grade","desk","pencil","homework","bus","lesson",
  "nurse","sick","health","medicine","care","bed","emergency","surgery","ambulance","patient",
  "street","building","people","busy","noise","urban","traffic","downtown","skyline","subway",
  "wave","shell","summer","relax","umbrella","surf","tan","towel","vacation","coast",
  "wild","animal","hike","trail","bird","path","wilderness","camping","canopy","moss",
  "care","warm","romantic","deep","emotion","bond","passion","affection","kiss","trust",
  "clock","hour","pass","second","minute","day","wait","schedule","future","precious",
  "cash","spend","bank","dollar","rich","earn","save","coin","wealth","salary",
  "sleep","wish","imagine","hope","float","vision","fantasy","nightmare","goal","ambition",
  "panic","dark","scary","anxiety","threat","shake","phobia","nightmare","horror","fright",
  "fast","sprint","race","legs","sweat","exercise","track","marathon","chase","jog",
  "plane","high","float","air","free","soar","pilot","cloud","altitude","glide",
  "pool","stroke","dive","wet","goggles","lane","splash","chlorine","freestyle","buoyant",
  "punch","battle","war","defend","argue","compete","win","lose","boxing","conflict",
  "young","grow","kid","baby","laughter","curious","family","wonder","playground","youth",
  "guide","protect","mother","father","raise","discipline","nurture","patience","household","bond",
  "trust","loyal","share","companion","support","memories","best","buddy","kindness","connection",
  "class","lesson","chalk","explain","mentor","test","subject","wisdom","inspire","patience",
  "medicine","cure","nurse","stethoscope","diagnose","heal","coat","clinic","appointment","checkup",
  "fire","rose","stop","apple","danger","anger","valentines","lipstick","ruby","crimson",
  "sky","ocean","calm","sad","cool","navy","denim","peaceful","sapphire","tranquil",
  "nature","envy","eco","lime","vegetable","organic","emerald","fresh","meadow","lawn",
  "play","doll","plastic","gift","colorful","blocks","robot","puzzle","imagination","teddy",
  "win","fun","compete","score","challenge","strategy","video","level","controller","tournament",
  "throw","round","bounce","kick","catch","roll","rubber","soccer","basketball","court",
  "type","digital","keyboard","mouse","data","software","laptop","hardware","monitor","tech",
  "web","connect","online","search","social","browse","network","global","website","email",
  "night","bright","wish","space","celebrity","constellation","galaxy","twinkle","shooting","telescope",
  "song","beat","rhythm","instrument","melody","concert","lyrics","album","dance","harmony",
  "winter","melt","blizzard","ski","snowman","sled","frost","chill","powder","shovel",
  "puddle","shower","drizzle","downpour","forecast","raincoat","spring","flood","weather","drench",
  "precious","metal","ring","rare","coin","treasure","medal","jewelry","luxury","sparkle",
  "star","moon","rest","quiet","dream","black","midnight","shadow","owl","calm",
  "bulb","ray","illuminate","candle","switch","beam","sunshine","spark","flash","glimmer",
  "silhouette","shade","ghost","lurking","outline","eclipse","darkness","trace","haunting","mystery",
  "climb","peak","snow","rock","summit","range","altitude","cliff","valley","ridge",
  "flow","stream","bank","fish","current","delta","rapids","canoe","shore","flowing",
  "wave","deep","salt","sea","vast","coral","whale","horizon","depth","marine",
  "white","rain","float","fluffy","gray","high","storm","puffy","weather","drift",
  "thunder","lightning","powerful","hurricane","tornado","warning","flood","shelter","chaos","downpour",
  "blow","cold","gust","kite","sail","breeze","tornado","turbine","draft","rustle",
  "stone","heavy","solid","concert","mineral","cliff","boulder","pebble","geology","fossil",
  "freeze","slippery","cube","rink","glacier","skate","frost","crystal","polar","iceberg",
  "desert","yellow","castle","grain","dune","hourglass","footprint","sandbox","shovel","barefoot",
  "mow","yard","meadow","picnic","dew","turf","wild","blade","park","barefoot",
  "branch","rustle","veins","season","maple","crisp","wither","rake","autumn","color",
  "plant","potential","garden","sprout","harvest","sow","germinate","bud","cycle","nature",
  "cigarette","chimney","alarm","ash","screen","billow","toxic","wisp","warning","signal",
  "donate","pulse","circulation","platelet","transfusion","scar","pump","drop","vampire","vein",
];

async function generateAssociations(word) {
  const prompt = `You are a semantic association expert modeling average human word associations.

For the word "${word}", list exactly 30 words that people most commonly free-associate with it, ranked from STRONGEST to WEAKEST association.

Rules:
- Single words only (no phrases)
- Common English words a typical adult would think of
- Ranked by how many people would think of it first
- No repeats, no numbers, no punctuation
- Return ONLY a JSON array of 30 strings, nothing else

Example format: ["word1","word2","word3",...]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.1, topP: 0.8 },
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  const clean = text.replace(/```json\n?|```/g, "").trim();
  const parsed = JSON.parse(clean);
  if (!Array.isArray(parsed)) throw new Error("Not an array");
  return parsed
    .filter(x => typeof x === "string")
    .map(s => s.toLowerCase().trim())
    .filter(s => s.length > 0 && s !== word.toLowerCase())
    .slice(0, 30);
}

function readCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")); }
  catch { return {}; }
}

function writeCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  if (!API_KEY) {
    console.error("❌ Set GEMINI_API_KEY environment variable first");
    process.exit(1);
  }

  const wordsArg = process.argv.slice(2);
  const words = wordsArg.length > 0
    ? wordsArg
    : [...new Set(WORDS_TO_WARM.map(w => w.toLowerCase()))];

  const cache = readCache();
  const toGenerate = words.filter(w => !cache[w] || cache[w].length < 25);

  console.log(`📚 Cache has ${Object.keys(cache).length} words`);
  console.log(`🔥 Need to generate: ${toGenerate.length} words`);
  console.log(`✅ Already cached: ${words.length - toGenerate.length} words\n`);

  if (toGenerate.length === 0) {
    console.log("All words already cached! Nothing to do.");
    return;
  }

  let success = 0, failed = 0;

  for (let i = 0; i < toGenerate.length; i++) {
    const word = toGenerate[i];
    process.stdout.write(`[${i + 1}/${toGenerate.length}] ${word}... `);
    try {
      const assocs = await generateAssociations(word);
      cache[word] = assocs;
      writeCache(cache);
      console.log(`✓ (${assocs.length} words)`);
      success++;
      // Respect rate limits — Gemini Flash free tier: 15 RPM
      await sleep(1000);
    } catch (e) {
      console.log(`✗ ${e.message}`);
      failed++;
      await sleep(2000);
    }
  }

  console.log(`\n✅ Done! ${success} generated, ${failed} failed`);
  console.log(`📚 Cache now has ${Object.keys(readCache()).length} words`);
}

main().catch(console.error);
