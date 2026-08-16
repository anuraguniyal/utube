/**
 * YouTube Recommendations Feed & Universal Search Dataset
 * Provides categorized, realistic YouTube recommendations and search engine.
 */

const YOUTUBE_RECOMMENDATIONS = [
  // Nature & 4K / Ambience
  {
    id: 'LXb3EKWsInQ',
    title: 'Costa Rica in 4K 60fps HDR (Ultra HD)',
    channel: 'Jacob + Katie Schwarz',
    avatar: '🌴',
    views: '84M views',
    published: '3 years ago',
    duration: '05:43',
    category: 'Nature & 4K',
    thumbnail: 'https://img.youtube.com/vi/LXb3EKWsInQ/hqdefault.jpg',
    description: 'Breathtaking 60fps HDR nature footage capturing Costa Rican rainforests and wildlife.'
  },
  {
    id: 'K4TOrB7at0Y',
    title: 'Tokyo Night Walk in Rain 4K HDR Binaural Sound',
    channel: 'Nomadic Ambience',
    avatar: '☔',
    views: '18M views',
    published: '1 year ago',
    duration: '25:10',
    category: 'Nature & 4K',
    thumbnail: 'https://img.youtube.com/vi/K4TOrB7at0Y/hqdefault.jpg',
    description: 'Relaxing ambient stroll through Shibuya neon alleys under soft spring rain.'
  },
  {
    id: '1La4QzGeaaQ',
    title: 'Patagonia 8K HDR 60fps Ultra HD Timelapse',
    channel: 'Martin Heck / Timestorm Films',
    avatar: '🏔️',
    views: '12M views',
    published: '2 years ago',
    duration: '04:12',
    category: 'Nature & 4K',
    thumbnail: 'https://img.youtube.com/vi/1La4QzGeaaQ/hqdefault.jpg',
    description: 'Spectacular glacial landscapes, rugged mountain peaks, and dramatic skies of Patagonia.'
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio – Beats to Relax / Study to',
    channel: 'Lofi Girl',
    avatar: '🎧',
    views: '85M views',
    published: 'Live Stream',
    duration: 'Live',
    category: 'Music',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    description: 'Peaceful lofi chillhop beats perfect for deep focus, studying, and relaxation.'
  },
  // Music & Global Hits
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    channel: 'Luis Fonsi',
    avatar: '🎵',
    views: '8.4B views',
    published: '6 years ago',
    duration: '04:41',
    category: 'Music',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    description: 'Record-breaking Latin pop global smash hit music video.'
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Queen – Bohemian Rhapsody (Official Video Remastered)',
    channel: 'Queen Official',
    avatar: '👑',
    views: '1.6B views',
    published: '4 years ago',
    duration: '05:59',
    category: 'Music',
    thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    description: 'Legendary rock anthem remastered in high definition audio and video.'
  },
  {
    id: '7wtfhZwyrcc',
    title: 'Imagine Dragons - Believer (Official Music Video)',
    channel: 'Imagine Dragons',
    avatar: '🐉',
    views: '2.5B views',
    published: '5 years ago',
    duration: '03:36',
    category: 'Music',
    thumbnail: 'https://img.youtube.com/vi/7wtfhZwyrcc/hqdefault.jpg',
    description: 'High energy arena rock featuring Dolph Lundgren in cinematic boxing showdown.'
  },
  {
    id: 'OPf0YbXqDm0',
    title: 'Mark Ronson - Uptown Funk ft. Bruno Mars',
    channel: 'Mark Ronson',
    avatar: '🎺',
    views: '5.1B views',
    published: '9 years ago',
    duration: '04:30',
    category: 'Music',
    thumbnail: 'https://img.youtube.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    description: 'Funky retro dance anthem with unforgettable choreography and brass hooks.'
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    channel: 'Ed Sheeran',
    avatar: '🎸',
    views: '6.2B views',
    published: '7 years ago',
    duration: '04:23',
    category: 'Music',
    thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    description: 'Chart-topping acoustic pop phenomenon with billions of global streams.'
  },
  {
    id: 'UDVtMYqUAyw',
    title: 'Hans Zimmer - Interstellar Main Theme Live in Prague',
    channel: 'Hans Zimmer Live',
    avatar: '🚀',
    views: '35M views',
    published: '5 years ago',
    duration: '08:52',
    category: 'Music',
    thumbnail: 'https://img.youtube.com/vi/UDVtMYqUAyw/hqdefault.jpg',
    description: 'Monumental orchestral performance of Christopher Nolan Interstellar soundtrack.'
  },
  // Tech & AI
  {
    id: 'vN93n1w3y38',
    title: 'Building Next-Gen Autonomous AI Agents in 2026',
    channel: 'Lex Fridman Clips',
    avatar: '🎙️',
    views: '3.8M views',
    published: '4 months ago',
    duration: '14:22',
    category: 'Tech & AI',
    thumbnail: 'https://img.youtube.com/vi/vN93n1w3y38/hqdefault.jpg',
    description: 'Deep dive discussion on neural architectures and autonomous coding models.'
  },
  {
    id: 'dtp6bS6wg5k',
    title: 'Apple Vision Pro: Tomorrow Technology Today (MKBHD Review)',
    channel: 'Marques Brownlee',
    avatar: '⚡',
    views: '16M views',
    published: '1 year ago',
    duration: '19:40',
    category: 'Tech & AI',
    thumbnail: 'https://img.youtube.com/vi/dtp6bS6wg5k/hqdefault.jpg',
    description: 'Full comprehensive hardware and spatial computing review of the Apple Vision Pro.'
  },
  {
    id: 'fn3KBPckncQ',
    title: 'Atlas Robot Goes Fully Electric & Autonomous',
    channel: 'Boston Dynamics',
    avatar: '🦾',
    views: '8.5M views',
    published: '8 months ago',
    duration: '01:28',
    category: 'Tech & AI',
    thumbnail: 'https://img.youtube.com/vi/fn3KBPckncQ/hqdefault.jpg',
    description: 'Next generation electric Atlas humanoid robot executing complex mobility gymnastics.'
  },
  {
    id: 'YRhxd3uGqrg',
    title: 'How ChatGPT & Large Language Models Actually Work',
    channel: '3Blue1Brown',
    avatar: '📐',
    views: '7.1M views',
    published: '10 months ago',
    duration: '27:32',
    category: 'Tech & AI',
    thumbnail: 'https://img.youtube.com/vi/YRhxd3uGqrg/hqdefault.jpg',
    description: 'Visual mathematical deep dive into transformer neural networks, attention, and vectors.'
  },
  // Gaming
  {
    id: 'lTRiuFIWV54',
    title: 'Cyberpunk 2077 — Official 4K Cinematic Gameplay Showcase',
    channel: 'Cyberpunk 2077',
    avatar: '🤖',
    views: '28M views',
    published: '2 years ago',
    duration: '04:20',
    category: 'Gaming',
    thumbnail: 'https://img.youtube.com/vi/lTRiuFIWV54/hqdefault.jpg',
    description: 'Ray tracing overdrive demonstration running through the neon-drenched Night City.'
  },
  {
    id: 'aircAruvnKk',
    title: 'Top 10 Unreal Engine 5.4 Photorealistic Showcases',
    channel: 'Digital Foundry',
    avatar: '🎮',
    views: '6.2M views',
    published: '5 months ago',
    duration: '11:45',
    category: 'Gaming',
    thumbnail: 'https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg',
    description: 'Next-gen Nanite and Lumen graphical fidelity analysis across modern titles.'
  },
  {
    id: 'QdBZY2fkU-0',
    title: 'Grand Theft Auto VI Trailer 1 (Official 4K)',
    channel: 'Rockstar Games',
    avatar: '⭐',
    views: '210M views',
    published: '1 year ago',
    duration: '01:31',
    category: 'Gaming',
    thumbnail: 'https://img.youtube.com/vi/QdBZY2fkU-0/hqdefault.jpg',
    description: 'Vice City arrives with cutting-edge visual fidelity and neon Florida landscapes.'
  },
  {
    id: 'E3Huy2cdih0',
    title: 'Elden Ring Shadow of the Erdtree — Official Launch Trailer',
    channel: 'BANDAI NAMCO',
    avatar: '⚔️',
    views: '14M views',
    published: '6 months ago',
    duration: '03:10',
    category: 'Gaming',
    thumbnail: 'https://img.youtube.com/vi/E3Huy2cdih0/hqdefault.jpg',
    description: 'FromSoftware masterpiece expansion unveiling the Land of Shadow and Messmer.'
  },
  // Sports & Extreme Motion
  {
    id: 'Bey4XXJAqS8',
    title: 'Action Sports & Stunts 4K Slow Motion Supercut',
    channel: 'Red Bull',
    avatar: '🔴',
    views: '42M views',
    published: '1 year ago',
    duration: '03:15',
    category: 'Sports & Motion',
    thumbnail: 'https://img.youtube.com/vi/Bey4XXJAqS8/hqdefault.jpg',
    description: 'High adrenaline extreme sports captured at 1000fps ultra slow motion.'
  },
  {
    id: 'H6S4d6j7q_0',
    title: 'Formula 1 Monaco GP Fastest Lap Onboard 4K 60fps',
    channel: 'Formula 1',
    avatar: '🏎️',
    views: '19M views',
    published: '2 years ago',
    duration: '01:50',
    category: 'Sports & Motion',
    thumbnail: 'https://img.youtube.com/vi/H6S4d6j7q_0/hqdefault.jpg',
    description: 'Unbelievable precision and speed weaving through the tight streets of Monte Carlo.'
  },
  {
    id: '7xYz4n9l6uQ',
    title: 'Surfing the Heaviest Wave on Earth: Teahupoo in 4K',
    channel: 'World Surf League',
    avatar: '🌊',
    views: '9.4M views',
    published: '1 year ago',
    duration: '06:14',
    category: 'Sports & Motion',
    thumbnail: 'https://img.youtube.com/vi/7xYz4n9l6uQ/hqdefault.jpg',
    description: 'Massive Tahitian barrel slabs filmed up close from water angles and drone 4K.'
  },
  // Trending, Viral & Science
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official 4K Remaster)',
    channel: 'Rick Astley',
    avatar: '🕺',
    views: '1.5B views',
    published: '14 years ago',
    duration: '03:32',
    category: 'Trending',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    description: 'The iconic pop classic that conquered the internet culture.'
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Me at the zoo (The Very First YouTube Video)',
    channel: 'jawed',
    avatar: '🐘',
    views: '310M views',
    published: '19 years ago',
    duration: '00:19',
    category: 'Trending',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    description: 'The historic video that started YouTube in April 2005.'
  },
  {
    id: 'J---aiyznGQ',
    title: 'Cat Keyboard Symphony Animation 4K',
    channel: 'Cat Beats Animation',
    avatar: '🐱',
    views: '12M views',
    published: '8 months ago',
    duration: '02:48',
    category: 'Trending',
    thumbnail: 'https://img.youtube.com/vi/J---aiyznGQ/hqdefault.jpg',
    description: 'Viral rhythmic cartoon animation synched to hyper-fast piano arpeggios.'
  },
  // Chess & Strategy
  {
    id: 'T5R36f2N_7A',
    title: 'Magnus Carlsen vs Hikaru Nakamura — Speed Chess Championship Final',
    channel: 'Chess.com',
    avatar: '♟️',
    views: '8.5M views',
    published: '1 year ago',
    duration: '22:15',
    category: 'Chess',
    thumbnail: 'https://img.youtube.com/vi/T5R36f2N_7A/hqdefault.jpg',
    description: 'The ultimate blitz & bullet chess showdown between world champion Magnus Carlsen and Hikaru Nakamura.'
  },
  {
    id: 'rKxXwF_ZrqM',
    title: 'The Greatest Chess Game Ever Played (Kasparov vs Topalov 1999)',
    channel: 'GothamChess',
    avatar: '♟️',
    views: '5.2M views',
    published: '2 years ago',
    duration: '18:40',
    category: 'Chess',
    thumbnail: 'https://img.youtube.com/vi/rKxXwF_ZrqM/hqdefault.jpg',
    description: 'Levy Rozman analyzes Garry Kasparov legendary immortal rook sacrifice and tactical masterclass.'
  },
  {
    id: 'fGNNqZ5Xz9o',
    title: 'Top 10 Chess Opening Traps Everyone Falls For',
    channel: 'agadmator\'s Chess Channel',
    avatar: '♟️',
    views: '12M views',
    published: '3 years ago',
    duration: '14:20',
    category: 'Chess',
    thumbnail: 'https://img.youtube.com/vi/fGNNqZ5Xz9o/hqdefault.jpg',
    description: 'Essential chess traps in the Italian Game, Sicilian Defense, Fried Liver Attack, and Queen\'s Gambit.'
  },
  {
    id: 'a3w8I8J4p8A',
    title: 'Speedrun to 2000 Elo: Master Level Chess Fundamentals',
    channel: 'Daniel Naroditsky',
    avatar: '♟️',
    views: '3.1M views',
    published: '1 year ago',
    duration: '31:05',
    category: 'Chess',
    thumbnail: 'https://img.youtube.com/vi/a3w8I8J4p8A/hqdefault.jpg',
    description: 'Grandmaster Daniel Naroditsky teaches positional mastery, chess tactics, opening prep, and endgame conversion.'
  },
  // Programming & Technology
  {
    id: '_uQrJ0TkZlc',
    title: 'Python Tutorial for Beginners - Full Course (Learn Python in 6 Hours)',
    channel: 'Programming with Mosh',
    avatar: '🐍',
    views: '41M views',
    published: '4 years ago',
    duration: '06:14:07',
    category: 'Coding & Tech',
    thumbnail: 'https://img.youtube.com/vi/_uQrJ0TkZlc/hqdefault.jpg',
    description: 'Complete modern Python programming course covering data types, OOP, libraries, and scripting.'
  },
  {
    id: 'W6NZfCO5SIk',
    title: 'JavaScript Tutorial for Beginners: Learn JavaScript in 1 Hour',
    channel: 'Programming with Mosh',
    avatar: '⚡',
    views: '15M views',
    published: '5 years ago',
    duration: '48:16',
    category: 'Coding & Tech',
    thumbnail: 'https://img.youtube.com/vi/W6NZfCO5SIk/hqdefault.jpg',
    description: 'Master JavaScript ES6 syntax, arrays, objects, functions, and modern browser development.'
  },
  // Science & Cosmos
  {
    id: 'uD4izuDMUQA',
    title: 'The Size of Space Comparison 4K (From Moon to Universe)',
    channel: 'Kurzgesagt – In a Nutshell',
    avatar: '🪐',
    views: '38M views',
    published: '3 years ago',
    duration: '11:18',
    category: 'Trending',
    thumbnail: 'https://img.youtube.com/vi/uD4izuDMUQA/hqdefault.jpg',
    description: 'Mind-expanding animation illustrating cosmic scales and gigantic black holes.'
  }
];

/**
 * Robust Multi-Instance Public YouTube Live Search Engine
 * - Queries multiple public Invidious & Piped instances concurrently with fastest-response resolution
 * - Automatically falls back to CORS proxies if browser CORS blocks direct requests
 * - In-memory and sessionStorage caching for instant (0ms) repeat queries
 * - Full normalized schema output: [{ id, title, channel, avatar, views, published, duration, thumbnail, description, category }]
 */

const searchCache = new Map();

// Helper to format seconds into MM:SS or HH:MM:SS
function formatDurationSec(sec) {
  if (!sec || isNaN(sec)) return '';
  const s = Math.floor(sec % 60);
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  const pad = (n) => (n < 10 ? '0' : '') + n;
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

// Helper to format view numbers into 1.2M / 450K
function formatViewCount(views) {
  if (!views) return 'Popular';
  if (typeof views === 'string' && views.toLowerCase().includes('view')) return views;
  const num = parseInt(views, 10);
  if (isNaN(num)) return String(views);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B views`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M views`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K views`;
  return `${num} views`;
}

// Normalizer for Invidious/Piped items
function normalizeSearchItem(item, query) {
  if (!item) return null;
  let id = item.videoId || item.id;
  if (!id && item.url) {
    const match = item.url.match(/v=([a-zA-Z0-9_-]{11})/) || item.url.match(/\/watch\?v=([^&]+)/) || item.url.match(/\/([a-zA-Z0-9_-]{11})$/);
    if (match) id = match[1];
  }
  if (!id || typeof id !== 'string' || id.length < 5) return null;

  const title = item.title || `YouTube Video (${id})`;
  const channel = item.author || item.uploaderName || item.channel || item.uploader || 'YouTube Creator';
  const views = formatViewCount(item.viewCountText || item.views || item.viewCount);
  const published = item.publishedText || item.uploadedDate || item.published || 'Recent';
  
  let duration = 'Video';
  if (typeof item.duration === 'string' && item.duration) {
    duration = item.duration;
  } else if (item.lengthSeconds) {
    duration = formatDurationSec(item.lengthSeconds);
  } else if (typeof item.duration === 'number') {
    duration = formatDurationSec(item.duration);
  }

  let thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  if (item.videoThumbnails && item.videoThumbnails[0] && item.videoThumbnails[0].url) {
    thumbnail = item.videoThumbnails[0].url;
  } else if (item.thumbnail) {
    thumbnail = item.thumbnail;
  }

  return {
    id,
    title,
    channel,
    avatar: '📺',
    views,
    published,
    duration,
    category: 'YouTube Search',
    thumbnail,
    description: item.description || `Search result for "${query}"`
  };
}

async function fetchFromInstance(endpoint, query, signal) {
  const res = await fetch(endpoint, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const rawList = Array.isArray(json) ? json : (json.items || json.results || []);
  if (!Array.isArray(rawList) || rawList.length === 0) throw new Error('Empty results');

  const normalized = rawList
    .map(item => normalizeSearchItem(item, query))
    .filter(Boolean);

  if (normalized.length === 0) throw new Error('No valid items');
  return normalized;
}

async function searchYouTubeVideos(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Check in-memory cache
  if (searchCache.has(q)) {
    return searchCache.get(q);
  }

  // Check sessionStorage cache
  try {
    const cached = sessionStorage.getItem(`utube_search_${q}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        searchCache.set(q, parsed);
        return parsed;
      }
    }
  } catch (e) {}

  // Local fuzzy / curated matches
  const tokens = q.split(/\s+/).filter(t => t.length > 1);
  const localMatches = YOUTUBE_RECOMMENDATIONS.filter(video => {
    const text = `${video.title} ${video.channel} ${video.description} ${video.category}`.toLowerCase();
    if (tokens.length === 0) return text.includes(q);
    return tokens.some(t => text.includes(t));
  }).sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    const aScore = tokens.reduce((acc, t) => acc + (aTitle.includes(t) ? 3 : 1), 0);
    const bScore = tokens.reduce((acc, t) => acc + (bTitle.includes(t) ? 3 : 1), 0);
    return bScore - aScore;
  });

  // If local matches exist, return immediately for instant 0ms rendering
  if (localMatches.length > 0) {
    searchCache.set(q, localMatches);
    return localMatches;
  }

  // Prepare multi-instance live search endpoints for non-catalog queries
  const encodedQ = encodeURIComponent(q);
  const directEndpoints = [
    `https://y.com.sb/api/v1/search?q=${encodedQ}&type=video`,
    `https://invidious.flokinet.to/api/v1/search?q=${encodedQ}&type=video`,
    `https://invidious.jing.rocks/api/v1/search?q=${encodedQ}&type=video`,
    `https://inv.nadeko.net/api/v1/search?q=${encodedQ}&type=video`,
    `https://yt.artemislena.eu/api/v1/search?q=${encodedQ}&type=video`
  ];

  // CORS proxy wrapped endpoints
  const proxyEndpoints = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://y.com.sb/api/v1/search?q=${encodedQ}&type=video`)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(`https://invidious.flokinet.to/api/v1/search?q=${encodedQ}&type=video`)}`
  ];

  const allEndpoints = [...directEndpoints, ...proxyEndpoints];

  let liveResults = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const promises = allEndpoints.map(url => fetchFromInstance(url, q, controller.signal));
    liveResults = await Promise.any(promises);
    clearTimeout(timeoutId);
  } catch (err) {
    // If live search instances are unreachable / offline, fall back cleanly
  }

  // Combine and deduplicate by videoId
  const seenIds = new Set();
  const combined = [];

  // Prioritize live results if found, augmented with local matches
  const sourceList = (liveResults && liveResults.length > 0)
    ? [...liveResults, ...localMatches]
    : localMatches;

  for (const item of sourceList) {
    if (item && item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      combined.push(item);
    }
  }

  // Cache results if non-empty
  if (combined.length > 0) {
    searchCache.set(q, combined);
    try {
      sessionStorage.setItem(`utube_search_${q}`, JSON.stringify(combined.slice(0, 20)));
    } catch (e) {}
  }

  return combined;
}

if (typeof window !== 'undefined') {
  window.YOUTUBE_RECOMMENDATIONS = YOUTUBE_RECOMMENDATIONS;
  window.SAMPLE_VIDEOS = YOUTUBE_RECOMMENDATIONS;
  window.searchYouTubeVideos = searchYouTubeVideos;
}

