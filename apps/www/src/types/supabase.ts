export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      fourp: {
        Row: {
          completion: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["cohere-event-type"]
          input_id: string
        }
        Insert: {
          completion?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["cohere-event-type"]
          input_id: string
        }
        Update: {
          completion?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["cohere-event-type"]
          input_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fourp_input_id_fkey"
            columns: ["input_id"]
            isOneToOne: true
            referencedRelation: "input"
            referencedColumns: ["id"]
          }
        ]
      }
      genbiz: {
        Row: {
          completion: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["cohere-event-type"]
          input_id: string
        }
        Insert: {
          completion?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["cohere-event-type"]
          input_id: string
        }
        Update: {
          completion?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["cohere-event-type"]
          input_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genbiz_input_id_fkey"
            columns: ["input_id"]
            isOneToOne: true
            referencedRelation: "swot"
            referencedColumns: ["input_id"]
          }
        ]
      }
      input: {
        Row: {
          created_at: string
          creator: string | null
          expertise: string | null
          id: string
          product_idea: string | null
          target_audience: string | null
        }
        Insert: {
          created_at?: string
          creator?: string | null
          expertise?: string | null
          id?: string
          product_idea?: string | null
          target_audience?: string | null
        }
        Update: {
          created_at?: string
          creator?: string | null
          expertise?: string | null
          id?: string
          product_idea?: string | null
          target_audience?: string | null
        }
        Relationships: []
      }
      swot: {
        Row: {
          completion: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["cohere-event-type"]
          input_id: string
        }
        Insert: {
          completion?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["cohere-event-type"]
          input_id: string
        }
        Update: {
          completion?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["cohere-event-type"]
          input_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swot_input_id_fkey"
            columns: ["input_id"]
            isOneToOne: true
            referencedRelation: "fourp"
            referencedColumns: ["input_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      "stream-completion": {
        Args: {
          table_name: string
          input_id: string
          event_type: string
          completion: string
          created_at: string
        }
        Returns: string
      }
    }
    Enums: {
      "cohere-event-type":
        | "stream-start"
        | "search-queries-generation"
        | "search-results"
        | "text-generation"
        | "stream-end"
        | "citation-generation"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
