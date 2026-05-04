/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // pino はワーカースレッドを使うため Next.js バンドルから除外
  serverExternalPackages: ["pino", "pino-pretty"],
}

export default nextConfig
