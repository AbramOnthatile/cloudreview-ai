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
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          brand: string | null
          category: string | null
          description: string | null
          image_url: string | null
          price: number | null
          source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          category?: string | null
          description?: string | null
          image_url?: string | null
          price?: number | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          category?: string | null
          description?: string | null
          image_url?: string | null
          price?: number | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title: string
          content: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          title?: string
          content?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: []
      }
      review_analysis: {
        Row: {
          id: string
          product_id: string
          summary: string | null
          pros: string[]
          cons: string[]
          themes: string[]
          sentiment: string | null
          mode: string
          generated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          summary?: string | null
          pros?: string[]
          cons?: string[]
          themes?: string[]
          sentiment?: string | null
          mode?: string
          generated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          summary?: string | null
          pros?: string[]
          cons?: string[]
          themes?: string[]
          sentiment?: string | null
          mode?: string
          generated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}