
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      health_post_comments: {
        Row: {
          content: string
          created_at: string
          id: number
          post_id: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          post_id: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_health_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "health_posts"
            referencedColumns: ["id"]
          }
        ]
      }
      health_posts: {
        Row: {
          content: string
          created_at: string
          id: number
          image_url: string | null
          likes: number
          published_at: string | null
          status: Database["public"]["Enums"]["post_status"]
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          image_url?: string | null
          likes?: number
          published_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          image_url?: string | null
          likes?: number
          published_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: number
          search_id: number
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          search_id: number
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          search_id?: number
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_messages_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      pharmacies: {
        Row: {
          contact1: string
          contact2: string
          id: number
          localisation: string
          nom: string
          week_id: number
        }
        Insert: {
          contact1: string
          contact2: string
          id?: number
          localisation: string
          nom: string
          week_id: number
        }
        Update: {
          contact1?: string
          contact2?: string
          id?: number
          localisation?: string
          nom?: string
          week_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_pharmacies_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "weeks"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          pharmacy_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          pharmacy_name?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          pharmacy_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      responses: {
        Row: {
          created_at: string
          id: number
          pharmacist_id: string
          pharmacy_name: string
          price: string | null
          search_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          pharmacist_id: string
          pharmacy_name: string
          price?: string | null
          search_id: number
        }
        Update: {
          created_at?: string
          id?: number
          pharmacist_id?: string
          pharmacy_name?: string
          price?: string | null
          search_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_responses_pharmacist_id_fkey"
            columns: ["pharmacist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_responses_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          }
        ]
      }
      searches: {
        Row: {
          client_id: string
          client_phone: string | null
          created_at: string
          id: number
          original_product_name: string | null
          photo_urls: string[] | null
          product_name: string
        }
        Insert: {
          client_id: string
          client_phone?: string | null
          created_at?: string
          id?: number
          original_product_name?: string | null
          photo_urls?: string[] | null
          product_name: string
        }
        Update: {
          client_id?: string
          client_phone?: string | null
          created_at?: string
          id?: number
          original_product_name?: string | null
          photo_urls?: string[] | null
          product_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "searches_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_feedback: {
        Row: {
          content: string
          created_at: string
          id: number
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          type?: string
        }
        Relationships: []
      }
      weeks: {
        Row: {
          id: number
          semaine: string
        }
        Insert: {
          id?: number
          semaine: string
        }
        Update: {
          id?: number
          semaine?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_all_pharmacy_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      increment_likes: {
        Args: {
          post_id_to_update: number
          increment_value: number
        }
        Returns: number
      }
    }
    Enums: {
      post_status: "draft" | "published" | "scheduled"
      user_role: "Client" | "Pharmacien"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

    

    