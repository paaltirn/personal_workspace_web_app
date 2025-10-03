export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string; // 关联 auth.users 的 id
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileData {
  name: string;
  role?: 'admin' | 'user';
  bio?: string;
}

export interface UpdateUserProfileData {
  name?: string;
  role?: 'admin' | 'user';
  bio?: string;
  avatar_url?: string;
}