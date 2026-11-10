export interface SocialPost {
  id: string;
  platform?: string;
  image_url: string;
  caption?: string;
  link?: string;
  position: number;
  active: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export class SocialPostService {
  static async getPosts(_activeOnly = false): Promise<SocialPost[]> {
    return [];
  }

  static async createPost(_post: Partial<SocialPost>): Promise<SocialPost | null> {
    return null;
  }

  static async updatePost(_id: string, _updates: Partial<SocialPost>): Promise<SocialPost | null> {
    return null;
  }

  static async deletePost(_id: string): Promise<boolean> {
    return false;
  }
}
