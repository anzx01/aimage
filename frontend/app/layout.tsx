import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIMAGE - AI视频生成平台",
  description: "聚合顶级AI模型，一站式生成TikTok爆款视频。支持Kling、Runway、Luma等多种AI模型，快速生成高质量短视频内容。",
  keywords: ["AI视频生成", "TikTok视频", "短视频制作", "AI视频工具", "视频生成平台", "Kling", "Runway", "Luma"],
  authors: [{ name: "AIMAGE Team" }],
  creator: "AIMAGE",
  publisher: "AIMAGE",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://aimage.app",
    title: "AIMAGE - AI视频生成平台",
    description: "聚合顶级AI模型，一站式生成TikTok爆款视频",
    siteName: "AIMAGE",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIMAGE - AI视频生成平台",
    description: "聚合顶级AI模型，一站式生成TikTok爆款视频",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#8B5CF6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
