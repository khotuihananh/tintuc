import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Giá vàng, BTC & xăng dầu",
    short_name: "Giá thị trường",
    description: "Theo dõi giá vàng, Bitcoin và xăng dầu cập nhật trực tiếp.",
    start_url: "/gold",
    display: "standalone",
    background_color: "#071426",
    theme_color: "#0b1f3a",
    orientation: "portrait",
    lang: "vi",
    categories: ["finance", "utilities"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

export const dynamic = "force-static";
