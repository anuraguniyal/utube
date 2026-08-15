/**
 * YouTube Recommendations Feed Dataset & Generator
 * Provides categorized, realistic YouTube recommendations with topic filters.
 */

const YOUTUBE_RECOMMENDATIONS = [
  // Trending & General
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
  }
];

if (typeof window !== 'undefined') {
  window.YOUTUBE_RECOMMENDATIONS = YOUTUBE_RECOMMENDATIONS;
  window.SAMPLE_VIDEOS = YOUTUBE_RECOMMENDATIONS; // Backward compatibility
}
