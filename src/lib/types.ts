

export interface Pharmacy {
  nom: string;
  localisation: string;
  contact1: string;
  contact2: string;
}

export interface WeekSchedule {
  semaine: string;
  pharmacies: Pharmacy[];
}

export interface HealthPost {
  id: number;
  created_at: string;
  title: string;
  content: string;
  image_url: string | null;
  likes: number;
  publish_at: string | null;
  status: 'published' | 'draft' | 'scheduled';
}

export interface HealthPostComment {
  id: number;
  post_id: number;
  content: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  pharmacy_name: string | null;
  phone: string | null;
  role: 'Client' | 'Pharmacien';
  password?: string | null;
}

export interface PharmacyWithProfile {
    nom: string;
    has_profile: boolean;
}
