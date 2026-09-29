export interface Role {
  id: number;
  name: string;
  description?: string;
  status?: boolean;
}

export interface User {
  id: number;
  name: string;
  email?: string;
  role_id: number;
  profile_image?: string;
  status?: boolean;
  role?: Role;
}
