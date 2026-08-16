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
 * Multi-Engine YouTube Search Function
 * 1. Checks public Invidious/Piped search API instances with 1.8s timeout
 * 2. Fuzzy-matches against local curated catalog across titles, channels, descriptions, and categories
 * 3. Returns a clean array of results: [{ id, title, channel, avatar, views, published, duration, thumbnail, description, category }]
 */
async function searchYouTubeVideos(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Local fuzzy / keyword match first for instant responses
  const tokens = q.split(/\s+/).filter(Boolean);
  const localMatches = YOUTUBE_RECOMMENDATIONS.filter(video => {
    const text = `${video.title} ${video.channel} ${video.description} ${video.category}`.toLowerCase();
    return tokens.some(t => text.includes(t));
  }).sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    const aScore = tokens.reduce((acc, t) => acc + (aTitle.includes(t) ? 2 : 1), 0);
    const bScore = tokens.reduce((acc, t) => acc + (bTitle.includes(t) ? 2 : 1), 0);
    return bScore - aScore;
  });

  // If local catalog matches exist, return them immediately
  if (localMatches.length > 0) {
    return localMatches;
  }

  // Attempt live Invidious search with fast abort timeout (500ms)
  let liveResults = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500);

    const endpoints = [
      `https://inv.nadeko.net/api/v1/search?q=${encodeURIComponent(q)}&type=video`,
      `https://invidious.nerdvpn.de/api/v1/search?q=${encodeURIComponent(q)}&type=video`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            liveResults = json.filter(item => item && (item.videoId || item.id)).map(item => {
              const vId = item.videoId || item.id;
              const formatSec = (sec) => {
                if (!sec || isNaN(sec)) return '';
                const m = Math.floor(sec / 60);
                const s = Math.floor(sec % 60);
                return `${m}:${s < 10 ? '0' : ''}${s}`;
              };
              return {
                id: vId,
                title: item.title || `Video (${vId})`,
                channel: item.author || item.channel || 'YouTube Creator',
                avatar: '📺',
                views: item.viewCountText || (item.viewCount ? `${(item.viewCount / 1000000).toFixed(1)}M views` : 'Popular'),
                published: item.publishedText || 'Recent',
                duration: item.lengthSeconds ? formatSec(item.lengthSeconds) : 'Video',
                category: 'Search Result',
                thumbnail: item.videoThumbnails && item.videoThumbnails[0] ? item.videoThumbnails[0].url : `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
                description: item.description || `Search result for "${query}"`
              };
            });
            break;
          }
        }
      } catch (err) {}
    }
    clearTimeout(timeoutId);
  } catch (e) {}

  const seenIds = new Set();
  const combined = [];

  for (const item of [...localMatches, ...liveResults]) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      combined.push(item);
    }
  }

  return combined.length > 0 ? combined : YOUTUBE_RECOMMENDATIONS.slice(0, 10);
}

if (typeof window !== 'undefined') {
  window.YOUTUBE_RECOMMENDATIONS = YOUTUBE_RECOMMENDATIONS;
  window.SAMPLE_VIDEOS = YOUTUBE_RECOMMENDATIONS;
  window.searchYouTubeVideos = searchYouTubeVideos;
}

