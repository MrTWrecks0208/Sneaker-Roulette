import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SneakerData {
  brand: string;
  model: string;
  colorway: string;
  height: string;
  style: string[];
  colors: string[];
  image_url: string;
  // Canonical search terms. Each alias is a specific string that SHOULD match this shoe.
  // More specific aliases beat generic ones during scoring.
  aliases: string[];
}

const SNEAKER_DB: SneakerData[] = [
  // ─── NIKE AIR FORCE 1 ───────────────────────────────────────────────────────
  { brand: "Nike", model: "Air Force 1", variant: "Low", colorway: "White", height: "Low", style: ["Casual", "Lifestyle", "Basketball"], colors: ["White"], image_url: "", aliases: ["air force 1 low white", "af1 low white", "air force 1 white", "af1 white", "air force 1 low", "af1 low", "air force 1", "af1", "air force one"] },
  { brand: "Nike", model: "Air Force 1", variant: "Mid", colorway: "White", height: "Mid", style: ["Casual", "Lifestyle", "Basketball"], colors: ["White"], image_url: "", aliases: ["air force 1 mid white", "af1 mid white", "air force 1 mid", "af1 mid"] },
  { brand: "Nike", model: "Air Force 1", variant: "High", colorway: "White", height: "High", style: ["Casual", "Lifestyle", "Basketball"], colors: ["White"], image_url: "", aliases: ["air force 1 high white", "af1 high white", "air force 1 high", "af1 high"] },

  // ─── NIKE AIR MAX ────────────────────────────────────────────────────────────
  { brand: "Nike", model: "Air Max 1", variant: "", colorway: "Obsidian", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["Blue", "White"], image_url: "", aliases: ["air max 1 obsidian", "am1 obsidian", "air max 1", "am1"] },
  { brand: "Nike", model: "Air Max 90", variant: "Essential", colorway: "Infrared", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["Red", "White", "Grey"], image_url: "", aliases: ["air max 90 infrared", "am90 infrared", "air max 90 essential infrared", "air max 90", "am90"] },
  { brand: "Nike", model: "Air Max 90", variant: "Essential", colorway: "Bacon", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["Brown", "Red", "White"], image_url: "", aliases: ["air max 90 bacon", "am90 bacon"] },
  { brand: "Nike", model: "Air Max 95", variant: "", colorway: "Neon", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["Yellow", "Black", "Grey"], image_url: "", aliases: ["air max 95 neon", "am95 neon", "air max 95", "am95"] },
  { brand: "Nike", model: "Air Max 97", variant: "", colorway: "Silver Bullet", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["Silver", "Red", "White"], image_url: "", aliases: ["air max 97 silver bullet", "am97 silver bullet", "air max 97", "am97"] },

  // ─── NIKE DUNK ───────────────────────────────────────────────────────────────
  { brand: "Nike", model: "Dunk Low", variant: "", colorway: "Panda", height: "Low", style: ["Casual", "Skateboarding", "Lifestyle"], colors: ["Black", "White"], image_url: "", aliases: ["dunk low panda", "nike dunk low panda", "dunk low black white", "dunk low", "nike dunk low", "nike dunk"] },
  { brand: "Nike", model: "Dunk High", variant: "", colorway: "Panda", height: "High", style: ["Casual", "Skateboarding", "Lifestyle"], colors: ["Black", "White"], image_url: "", aliases: ["dunk high panda", "nike dunk high panda", "dunk high black white", "dunk high", "nike dunk high"] },
  { brand: "Nike", model: "Dunk Low", variant: "SP", colorway: "Cactus Jack", height: "Low", style: ["Casual", "Lifestyle", "Limited Edition"], colors: ["Brown", "Black"], image_url: "", aliases: ["dunk low travis scott", "dunk low cactus jack", "travis scott dunk"] },
  { brand: "Nike", model: "Dunk Low", variant: "SE", colorway: "Peach Cream", height: "Low", style: ["Casual", "Lifestyle"], colors: ["Beige", "Brown"], image_url: "", aliases: ["dunk low peach cream"] },

  // ─── NIKE BLAZER ─────────────────────────────────────────────────────────────
  { brand: "Nike", model: "Blazer Mid", variant: "77 Vintage", colorway: "White/Black", height: "Mid", style: ["Casual", "Skateboarding", "Retro"], colors: ["White", "Black"], image_url: "", aliases: ["blazer mid 77 vintage", "blazer mid 77", "blazer mid white black", "blazer mid", "nike blazer mid", "blazer", "nike blazer"] },

  // ─── NIKE SB ─────────────────────────────────────────────────────────────────
  { brand: "Nike", model: "SB Dunk Low", variant: "", colorway: "Black/White", height: "Low", style: ["Skateboarding", "Casual"], colors: ["Black", "White"], image_url: "", aliases: ["sb dunk low", "nike sb dunk low", "sb dunk"] },
  { brand: "Nike", model: "SB Janoski", variant: "", colorway: "Black/White", height: "Low", style: ["Skateboarding", "Casual"], colors: ["Black", "White"], image_url: "", aliases: ["sb janoski", "janoski", "stefan janoski"] },

  // ─── NIKE RUNNING ────────────────────────────────────────────────────────────
  { brand: "Nike", model: "Pegasus 40", variant: "", colorway: "Black/White", height: "Low", style: ["Running", "Athletic"], colors: ["Black", "White"], image_url: "", aliases: ["pegasus 40", "air zoom pegasus 40", "nike pegasus 40", "pegasus"] },
  { brand: "Nike", model: "Cortez", variant: "", colorway: "White/Red/Blue", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["White", "Red", "Blue"], image_url: "", aliases: ["nike cortez", "cortez"] },

  // ─── AIR JORDAN 1 ────────────────────────────────────────────────────────────
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro High OG", colorway: "Chicago", height: "High", style: ["Basketball", "Lifestyle", "Retro"], colors: ["Red", "White", "Black"], image_url: "", aliases: ["jordan 1 retro high og chicago", "jordan 1 chicago", "aj1 chicago", "air jordan 1 chicago"] },
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro High OG", colorway: "Black Toe", height: "High", style: ["Basketball", "Lifestyle", "Retro"], colors: ["Black", "White", "Red"], image_url: "", aliases: ["jordan 1 retro high black toe", "jordan 1 black toe", "aj1 black toe", "air jordan 1 black toe", "jordan 1 retro high og black toe"] },
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro High OG", colorway: "Bred", height: "High", style: ["Basketball", "Lifestyle", "Retro"], colors: ["Black", "Red"], image_url: "", aliases: ["jordan 1 bred", "jordan 1 retro high bred", "aj1 bred", "air jordan 1 bred"] },
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro High OG", colorway: "Royal Blue", height: "High", style: ["Basketball", "Lifestyle", "Retro"], colors: ["Blue", "Black", "White"], image_url: "", aliases: ["jordan 1 royal blue", "jordan 1 royal", "aj1 royal", "air jordan 1 royal"] },
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro High OG", colorway: "Shadow", height: "High", style: ["Basketball", "Lifestyle", "Retro"], colors: ["Black", "Grey", "White"], image_url: "", aliases: ["jordan 1 shadow", "aj1 shadow", "air jordan 1 shadow"] },
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro High OG", colorway: "Satin Black Toe", height: "High", style: ["Basketball", "Lifestyle", "Limited Edition"], colors: ["Black", "White", "Red"], image_url: "", aliases: ["jordan 1 satin black toe"] },
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro High OG", colorway: "University Blue", height: "High", style: ["Basketball", "Lifestyle"], colors: ["Blue", "White"], image_url: "", aliases: ["jordan 1 university blue", "aj1 university blue"] },
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro High OG", colorway: "Dark Mocha", height: "High", style: ["Basketball", "Lifestyle"], colors: ["Brown", "Black", "White"], image_url: "", aliases: ["jordan 1 dark mocha", "aj1 dark mocha", "jordan 1 mocha"] },
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro High", colorway: "Travis Scott", height: "High", style: ["Basketball", "Lifestyle", "Limited Edition"], colors: ["Brown", "White", "Black"], image_url: "", aliases: ["jordan 1 travis scott", "jordan 1 reverse mocha", "aj1 travis scott", "air jordan 1 travis scott cactus jack"] },
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro Low", colorway: "Bred Toe", height: "Low", style: ["Basketball", "Casual", "Retro"], colors: ["Black", "Red", "White"], image_url: "", aliases: ["jordan 1 low bred toe", "aj1 low bred toe"] },
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro High OG", colorway: "Obsidian", height: "High", style: ["Basketball", "Lifestyle"], colors: ["Blue", "White"], image_url: "", aliases: ["jordan 1 obsidian", "aj1 obsidian"] },
  // Generic AJ1 fallback — only match if no colorway is in the query
  { brand: "Jordan", model: "Air Jordan 1", variant: "Retro High OG", colorway: "White/Black", height: "High", style: ["Basketball", "Lifestyle", "Retro"], colors: ["White", "Black"], image_url: "", aliases: ["jordan 1 retro high", "jordan 1 high", "aj1 high", "air jordan 1 retro high og", "air jordan 1 retro high", "air jordan 1 high", "jordan 1", "aj1", "air jordan 1"] },

  // ─── AIR JORDAN 2-13 ─────────────────────────────────────────────────────────
  { brand: "Jordan", model: "Air Jordan 3", variant: "Retro", colorway: "White Cement", height: "High", style: ["Basketball", "Retro"], colors: ["White", "Grey", "Black"], image_url: "", aliases: ["jordan 3 white cement", "aj3 white cement", "air jordan 3 white cement"] },
  { brand: "Jordan", model: "Air Jordan 3", variant: "Retro", colorway: "Fire Red", height: "High", style: ["Basketball", "Retro"], colors: ["White", "Red", "Black"], image_url: "", aliases: ["jordan 3 fire red", "aj3 fire red", "jordan 3", "aj3", "air jordan 3"] },
  { brand: "Jordan", model: "Air Jordan 4", variant: "Retro", colorway: "Bred", height: "High", style: ["Basketball", "Retro"], colors: ["Black", "Red"], image_url: "", aliases: ["jordan 4 bred", "aj4 bred", "air jordan 4 bred"] },
  { brand: "Jordan", model: "Air Jordan 4", variant: "Retro", colorway: "Military Black", height: "High", style: ["Basketball", "Retro", "Casual"], colors: ["Black", "White", "Grey"], image_url: "", aliases: ["jordan 4 military black", "aj4 military black", "jordan 4 military", "air jordan 4 military"] },
  { brand: "Jordan", model: "Air Jordan 4", variant: "Retro", colorway: "White Cement", height: "High", style: ["Basketball", "Retro"], colors: ["White", "Grey", "Black"], image_url: "", aliases: ["jordan 4 white cement", "aj4 white cement", "jordan 4", "aj4", "air jordan 4"] },
  { brand: "Jordan", model: "Air Jordan 5", variant: "Retro", colorway: "Grape", height: "High", style: ["Basketball", "Retro"], colors: ["Purple", "White", "Teal"], image_url: "", aliases: ["jordan 5 grape", "aj5 grape"] },
  { brand: "Jordan", model: "Air Jordan 5", variant: "Retro", colorway: "Fire Red", height: "High", style: ["Basketball", "Retro"], colors: ["Black", "Red", "Grey"], image_url: "", aliases: ["jordan 5 fire red", "aj5 fire red", "jordan 5", "aj5", "air jordan 5"] },
  { brand: "Jordan", model: "Air Jordan 11", variant: "Retro", colorway: "Bred", height: "High", style: ["Basketball", "Retro", "Limited Edition"], colors: ["Black", "Red"], image_url: "", aliases: ["jordan 11 bred", "aj11 bred", "air jordan 11 bred"] },
  { brand: "Jordan", model: "Air Jordan 11", variant: "Retro", colorway: "Cool Grey", height: "High", style: ["Basketball", "Retro"], colors: ["Grey", "White"], image_url: "", aliases: ["jordan 11 cool grey", "aj11 cool grey"] },
  { brand: "Jordan", model: "Air Jordan 11", variant: "Retro Low", colorway: "Bred", height: "Low", style: ["Basketball", "Retro"], colors: ["Black", "Red", "White"], image_url: "", aliases: ["jordan 11 low bred", "aj11 low bred"] },
  { brand: "Jordan", model: "Air Jordan 11", variant: "Retro", colorway: "Space Jam", height: "High", style: ["Basketball", "Retro", "Limited Edition"], colors: ["Black", "Blue", "White"], image_url: "", aliases: ["jordan 11 space jam", "space jam 11", "jordan 11", "aj11", "air jordan 11"] },

  // ─── ADIDAS ──────────────────────────────────────────────────────────────────
  { brand: "Adidas", model: "Ultraboost", variant: "21", colorway: "Core Black", height: "Low", style: ["Running", "Athletic", "Casual"], colors: ["Black"], image_url: "", aliases: ["ultraboost 21 core black", "ultraboost 21 black", "ultraboost 21", "ultraboost black", "ultraboost", "ultra boost"] },
  { brand: "Adidas", model: "Ultraboost", variant: "Light", colorway: "Cloud White", height: "Low", style: ["Running", "Athletic", "Casual"], colors: ["White"], image_url: "", aliases: ["ultraboost light white", "ultraboost light cloud white", "ultraboost light"] },
  { brand: "Adidas", model: "Samba", variant: "OG", colorway: "White/Black/Gum", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["White", "Black"], image_url: "", aliases: ["samba og white black", "samba og", "adidas samba og", "samba white black", "adidas samba", "samba"] },
  { brand: "Adidas", model: "Samba", variant: "OG", colorway: "Black/White/Gum", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["Black", "White"], image_url: "", aliases: ["samba og black", "samba black", "samba black white"] },
  { brand: "Adidas", model: "Gazelle", variant: "", colorway: "Bold Green", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["Green", "White"], image_url: "", aliases: ["gazelle bold green", "adidas gazelle green", "adidas gazelle", "gazelle"] },
  { brand: "Adidas", model: "Campus", variant: "00s", colorway: "Core Black", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["Black", "White"], image_url: "", aliases: ["campus 00s black", "campus 00s core black", "adidas campus 00s black", "adidas campus 00s", "campus 00s", "adidas campus", "campus"] },
  { brand: "Adidas", model: "Stan Smith", variant: "", colorway: "White/Green", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["White", "Green"], image_url: "", aliases: ["stan smith white green", "adidas stan smith white green", "adidas stan smith", "stan smith"] },
  { brand: "Adidas", model: "Superstar", variant: "", colorway: "White/Black", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["White", "Black"], image_url: "", aliases: ["superstar white black", "adidas superstar white black", "adidas superstar", "superstar"] },
  { brand: "Adidas", model: "Forum Low", variant: "", colorway: "White/Blue", height: "Low", style: ["Casual", "Lifestyle", "Basketball"], colors: ["White", "Blue"], image_url: "", aliases: ["forum low white blue", "adidas forum low", "forum low", "adidas forum", "forum"] },
  { brand: "Adidas", model: "NMD R1", variant: "", colorway: "Core Black", height: "Low", style: ["Casual", "Lifestyle"], colors: ["Black", "White"], image_url: "", aliases: ["nmd r1 black", "adidas nmd r1", "nmd r1", "adidas nmd", "nmd"] },
  { brand: "Adidas", model: "ZX 8000", variant: "", colorway: "Aqua", height: "Low", style: ["Casual", "Retro", "Lifestyle"], colors: ["Teal", "White", "Yellow"], image_url: "", aliases: ["zx 8000 aqua", "adidas zx 8000", "zx 8000", "zx8000"] },

  // ─── YEEZY ───────────────────────────────────────────────────────────────────
  { brand: "Yeezy", model: "Yeezy Boost 350 V2", variant: "", colorway: "Zebra", height: "Low", style: ["Casual", "Lifestyle", "Limited Edition"], colors: ["White", "Black"], image_url: "", aliases: ["yeezy 350 v2 zebra", "yeezy boost 350 v2 zebra", "yeezy zebra", "350 v2 zebra", "yeezy 350 zebra"] },
  { brand: "Yeezy", model: "Yeezy Boost 350 V2", variant: "", colorway: "Beluga", height: "Low", style: ["Casual", "Lifestyle", "Limited Edition"], colors: ["Grey", "Orange"], image_url: "", aliases: ["yeezy 350 v2 beluga", "yeezy boost 350 v2 beluga", "yeezy beluga", "350 beluga"] },
  { brand: "Yeezy", model: "Yeezy Boost 350 V2", variant: "", colorway: "Static", height: "Low", style: ["Casual", "Lifestyle", "Limited Edition"], colors: ["Grey", "White"], image_url: "", aliases: ["yeezy 350 v2 static", "yeezy static", "350 v2 static"] },
  { brand: "Yeezy", model: "Yeezy Boost 350 V2", variant: "", colorway: "Black", height: "Low", style: ["Casual", "Lifestyle", "Limited Edition"], colors: ["Black"], image_url: "", aliases: ["yeezy 350 v2 black", "yeezy boost 350 black", "yeezy 350 black", "yeezy 350 v2"] },
  { brand: "Yeezy", model: "Yeezy Boost 350 V2", variant: "", colorway: "Natural", height: "Low", style: ["Casual", "Lifestyle"], colors: ["Beige"], image_url: "", aliases: ["yeezy 350 natural", "yeezy 350 v2 natural", "yeezy boost 350", "yeezy 350"] },
  { brand: "Yeezy", model: "Yeezy 700", variant: "Wave Runner", colorway: "Solid Grey", height: "Low", style: ["Casual", "Lifestyle", "Limited Edition"], colors: ["Grey", "Blue", "Orange"], image_url: "", aliases: ["yeezy 700 wave runner", "yeezy wave runner", "700 wave runner"] },
  { brand: "Yeezy", model: "Yeezy 700", variant: "V3", colorway: "Alvah", height: "Low", style: ["Casual", "Lifestyle"], colors: ["Black"], image_url: "", aliases: ["yeezy 700 v3", "yeezy 700 v3 alvah", "yeezy 700"] },
  { brand: "Yeezy", model: "Foam Runner", variant: "", colorway: "Onyx", height: "Low", style: ["Casual", "Lifestyle"], colors: ["Black"], image_url: "", aliases: ["yeezy foam runner onyx", "foam runner onyx", "yeezy foam runner", "foam runner"] },
  { brand: "Yeezy", model: "Yeezy Slide", variant: "", colorway: "Onyx", height: "Low", style: ["Casual", "Sandals"], colors: ["Black"], image_url: "", aliases: ["yeezy slide onyx", "yeezy slide black", "yeezy slides", "yeezy slide"] },

  // ─── NEW BALANCE ─────────────────────────────────────────────────────────────
  { brand: "New Balance", model: "550", variant: "", colorway: "White/Green", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["White", "Green"], image_url: "", aliases: ["new balance 550 white green", "nb 550 white green", "nb 550", "new balance 550", "550"] },
  { brand: "New Balance", model: "550", variant: "", colorway: "White/Navy", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["White", "Navy"], image_url: "", aliases: ["new balance 550 white navy", "nb 550 white navy", "550 white navy"] },
  { brand: "New Balance", model: "990", variant: "v5", colorway: "Grey", height: "Low", style: ["Casual", "Lifestyle", "Running"], colors: ["Grey"], image_url: "", aliases: ["new balance 990 v5 grey", "nb 990 v5", "990 v5", "new balance 990", "nb 990", "990"] },
  { brand: "New Balance", model: "2002R", variant: "", colorway: "Raincloud", height: "Low", style: ["Casual", "Lifestyle", "Running"], colors: ["Grey", "White"], image_url: "", aliases: ["new balance 2002r raincloud", "nb 2002r raincloud", "2002r raincloud", "nb 2002r", "new balance 2002r", "2002r"] },
  { brand: "New Balance", model: "530", variant: "", colorway: "White/Silver", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["White", "Silver"], image_url: "", aliases: ["new balance 530 white silver", "nb 530", "new balance 530", "530"] },
  { brand: "New Balance", model: "9060", variant: "", colorway: "Sea Salt", height: "Low", style: ["Casual", "Lifestyle"], colors: ["Beige", "Grey"], image_url: "", aliases: ["new balance 9060 sea salt", "nb 9060", "new balance 9060", "9060"] },
  { brand: "New Balance", model: "1906R", variant: "", colorway: "Protection Pack", height: "Low", style: ["Casual", "Lifestyle"], colors: ["Black", "Silver"], image_url: "", aliases: ["new balance 1906r", "nb 1906r", "1906r"] },

  // ─── CONVERSE ────────────────────────────────────────────────────────────────
  { brand: "Converse", model: "Chuck Taylor All Star", variant: "High Top", colorway: "Black", height: "High", style: ["Casual", "Lifestyle", "Retro"], colors: ["Black"], image_url: "", aliases: ["chuck taylor high black", "converse chuck taylor high black", "chuck taylor all star black", "chuck taylor black", "black chucks", "chucks black"] },
  { brand: "Converse", model: "Chuck Taylor All Star", variant: "High Top", colorway: "White", height: "High", style: ["Casual", "Lifestyle", "Retro"], colors: ["White"], image_url: "", aliases: ["chuck taylor high white", "converse chuck taylor high white", "chuck taylor all star white", "chuck taylor white", "white chucks", "chucks white", "chuck taylor", "converse chuck taylor", "chucks", "converse", "chuck 70"] },
  { brand: "Converse", model: "Chuck Taylor All Star", variant: "Low Top", colorway: "White", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["White"], image_url: "", aliases: ["chuck taylor low white", "chuck taylor low", "converse low white"] },
  { brand: "Converse", model: "One Star", variant: "Pro", colorway: "Black", height: "Low", style: ["Skateboarding", "Casual"], colors: ["Black", "White"], image_url: "", aliases: ["converse one star pro", "one star pro", "converse one star", "one star"] },
  { brand: "Converse", model: "Run Star Hike", variant: "", colorway: "Black", height: "High", style: ["Casual", "Lifestyle"], colors: ["Black"], image_url: "", aliases: ["run star hike black", "converse run star hike", "run star hike", "converse run star"] },

  // ─── VANS ────────────────────────────────────────────────────────────────────
  { brand: "Vans", model: "Old Skool", variant: "", colorway: "Black/White", height: "Low", style: ["Skateboarding", "Casual", "Lifestyle"], colors: ["Black", "White"], image_url: "", aliases: ["vans old skool black white", "old skool black white", "old skool black", "vans old skool", "old skool"] },
  { brand: "Vans", model: "Sk8-Hi", variant: "", colorway: "Black/White", height: "High", style: ["Skateboarding", "Casual", "Lifestyle"], colors: ["Black", "White"], image_url: "", aliases: ["vans sk8 hi black white", "sk8 hi black", "sk8-hi black white", "vans sk8 hi", "sk8 hi", "sk8-hi"] },
  { brand: "Vans", model: "Authentic", variant: "", colorway: "Black", height: "Low", style: ["Skateboarding", "Casual"], colors: ["Black"], image_url: "", aliases: ["vans authentic black", "vans authentic", "authentic"] },
  { brand: "Vans", model: "Era", variant: "", colorway: "Navy/White", height: "Low", style: ["Skateboarding", "Casual"], colors: ["Navy", "White"], image_url: "", aliases: ["vans era navy", "vans era", "era"] },
  { brand: "Vans", model: "Slip-On", variant: "", colorway: "Checkerboard", height: "Low", style: ["Skateboarding", "Casual"], colors: ["Black", "White"], image_url: "", aliases: ["vans slip on checkerboard", "slip on checkerboard", "vans checkerboard", "vans slip on", "slip on"] },

  // ─── ASICS ───────────────────────────────────────────────────────────────────
  { brand: "ASICS", model: "Gel-Kayano 14", variant: "", colorway: "Silver/Teal", height: "Low", style: ["Running", "Retro", "Casual"], colors: ["Silver", "Teal"], image_url: "", aliases: ["gel kayano 14 silver teal", "kayano 14 silver teal", "gel-kayano 14", "kayano 14", "gel kayano", "asics kayano"] },
  { brand: "ASICS", model: "Gel-1130", variant: "", colorway: "White/Clay Canyon", height: "Low", style: ["Running", "Retro", "Casual"], colors: ["White", "Brown"], image_url: "", aliases: ["gel 1130 white clay", "asics gel 1130", "gel-1130", "gel 1130", "1130", "asics 1130"] },
  { brand: "ASICS", model: "Gel-Lyte III", variant: "", colorway: "Salmon Toe", height: "Low", style: ["Casual", "Retro"], colors: ["Pink", "Black", "White"], image_url: "", aliases: ["gel lyte 3 salmon toe", "gel lyte iii salmon toe", "asics salmon toe", "gel lyte 3", "gel lyte iii", "asics gel lyte"] },

  // ─── PUMA ────────────────────────────────────────────────────────────────────
  { brand: "Puma", model: "Speedcat", variant: "", colorway: "Red", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["Red"], image_url: "", aliases: ["puma speedcat red", "speedcat red", "puma speedcat", "speedcat"] },
  { brand: "Puma", model: "Suede", variant: "", colorway: "Black", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["Black"], image_url: "", aliases: ["puma suede black", "puma suede classic black", "puma suede", "suede"] },
  { brand: "Puma", model: "Palermo", variant: "", colorway: "Navy", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["Navy", "White"], image_url: "", aliases: ["puma palermo navy", "puma palermo", "palermo"] },

  // ─── REEBOK ──────────────────────────────────────────────────────────────────
  { brand: "Reebok", model: "Club C 85", variant: "", colorway: "White/Green", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["White", "Green"], image_url: "", aliases: ["reebok club c 85 white green", "club c 85 white green", "reebok club c", "club c 85", "club c"] },
  { brand: "Reebok", model: "Classic Leather", variant: "", colorway: "White", height: "Low", style: ["Casual", "Lifestyle", "Retro"], colors: ["White"], image_url: "", aliases: ["reebok classic leather white", "reebok classic leather", "reebok classic", "classic leather"] },

  // ─── SALOMON ─────────────────────────────────────────────────────────────────
  { brand: "Salomon", model: "XT-6", variant: "", colorway: "Black/Phantom", height: "Low", style: ["Trail", "Lifestyle", "Casual"], colors: ["Black"], image_url: "", aliases: ["salomon xt-6 black phantom", "salomon xt-6 black", "salomon xt6 black", "salomon xt-6", "salomon xt6", "xt-6", "xt6"] },
  { brand: "Salomon", model: "XT-4", variant: "", colorway: "Aurora Borealis", height: "Low", style: ["Trail", "Lifestyle", "Casual"], colors: ["Teal", "Blue", "Green"], image_url: "", aliases: ["salomon xt-4 aurora borealis", "salomon xt4 aurora", "salomon xt-4", "salomon xt4", "xt-4", "xt4"] },
  { brand: "Salomon", model: "ACS Pro", variant: "", colorway: "Black", height: "Low", style: ["Trail", "Lifestyle"], colors: ["Black", "Grey"], image_url: "", aliases: ["salomon acs pro black", "salomon acs pro", "acs pro"] },

  // ─── ON RUNNING ──────────────────────────────────────────────────────────────
  { brand: "On Running", model: "Cloud 5", variant: "", colorway: "All Black", height: "Low", style: ["Running", "Athletic", "Casual"], colors: ["Black"], image_url: "", aliases: ["on cloud 5 black", "on cloud 5 all black", "on cloud 5", "on cloud", "cloud 5"] },
  { brand: "On Running", model: "Cloudmonster", variant: "", colorway: "Frost", height: "Low", style: ["Running", "Casual"], colors: ["White", "Grey"], image_url: "", aliases: ["on cloudmonster frost", "cloudmonster frost", "on cloudmonster", "cloudmonster"] },

  // ─── LUXURY / DESIGNER ───────────────────────────────────────────────────────
  { brand: "Balenciaga", model: "Track", variant: "", colorway: "Black", height: "High", style: ["Lifestyle", "Limited Edition"], colors: ["Black"], image_url: "", aliases: ["balenciaga track black", "balenciaga track", "track"] },
  { brand: "Balenciaga", model: "Speed 2.0", variant: "", colorway: "Black", height: "Low", style: ["Lifestyle", "Limited Edition"], colors: ["Black"], image_url: "", aliases: ["balenciaga speed 2.0", "balenciaga speed", "speed 2.0"] },
  { brand: "Common Projects", model: "Achilles Low", variant: "", colorway: "White", height: "Low", style: ["Casual", "Lifestyle", "Formal"], colors: ["White"], image_url: "", aliases: ["common projects achilles low white", "common projects achilles low", "achilles low", "cp achilles", "common projects"] },
  { brand: "Rick Owens", model: "DRKSHDW Ramones", variant: "", colorway: "Black", height: "High", style: ["Lifestyle", "Limited Edition"], colors: ["Black"], image_url: "", aliases: ["rick owens ramones black", "rick owens ramones", "ramones"] },

  // ─── SAUCONY ─────────────────────────────────────────────────────────────────
  { brand: "Saucony", model: "Shadow 6000", variant: "", colorway: "Black/White", height: "Low", style: ["Casual", "Retro", "Lifestyle"], colors: ["Black", "White"], image_url: "", aliases: ["saucony shadow 6000 black white", "shadow 6000 black", "saucony shadow 6000", "shadow 6000"] },
  { brand: "Saucony", model: "Jazz 81", variant: "", colorway: "Navy/White", height: "Low", style: ["Casual", "Retro"], colors: ["Navy", "White"], image_url: "", aliases: ["saucony jazz 81 navy", "jazz 81 navy", "saucony jazz 81", "jazz 81", "saucony jazz"] },
];

// ─── SCORING ──────────────────────────────────────────────────────────────────
// Strategy: aliases are ordered most-specific → least-specific per entry.
// We score each alias against the query and weight by specificity (index position).
// We also penalize when the query clearly references a DIFFERENT colorway/variant
// than what the entry represents.

const COLORWAY_KEYWORDS = [
  "chicago", "black toe", "satin black toe", "bred", "royal blue", "royal",
  "shadow", "dark mocha", "mocha", "university blue", "obsidian", "travis scott",
  "cactus jack", "reverse mocha", "zebra", "beluga", "static", "neon", "infrared",
  "bacon", "silver bullet", "panda", "grape", "fire red", "white cement",
  "cool grey", "space jam", "wave runner", "salmon toe", "aurora borealis",
  "sea salt", "peach cream",
];

function containsColorwayKeyword(text: string): string | null {
  for (const kw of COLORWAY_KEYWORDS) {
    if (text.includes(kw)) return kw;
  }
  return null;
}

function scoreEntry(entry: SneakerData, query: string): number {
  const q = query.toLowerCase().trim();
  const entryColorway = entry.colorway.toLowerCase();
  const entryVariant = entry.variant.toLowerCase();

  // If query specifies a colorway keyword and this entry's colorway doesn't
  // contain it, apply a hard penalty to prevent false positives.
  const queriedColorway = containsColorwayKeyword(q);
  if (queriedColorway) {
    if (!entryColorway.includes(queriedColorway) && !entry.aliases.some(a => a.includes(queriedColorway))) {
      return -1; // disqualify
    }
  }

  // Similarly if query includes a variant clue (e.g. "low", "high", "mid", "retro")
  // and entry height conflicts
  const heightConflict =
    (q.includes(" high") && entry.height === "Low" && !q.includes(" high og")) ||
    (q.includes(" low") && entry.height === "High" && !q.includes(" low top"));
  if (heightConflict) {
    // soft penalty rather than hard disqualify, in case there's no better match
  }

  let best = 0;

  for (let i = 0; i < entry.aliases.length; i++) {
    const alias = entry.aliases[i];
    // Specificity weight: more-specific (lower index) aliases are worth more
    const specificityMultiplier = 1 + (entry.aliases.length - i) * 0.05;
    let s = 0;

    if (alias === q) {
      s = 100;
    } else if (alias.includes(q)) {
      s = 80;
    } else if (q.includes(alias)) {
      // The query contains this alias — only good if alias is specific enough
      // (avoid generic aliases like "jordan 1" matching "jordan 1 black toe chicago")
      const aliasTokens = alias.split(" ").length;
      s = aliasTokens >= 3 ? 70 : aliasTokens === 2 ? 50 : 25;
    } else {
      // Token overlap
      const qTokens = q.split(/\s+/).filter(Boolean);
      const aTokens = alias.split(/\s+/).filter(Boolean);
      let matched = 0;
      for (const qt of qTokens) {
        if (aTokens.some(at => at === qt)) matched += 3;
        else if (aTokens.some(at => at.startsWith(qt) || qt.startsWith(at))) matched += 1;
      }
      // Penalize unmatched query tokens
      const unmatched = qTokens.filter(qt => !aTokens.some(at => at.includes(qt) || qt.includes(at))).length;
      s = Math.max(0, matched * 4 - unmatched * 8);
    }

    best = Math.max(best, s * specificityMultiplier);
  }

  if (heightConflict) best *= 0.6;

  return best;
}

function lookup(query: string): { match: SneakerData | null; suggestions: string[] } {
  const q = query.toLowerCase().trim().replace(/[^a-z0-9\s\-]/g, "");
  if (!q) return { match: null, suggestions: [] };

  const scored = SNEAKER_DB.map(entry => ({ entry, score: scoreEntry(entry, q) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  const CONFIDENCE_THRESHOLD = 35;

  if (!top || top.score < CONFIDENCE_THRESHOLD) {
    // Return suggestions from lower-scoring matches
    const suggestions = scored
      .slice(0, 5)
      .map(x => `${x.entry.brand} ${x.entry.model} ${x.entry.variant} ${x.entry.colorway}`.replace(/\s+/g, " ").trim());
    return { match: null, suggestions };
  }

  // If the second-best score is very close and they differ significantly, be cautious
  const second = scored[1];
  if (second && top.score - second.score < 5 && top.entry.brand !== second.entry.brand) {
    const suggestions = scored
      .slice(0, 4)
      .map(x => `${x.entry.brand} ${x.entry.model} ${x.entry.variant} ${x.entry.colorway}`.replace(/\s+/g, " ").trim());
    return { match: null, suggestions };
  }

  return { match: top.entry, suggestions: [] };
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const name = url.searchParams.get("name");

    if (!name) {
      return new Response(
        JSON.stringify({ error: "Missing 'name' query parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { match, suggestions } = lookup(name);

    if (!match) {
      return new Response(
        JSON.stringify({
          found: false,
          message: suggestions.length
            ? `No confident match for "${name}". Did you mean one of these?`
            : `No match found for "${name}". Try a more specific name or enter details manually.`,
          suggestions,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { aliases, ...responseData } = match;
    return new Response(
      JSON.stringify({ found: true, ...responseData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
