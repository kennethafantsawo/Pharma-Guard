
export type Database = {
  public: {
    Tables: {
      weeks: {
        Row: {
          id: number
          semaine: string
        }
      }
      pharmacies: {
        Row: {
          id: number
          week_id: number
          nom: string
          localisation: string
          contact1: string
          contact2: string
        }
      }
      user_feedback: {
        Row: {
          id: number;
          type: string;
          content: string;
          created_at: string;
        },
        Insert: {
          type: string;
          content: string;
        }
      },
      profiles: {
        Row: {
          id: string; // Corresponds to auth.users.id
          phone: string;
          username: string;
          role: 'Client' | 'Pharmacien';
          pharmacy_name: string | null;
          created_at: string;
        },
        Insert: {
          id: string;
          phone: string;
          username: string;
          role: 'Client' | 'Pharmacien';
          pharmacy_name?: string | null;
        }
      },
      searches: {
        Row: {
          id: number;
          client_id: string;
          original_product_name: string | null;
          product_name: string;
          photo_urls: string[] | null;
          created_at: string;
        },
        Insert: {
          client_id: string;
          original_product_name?: string | null;
          product_name: string;
          photo_urls?: string[] | null;
        }
      },
      responses: {
        Row: {
          id: number;
          search_id: number;
          pharmacist_id: string;
          pharmacy_name: string;
          price: string | null;
          created_at: string;
        },
        Insert: {
          search_id: number;
          pharmacist_id: string;
          pharmacy_name: string;
          price?: string | null;
        }
      },
      messages: {
        Row: {
          id: number;
          search_id: number;
          sender_id: string;
          content: string;
          created_at: string;
        },
        Insert: {
          search_id: number;
          sender_id: string;
          content: string;
        }
      }
    }
    Functions: {}
  }
}
