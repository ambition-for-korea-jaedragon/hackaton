import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "muselook",
    short_name: "muselook",
    description: "Copy the look. Keep your tone.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4f9",
    theme_color: "#f6f4f9",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
