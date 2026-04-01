"use server";

import { TikTokPost } from "@/lib/types";
import { getTikTokAudio } from "@/lib/tiktok";

export async function formAction(url: string): Promise<TikTokPost> {
  const result = await getTikTokAudio(url);
  return result;
}
