import { AssociationMap } from "@/types";

// Primary association map - top 20 human associations per word, ranked 1-20.
// Based on free association norms and common semantic links.
export const ASSOCIATION_MAP: AssociationMap = {
  // Animals
  dog: ["bone", "cat", "pet", "bark", "puppy", "leash", "fur", "tail", "fetch", "friend", "loyal", "wag", "collar", "paw", "vet", "walk", "kennel", "breed", "guard", "puppy love"],
  cat: ["dog", "meow", "purr", "fur", "mouse", "kitten", "whiskers", "pet", "claw", "nap", "litter", "tail", "scratch", "lazy", "yarn", "feline", "hiss", "paw", "independent", "milk"],
  fish: ["water", "sea", "swim", "scales", "hook", "ocean", "shark", "fin", "pond", "net", "tank", "bait", "gill", "school", "river", "fry", "aquarium", "fillet", "salmon", "bowl"],
  bird: ["fly", "wing", "nest", "egg", "feather", "sky", "sing", "tree", "beak", "cage", "flock", "migrate", "chirp", "perch", "flight", "robin", "eagle", "tweet", "nature", "freedom"],
  horse: ["ride", "stable", "gallop", "saddle", "mane", "farm", "race", "hoof", "barn", "cowboy", "trot", "rein", "pony", "carriage", "field", "jockey", "hay", "stallion", "western", "trail"],

  // Body / anatomy
  bone: ["dog", "skeleton", "break", "calcium", "marrow", "joint", "skull", "hard", "chew", "ghost", "fracture", "rib", "spine", "x-ray", "white", "fossil", "structure", "body", "ache", "cartilage"],
  skull: ["bone", "death", "pirate", "brain", "crossbones", "head", "skeleton", "danger", "dark", "tattoo", "halloween", "x-ray", "cranium", "warning", "anatomy", "fear", "grave", "poison", "bone", "horror"],
  heart: ["love", "blood", "beat", "chest", "pump", "emotion", "red", "valentine", "care", "life", "pulse", "soul", "feeling", "romance", "warmth", "rhythm", "broken", "cardiac", "true", "kind"],
  brain: ["mind", "think", "skull", "neuron", "smart", "head", "knowledge", "idea", "memory", "logic", "intelligence", "thought", "puzzle", "learning", "wisdom", "psychology", "genius", "focus", "creative", "study"],
  eye: ["see", "sight", "vision", "blue", "blink", "pupil", "look", "iris", "watch", "glass", "tear", "lash", "stare", "glance", "contact", "view", "wink", "perception", "focus", "color"],

  // Nature
  tree: ["leaf", "wood", "forest", "root", "branch", "shade", "climb", "bird", "park", "tall", "trunk", "oak", "nature", "fruit", "green", "shelter", "growth", "wind", "garden", "carbon"],
  flower: ["bloom", "petal", "garden", "rose", "bee", "color", "plant", "spring", "gift", "smell", "vase", "bouquet", "tulip", "fragrance", "pollen", "bud", "wedding", "nature", "soft", "beauty"],
  sun: ["light", "warm", "bright", "sky", "shine", "hot", "yellow", "star", "day", "burn", "summer", "rise", "sunset", "energy", "beach", "ray", "heat", "tan", "vitamin", "solar"],
  moon: ["night", "star", "glow", "sky", "dark", "orbit", "silver", "dream", "tide", "crescent", "lunar", "eclipse", "werewolf", "space", "full", "light", "phase", "romance", "cycle", "calm"],
  water: ["wave", "drink", "ocean", "river", "blue", "swim", "wet", "flow", "rain", "clear", "thirst", "lake", "pool", "ice", "splash", "hydrate", "tap", "bottle", "stream", "life"],
  fire: ["hot", "burn", "flame", "heat", "red", "wood", "smoke", "light", "danger", "warm", "spark", "camp", "ash", "blaze", "ember", "destruction", "passion", "alarm", "candle", "energy"],
  earth: ["ground", "soil", "planet", "dirt", "nature", "world", "rock", "land", "life", "green", "global", "gravity", "environment", "continent", "home", "sphere", "ecosystem", "mud", "garden", "core"],

  // Objects
  book: ["read", "story", "page", "library", "learn", "author", "cover", "word", "knowledge", "shelf", "novel", "chapter", "fiction", "paper", "title", "bookmark", "literature", "print", "school", "imagination"],
  car: ["drive", "road", "wheel", "fast", "engine", "gas", "speed", "trip", "seat", "door", "highway", "traffic", "garage", "tire", "vehicle", "key", "horn", "brake", "parking", "mirror"],
  house: ["home", "family", "roof", "door", "room", "wall", "window", "yard", "live", "building", "kitchen", "garden", "neighbor", "shelter", "key", "mortgage", "address", "comfort", "porch", "furniture"],
  phone: ["call", "text", "screen", "talk", "ring", "contact", "app", "camera", "smart", "number", "charger", "message", "battery", "signal", "internet", "selfie", "speaker", "voicemail", "mobile", "social"],
  key: ["lock", "door", "open", "car", "ring", "secret", "house", "music", "note", "answer", "code", "chain", "vault", "password", "unlock", "important", "piano", "spare", "metal", "hidden"],

  // Food & drink
  food: ["eat", "meal", "taste", "hunger", "cook", "kitchen", "diet", "energy", "plate", "restaurant", "recipe", "dinner", "flavor", "nutrition", "snack", "menu", "grocery", "delicious", "fresh", "table"],
  apple: ["fruit", "tree", "red", "eat", "juice", "pie", "sweet", "school", "healthy", "bite", "core", "orchard", "cider", "seed", "crisp", "teacher", "doctor", "green", "snack", "fall"],
  bread: ["butter", "toast", "wheat", "bake", "soft", "sandwich", "flour", "oven", "yeast", "slice", "crust", "loaf", "bakery", "rise", "grain", "dough", "warm", "crumb", "gluten", "table"],
  milk: ["white", "drink", "cow", "dairy", "cold", "pour", "cream", "calcium", "baby", "glass", "carton", "cereal", "fresh", "bottle", "yogurt", "cheese", "farm", "shake", "lactose", "nutrition"],
  coffee: ["morning", "hot", "drink", "dark", "wake", "cup", "bean", "espresso", "brown", "energy", "caffeine", "mug", "brew", "latte", "cafe", "roast", "black", "aroma", "milk", "buzz"],
  cake: ["sweet", "birthday", "bake", "frosting", "slice", "party", "celebrate", "sugar", "candle", "eat", "wedding", "layer", "icing", "dessert", "chocolate", "bakery", "treat", "moist", "spongy", "occasion"],

  // Places
  school: ["learn", "teacher", "class", "student", "book", "grade", "desk", "pencil", "rule", "friend", "homework", "bus", "lesson", "exam", "playground", "lunch", "subject", "education", "uniform", "principal"],
  hospital: ["doctor", "nurse", "sick", "health", "medicine", "care", "bed", "emergency", "white", "help", "patient", "surgery", "ambulance", "treatment", "ward", "clinic", "recovery", "injection", "stethoscope", "urgent"],
  city: ["street", "building", "people", "busy", "noise", "urban", "traffic", "tall", "culture", "downtown", "skyline", "subway", "crowd", "lights", "metropolis", "apartment", "bustle", "diverse", "nightlife", "concrete"],
  beach: ["sand", "wave", "ocean", "sun", "swim", "shell", "summer", "relax", "umbrella", "surf", "tan", "towel", "vacation", "coast", "seagull", "shore", "bikini", "tide", "palm", "barefoot"],
  forest: ["tree", "green", "dark", "animal", "hike", "trail", "nature", "bird", "leaf", "path", "wildlife", "woods", "canopy", "moss", "quiet", "camping", "wilderness", "shade", "fern", "explore"],

  // Concepts
  love: ["heart", "care", "warm", "feel", "romantic", "deep", "true", "emotion", "bond", "sweet", "passion", "affection", "kiss", "soulmate", "devotion", "marriage", "trust", "tender", "forever", "happiness"],
  time: ["clock", "hour", "pass", "second", "minute", "day", "wait", "fast", "slow", "value", "schedule", "calendar", "deadline", "moment", "future", "past", "watch", "rush", "precious", "eternal"],
  money: ["cash", "spend", "bank", "dollar", "rich", "earn", "save", "gold", "coin", "work", "wealth", "salary", "budget", "credit", "poor", "currency", "invest", "debt", "wallet", "loan"],
  dream: ["sleep", "night", "wish", "imagine", "cloud", "hope", "deep", "float", "vision", "fantasy", "nightmare", "goal", "ambition", "subconscious", "surreal", "aspiration", "fairy tale", "wonder", "rest", "future"],
  fear: ["dark", "scary", "panic", "heart", "hide", "danger", "anxiety", "threat", "shake", "cold", "phobia", "nightmare", "horror", "fright", "tremble", "worry", "alarm", "scream", "courage", "spider"],

  // Actions
  run: ["fast", "sprint", "race", "legs", "sweat", "exercise", "track", "marathon", "chase", "flee", "jog", "stamina", "cardio", "speed", "finish", "shoes", "breath", "athlete", "endurance", "escape"],
  fly: ["bird", "wing", "sky", "plane", "high", "float", "air", "free", "dream", "soar", "flight", "pilot", "cloud", "altitude", "glide", "feather", "travel", "kite", "wind", "insect"],
  swim: ["water", "pool", "fish", "float", "stroke", "dive", "wet", "ocean", "lap", "breathe", "goggles", "lane", "splash", "current", "drown", "athlete", "chlorine", "freestyle", "wave", "buoyant"],
  fight: ["punch", "battle", "war", "defend", "argue", "compete", "win", "lose", "anger", "strong", "boxing", "conflict", "struggle", "enemy", "wound", "resist", "rivalry", "violence", "courage", "weapon"],

  // People
  child: ["school", "play", "young", "parent", "grow", "learn", "toy", "joy", "small", "innocent", "kid", "baby", "laughter", "curious", "school bus", "family", "wonder", "playground", "energy", "youth"],
  parent: ["child", "love", "care", "family", "guide", "protect", "mother", "father", "teach", "support", "responsibility", "home", "sacrifice", "raise", "discipline", "nurture", "wisdom", "patience", "household", "bond"],
  friend: ["trust", "loyal", "talk", "laugh", "share", "bond", "help", "care", "close", "fun", "companion", "support", "memories", "best", "honest", "loyalty", "buddy", "together", "kindness", "connection"],
  teacher: ["school", "learn", "class", "student", "grade", "lesson", "chalk", "knowledge", "explain", "guide", "education", "homework", "patience", "mentor", "classroom", "test", "subject", "wisdom", "inspire", "curriculum"],
  doctor: ["hospital", "sick", "medicine", "cure", "health", "nurse", "stethoscope", "diagnose", "heal", "coat", "patient", "clinic", "appointment", "surgery", "checkup", "prescription", "expert", "care", "treatment", "white coat"],

  // Colors
  red: ["fire", "blood", "rose", "love", "stop", "warm", "apple", "danger", "hot", "bold", "passion", "anger", "valentine", "lipstick", "ruby", "crimson", "siren", "alert", "wine", "cherry"],
  blue: ["sky", "ocean", "water", "calm", "cool", "deep", "sad", "clear", "cold", "gentle", "navy", "denim", "peaceful", "ice", "sapphire", "tranquil", "sea", "azure", "melancholy", "serene"],
  green: ["nature", "tree", "grass", "fresh", "grow", "leaf", "earth", "healthy", "spring", "cool", "envy", "money", "eco", "forest", "lime", "vegetable", "organic", "emerald", "calm", "fresh start"],

  // Toys & play
  toy: ["child", "play", "fun", "game", "doll", "plastic", "gift", "colorful", "joy", "young", "blocks", "teddy bear", "robot", "puzzle", "store", "kid", "imagination", "birthday", "collection", "miniature"],
  game: ["play", "win", "fun", "compete", "score", "challenge", "team", "lose", "board", "rule", "video", "level", "strategy", "puzzle", "controller", "tournament", "league", "championship", "match", "skill"],
  ball: ["throw", "round", "play", "sport", "bounce", "kick", "catch", "roll", "game", "rubber", "soccer", "basketball", "court", "field", "team", "pitch", "goal", "spherical", "toy", "stadium"],

  // Technology
  computer: ["screen", "type", "internet", "code", "work", "digital", "keyboard", "mouse", "data", "program", "software", "laptop", "hardware", "monitor", "tech", "processor", "memory", "click", "browser", "wifi"],
  internet: ["web", "connect", "online", "search", "social", "browse", "network", "fast", "data", "global", "website", "wifi", "email", "stream", "cloud", "router", "download", "digital", "media", "viral"],

  // More nouns
  star: ["sky", "night", "bright", "shine", "wish", "space", "moon", "glow", "yellow", "famous", "celebrity", "constellation", "galaxy", "twinkle", "north", "sparkle", "telescope", "wonder", "hollywood", "shooting"],
  music: ["sound", "song", "beat", "rhythm", "instrument", "listen", "feel", "guitar", "notes", "band", "melody", "concert", "lyrics", "album", "dance", "harmony", "tune", "piano", "radio", "playlist"],
  snow: ["cold", "white", "winter", "fall", "ice", "christmas", "silent", "melt", "flake", "freeze", "blizzard", "ski", "snowman", "sled", "frost", "chill", "powder", "mountain", "holiday", "shovel"],
  rain: ["water", "wet", "cloud", "fall", "gray", "storm", "umbrella", "drop", "thunder", "cold", "puddle", "shower", "drizzle", "downpour", "forecast", "raincoat", "spring", "flood", "weather", "drench"],
  gold: ["yellow", "precious", "metal", "shine", "ring", "rich", "rare", "coin", "warm", "bright", "treasure", "medal", "wealth", "jewelry", "luxury", "shiny", "prize", "valuable", "ore", "sparkle"],
  night: ["dark", "sleep", "star", "moon", "quiet", "dream", "rest", "cool", "late", "black", "midnight", "shadow", "owl", "calm", "stars", "lullaby", "darkness", "evening", "silence", "nocturnal"],
  light: ["bright", "sun", "shine", "warm", "lamp", "glow", "fast", "soft", "white", "energy", "bulb", "ray", "illuminate", "candle", "switch", "beam", "sunshine", "spark", "flash", "glimmer"],
  shadow: ["dark", "light", "follow", "black", "night", "quiet", "hidden", "dim", "cool", "mystery", "silhouette", "shade", "ghost", "lurking", "outline", "eclipse", "darkness", "trace", "puppet", "haunting"],
  mountain: ["high", "climb", "peak", "snow", "rock", "tall", "trail", "hike", "cold", "nature", "summit", "range", "altitude", "cliff", "valley", "expedition", "ridge", "alpine", "elevation", "majestic"],
  river: ["water", "flow", "stream", "bank", "fish", "current", "wide", "nature", "bend", "boat", "delta", "rapids", "tributary", "canoe", "shore", "flowing", "valley", "source", "fresh", "winding"],
  ocean: ["water", "wave", "deep", "blue", "salt", "sea", "fish", "vast", "beach", "swim", "tide", "current", "coral", "whale", "horizon", "depth", "shore", "marine", "voyage", "endless"],
  cloud: ["sky", "soft", "white", "rain", "float", "fluffy", "dream", "gray", "high", "light", "storm", "puffy", "weather", "drift", "overcast", "shape", "cotton", "sky high", "horizon", "mist"],
  storm: ["rain", "wind", "thunder", "lightning", "dark", "powerful", "scary", "cloud", "electric", "danger", "hurricane", "tornado", "warning", "flood", "shelter", "chaos", "downpour", "siren", "severe", "wild"],
  wind: ["blow", "air", "cold", "fast", "whistle", "gust", "kite", "sail", "feel", "storm", "breeze", "tornado", "turbine", "draft", "chill", "current", "rustle", "weather", "force", "invisible"],
  rock: ["hard", "stone", "heavy", "solid", "music", "mountain", "ground", "mineral", "cliff", "ancient", "boulder", "pebble", "concert", "climb", "geology", "sediment", "fossil", "quarry", "gravel", "band"],
  ice: ["cold", "water", "freeze", "white", "snow", "slippery", "melt", "cube", "hard", "rink", "glacier", "skate", "frost", "chill", "frozen", "winter", "crystal", "polar", "iceberg", "cooler"],
  sand: ["beach", "fine", "desert", "yellow", "soft", "castle", "grain", "warm", "grit", "time", "dune", "shore", "hourglass", "footprint", "tan", "sandbox", "shovel", "wave", "barefoot", "coast"],
  grass: ["green", "grow", "lawn", "soft", "cut", "field", "fresh", "nature", "spring", "blade", "mow", "yard", "meadow", "picnic", "dew", "turf", "garden", "barefoot", "park", "wild"],
  leaf: ["tree", "green", "fall", "nature", "light", "thin", "autumn", "plant", "flutter", "shape", "branch", "rustle", "veins", "season", "maple", "crisp", "wind", "color", "wither", "rake"],
  seed: ["grow", "plant", "ground", "small", "start", "potential", "garden", "fruit", "soil", "life", "sprout", "harvest", "sow", "root", "germinate", "bud", "future", "tiny", "nature", "cycle"],
  smoke: ["fire", "gray", "dark", "signal", "haze", "cloud", "burn", "air", "rise", "danger", "smell", "cigarette", "chimney", "alarm", "ash", "screen", "billow", "toxic", "wisp", "warning"],
  blood: ["red", "life", "vein", "heart", "flow", "wound", "warm", "iron", "body", "vital", "donate", "pulse", "circulation", "platelet", "transfusion", "scar", "pump", "type", "drop", "vampire"],
};

// Daily seed word schedule - 90 days of puzzles
export const DAILY_SEEDS = [
  "dog", "sun", "ocean", "book", "fire", "dream", "star", "apple", "rain", "music",
  "heart", "cloud", "tree", "night", "water", "mountain", "gold", "light", "bird", "snow",
  "cat", "moon", "river", "school", "wind", "flower", "city", "rock", "ice", "love",
  "horse", "earth", "beach", "food", "storm", "friend", "forest", "coffee", "red", "time",
  "eye", "grass", "computer", "shadow", "cake", "parent", "blue", "sand", "game", "fear",
  "fish", "sky", "leaf", "doctor", "smoke", "child", "green", "blood", "toy", "money",
  "brain", "phone", "seed", "teacher", "rain", "bone", "milk", "car", "key", "run",
  "skull", "house", "bread", "swim", "ball", "fly", "internet", "fire", "ice", "dark",
  "star", "mountain", "ocean", "cat", "dream", "book", "friend", "music", "heart", "sun",
];

// Bridge mode: semantically distant word pairs — interesting to navigate between
export const BRIDGE_PAIRS: [string, string][] = [
  ["ocean", "sky"],    ["dog", "moon"],     ["fire", "water"],   ["book", "forest"],
  ["dream", "stone"],  ["star", "earth"],   ["music", "silence"],["heart", "machine"],
  ["cloud", "root"],   ["light", "shadow"], ["child", "ancient"],["city", "wilderness"],
  ["fear", "love"],    ["ice", "flame"],    ["bird", "fish"],    ["road", "island"],
  ["bread", "storm"],  ["eye", "mountain"], ["gold", "rain"],    ["mind", "body"],
  ["sun", "night"],    ["tree", "ocean"],   ["word", "stone"],   ["time", "flower"],
  ["cat", "thunder"],  ["snow", "desert"],  ["game", "reality"], ["river", "smoke"],
  ["friend", "enemy"], ["school", "jungle"],["brain", "heart"],  ["car", "horse"],
  ["phone", "nature"], ["rock", "feather"], ["sand", "forest"],  ["sleep", "war"],
  ["coin", "river"],   ["art", "science"],  ["home", "wilderness"],["voice", "silence"],
  ["laugh", "tear"],   ["book", "sword"],   ["door", "wave"],    ["milk", "thunder"],
  ["apple", "ocean"],  ["key", "dream"],    ["dark", "bloom"],   ["bone", "cloud"],
  ["coffee", "moon"],  ["fish", "fire"],    ["eye", "earth"],    ["cage", "sky"],
  ["clock", "forest"], ["bread", "star"],   ["storm", "peace"],  ["mirror", "mountain"],
  ["tooth", "music"],  ["hand", "wind"],    ["blood", "flower"], ["ship", "desert"],
  ["brain", "storm"],  ["ice", "volcano"],  ["ghost", "city"],   ["stone", "butterfly"],
  ["map", "ocean"],    ["ink", "rainbow"],  ["fog", "sunrise"],  ["coin", "music"],
  ["wolf", "moon"],    ["seed", "sky"],     ["sword", "poetry"], ["cave", "star"],
  ["snow", "fire"],    ["child", "wisdom"], ["echo", "mountain"],["web", "dew"],
  ["crown", "dust"],   ["night", "birth"],  ["path", "island"],  ["river", "cloud"],
  ["dog", "star"],     ["rose", "iron"],    ["earth", "song"],   ["dream", "anchor"],
  ["fear", "flight"],  ["winter", "bloom"], ["eye", "storm"],    ["salt", "sweet"],
  ["bone", "sky"],     ["root", "storm"],   ["fish", "mountain"],["light", "cave"],
];

// Puzzle metadata (start date = day 0)
export const PUZZLE_START_DATE = new Date("2024-01-15T00:00:00.000Z");

export function getDayId(date: Date = new Date()): string {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return utcDate.toISOString().split("T")[0];
}

export function getPuzzleNumber(date: Date = new Date()): number {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const startDate = new Date(Date.UTC(2024, 0, 15));
  const diffMs = utcDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

export function getSeedWordForDate(date: Date = new Date()): string {
  const puzzleNum = getPuzzleNumber(date);
  const idx = ((puzzleNum - 1) % DAILY_SEEDS.length + DAILY_SEEDS.length) % DAILY_SEEDS.length;
  return DAILY_SEEDS[idx];
}

export function getBridgePairForDate(date: Date = new Date()): [string, string] {
  const puzzleNum = getPuzzleNumber(date);
  const idx = ((puzzleNum - 1) % BRIDGE_PAIRS.length + BRIDGE_PAIRS.length) % BRIDGE_PAIRS.length;
  return BRIDGE_PAIRS[idx];
}

export function getTodaysPuzzle() {
  const now = new Date();
  const [startWord, targetWord] = getBridgePairForDate(now);
  return {
    dayId: getDayId(now),
    puzzleNumber: getPuzzleNumber(now),
    date: now.toUTCString(),
    // Endless mode
    seedWord: getSeedWordForDate(now),
    // Bridge mode
    startWord,
    targetWord,
  };
}

// Get associations for a word from the static map
export function getStaticAssociations(word: string): string[] {
  const normalized = word.toLowerCase().trim();
  return ASSOCIATION_MAP[normalized] || [];
}

// Check if a guess is valid using static map
export function isValidGuessStatic(currentWord: string, guess: string, topK: number = 30): boolean {
  const associations = getStaticAssociations(currentWord);
  const normalizedGuess = guess.toLowerCase().trim();
  return associations.slice(0, topK).includes(normalizedGuess);
}

// Get rank of guess in associations
export function getGuessRank(currentWord: string, guess: string): number {
  const associations = getStaticAssociations(currentWord);
  const normalizedGuess = guess.toLowerCase().trim();
  const idx = associations.indexOf(normalizedGuess);
  return idx >= 0 ? idx + 1 : -1;
}
