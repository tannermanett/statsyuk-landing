/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { hostname: "localhost" }, 
      { hostname: "randomuser.me" },
      { hostname: "img.youtube.com" }
    ],
  },
};

export default nextConfig;
