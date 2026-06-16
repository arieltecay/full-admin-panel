export interface Client {
  _id: string;
  name: string;
  email: string;
  role: 'client';
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended';
  accessExpiresAt?: string | null;
  customNote?: string;
  managerPassword?: string;
  createdAt: string;
}
