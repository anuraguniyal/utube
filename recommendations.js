/**
 * UTUBE Dynamic Live YouTube Search & Discovery Engine
 * 100% Dynamic - Zero hardcoded/handcrafted video lists.
 * Queries live open-CORS YouTube endpoints in real-time.
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

// Helper to format release dates into relative time ("2 days ago", "1 week ago", "3 months ago", etc.)
function formatPublishedDate(pub) {
  if (!pub) return '';
  if (typeof pub === 'string') {
    const s = pub.trim();
    if (s.toLowerCase().includes('ago')) return s;
    if (s.toLowerCase().includes('stream')) return s;
    const parsedDate = new Date(s);
    if (!isNaN(parsedDate.getTime())) {
      const now = Date.now();
      const diffSec = Math.floor((now - parsedDate.getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
      if (diffSec < 86400 * 7) {
        const days = Math.floor(diffSec / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      }
      if (diffSec < 86400 * 30) {
        const weeks = Math.floor(diffSec / (86400 * 7));
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      }
      if (diffSec < 86400 * 365) {
        const months = Math.floor(diffSec / (86400 * 30));
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
      }
      const years = Math.floor(diffSec / (86400 * 365));
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
    return s;
  }
  if (typeof pub === 'number') {
    const ms = pub < 1e11 ? pub * 1000 : pub;
    const diffSec = Math.floor((Date.now() - ms) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    if (diffSec < 86400 * 7) {
      const days = Math.floor(diffSec / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    if (diffSec < 86400 * 30) {
      const weeks = Math.floor(diffSec / (86400 * 7));
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    if (diffSec < 86400 * 365) {
      const months = Math.floor(diffSec / (86400 * 30));
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    const years = Math.floor(diffSec / (86400 * 365));
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
  return '';
}

// Normalizer for Invidious/Piped live API search items
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
  const rawPublished = item.publishedText || item.uploadedDate || item.published || item.publishedDate || item.uploadDate || item.uploaded || item.uploadedText;
  const published = formatPublishedDate(rawPublished) || 'Recent';
  
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
    category: 'YouTube',
    thumbnail,
    description: item.description || `Live search result for "${query}"`
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

/**
 * 100% Dynamic Live YouTube Search
 * Queries multiple verified open-CORS YouTube mirrors in parallel.
 */
async function searchYouTubeVideos(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // In-memory cache check
  if (searchCache.has(q)) {
    return searchCache.get(q);
  }

  // SessionStorage cache check
  try {
    const cached = sessionStorage.getItem(`utube_dyn_search_${q}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        searchCache.set(q, parsed);
        return parsed;
      }
    }
  } catch (e) {}

  const encodedQ = encodeURIComponent(q);
  const directEndpoints = [
    `https://y.com.sb/api/v1/search?q=${encodedQ}&type=video`,
    `https://invidious.flokinet.to/api/v1/search?q=${encodedQ}&type=video`,
    `https://invidious.jing.rocks/api/v1/search?q=${encodedQ}&type=video`,
    `https://inv.nadeko.net/api/v1/search?q=${encodedQ}&type=video`,
    `https://yt.artemislena.eu/api/v1/search?q=${encodedQ}&type=video`
  ];

  const proxyEndpoints = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://y.com.sb/api/v1/search?q=${encodedQ}&type=video`)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(`https://invidious.flokinet.to/api/v1/search?q=${encodedQ}&type=video`)}`
  ];

  const allEndpoints = [...directEndpoints, ...proxyEndpoints];

  let liveResults = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const promises = allEndpoints.map(url => fetchFromInstance(url, q, controller.signal));
    liveResults = await Promise.any(promises);
    clearTimeout(timeoutId);
  } catch (err) {
    console.warn(`[UTUBE Search] Live search failed for query "${q}":`, err.message);
  }

  const seenIds = new Set();
  const results = [];

  for (const item of (liveResults || [])) {
    if (item && item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      results.push(item);
    }
  }

  if (results.length > 0) {
    searchCache.set(q, results);
    try {
      sessionStorage.setItem(`utube_dyn_search_${q}`, JSON.stringify(results.slice(0, 25)));
    } catch (e) {}
  }

  return results;
}

/**
 * Dynamically fetch live trending / discovery videos from YouTube
 */
async function fetchTrendingYouTubeVideos() {
  return await searchYouTubeVideos('trending 4k');
}

if (typeof window !== 'undefined') {
  window.searchYouTubeVideos = searchYouTubeVideos;
  window.fetchTrendingYouTubeVideos = fetchTrendingYouTubeVideos;
}
