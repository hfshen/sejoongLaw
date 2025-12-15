export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          name: string
          position: string | null
          profile_image_url: string | null
          introduction: string | null
          specialties: string[] | null
          education: string[] | null
          career: string[] | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          position?: string | null
          profile_image_url?: string | null
          introduction?: string | null
          specialties?: string[] | null
          education?: string[] | null
          career?: string[] | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: string | null
          profile_image_url?: string | null
          introduction?: string | null
          specialties?: string[] | null
          education?: string[] | null
          career?: string[] | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      page_contents: {
        Row: {
          id: string
          route_path: string
          title: string
          content: string | null
          meta_description: string | null
          branch: string | null
          section: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          route_path: string
          title: string
          content?: string | null
          meta_description?: string | null
          branch?: string | null
          section?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          route_path?: string
          title?: string
          content?: string | null
          meta_description?: string | null
          branch?: string | null
          section?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          user_id: string
          branch: string
          title: string
          content: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          branch: string
          title: string
          content: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          branch?: string
          title?: string
          content?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

