import { Downloader } from "@tobyg74/tiktok-api-dl";
import type { TikTokPost } from "@/lib/types";

type DownloaderVersion = "v1" | "v2";

type RawDownloaderResponse = {
  status: "success" | "error";
  message?: string;
  result?: {
    id?: string;
    createTime?: number;
    desc?: string;
    hashtag?: string[];
    isADS?: boolean;
    isTurnOffComment?: boolean;
    type?: "video" | "image" | "music";
    author?: {
      uid?: string;
      username?: string;
      uniqueId?: string;
      nickname?: string;
      signature?: string;
    };
    music?: {
      album?: string;
      author?: string;
      coverLarge?: string[];
      coverMedium?: string[];
      coverThumb?: string[];
      duration?: number;
      id?: string | number;
      isAuthorArtist?: boolean;
      isCommerceMusic?: boolean;
      isOriginalSound?: boolean;
      playUrl?: string[];
      title?: string;
    };
    statistics?: {
      likeCount?: string | number;
      commentCount?: string | number;
      shareCount?: string | number;
      playCount?: number;
      downloadCount?: number;
    };
    video?: {
      ratio?: string;
      duration?: number;
      playAddr?: string[];
      downloadAddr?: string[];
      cover?: string[];
      dynamicCover?: string[];
      originCover?: string[];
    };
  };
};

async function retryDownload(url: string, versions: DownloaderVersion[]) {
  for (const version of versions) {
    try {
      const response = (await Downloader(url, {
        version,
      })) as RawDownloaderResponse;

      if (response.status === "success") {
        return { response, version };
      }
    } catch (error) {
      console.warn(`Failed to download file with: ${version}`, error);
    }
  }

  return null;
}

function normalizeResponse(
  response: RawDownloaderResponse,
  version: DownloaderVersion,
): TikTokPost {
  const result = response.result;
  const playUrl = result?.music?.playUrl?.filter(Boolean) ?? [];

  if (!result || playUrl.length === 0) {
    throw new Error("TikTok audio is missing a playable sound");
  }

  return {
    data: {
      result: {
        author: {
          uid: result.author?.uid,
          username:
            result.author?.username ??
            result.author?.nickname ??
            "unknown-creator",
          uniqueId: result.author?.uniqueId,
          nickname:
            result.author?.nickname ??
            result.author?.username ??
            "Unknown creator",
          signature: result.author?.signature,
        },
        createTime: result.createTime ?? Date.now(),
        desc: result.desc ?? "",
        hashtag: result.hashtag ?? [],
        id: result.id ?? crypto.randomUUID(),
        isADS: result.isADS ?? false,
        isTurnOffComment: result.isTurnOffComment ?? false,
        music: {
          album: result.music?.album,
          author: result.music?.author ?? "Unknown artist",
          coverLarge: result.music?.coverLarge ?? [],
          coverMedium: result.music?.coverMedium ?? [],
          coverThumb: result.music?.coverThumb ?? [],
          duration: result.music?.duration ?? 0,
          id: result.music?.id,
          isAuthorArtist: result.music?.isAuthorArtist,
          isCommerceMusic: result.music?.isCommerceMusic,
          isOriginalSound: result.music?.isOriginalSound,
          playUrl,
          title: result.music?.title ?? "TikTok Audio",
        },
        statistics: {
          likeCount: result.statistics?.likeCount,
          commentCount: result.statistics?.commentCount,
          shareCount: result.statistics?.shareCount,
          playCount: result.statistics?.playCount,
          downloadCount: result.statistics?.downloadCount,
        },
        type: result.type ?? "music",
        video: {
          ratio: result.video?.ratio,
          duration: result.video?.duration,
          playAddr: result.video?.playAddr ?? [],
          downloadAddr: result.video?.downloadAddr ?? [],
          cover: result.video?.cover ?? [],
          dynamicCover: result.video?.dynamicCover ?? [],
          originCover: result.video?.originCover ?? [],
        },
        status: "success",
      },
    },
    ver: version,
  };
}

export async function getTikTokAudio(url: string): Promise<TikTokPost> {
  if (!url || !url.includes("tiktok.com")) {
    throw new Error("Invalid TikTok URL");
  }

  const result = await retryDownload(url, ["v1", "v2"]);

  if (!result) {
    throw new Error("Failed to download TikTok audio");
  }

  return normalizeResponse(result.response, result.version);
}
