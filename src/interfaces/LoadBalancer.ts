export interface LoadBalancer {
  id: string;
  name: string;
  ip: string;
  algorithm: string;
  status: string;
  created_at: string;
  droplet_ids: number[];
}