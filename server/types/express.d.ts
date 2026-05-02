declare global {
  namespace Express {
    interface User {
      id: number;
      name: string;
      email: string;
      address: string | null;
      preferences: Record<string, unknown> | null;
      senator_ids: number[];
      congress_member_ids: number[];
    }
  }
}

export {};
