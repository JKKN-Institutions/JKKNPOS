export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          address: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          gst_type: string | null
          gstin: string | null
          hsn_code_prefix: string | null
          id: string
          name: string
          phone: string | null
          settings: Json | null
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          gst_type?: string | null
          gstin?: string | null
          hsn_code_prefix?: string | null
          id?: string
          name: string
          phone?: string | null
          settings?: Json | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          gst_type?: string | null
          gstin?: string | null
          hsn_code_prefix?: string | null
          id?: string
          name?: string
          phone?: string | null
          settings?: Json | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          business_id: string
          created_at: string | null
          credit_balance: number | null
          credit_limit: number | null
          customer_type: string | null
          email: string | null
          gstin: string | null
          id: string
          last_visit: string | null
          loyalty_points: number | null
          name: string
          notes: string | null
          phone: string | null
          total_purchases: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_id: string
          created_at?: string | null
          credit_balance?: number | null
          credit_limit?: number | null
          customer_type?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          last_visit?: string | null
          loyalty_points?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          total_purchases?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_id?: string
          created_at?: string | null
          credit_balance?: number | null
          credit_limit?: number | null
          customer_type?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          last_visit?: string | null
          loyalty_points?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          total_purchases?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          business_id: string
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          is_recurring: boolean | null
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          recurrence_interval: string | null
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          business_id: string
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          recurrence_interval?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          business_id?: string
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          recurrence_interval?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      item_modifiers: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_required: boolean | null
          item_id: string
          modifier_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          item_id: string
          modifier_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          item_id?: string
          modifier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_modifiers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_modifiers_modifier_id_fkey"
            columns: ["modifier_id"]
            isOneToOne: false
            referencedRelation: "modifiers"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          barcode: string | null
          business_id: string
          category_id: string | null
          cess_rate: number | null
          cost: number | null
          created_at: string | null
          description: string | null
          expiry_date: string | null
          gst_rate: number | null
          hsn_code: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_stock: number | null
          min_stock: number | null
          name: string
          price: number
          sku: string | null
          stock: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          business_id: string
          category_id?: string | null
          cess_rate?: number | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_stock?: number | null
          min_stock?: number | null
          name: string
          price?: number
          sku?: string | null
          stock?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          business_id?: string
          category_id?: string | null
          cess_rate?: number | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_stock?: number | null
          min_stock?: number | null
          name?: string
          price?: number
          sku?: string | null
          stock?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      modifier_options: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          modifier_id: string
          name: string
          price_adjustment: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          modifier_id: string
          name: string
          price_adjustment?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          modifier_id?: string
          name?: string
          price_adjustment?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modifier_options_modifier_id_fkey"
            columns: ["modifier_id"]
            isOneToOne: false
            referencedRelation: "modifiers"
            referencedColumns: ["id"]
          },
        ]
      }
      modifiers: {
        Row: {
          business_id: string
          created_at: string | null
          display_name: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          max_selections: number | null
          min_selections: number | null
          name: string
          selection_type: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          name: string
          selection_type?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          name?: string
          selection_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modifiers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          reference: string | null
          sale_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          reference?: string | null
          sale_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          reference?: string | null
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_id: string
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          permissions: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          permissions?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_item_modifiers: {
        Row: {
          created_at: string | null
          id: string
          modifier_id: string
          modifier_name: string
          modifier_option_id: string
          option_name: string
          price_adjustment: number | null
          sale_item_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          modifier_id: string
          modifier_name: string
          modifier_option_id: string
          option_name: string
          price_adjustment?: number | null
          sale_item_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          modifier_id?: string
          modifier_name?: string
          modifier_option_id?: string
          option_name?: string
          price_adjustment?: number | null
          sale_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_item_modifiers_modifier_id_fkey"
            columns: ["modifier_id"]
            isOneToOne: false
            referencedRelation: "modifiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_item_modifiers_modifier_option_id_fkey"
            columns: ["modifier_option_id"]
            isOneToOne: false
            referencedRelation: "modifier_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_item_modifiers_sale_item_id_fkey"
            columns: ["sale_item_id"]
            isOneToOne: false
            referencedRelation: "sale_items"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          discount: number | null
          id: string
          item_id: string
          name: string
          price: number
          quantity: number
          sale_id: string
          tax: number | null
          total: number
        }
        Insert: {
          discount?: number | null
          id?: string
          item_id: string
          name: string
          price: number
          quantity: number
          sale_id: string
          tax?: number | null
          total: number
        }
        Update: {
          discount?: number | null
          id?: string
          item_id?: string
          name?: string
          price?: number
          quantity?: number
          sale_id?: string
          tax?: number | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          business_id: string
          cess_amount: number | null
          cgst_amount: number | null
          created_at: string | null
          customer_id: string | null
          discount: number | null
          discount_type: string | null
          id: string
          igst_amount: number | null
          invoice_type: string | null
          notes: string | null
          place_of_supply: string | null
          sale_number: string
          sgst_amount: number | null
          status: Database["public"]["Enums"]["sale_status"] | null
          subtotal: number
          tax: number | null
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          cess_amount?: number | null
          cgst_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          discount?: number | null
          discount_type?: string | null
          id?: string
          igst_amount?: number | null
          invoice_type?: string | null
          notes?: string | null
          place_of_supply?: string | null
          sale_number: string
          sgst_amount?: number | null
          status?: Database["public"]["Enums"]["sale_status"] | null
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          cess_amount?: number | null
          cgst_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          discount?: number | null
          discount_type?: string | null
          id?: string
          igst_amount?: number | null
          invoice_type?: string | null
          notes?: string | null
          place_of_supply?: string | null
          sale_number?: string
          sgst_amount?: number | null
          status?: Database["public"]["Enums"]["sale_status"] | null
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          item_id: string
          quantity: number
          reason: string | null
          reference: string | null
          type: Database["public"]["Enums"]["stock_movement_type"]
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          item_id: string
          quantity: number
          reason?: string | null
          reference?: string | null
          type: Database["public"]["Enums"]["stock_movement_type"]
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          item_id?: string
          quantity?: number
          reason?: string | null
          reference?: string | null
          type?: Database["public"]["Enums"]["stock_movement_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_item_stock: {
        Args: {
          p_adjustment_type: string
          p_business_id: string
          p_item_id: string
          p_quantity: number
          p_reason: string
          p_user_id: string
        }
        Returns: Json
      }
      approve_expense: {
        Args: {
          p_approver_id: string
          p_business_id: string
          p_expense_id: string
        }
        Returns: Json
      }
      bulk_update_prices: {
        Args: {
          p_business_id: string
          p_category_id: string
          p_percentage: number
          p_round_to?: number
        }
        Returns: number
      }
      cancel_sale: {
        Args: {
          p_business_id: string
          p_reason: string
          p_sale_id: string
          p_user_id: string
        }
        Returns: Json
      }
      create_expense: {
        Args: {
          p_amount: number
          p_business_id: string
          p_category: string
          p_date: string
          p_description?: string
          p_is_recurring?: boolean
          p_notes?: string
          p_payment_method?: string
          p_receipt_url?: string
          p_recurrence_interval?: string
          p_user_id: string
        }
        Returns: Json
      }
      create_sale: {
        Args: {
          p_business_id: string
          p_customer_id?: string
          p_discount?: number
          p_discount_type?: string
          p_invoice_type?: string
          p_items: Json
          p_notes?: string
          p_payments: Json
          p_place_of_supply?: string
          p_user_id: string
        }
        Returns: Json
      }
      generate_sale_number: { Args: { p_business_id: string }; Returns: string }
      get_business_customers: {
        Args: {
          p_business_id: string
          p_customer_type?: string
          p_has_credit_balance?: boolean
          p_search_term?: string
          p_sort_by?: string
          p_sort_order?: string
        }
        Returns: {
          address: string
          available_credit: number
          business_id: string
          created_at: string
          credit_balance: number
          credit_limit: number
          customer_type: string
          email: string
          gstin: string
          id: string
          last_visit: string
          loyalty_points: number
          name: string
          notes: string
          phone: string
          total_purchases: number
          updated_at: string
        }[]
      }
      get_business_dashboard: {
        Args: { p_business_id: string; p_date?: string }
        Returns: Json
      }
      get_business_expenses: {
        Args: {
          p_approved_only?: boolean
          p_business_id: string
          p_category?: string
          p_end_date?: string
          p_payment_method?: string
          p_start_date?: string
          p_user_id?: string
        }
        Returns: {
          amount: number
          approved_at: string
          approved_by: string
          approver_name: string
          business_id: string
          category: string
          created_at: string
          date: string
          description: string
          id: string
          is_recurring: boolean
          notes: string
          payment_method: string
          receipt_url: string
          recurrence_interval: string
          user_id: string
          user_name: string
        }[]
      }
      get_business_items: {
        Args: {
          p_business_id: string
          p_category_id?: string
          p_is_active?: boolean
          p_low_stock_only?: boolean
          p_search_term?: string
        }
        Returns: {
          barcode: string
          business_id: string
          category_id: string
          category_name: string
          cess_rate: number
          cost: number
          created_at: string
          description: string
          expiry_date: string
          gst_rate: number
          hsn_code: string
          id: string
          image_url: string
          is_active: boolean
          is_low_stock: boolean
          max_stock: number
          min_stock: number
          name: string
          price: number
          profit_margin: number
          sku: string
          stock: number
          unit: string
          updated_at: string
        }[]
      }
      get_cash_flow_statement: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: Json
      }
      get_comparative_sales_report: {
        Args: {
          p_business_id: string
          p_current_end: string
          p_current_start: string
          p_previous_end: string
          p_previous_start: string
        }
        Returns: Json
      }
      get_customer_analytics: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: Json
      }
      get_customer_details: {
        Args: { p_business_id: string; p_customer_id: string }
        Returns: Json
      }
      get_customers_with_credit: {
        Args: { p_business_id: string }
        Returns: {
          available_credit: number
          credit_balance: number
          credit_limit: number
          days_overdue: number
          id: string
          last_purchase_date: string
          name: string
          phone: string
        }[]
      }
      get_daily_sales_report: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          avg_transaction_value: number
          card_sales: number
          cash_sales: number
          credit_sales: number
          sale_date: string
          total_items_sold: number
          total_sales: number
          transaction_count: number
          upi_sales: number
        }[]
      }
      get_dead_stock_report: {
        Args: { p_business_id: string; p_days_threshold?: number }
        Returns: {
          category: string
          cost: number
          current_stock: number
          days_since_last_sale: number
          item_id: string
          item_name: string
          last_sale_date: string
          price: number
          total_value: number
        }[]
      }
      get_expense_categories: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          avg_amount: number
          category: string
          expense_count: number
          last_expense_date: string
          total_amount: number
        }[]
      }
      get_expense_summary: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: Json
      }
      get_expiring_items: {
        Args: { p_business_id: string; p_days_threshold?: number }
        Returns: {
          barcode: string
          category_name: string
          days_until_expiry: number
          expiry_date: string
          id: string
          name: string
          sku: string
          stock: number
        }[]
      }
      get_gst_report: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: Json
      }
      get_hourly_sales_pattern: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          avg_transaction_value: number
          hour: number
          is_peak_hour: boolean
          total_sales: number
          transaction_count: number
        }[]
      }
      get_inventory_value: { Args: { p_business_id: string }; Returns: Json }
      get_item_by_code: {
        Args: { p_business_id: string; p_code: string }
        Returns: {
          barcode: string
          business_id: string
          category_id: string
          cess_rate: number
          cost: number
          created_at: string
          description: string
          expiry_date: string
          gst_rate: number
          hsn_code: string
          id: string
          image_url: string
          is_active: boolean
          max_stock: number
          min_stock: number
          name: string
          price: number
          sku: string
          stock: number
          unit: string
          updated_at: string
        }[]
      }
      get_low_stock_items: {
        Args: { p_business_id: string }
        Returns: {
          barcode: string
          category_name: string
          id: string
          min_stock: number
          name: string
          sku: string
          stock: number
          stock_percentage: number
        }[]
      }
      get_parked_sales: {
        Args: { p_business_id: string }
        Returns: {
          cashier_name: string
          created_at: string
          customer_id: string
          customer_name: string
          discount: number
          id: string
          items_count: number
          notes: string
          sale_number: string
          subtotal: number
          total: number
          user_id: string
        }[]
      }
      get_payment_summary: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          payment_method: Database["public"]["Enums"]["payment_method"]
          total_amount: number
          transaction_count: number
        }[]
      }
      get_profit_loss_statement: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: Json
      }
      get_recurring_expenses: {
        Args: { p_active_only?: boolean; p_business_id: string }
        Returns: {
          amount: number
          category: string
          description: string
          id: string
          last_occurrence_date: string
          next_occurrence_date: string
          payment_method: string
          recurrence_interval: string
          user_name: string
        }[]
      }
      get_sale_details: {
        Args: { p_business_id: string; p_sale_id: string }
        Returns: Json
      }
      get_sales_summary: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: Json
      }
      get_staff_expenses: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          approved_count: number
          avg_expense: number
          expense_count: number
          pending_count: number
          total_expenses: number
          user_id: string
          user_name: string
        }[]
      }
      get_top_customers: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_limit?: number
          p_start_date?: string
        }
        Returns: {
          average_purchase: number
          customer_id: string
          customer_name: string
          last_purchase_date: string
          phone: string
          purchase_count: number
          total_revenue: number
        }[]
      }
      get_top_expense_categories: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_limit?: number
          p_start_date?: string
        }
        Returns: {
          category: string
          expense_count: number
          percentage: number
          total_amount: number
        }[]
      }
      get_top_selling_items: {
        Args: {
          p_business_id: string
          p_end_date?: string
          p_limit?: number
          p_start_date?: string
        }
        Returns: {
          item_id: string
          item_name: string
          quantity_sold: number
          times_sold: number
          total_revenue: number
        }[]
      }
      park_sale: {
        Args: {
          p_business_id: string
          p_customer_id?: string
          p_discount?: number
          p_discount_type?: string
          p_items: Json
          p_notes?: string
          p_user_id: string
        }
        Returns: Json
      }
      record_credit_payment: {
        Args: {
          p_amount: number
          p_business_id: string
          p_customer_id: string
          p_notes?: string
          p_payment_method: string
          p_reference?: string
          p_user_id: string
        }
        Returns: Json
      }
      search_customers: {
        Args: { p_business_id: string; p_search_term: string }
        Returns: {
          credit_balance: number
          customer_type: string
          email: string
          id: string
          name: string
          phone: string
          total_purchases: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_loyalty_points: {
        Args: {
          p_business_id: string
          p_customer_id: string
          p_points_change: number
          p_reason: string
        }
        Returns: Json
      }
    }
    Enums: {
      payment_method: "CASH" | "CARD" | "UPI" | "WALLET"
      sale_status: "COMPLETED" | "PARKED" | "CANCELLED"
      stock_movement_type: "IN" | "OUT" | "ADJUSTMENT"
      user_role: "OWNER" | "MANAGER" | "STAFF" | "HELPER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_method: ["CASH", "CARD", "UPI", "WALLET"],
      sale_status: ["COMPLETED", "PARKED", "CANCELLED"],
      stock_movement_type: ["IN", "OUT", "ADJUSTMENT"],
      user_role: ["OWNER", "MANAGER", "STAFF", "HELPER"],
    },
  },
} as const
