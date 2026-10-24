import type { Metadata } from "next";
import { Feed } from "@/components/feed";

export const metadata: Metadata = { title: "Feed — muselook" };

export default function Page() {
  return <Feed />;
}
