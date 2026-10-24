import type { Metadata } from "next";
import { LookPicker } from "@/components/look-picker";

export const metadata: Metadata = { title: "New look — muselook" };

export default function Page() {
  return <LookPicker />;
}
