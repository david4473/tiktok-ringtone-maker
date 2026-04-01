export interface TikTokAuthor {
  uid?: string;
  username: string;
  uniqueId?: string;
  nickname: string;
  signature?: string;
  [key: string]: unknown;
}

export interface TikTokMusic {
  album?: string;
  author: string;
  coverLarge?: string[];
  coverMedium?: string[];
  coverThumb?: string[];
  duration: number;
  id?: string | number;
  isAuthorArtist?: boolean;
  isCommerceMusic?: boolean;
  isOriginalSound?: boolean;
  playUrl: string[];
  title: string;
  [key: string]: unknown;
}

export interface TikTokStatistics {
  likeCount?: string | number;
  commentCount?: string | number;
  shareCount?: string | number;
  playCount?: number;
  downloadCount?: number;
  [key: string]: unknown;
}

export interface TikTokVideo {
  ratio?: string;
  duration?: number;
  playAddr?: string[];
  downloadAddr?: string[];
  cover?: string[];
  dynamicCover?: string[];
  originCover?: string[];
  [key: string]: unknown;
}

export interface TikTokPost {
  data: {
    result: {
      author: TikTokAuthor;
      createTime: number;
      desc: string;
      hashtag: string[];
      id: string;
      isADS: boolean;
      isTurnOffComment: boolean;
      music: TikTokMusic;
      statistics: TikTokStatistics;
      type: "video" | "image" | "music";
      video: TikTokVideo;
      status: "success";
      [key: string]: unknown;
    };
  };
  ver: "v1" | "v2";
}
