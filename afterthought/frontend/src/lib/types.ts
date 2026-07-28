export interface Theme {
  id: number;
  name: string;
  description: string | null;
}

export interface Series {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface EssaySummary {
  id: number;
  title: string;
  slug: string;
  abstract: string | null;
  issue_number: number | null;
  reading_time_minutes: number | null;
  featured_quote: string | null;
  cover_illustration: string | null;
  canonical_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  is_current_issue: boolean;
  status: "draft" | "scheduled" | "published" | "archived";
  view_count: number;
  publication_date: string | null;
  created_at: string;
  updated_at: string;
  series: Pick<Series, "id" | "name"> | null;
  themes: Array<Pick<Theme, "id" | "name">>;
}

export interface Essay extends EssaySummary {
  content: string;
}

export interface User {
  id: number;
  email: string;
  display_name: string | null;
  avatar: string | null;
  biography: string | null;
  hide_identity: boolean;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface Comment {
  id: number;
  content: string;
  essay_id: number;
  created_at: string;
  is_approved: boolean;
  author_name: string;
  is_anonymous: boolean;
}
