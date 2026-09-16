export type ReviewIdentityType = "roblox" | "discord" | "name";
export type ReviewStatus = "pending" | "approved" | "rejected";

export type PortfolioReview = {
  id: string;
  display_name: string;
  identity_type: ReviewIdentityType;
  rating: number;
  title: string;
  description: string;
  image_url: string;
  status: ReviewStatus;
  created_at: string;
  reviewed_at?: string | null;
};

export function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
