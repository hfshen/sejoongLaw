import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "법무법인 세중",
    short_name: "세중법무법인",
    description: "전문 법률 서비스를 제공하는 법무법인 세중",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#bb271a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["legal", "business"],
    lang: "ko",
    dir: "ltr",
    orientation: "portrait-primary",
  }
}
