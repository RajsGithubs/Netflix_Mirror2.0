/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      {
        source: '/watch/movie',
        destination: '/watch/movie/tt1375666',
        permanent: false,
      },
      {
        source: '/watch/series',
        destination: '/watch/series/tt0944947',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
