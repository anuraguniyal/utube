// Curated sample YouTube videos for quick testing and demonstration
const SAMPLE_VIDEOS = [
  {
    id: 'LXb3EKWsInQ',
    title: 'Costa Rica in 4K 60fps HDR (Ultra HD)',
    channel: 'Jacob + Katie Schwarz',
    duration: '05:43',
    category: 'Nature & Motion',
    description: 'High frame-rate 60fps nature footage - perfect for testing high-speed and slow-motion gesture controls.',
    thumbnail: 'https://img.youtube.com/vi/LXb3EKWsInQ/hqdefault.jpg'
  },
  {
    id: 'Bey4XXJAqS8',
    title: 'Action Sports & Stunts 4K Slow Motion',
    channel: 'Red Bull',
    duration: '03:15',
    category: 'Action & Sports',
    description: 'Extreme sports dynamics - excellent for testing horizontal reverse scrubbing and precision frame stepping.',
    thumbnail: 'https://img.youtube.com/vi/Bey4XXJAqS8/hqdefault.jpg'
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    channel: 'Luis Fonsi',
    duration: '04:41',
    category: 'Music & Rhythm',
    description: 'Rhythmic music video to test A-B looping and tempo speed controls.',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg'
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Queen – Bohemian Rhapsody (Official Video Remastered)',
    channel: 'Queen Official',
    duration: '05:59',
    category: 'Music & Concert',
    description: 'Multi-tempo legendary performance, great for bookmarking timestamps and speed modulations.',
    thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg'
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    channel: 'Rick Astley',
    duration: '03:32',
    category: 'Classic',
    description: 'The timeless classic. Test reverse rewind on the iconic dance moves!',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
  },
  {
    id: '7wtfhZwyrcc',
    title: 'Believer - Imagine Dragons (Official Music Video)',
    channel: 'Imagine Dragons',
    duration: '03:36',
    category: 'Music Video',
    description: 'Punchy action and high energy pacing, great for vertical drag speed up/down testing.',
    thumbnail: 'https://img.youtube.com/vi/7wtfhZwyrcc/hqdefault.jpg'
  }
];

if (typeof window !== 'undefined') {
  window.SAMPLE_VIDEOS = SAMPLE_VIDEOS;
}
