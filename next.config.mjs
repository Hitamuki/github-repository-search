/**
 * @file Next.js 設定
 * @remarks セキュリティヘッダー・画像ドメイン許可・外部パッケージ設定
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // X-Powered-By: Next.js ヘッダーを無効化（フレームワーク情報の漏洩防止）
  poweredByHeader: false,
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js のハイドレーション・インラインスクリプトに必要
              "script-src 'self' 'unsafe-inline'",
              // Tailwind CSS / Next.js のインラインスタイルに必要
              "style-src 'self' 'unsafe-inline'",
              // GitHub アバター画像
              "img-src 'self' https://avatars.githubusercontent.com data: blob:",
              // フォント
              "font-src 'self'",
              // API 通信はすべてサーバーサイドのため 'self' のみ
              "connect-src 'self'",
              // プラグイン・Flash 等を禁止
              "object-src 'none'",
              // iframe 埋め込みを禁止
              "frame-src 'none'",
              "frame-ancestors 'none'",
              // フォーム送信先を自ドメインのみに制限
              "form-action 'self'",
              // HTTPS 通信のみ許可
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // max-age=1年。includeSubDomains はサブドメイン運用がないため省略
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
}

export default nextConfig
