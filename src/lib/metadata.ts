export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'anime' | 'livetv';
  posterUrl: string;
  backdropUrl?: string;
  year?: string;
  rating?: string | number;
  genres?: string[];
  description?: string;
  streamUrl?: string; // For Live TV or direct HLS streams
  category?: string;  // Category for Live TV
}

export interface Episode {
  id: string | number;
  title: string;
  season: number;
  episode: number;
  thumbnail?: string;
  overview?: string;
  released?: string;
}

export interface MediaDetails extends MediaItem {
  duration?: string;
  cast?: string[];
  directors?: string[];
  seasons?: number[];
  episodes?: Episode[];
  imdbId?: string;
  trailerUrl?: string;
}

export interface LiveChannel {
  id: string;
  name: string;
  logo: string;
  category: 'News' | 'Sports' | 'Entertainment' | 'Music' | 'Documentary';
  streamUrl: string;
  country: string;
  description: string;
}

// Curated high-availability verified public .m3u8 streams
export const CURATED_LIVE_CHANNELS: LiveChannel[] = [
  {
    id: 'sky-news-uk',
    name: 'Sky News HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Sky_News_2020.svg/512px-Sky_News_2020.svg.png',
    category: 'News',
    streamUrl: 'https://live.news.sky.com/hls/live/2007281/skynews_sub_live/master.m3u8',
    country: 'United Kingdom',
    description: 'Breaking global news, politics, and analysis 24/7 in full HD.',
  },
  {
    id: 'abc-news-live',
    name: 'ABC News Live',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/ABC_News_logo_2021.svg/512px-ABC_News_logo_2021.svg.png',
    category: 'News',
    streamUrl: 'https://abcnews-stream.abcnews.com/chunklist.m3u8',
    country: 'United States',
    description: 'Premier live streaming news network from ABC News.',
  },
  {
    id: 'al-jazeera-en',
    name: 'Al Jazeera English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Al_Jazeera_English_logo.svg/512px-Al_Jazeera_English_logo.svg.png',
    category: 'News',
    streamUrl: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8',
    country: 'International',
    description: 'Unbiased in-depth reporting and international investigative journalism.',
  },
  {
    id: 'bloomberg-us',
    name: 'Bloomberg TV US',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bloomberg_Television_logo.svg/512px-Bloomberg_Television_logo.svg.png',
    category: 'News',
    streamUrl: 'https://bloomberg.com/media-manifest/streams/us.m3u8',
    country: 'United States',
    description: 'Global business, markets, economic news, and financial updates.',
  },
  {
    id: 'dw-english',
    name: 'DW News English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_logo.svg/512px-Deutsche_Welle_logo.svg.png',
    category: 'News',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    country: 'Germany',
    description: 'German international broadcasting service delivering world news.',
  },
  {
    id: 'france-24-en',
    name: 'France 24 English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/France_24_logo.svg/512px-France_24_logo.svg.png',
    category: 'News',
    streamUrl: 'https://static.france24.com/live/F24_EN_LO_HLS/live_tv.m3u8',
    country: 'France',
    description: 'International news round-the-clock from Paris with European perspective.',
  },
  {
    id: 'red-bull-tv',
    name: 'Red Bull TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Red_Bull_TV_logo.svg/512px-Red_Bull_TV_logo.svg.png',
    category: 'Sports',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    country: 'Global',
    description: 'Action sports, motorsports, gaming, cultural events, and extreme sports.',
  },
  {
    id: 'nasa-tv',
    name: 'NASA TV Official HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/512px-NASA_logo.svg.png',
    category: 'Documentary',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    country: 'United States',
    description: 'Live rocket launches, ISS spacewalks, deep space research, and astronomy.',
  },
  {
    id: 'clubbing-tv',
    name: 'Clubbing TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Clubbing_tv_logo.png/512px-Clubbing_tv_logo.png',
    category: 'Music',
    streamUrl: 'https://stream.clubbingtv.com/live/master.m3u8',
    country: 'France',
    description: 'The world leading electronic music and DJ festival channel.',
  },
  {
    id: 'cinehouse',
    name: 'Cinehouse Movie Channel',
    logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60',
    category: 'Entertainment',
    streamUrl: 'https://stream.cinehouse.tv/hls/live/master.m3u8',
    country: 'United States',
    description: 'Curated blockbuster and cult classic movies streamed 24 hours a day.',
  },
];

// Fallback trending catalog in case of temporary upstream network blockages
export const FALLBACK_TRENDING_MOVIES: MediaItem[] = [
  {
    id: 'tt15239678',
    title: 'Dune: Part Two',
    type: 'movie',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BN2QyZGUgkNjMtODAyZC00MGY4LWIxNjktODU2Nzg1NzlkMmEzXkEyXkFqcGc@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    year: '2024',
    rating: '8.5',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
  },
  {
    id: 'tt15398776',
    title: 'Oppenheimer',
    type: 'movie',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjctNDhlNy00N2EzLTg2OTgtZjFlZDM2YmY1NmFjXkEyXkFqcGc@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    year: '2023',
    rating: '8.9',
    genres: ['Biography', 'Drama', 'History'],
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
  },
  {
    id: 'tt1375666',
    title: 'Inception',
    type: 'movie',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    year: '2010',
    rating: '8.8',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
  },
  {
    id: 'tt0816692',
    title: 'Interstellar',
    type: 'movie',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80',
    year: '2014',
    rating: '8.7',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers.",
  },
  {
    id: 'tt6263850',
    title: 'Deadpool & Wolverine',
    type: 'movie',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNzRiMjg0MzUtNTQ1Eg00OGNkLWE2NjMtMmI5NTZiNjQ5YTQ4XkEyXkFqcGc@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    year: '2024',
    rating: '7.8',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    description: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to defeat a common enemy.',
  },
  {
    id: 'tt0468569',
    title: 'The Dark Knight',
    type: 'movie',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    year: '2008',
    rating: '9.0',
    genres: ['Action', 'Crime', 'Drama'],
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests of his ability to fight injustice.',
  },
];

export const FALLBACK_TRENDING_SERIES: MediaItem[] = [
  {
    id: 'tt0903747',
    title: 'Breaking Bad',
    type: 'series',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjAtNjA5NDE4YjBkNDk3XkEyXkFqcGc@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    year: '2008',
    rating: '9.5',
    genres: ['Crime', 'Drama', 'Thriller'],
    description: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.',
  },
  {
    id: 'tt0944947',
    title: 'Game of Thrones',
    type: 'series',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZD阳ODMxXkEyXkFqcGc@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    year: '2011',
    rating: '9.2',
    genres: ['Action', 'Adventure', 'Drama'],
    description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
  },
  {
    id: 'tt4574334',
    title: 'Stranger Things',
    type: 'series',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3YTUtYjBkZWI0ZWNhSfFkXkEyXkFqcGc@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    year: '2016',
    rating: '8.7',
    genres: ['Drama', 'Fantasy', 'Horror'],
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
  },
  {
    id: 'tt1190634',
    title: 'The Boys',
    type: 'series',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYzA2Nzk5M2EtNWY4Ny00ZDY2LThlNTMtMGM5MmZkMGM1NGRhXkEyXkFqcGc@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    year: '2019',
    rating: '8.7',
    genres: ['Action', 'Comedy', 'Drama'],
    description: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.',
  },
  {
    id: 'tt11198330',
    title: 'House of the Dragon',
    type: 'series',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjA5OTljNzYtOWIxNi00NDkzLWE1ODEtOTk3MDNhZDY3ZGIwXkEyXkFqcGc@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    year: '2022',
    rating: '8.4',
    genres: ['Action', 'Adventure', 'Drama'],
    description: 'An internal succession war within House Targaryen at the height of its power, 172 years before the birth of Daenerys Targaryen.',
  },
  {
    id: 'tt8772296',
    title: 'Euphoria',
    type: 'series',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BN2IzYTFmMmQtYjFkMi00MzY2LWE1N2YtYTgyNzNmY2VhMGY1XkEyXkFqcGc@._V1_SX300.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    year: '2019',
    rating: '8.3',
    genres: ['Drama'],
    description: 'A look at life for a group of high school students as they grapple with issues of drugs, sex, and identity.',
  },
];

export const FALLBACK_TOP_ANIME: MediaItem[] = [
  {
    id: '52991',
    title: 'Frieren: Beyond Journey\'s End',
    type: 'anime',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    year: '2023',
    rating: '9.3',
    genres: ['Adventure', 'Drama', 'Fantasy'],
    description: 'An elven mage reflecting on life, mortality, and human bonds on an introspective journey following the defeat of the Demon King.',
  },
  {
    id: '5114',
    title: 'Fullmetal Alchemist: Brotherhood',
    type: 'anime',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    year: '2009',
    rating: '9.1',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    description: 'Two brothers search for a Philosopher\'s Stone after an attempt to revive their deceased mother goes awry and leaves them in damaged physical forms.',
  },
  {
    id: '16498',
    title: 'Attack on Titan',
    type: 'anime',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    year: '2013',
    rating: '8.5',
    genres: ['Action', 'Drama', 'Fantasy'],
    description: 'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans.',
  },
  {
    id: '38000',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    type: 'anime',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    year: '2019',
    rating: '8.5',
    genres: ['Action', 'Fantasy'],
    description: 'A youth begins a quest to fight demons and turn his sister human again after his family is slaughtered and his sister is turned into a demon.',
  },
  {
    id: '40748',
    title: 'Jujutsu Kaisen',
    type: 'anime',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    year: '2020',
    rating: '8.6',
    genres: ['Action', 'Fantasy'],
    description: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman\'s school to be able to locate the demon\'s other body parts.',
  },
  {
    id: '21',
    title: 'One Piece',
    type: 'anime',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80',
    year: '1999',
    rating: '8.7',
    genres: ['Action', 'Adventure', 'Fantasy'],
    description: 'Monkey D. Luffy sets sail with his crew of Straw Hat Pirates through the Grand Line to find the treasure known as One Piece and become the Pirate King.',
  },
];

// Helper to safely fetch with timeout
async function safeFetchJson<T>(url: string, timeoutMs = 4500): Promise<T | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    } as any);
    clearTimeout(id);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    clearTimeout(id);
    return null;
  }
}

// 1. Cinemeta API Clients
export async function getTrendingMovies(): Promise<MediaItem[]> {
  try {
    const data = await safeFetchJson<{ metas: any[] }>('https://v3-cinemeta.strem.io/catalog/movie/top.json');
    if (!data?.metas?.length) return FALLBACK_TRENDING_MOVIES;

    return data.metas.slice(0, 20).map((m) => ({
      id: m.id || m.imdb_id,
      title: m.name,
      type: 'movie',
      posterUrl: m.poster || FALLBACK_TRENDING_MOVIES[0].posterUrl,
      backdropUrl: m.background || m.poster,
      year: m.releaseInfo || m.year,
      rating: m.imdbRating || '7.5',
      genres: m.genres || [],
      description: m.description,
    }));
  } catch {
    return FALLBACK_TRENDING_MOVIES;
  }
}

export async function getTrendingSeries(): Promise<MediaItem[]> {
  try {
    const data = await safeFetchJson<{ metas: any[] }>('https://v3-cinemeta.strem.io/catalog/series/top.json');
    if (!data?.metas?.length) return FALLBACK_TRENDING_SERIES;

    return data.metas.slice(0, 20).map((m) => ({
      id: m.id || m.imdb_id,
      title: m.name,
      type: 'series',
      posterUrl: m.poster || FALLBACK_TRENDING_SERIES[0].posterUrl,
      backdropUrl: m.background || m.poster,
      year: m.releaseInfo || m.year,
      rating: m.imdbRating || '8.0',
      genres: m.genres || [],
      description: m.description,
    }));
  } catch {
    return FALLBACK_TRENDING_SERIES;
  }
}

export async function getTopAnime(): Promise<MediaItem[]> {
  try {
    const data = await safeFetchJson<{ data: any[] }>('https://api.jikan.moe/v4/top/anime?limit=20');
    if (!data?.data?.length) return FALLBACK_TOP_ANIME;

    return data.data.map((a) => ({
      id: String(a.mal_id),
      title: a.title_english || a.title,
      type: 'anime',
      posterUrl: a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url || FALLBACK_TOP_ANIME[0].posterUrl,
      backdropUrl: a.images?.jpg?.large_image_url,
      year: a.year ? String(a.year) : a.aired?.from ? a.aired.from.slice(0, 4) : undefined,
      rating: a.score ? String(a.score) : '8.2',
      genres: a.genres?.map((g: any) => g.name) || [],
      description: a.synopsis,
    }));
  } catch {
    return FALLBACK_TOP_ANIME;
  }
}

export async function getLiveTvChannels(): Promise<MediaItem[]> {
  return CURATED_LIVE_CHANNELS.map((ch) => ({
    id: ch.id,
    title: ch.name,
    type: 'livetv',
    posterUrl: ch.logo,
    category: ch.category,
    streamUrl: ch.streamUrl,
    description: ch.description,
    rating: 'LIVE',
    year: ch.country,
  }));
}

// Universal Search across Movies, Series, Anime, and Live TV
export async function universalSearch(query: string): Promise<MediaItem[]> {
  if (!query || query.trim().length === 0) return [];

  const cleanQuery = encodeURIComponent(query.trim().toLowerCase());
  const results: MediaItem[] = [];

  // Match Live TV instantly locally
  const matchedChannels = CURATED_LIVE_CHANNELS.filter(
    (ch) =>
      ch.name.toLowerCase().includes(query.toLowerCase()) ||
      ch.category.toLowerCase().includes(query.toLowerCase()) ||
      ch.country.toLowerCase().includes(query.toLowerCase())
  ).map((ch) => ({
    id: ch.id,
    title: ch.name,
    type: 'livetv' as const,
    posterUrl: ch.logo,
    category: ch.category,
    streamUrl: ch.streamUrl,
    description: ch.description,
    rating: 'LIVE',
    year: ch.country,
  }));
  results.push(...matchedChannels);

  // Parallel fetch from Cinemeta and Jikan
  const [moviesData, seriesData, animeData] = await Promise.allSettled([
    safeFetchJson<{ metas: any[] }>(`https://v3-cinemeta.strem.io/catalog/movie/top/search=${cleanQuery}.json`, 3500),
    safeFetchJson<{ metas: any[] }>(`https://v3-cinemeta.strem.io/catalog/series/top/search=${cleanQuery}.json`, 3500),
    safeFetchJson<{ data: any[] }>(`https://api.jikan.moe/v4/anime?q=${cleanQuery}&limit=8`, 3500),
  ]);

  if (moviesData.status === 'fulfilled' && moviesData.value?.metas) {
    results.push(
      ...moviesData.value.metas.slice(0, 8).map((m) => ({
        id: m.id || m.imdb_id,
        title: m.name,
        type: 'movie' as const,
        posterUrl: m.poster,
        backdropUrl: m.background,
        year: m.releaseInfo || m.year,
        rating: m.imdbRating,
        genres: m.genres || [],
        description: m.description,
      }))
    );
  }

  if (seriesData.status === 'fulfilled' && seriesData.value?.metas) {
    results.push(
      ...seriesData.value.metas.slice(0, 8).map((m) => ({
        id: m.id || m.imdb_id,
        title: m.name,
        type: 'series' as const,
        posterUrl: m.poster,
        backdropUrl: m.background,
        year: m.releaseInfo || m.year,
        rating: m.imdbRating,
        genres: m.genres || [],
        description: m.description,
      }))
    );
  }

  if (animeData.status === 'fulfilled' && animeData.value?.data) {
    results.push(
      ...animeData.value.data.map((a) => ({
        id: String(a.mal_id),
        title: a.title_english || a.title,
        type: 'anime' as const,
        posterUrl: a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url,
        backdropUrl: a.images?.jpg?.large_image_url,
        year: a.year ? String(a.year) : undefined,
        rating: a.score ? String(a.score) : undefined,
        genres: a.genres?.map((g: any) => g.name) || [],
        description: a.synopsis,
      }))
    );
  }

  // Filter out items missing posters or IDs
  return results.filter((item) => item.id && item.title);
}

// Media Details Fetcher
export async function getMediaDetails(type: 'movie' | 'series' | 'anime' | 'livetv', id: string): Promise<MediaDetails | null> {
  if (type === 'livetv') {
    const ch = CURATED_LIVE_CHANNELS.find((c) => c.id === id) || CURATED_LIVE_CHANNELS[0];
    return {
      id: ch.id,
      title: ch.name,
      type: 'livetv',
      posterUrl: ch.logo,
      streamUrl: ch.streamUrl,
      description: ch.description,
      category: ch.category,
      year: ch.country,
      rating: 'LIVE',
    };
  }

  if (type === 'anime') {
    try {
      const full = await safeFetchJson<{ data: any }>(`https://api.jikan.moe/v4/anime/${id}/full`, 4000);
      const epData = await safeFetchJson<{ data: any[] }>(`https://api.jikan.moe/v4/anime/${id}/episodes`, 4000);

      const a = full?.data;
      if (!a) {
        // Fallback to top anime mock
        const fallback = FALLBACK_TOP_ANIME.find((fa) => fa.id === id) || FALLBACK_TOP_ANIME[0];
        return {
          ...fallback,
          seasons: [1],
          episodes: Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            title: `Episode ${i + 1}`,
            season: 1,
            episode: i + 1,
          })),
        };
      }

      const totalEpisodes = a.episodes || epData?.data?.length || 12;
      const episodes: Episode[] = epData?.data?.length
        ? epData.data.map((ep: any) => ({
            id: ep.mal_id,
            title: ep.title || `Episode ${ep.mal_id}`,
            season: 1,
            episode: ep.mal_id,
            overview: ep.synopsis,
            released: ep.aired,
          }))
        : Array.from({ length: totalEpisodes }, (_, i) => ({
            id: i + 1,
            title: `Episode ${i + 1}`,
            season: 1,
            episode: i + 1,
          }));

      return {
        id: String(a.mal_id),
        title: a.title_english || a.title,
        type: 'anime',
        posterUrl: a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url,
        backdropUrl: a.trailer?.images?.maximum_image_url || a.images?.jpg?.large_image_url,
        year: a.year ? String(a.year) : undefined,
        rating: a.score ? String(a.score) : '8.0',
        genres: a.genres?.map((g: any) => g.name) || [],
        description: a.synopsis,
        duration: a.duration,
        seasons: [1],
        episodes,
      };
    } catch {
      const fallback = FALLBACK_TOP_ANIME.find((fa) => fa.id === id) || FALLBACK_TOP_ANIME[0];
      return {
        ...fallback,
        seasons: [1],
        episodes: Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          title: `Episode ${i + 1}`,
          season: 1,
          episode: i + 1,
        })),
      };
    }
  }

  // Movie or Series via Cinemeta
  try {
    const metaEndpoint = type === 'movie'
      ? `https://v3-cinemeta.strem.io/meta/movie/${id}.json`
      : `https://v3-cinemeta.strem.io/meta/series/${id}.json`;

    const data = await safeFetchJson<{ meta: any }>(metaEndpoint, 4500);
    const m = data?.meta;

    if (!m) {
      const fallbackList = type === 'movie' ? FALLBACK_TRENDING_MOVIES : FALLBACK_TRENDING_SERIES;
      const fallback = fallbackList.find((f) => f.id === id) || fallbackList[0];
      return {
        ...fallback,
        seasons: type === 'series' ? [1] : undefined,
        episodes: type === 'series'
          ? Array.from({ length: 10 }, (_, i) => ({
              id: i + 1,
              title: `Episode ${i + 1}`,
              season: 1,
              episode: i + 1,
            }))
          : undefined,
      };
    }

    const episodes: Episode[] = [];
    const seasonsSet = new Set<number>();

    if (m.videos && Array.isArray(m.videos)) {
      m.videos.forEach((v: any) => {
        const s = v.season || 1;
        const e = v.episode || 1;
        seasonsSet.add(s);
        episodes.push({
          id: v.id || `${s}-${e}`,
          title: v.name || v.title || `Episode ${e}`,
          season: s,
          episode: e,
          thumbnail: v.thumbnail,
          overview: v.overview,
          released: v.released,
        });
      });
    }

    const seasons = Array.from(seasonsSet).sort((a, b) => a - b);
    if (type === 'series' && seasons.length === 0) {
      seasons.push(1);
    }

    return {
      id: m.id || m.imdb_id || id,
      imdbId: m.imdb_id || id,
      title: m.name,
      type,
      posterUrl: m.poster,
      backdropUrl: m.background || m.poster,
      year: m.releaseInfo || m.year,
      rating: m.imdbRating || '7.8',
      genres: m.genres || [],
      description: m.description,
      duration: m.runtime,
      cast: m.cast || [],
      directors: m.director ? [m.director] : [],
      seasons: type === 'series' ? seasons : undefined,
      episodes: type === 'series' ? episodes : undefined,
      trailerUrl: m.trailer,
    };
  } catch {
    const fallbackList = type === 'movie' ? FALLBACK_TRENDING_MOVIES : FALLBACK_TRENDING_SERIES;
    const fallback = fallbackList.find((f) => f.id === id) || fallbackList[0];
    return {
      ...fallback,
      seasons: type === 'series' ? [1] : undefined,
      episodes: type === 'series'
        ? Array.from({ length: 8 }, (_, i) => ({
            id: i + 1,
            title: `Episode ${i + 1}`,
            season: 1,
            episode: i + 1,
          }))
        : undefined,
    };
  }
}

// -------------------------------------------------------------
// GENRE DEFINITIONS & DISCOVERY ENGINE
// -------------------------------------------------------------

export interface GenreCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export const GENRES: GenreCategory[] = [
  { id: 'action', name: 'Action & Adventure', slug: 'action', description: 'High-octane blockbusters, heroic quests, and thrilling showdowns.' },
  { id: 'sci-fi', name: 'Sci-Fi & Cyberpunk', slug: 'sci-fi', description: 'Futuristic worlds, interstellar exploration, and visionary epics.' },
  { id: 'crime', name: 'Crime & Mystery', slug: 'crime', description: 'Intriguing detective stories, heists, and gripping underworld dramas.' },
  { id: 'drama', name: 'Critically Acclaimed Drama', slug: 'drama', description: 'Emotional masterworks, true stories, and deep character journeys.' },
  { id: 'comedy', name: 'Comedy & Laughs', slug: 'comedy', description: 'Clever humor, satire, and feel-good entertainment.' },
  { id: 'horror', name: 'Horror & Suspense', slug: 'horror', description: 'Supernatural mysteries and psychological chills.' },
  { id: 'animation', name: 'Animation & Anime', slug: 'animation', description: 'Masterclass animation and legendary animated sagas.' },
  { id: 'documentary', name: 'Documentaries', slug: 'documentary', description: 'Real-world science, nature wonders, and historical investigations.' },
];

/**
 * Fetch Top 10 Movies Today for the specialized Netflix-style Top 10 Carousel
 */
export async function getTop10Movies(): Promise<MediaItem[]> {
  try {
    const movies = await getTrendingMovies();
    if (movies && movies.length >= 10) {
      return movies.slice(0, 10);
    }
    return FALLBACK_TRENDING_MOVIES.slice(0, 10);
  } catch {
    return FALLBACK_TRENDING_MOVIES.slice(0, 10);
  }
}

/**
 * Fetch Top 10 Series Today
 */
export async function getTop10Series(): Promise<MediaItem[]> {
  try {
    const series = await getTrendingSeries();
    if (series && series.length >= 10) {
      return series.slice(0, 10);
    }
    return FALLBACK_TRENDING_SERIES.slice(0, 10);
  } catch {
    return FALLBACK_TRENDING_SERIES.slice(0, 10);
  }
}

/**
 * Fetch titles by genre slug (e.g. 'action', 'sci-fi', 'comedy')
 */
export async function getTitlesByGenre(genreSlug: string): Promise<MediaItem[]> {
  const normSlug = genreSlug.toLowerCase().trim();
  const [movies, series, anime] = await Promise.all([
    getTrendingMovies(),
    getTrendingSeries(),
    getTopAnime(),
  ]);

  const all = [...movies, ...series, ...anime];

  const matched = all.filter((item) => {
    if (!item.genres || item.genres.length === 0) return false;
    return item.genres.some((g) => {
      const gNorm = g.toLowerCase();
      if (normSlug === 'sci-fi' && (gNorm.includes('sci-fi') || gNorm.includes('science fiction'))) return true;
      if (normSlug === 'action' && (gNorm.includes('action') || gNorm.includes('adventure'))) return true;
      if (normSlug === 'crime' && (gNorm.includes('crime') || gNorm.includes('mystery') || gNorm.includes('thriller'))) return true;
      if (normSlug === 'animation' && (gNorm.includes('animation') || item.type === 'anime')) return true;
      return gNorm.includes(normSlug);
    });
  });

  if (matched.length >= 4) {
    return matched;
  }

  // Fallback to top items if genre query has sparse matches
  return all.slice(0, 18);
}

/**
 * Get Recommendations ("More Like This") for a specific title
 */
export async function getRecommendations(
  type: 'movie' | 'series' | 'anime' | 'livetv',
  id: string,
  genres: string[] = []
): Promise<MediaItem[]> {
  if (type === 'livetv') {
    return CURATED_LIVE_CHANNELS.filter((c) => c.id !== id).slice(0, 6).map((ch) => ({
      id: ch.id,
      title: ch.name,
      type: 'livetv',
      posterUrl: ch.logo,
      category: ch.category,
      streamUrl: ch.streamUrl,
      description: ch.description,
      rating: 'LIVE',
      year: ch.country,
    }));
  }

  const [movies, series, anime] = await Promise.all([
    getTrendingMovies(),
    getTrendingSeries(),
    getTopAnime(),
  ]);

  const pool = type === 'movie' ? movies : type === 'series' ? series : anime;
  const filtered = pool.filter((item) => item.id !== id);

  if (genres.length > 0) {
    const scored = filtered.map((item) => {
      let score = 0;
      if (item.genres) {
        for (const g of item.genres) {
          if (genres.includes(g)) score += 2;
        }
      }
      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 6).map((s) => s.item);
  }

  return filtered.slice(0, 6);
}

