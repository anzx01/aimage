import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  credits: number;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  mode: 'basic' | 'advanced';
  status: 'draft' | 'processing' | 'completed' | 'failed';
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  credits_used: number;
  created_at: string;
  updated_at: string;
}

export interface ShowcaseCase {
  id: string;
  title: string;
  description: string | null;
  category: string;
  model_version: string;
  video_url: string;
  thumbnail_url: string;
  view_count: number;
  favorite_count: number;
  tags: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}
