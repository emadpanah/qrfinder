// src/modules/data/database/dto/lunarcrush-news.dto.ts
export class LunarCrushNewsDto {
    id: string;
    post_type: string;
    post_title: string;
    post_link: string;
    post_image: string;
    post_created: number;
    post_sentiment: number;
    creator_id: string;
    creator_name: string;
    creator_display_name: string;
    creator_followers: number;
    creator_avatar: string;
    interactions_24h: number;
    interactions_total: number;
    fetched_at: number;
  }
  