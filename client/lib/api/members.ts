const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface Member {
  id: number;
  name: string;
  state: string;
  district: string | null;
  role: 'Senator' | 'Representative';
  party: string;
  api_id: string;
  photo_url: string | null;
}

export interface MembersResponse {
  source: 'cache' | 'api';
  count: number;
  members: Member[];
}

export async function fetchMembers(): Promise<MembersResponse> {
  const res = await fetch(`${API_URL}/api/member`);
  if (!res.ok) {
    throw new Error(`Failed to fetch members: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
