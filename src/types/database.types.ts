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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_flags: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          ai_confidence: number | null
          ai_model: string | null
          ai_reasoning: string | null
          company_id: string
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          expires_at: string | null
          flag_type: string
          id: string
          recommendations: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string | null
          suggested_actions: Json | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          ai_confidence?: number | null
          ai_model?: string | null
          ai_reasoning?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string | null
          flag_type: string
          id?: string
          recommendations?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          suggested_actions?: Json | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          ai_confidence?: number | null
          ai_model?: string | null
          ai_reasoning?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          flag_type?: string
          id?: string
          recommendations?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          suggested_actions?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_flags_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_flags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_flags_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          actual_impact: Json | null
          company_id: string
          confidence_score: number | null
          created_at: string | null
          description: string | null
          estimated_impact: Json | null
          expires_at: string | null
          id: string
          implemented_at: string | null
          implemented_by: string | null
          recommendation_type: string
          status: string | null
          supporting_data: Json | null
          target_id: string | null
          target_type: string
          title: string
        }
        Insert: {
          actual_impact?: Json | null
          company_id: string
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          estimated_impact?: Json | null
          expires_at?: string | null
          id?: string
          implemented_at?: string | null
          implemented_by?: string | null
          recommendation_type: string
          status?: string | null
          supporting_data?: Json | null
          target_id?: string | null
          target_type: string
          title: string
        }
        Update: {
          actual_impact?: Json | null
          company_id?: string
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          estimated_impact?: Json | null
          expires_at?: string | null
          id?: string
          implemented_at?: string | null
          implemented_by?: string | null
          recommendation_type?: string
          status?: string | null
          supporting_data?: Json | null
          target_id?: string | null
          target_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendations_implemented_by_fkey"
            columns: ["implemented_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          rate_limit: number | null
          scopes: string[]
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          rate_limit?: number | null
          scopes?: string[]
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          rate_limit?: number | null
          scopes?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_status_events: {
        Row: {
          appointment_id: string
          changed_at: string | null
          changed_by: string | null
          id: string
          metadata: Json | null
          new_status: Database["public"]["Enums"]["appointment_status"]
          previous_status:
            | Database["public"]["Enums"]["appointment_status"]
            | null
          reason: string | null
        }
        Insert: {
          appointment_id: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          metadata?: Json | null
          new_status: Database["public"]["Enums"]["appointment_status"]
          previous_status?:
            | Database["public"]["Enums"]["appointment_status"]
            | null
          reason?: string | null
        }
        Update: {
          appointment_id?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["appointment_status"]
          previous_status?:
            | Database["public"]["Enums"]["appointment_status"]
            | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_status_events_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_status_events_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          actual_duration_minutes: number | null
          arrived_at: string | null
          assigned_at: string | null
          assigned_by: string | null
          checked_in_at: string | null
          checked_in_lat: number | null
          checked_in_lng: number | null
          checked_out_at: string | null
          checked_out_lat: number | null
          checked_out_lng: number | null
          company_id: string
          created_at: string | null
          customer_confirmed: boolean | null
          customer_confirmed_at: string | null
          en_route_at: string | null
          equipment_checklist: Json | null
          equipment_verified: boolean | null
          estimated_duration_minutes: number
          id: string
          last_rescheduled_at: string | null
          metadata: Json | null
          notes: string | null
          order_id: string
          original_date: string | null
          original_time: string | null
          photographer_confirmed: boolean | null
          photographer_confirmed_at: string | null
          photographer_id: string | null
          photographer_notes: string | null
          reschedule_count: number | null
          reschedule_reason: string | null
          rescheduled_by: string | null
          scheduled_date: string
          scheduled_end_time: string
          scheduled_start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          status_changed_at: string | null
          timezone: string
          travel_distance_miles: number | null
          travel_duration_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          arrived_at?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          checked_in_at?: string | null
          checked_in_lat?: number | null
          checked_in_lng?: number | null
          checked_out_at?: string | null
          checked_out_lat?: number | null
          checked_out_lng?: number | null
          company_id: string
          created_at?: string | null
          customer_confirmed?: boolean | null
          customer_confirmed_at?: string | null
          en_route_at?: string | null
          equipment_checklist?: Json | null
          equipment_verified?: boolean | null
          estimated_duration_minutes: number
          id?: string
          last_rescheduled_at?: string | null
          metadata?: Json | null
          notes?: string | null
          order_id: string
          original_date?: string | null
          original_time?: string | null
          photographer_confirmed?: boolean | null
          photographer_confirmed_at?: string | null
          photographer_id?: string | null
          photographer_notes?: string | null
          reschedule_count?: number | null
          reschedule_reason?: string | null
          rescheduled_by?: string | null
          scheduled_date: string
          scheduled_end_time: string
          scheduled_start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          status_changed_at?: string | null
          timezone: string
          travel_distance_miles?: number | null
          travel_duration_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_duration_minutes?: number | null
          arrived_at?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          checked_in_at?: string | null
          checked_in_lat?: number | null
          checked_in_lng?: number | null
          checked_out_at?: string | null
          checked_out_lat?: number | null
          checked_out_lng?: number | null
          company_id?: string
          created_at?: string | null
          customer_confirmed?: boolean | null
          customer_confirmed_at?: string | null
          en_route_at?: string | null
          equipment_checklist?: Json | null
          equipment_verified?: boolean | null
          estimated_duration_minutes?: number
          id?: string
          last_rescheduled_at?: string | null
          metadata?: Json | null
          notes?: string | null
          order_id?: string
          original_date?: string | null
          original_time?: string | null
          photographer_confirmed?: boolean | null
          photographer_confirmed_at?: string | null
          photographer_id?: string | null
          photographer_notes?: string | null
          reschedule_count?: number | null
          reschedule_reason?: string | null
          rescheduled_by?: string | null
          scheduled_date?: string
          scheduled_end_time?: string
          scheduled_start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          status_changed_at?: string | null
          timezone?: string
          travel_distance_miles?: number | null
          travel_duration_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "mv_photographer_performance"
            referencedColumns: ["photographer_id"]
          },
          {
            foreignKeyName: "appointments_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_rescheduled_by_fkey"
            columns: ["rescheduled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_type: string | null
          changes: Json | null
          company_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          request_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          action: string
          actor_type?: string | null
          changes?: Json | null
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          request_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          action?: string
          actor_type?: string | null
          changes?: Json | null
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          request_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_blocks: {
        Row: {
          availability_type: Database["public"]["Enums"]["availability_type"]
          company_id: string
          created_at: string | null
          end_time: string
          external_id: string | null
          id: string
          is_recurring: boolean | null
          market_id: string | null
          notes: string | null
          parent_block_id: string | null
          photographer_id: string | null
          recurrence_end: string | null
          recurrence_rule: string | null
          source: string | null
          start_time: string
          timezone: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability_type: Database["public"]["Enums"]["availability_type"]
          company_id: string
          created_at?: string | null
          end_time: string
          external_id?: string | null
          id?: string
          is_recurring?: boolean | null
          market_id?: string | null
          notes?: string | null
          parent_block_id?: string | null
          photographer_id?: string | null
          recurrence_end?: string | null
          recurrence_rule?: string | null
          source?: string | null
          start_time: string
          timezone: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability_type?: Database["public"]["Enums"]["availability_type"]
          company_id?: string
          created_at?: string | null
          end_time?: string
          external_id?: string | null
          id?: string
          is_recurring?: boolean | null
          market_id?: string | null
          notes?: string | null
          parent_block_id?: string | null
          photographer_id?: string | null
          recurrence_end?: string | null
          recurrence_rule?: string | null
          source?: string | null
          start_time?: string
          timezone?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_parent_block_id_fkey"
            columns: ["parent_block_id"]
            isOneToOne: false
            referencedRelation: "availability_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "mv_photographer_performance"
            referencedColumns: ["photographer_id"]
          },
          {
            foreignKeyName: "availability_blocks_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bonuses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          bonus_type: string
          company_id: string
          created_at: string | null
          criteria: Json | null
          description: string | null
          earned_date: string
          id: string
          name: string
          paid_at: string | null
          photographer_id: string | null
          photographer_invoice_id: string | null
          status: Database["public"]["Enums"]["payroll_status"] | null
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          bonus_type: string
          company_id: string
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          earned_date?: string
          id?: string
          name: string
          paid_at?: string | null
          photographer_id?: string | null
          photographer_invoice_id?: string | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          bonus_type?: string
          company_id?: string
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          earned_date?: string
          id?: string
          name?: string
          paid_at?: string | null
          photographer_id?: string | null
          photographer_invoice_id?: string | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonuses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonuses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonuses_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "mv_photographer_performance"
            referencedColumns: ["photographer_id"]
          },
          {
            foreignKeyName: "bonuses_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonuses_photographer_invoice_id_fkey"
            columns: ["photographer_invoice_id"]
            isOneToOne: false
            referencedRelation: "photographer_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonuses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_items: {
        Row: {
          bundle_id: string
          created_at: string | null
          id: string
          product_id: string
          quantity: number | null
        }
        Insert: {
          bundle_id: string
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number | null
        }
        Update: {
          bundle_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "product_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          commission_amount: number
          commission_rate: number | null
          commission_type: Database["public"]["Enums"]["commission_type"]
          company_id: string
          created_at: string | null
          customer_id: string | null
          earned_date: string
          id: string
          notes: string | null
          order_id: string | null
          order_total: number | null
          paid_at: string | null
          pay_period_end: string | null
          pay_period_start: string | null
          payment_reference: string | null
          photographer_invoice_id: string | null
          qualifying_amount: number | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["payroll_status"] | null
          user_id: string
        }
        Insert: {
          commission_amount: number
          commission_rate?: number | null
          commission_type: Database["public"]["Enums"]["commission_type"]
          company_id: string
          created_at?: string | null
          customer_id?: string | null
          earned_date?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          order_total?: number | null
          paid_at?: string | null
          pay_period_end?: string | null
          pay_period_start?: string | null
          payment_reference?: string | null
          photographer_invoice_id?: string | null
          qualifying_amount?: number | null
          role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["payroll_status"] | null
          user_id: string
        }
        Update: {
          commission_amount?: number
          commission_rate?: number | null
          commission_type?: Database["public"]["Enums"]["commission_type"]
          company_id?: string
          created_at?: string | null
          customer_id?: string | null
          earned_date?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          order_total?: number | null
          paid_at?: string | null
          pay_period_end?: string | null
          pay_period_start?: string | null
          payment_reference?: string | null
          photographer_invoice_id?: string | null
          qualifying_amount?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["payroll_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_photographer_invoice_id_fkey"
            columns: ["photographer_invoice_id"]
            isOneToOne: false
            referencedRelation: "photographer_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          billing_email: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          features: Json | null
          hubspot_portal_id: string | null
          id: string
          is_active: boolean | null
          legal_name: string | null
          logo_url: string | null
          name: string
          phone: string | null
          postal_code: string | null
          quickbooks_company_id: string | null
          quickbooks_realm_id: string | null
          settings: Json | null
          slug: string
          state: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tax_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          billing_email?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          features?: Json | null
          hubspot_portal_id?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          quickbooks_company_id?: string | null
          quickbooks_realm_id?: string | null
          settings?: Json | null
          slug: string
          state?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tax_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          billing_email?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          features?: Json | null
          hubspot_portal_id?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          quickbooks_company_id?: string | null
          quickbooks_realm_id?: string | null
          settings?: Json | null
          slug?: string
          state?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tax_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          customer_id: string
          discount_amount: number
          id: string
          order_id: string
          used_at: string | null
        }
        Insert: {
          coupon_id: string
          customer_id: string
          discount_amount: number
          id?: string
          order_id: string
          used_at?: string | null
        }
        Update: {
          coupon_id?: string
          customer_id?: string
          discount_amount?: number
          id?: string
          order_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_categories: string[] | null
          applicable_markets: string[] | null
          applicable_products: string[] | null
          campaign: string | null
          code: string
          company_id: string
          created_at: string | null
          current_uses: number | null
          customer_ids: string[] | null
          customer_type: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          max_uses: number | null
          max_uses_per_customer: number | null
          minimum_order_value: number | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_markets?: string[] | null
          applicable_products?: string[] | null
          campaign?: string | null
          code: string
          company_id: string
          created_at?: string | null
          current_uses?: number | null
          customer_ids?: string[] | null
          customer_type?: string | null
          description?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          max_uses_per_customer?: number | null
          minimum_order_value?: number | null
          name: string
          start_date?: string
          updated_at?: string | null
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_markets?: string[] | null
          applicable_products?: string[] | null
          campaign?: string | null
          code?: string
          company_id?: string
          created_at?: string | null
          current_uses?: number | null
          customer_ids?: string[] | null
          customer_type?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          max_uses_per_customer?: number | null
          minimum_order_value?: number | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          credit_id: string
          description: string | null
          id: string
          order_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          credit_id: string
          description?: string | null
          id?: string
          order_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          credit_id?: string
          description?: string | null
          id?: string
          order_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "customer_credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          created_at: string | null
          customer_id: string
          email: string | null
          first_name: string
          id: string
          is_primary: boolean | null
          last_name: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          email?: string | null
          first_name: string
          id?: string
          is_primary?: boolean | null
          last_name: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          email?: string | null
          first_name?: string
          id?: string
          is_primary?: boolean | null
          last_name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customer_credits: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          customer_id: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          remaining_amount: number
          source_id: string | null
          source_type: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          customer_id: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          remaining_amount: number
          source_id?: string | null
          source_type: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          customer_id?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          remaining_amount?: number
          source_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_credits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_credits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_credits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customer_invoice_items: {
        Row: {
          created_at: string | null
          description: string
          discount_amount: number | null
          id: string
          invoice_id: string
          order_id: string | null
          order_item_id: string | null
          quantity: number | null
          tax_amount: number | null
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_amount?: number | null
          id?: string
          invoice_id: string
          order_id?: string | null
          order_item_id?: string | null
          quantity?: number | null
          tax_amount?: number | null
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_amount?: number | null
          id?: string
          invoice_id?: string
          order_id?: string | null
          order_item_id?: string | null
          quantity?: number | null
          tax_amount?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "customer_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invoice_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invoice_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_invoices: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          company_id: string
          created_at: string | null
          customer_id: string
          discount_amount: number | null
          due_date: string
          id: string
          internal_notes: string | null
          invoice_date: string
          invoice_number: string
          last_reminder_at: string | null
          notes: string | null
          order_ids: string[]
          payment_terms: number | null
          pdf_url: string | null
          quickbooks_invoice_id: string | null
          quickbooks_sync_status: string | null
          quickbooks_synced_at: string | null
          reminder_count: number | null
          sent_at: string | null
          sent_to: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string | null
          subtotal: number
          tax_amount: number | null
          total: number
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          company_id: string
          created_at?: string | null
          customer_id: string
          discount_amount?: number | null
          due_date: string
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number: string
          last_reminder_at?: string | null
          notes?: string | null
          order_ids: string[]
          payment_terms?: number | null
          pdf_url?: string | null
          quickbooks_invoice_id?: string | null
          quickbooks_sync_status?: string | null
          quickbooks_synced_at?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          sent_to?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          subtotal: number
          tax_amount?: number | null
          total: number
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          company_id?: string
          created_at?: string | null
          customer_id?: string
          discount_amount?: number | null
          due_date?: string
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number?: string
          last_reminder_at?: string | null
          notes?: string | null
          order_ids?: string[]
          payment_terms?: number | null
          pdf_url?: string | null
          quickbooks_invoice_id?: string | null
          quickbooks_sync_status?: string | null
          quickbooks_synced_at?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          sent_to?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          total?: number
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          assigned_sales_rep_id: string | null
          average_order_value: number | null
          billing_email: string | null
          business_name: string | null
          business_type: string | null
          city: string | null
          company_id: string
          created_at: string | null
          credit_limit: number | null
          current_balance: number | null
          display_name: string | null
          email: string
          first_name: string
          hubspot_company_id: string | null
          hubspot_contact_id: string | null
          id: string
          is_active: boolean | null
          is_vip: boolean | null
          last_name: string
          license_number: string | null
          lifetime_orders: number | null
          lifetime_revenue: number | null
          notes: string | null
          payment_terms: number | null
          phone: string | null
          postal_code: string | null
          preferences: Json | null
          preferred_photographers: string[] | null
          primary_market_id: string | null
          referral_source: string | null
          referred_by_customer_id: string | null
          state: string | null
          stripe_customer_id: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          assigned_sales_rep_id?: string | null
          average_order_value?: number | null
          billing_email?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          company_id: string
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          display_name?: string | null
          email: string
          first_name: string
          hubspot_company_id?: string | null
          hubspot_contact_id?: string | null
          id?: string
          is_active?: boolean | null
          is_vip?: boolean | null
          last_name: string
          license_number?: string | null
          lifetime_orders?: number | null
          lifetime_revenue?: number | null
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          preferred_photographers?: string[] | null
          primary_market_id?: string | null
          referral_source?: string | null
          referred_by_customer_id?: string | null
          state?: string | null
          stripe_customer_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          assigned_sales_rep_id?: string | null
          average_order_value?: number | null
          billing_email?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          company_id?: string
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          display_name?: string | null
          email?: string
          first_name?: string
          hubspot_company_id?: string | null
          hubspot_contact_id?: string | null
          id?: string
          is_active?: boolean | null
          is_vip?: boolean | null
          last_name?: string
          license_number?: string | null
          lifetime_orders?: number | null
          lifetime_revenue?: number | null
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          preferred_photographers?: string[] | null
          primary_market_id?: string | null
          referral_source?: string | null
          referred_by_customer_id?: string | null
          state?: string | null
          stripe_customer_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_sales_rep_id_fkey"
            columns: ["assigned_sales_rep_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_primary_market_id_fkey"
            columns: ["primary_market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_referred_by_customer_id_fkey"
            columns: ["referred_by_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_referred_by_customer_id_fkey"
            columns: ["referred_by_customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          config: Json
          created_at: string | null
          dashboard_id: string
          height: number | null
          id: string
          is_active: boolean | null
          kpi_id: string | null
          name: string
          position_x: number | null
          position_y: number | null
          query: string | null
          refresh_interval_seconds: number | null
          widget_type: string
          width: number | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          dashboard_id: string
          height?: number | null
          id?: string
          is_active?: boolean | null
          kpi_id?: string | null
          name: string
          position_x?: number | null
          position_y?: number | null
          query?: string | null
          refresh_interval_seconds?: number | null
          widget_type: string
          width?: number | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          dashboard_id?: string
          height?: number | null
          id?: string
          is_active?: boolean | null
          kpi_id?: string | null
          name?: string
          position_x?: number | null
          position_y?: number | null
          query?: string | null
          refresh_interval_seconds?: number | null
          widget_type?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_widgets_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboards: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          layout: Json
          name: string
          roles: Database["public"]["Enums"]["user_role"][] | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          layout?: Json
          name: string
          roles?: Database["public"]["Enums"]["user_role"][] | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          layout?: Json
          name?: string
          roles?: Database["public"]["Enums"]["user_role"][] | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          delivered_count: number | null
          description: string | null
          expected_count: number | null
          id: string
          is_delivered: boolean | null
          media_type: Database["public"]["Enums"]["media_type"]
          minimum_count: number | null
          name: string
          order_id: string
          order_item_id: string | null
          qc_passed_at: string | null
          qc_required: boolean | null
          qc_status: Database["public"]["Enums"]["qc_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          delivered_count?: number | null
          description?: string | null
          expected_count?: number | null
          id?: string
          is_delivered?: boolean | null
          media_type: Database["public"]["Enums"]["media_type"]
          minimum_count?: number | null
          name: string
          order_id: string
          order_item_id?: string | null
          qc_passed_at?: string | null
          qc_required?: boolean | null
          qc_status?: Database["public"]["Enums"]["qc_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          delivered_count?: number | null
          description?: string | null
          expected_count?: number | null
          id?: string
          is_delivered?: boolean | null
          media_type?: Database["public"]["Enums"]["media_type"]
          minimum_count?: number | null
          name?: string
          order_id?: string
          order_item_id?: string | null
          qc_passed_at?: string | null
          qc_required?: boolean | null
          qc_status?: Database["public"]["Enums"]["qc_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      edit_requests: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          created_at: string | null
          description: string
          due_at: string | null
          id: string
          media_asset_id: string | null
          new_asset_id: string | null
          order_id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          request_type: string
          requested_at: string | null
          requested_by: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description: string
          due_at?: string | null
          id?: string
          media_asset_id?: string | null
          new_asset_id?: string | null
          order_id: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          request_type: string
          requested_at?: string | null
          requested_by: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          due_at?: string | null
          id?: string
          media_asset_id?: string | null
          new_asset_id?: string | null
          order_id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          request_type?: string
          requested_at?: string | null
          requested_by?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edit_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_requests_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_requests_new_asset_id_fkey"
            columns: ["new_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_requests_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          brand: string | null
          company_id: string
          condition: string | null
          created_at: string | null
          current_location: string | null
          current_value: number | null
          equipment_type: string
          id: string
          last_maintenance_date: string | null
          maintenance_notes: string | null
          market_id: string | null
          model: string | null
          name: string
          next_maintenance_date: string | null
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          specifications: Json | null
          status: Database["public"]["Enums"]["equipment_status"] | null
          updated_at: string | null
          useful_life_months: number | null
          vendor: string | null
          warranty_expires: string | null
          warranty_notes: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          brand?: string | null
          company_id: string
          condition?: string | null
          created_at?: string | null
          current_location?: string | null
          current_value?: number | null
          equipment_type: string
          id?: string
          last_maintenance_date?: string | null
          maintenance_notes?: string | null
          market_id?: string | null
          model?: string | null
          name: string
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["equipment_status"] | null
          updated_at?: string | null
          useful_life_months?: number | null
          vendor?: string | null
          warranty_expires?: string | null
          warranty_notes?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          brand?: string | null
          company_id?: string
          condition?: string | null
          created_at?: string | null
          current_location?: string | null
          current_value?: number | null
          equipment_type?: string
          id?: string
          last_maintenance_date?: string | null
          maintenance_notes?: string | null
          market_id?: string | null
          model?: string | null
          name?: string
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["equipment_status"] | null
          updated_at?: string | null
          useful_life_months?: number | null
          vendor?: string | null
          warranty_expires?: string | null
          warranty_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "mv_photographer_performance"
            referencedColumns: ["photographer_id"]
          },
          {
            foreignKeyName: "equipment_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          condition_at_assignment: string | null
          condition_at_return: string | null
          created_at: string | null
          equipment_id: string
          id: string
          notes: string | null
          photographer_id: string
          returned_at: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          condition_at_assignment?: string | null
          condition_at_return?: string | null
          created_at?: string | null
          equipment_id: string
          id?: string
          notes?: string | null
          photographer_id: string
          returned_at?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          condition_at_assignment?: string | null
          condition_at_return?: string | null
          created_at?: string | null
          equipment_id?: string
          id?: string
          notes?: string | null
          photographer_id?: string
          returned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "mv_photographer_performance"
            referencedColumns: ["photographer_id"]
          },
          {
            foreignKeyName: "equipment_assignments_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_maintenance: {
        Row: {
          cost: number | null
          created_at: string | null
          description: string | null
          equipment_id: string
          id: string
          maintenance_type: string
          notes: string | null
          performed_at: string | null
          performed_by: string | null
          vendor: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          description?: string | null
          equipment_id: string
          id?: string
          maintenance_type: string
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
          vendor?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          description?: string | null
          equipment_id?: string
          id?: string
          maintenance_type?: string
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_maintenance_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_maintenance_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          company_id: string
          created_at: string | null
          holiday_date: string
          id: string
          is_annual: boolean | null
          is_closed: boolean | null
          market_id: string | null
          modified_hours: Json | null
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          holiday_date: string
          id?: string
          is_annual?: boolean | null
          is_closed?: boolean | null
          market_id?: string | null
          modified_hours?: Json | null
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          holiday_date?: string
          id?: string
          is_annual?: boolean | null
          is_closed?: boolean | null
          market_id?: string | null
          modified_hours?: Json | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "holidays_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holidays_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          key: string
          result: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          key: string
          result?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          key?: string
          result?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      incentive_payouts: {
        Row: {
          created_at: string | null
          id: string
          incentive_program_id: string
          metric_value: number | null
          paid_at: string | null
          payout_amount: number
          period_end: string
          period_start: string
          photographer_id: string | null
          photographer_invoice_id: string | null
          status: Database["public"]["Enums"]["payroll_status"] | null
          threshold_met: boolean | null
          tier_achieved: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          incentive_program_id: string
          metric_value?: number | null
          paid_at?: string | null
          payout_amount: number
          period_end: string
          period_start: string
          photographer_id?: string | null
          photographer_invoice_id?: string | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
          threshold_met?: boolean | null
          tier_achieved?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          incentive_program_id?: string
          metric_value?: number | null
          paid_at?: string | null
          payout_amount?: number
          period_end?: string
          period_start?: string
          photographer_id?: string | null
          photographer_invoice_id?: string | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
          threshold_met?: boolean | null
          tier_achieved?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incentive_payouts_incentive_program_id_fkey"
            columns: ["incentive_program_id"]
            isOneToOne: false
            referencedRelation: "incentive_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentive_payouts_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "mv_photographer_performance"
            referencedColumns: ["photographer_id"]
          },
          {
            foreignKeyName: "incentive_payouts_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentive_payouts_photographer_invoice_id_fkey"
            columns: ["photographer_invoice_id"]
            isOneToOne: false
            referencedRelation: "photographer_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentive_payouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      incentive_programs: {
        Row: {
          budget: number | null
          company_id: string
          created_at: string | null
          criteria: Json
          description: string | null
          eligible_markets: string[] | null
          eligible_roles: Database["public"]["Enums"]["user_role"][] | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          program_type: string
          spent: number | null
          start_date: string
          tiers: Json | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          company_id: string
          created_at?: string | null
          criteria: Json
          description?: string | null
          eligible_markets?: string[] | null
          eligible_roles?: Database["public"]["Enums"]["user_role"][] | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          program_type: string
          spent?: number | null
          start_date: string
          tiers?: Json | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          company_id?: string
          created_at?: string | null
          criteria?: Json
          description?: string | null
          eligible_markets?: string[] | null
          eligible_roles?: Database["public"]["Enums"]["user_role"][] | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          program_type?: string
          spent?: number | null
          start_date?: string
          tiers?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incentive_programs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          processed_at: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          processed_at?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          processed_at?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "customer_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_definitions: {
        Row: {
          available_dimensions: string[] | null
          calculation_type: string
          category: string | null
          created_at: string | null
          description: string | null
          format: string | null
          formula: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          target_type: string | null
          unit: string | null
        }
        Insert: {
          available_dimensions?: string[] | null
          calculation_type: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          format?: string | null
          formula?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          target_type?: string | null
          unit?: string | null
        }
        Update: {
          available_dimensions?: string[] | null
          calculation_type?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          format?: string | null
          formula?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          target_type?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      kpi_snapshots: {
        Row: {
          company_id: string
          created_at: string | null
          dimension_id: string | null
          dimension_name: string | null
          dimension_type: string | null
          id: string
          kpi_id: string
          metadata: Json | null
          period_end: string
          period_start: string
          period_type: string
          sample_size: number | null
          value: number
        }
        Insert: {
          company_id: string
          created_at?: string | null
          dimension_id?: string | null
          dimension_name?: string | null
          dimension_type?: string | null
          id?: string
          kpi_id: string
          metadata?: Json | null
          period_end: string
          period_start: string
          period_type: string
          sample_size?: number | null
          value: number
        }
        Update: {
          company_id?: string
          created_at?: string | null
          dimension_id?: string | null
          dimension_name?: string | null
          dimension_type?: string | null
          id?: string
          kpi_id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          period_type?: string
          sample_size?: number | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_snapshots_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_snapshots_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      market_pricing: {
        Row: {
          created_at: string | null
          id: string
          is_available: boolean | null
          market_id: string
          multiplier: number | null
          price_override: number | null
          product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          market_id: string
          multiplier?: number | null
          price_override?: number | null
          product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          market_id?: string
          multiplier?: number | null
          price_override?: number | null
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_pricing_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_pricing_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "market_pricing_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          center_lat: number | null
          center_lng: number | null
          city: string
          code: string | null
          company_id: string
          country: string | null
          created_at: string | null
          fly_zones: Json | null
          id: string
          is_active: boolean | null
          max_booking_days_ahead: number | null
          min_lead_time_hours: number | null
          name: string
          operating_hours: Json | null
          pricing_multiplier: number | null
          radius_miles: number | null
          service_area_geojson: Json | null
          settings: Json | null
          slug: string
          state: string
          timezone: string
          updated_at: string | null
        }
        Insert: {
          center_lat?: number | null
          center_lng?: number | null
          city: string
          code?: string | null
          company_id: string
          country?: string | null
          created_at?: string | null
          fly_zones?: Json | null
          id?: string
          is_active?: boolean | null
          max_booking_days_ahead?: number | null
          min_lead_time_hours?: number | null
          name: string
          operating_hours?: Json | null
          pricing_multiplier?: number | null
          radius_miles?: number | null
          service_area_geojson?: Json | null
          settings?: Json | null
          slug: string
          state: string
          timezone: string
          updated_at?: string | null
        }
        Update: {
          center_lat?: number | null
          center_lng?: number | null
          city?: string
          code?: string | null
          company_id?: string
          country?: string | null
          created_at?: string | null
          fly_zones?: Json | null
          id?: string
          is_active?: boolean | null
          max_booking_days_ahead?: number | null
          min_lead_time_hours?: number | null
          name?: string
          operating_hours?: Json | null
          pricing_multiplier?: number | null
          radius_miles?: number | null
          service_area_geojson?: Json | null
          settings?: Json | null
          slug?: string
          state?: string
          timezone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "markets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          ai_analysis: Json | null
          ai_description: string | null
          ai_tags: string[] | null
          appointment_id: string | null
          company_id: string
          created_at: string | null
          deleted_at: string | null
          deliverable_id: string | null
          display_order: number | null
          duration_seconds: number | null
          edit_version: number | null
          edited_at: string | null
          edited_by: string | null
          exif_data: Json | null
          file_extension: string | null
          file_size_bytes: number | null
          filename: string
          height: number | null
          id: string
          is_cover: boolean | null
          is_deleted: boolean | null
          is_edited: boolean | null
          is_featured: boolean | null
          is_processed: boolean | null
          media_type: Database["public"]["Enums"]["media_type"]
          mime_type: string | null
          order_id: string | null
          original_asset_id: string | null
          original_filename: string | null
          preview_url: string | null
          processed_at: string | null
          public_url: string | null
          qc_issues: Json | null
          qc_notes: string | null
          qc_reviewed_at: string | null
          qc_reviewed_by: string | null
          qc_score: number | null
          qc_status: Database["public"]["Enums"]["qc_status"] | null
          room_type: string | null
          scene_type: string | null
          signed_url: string | null
          signed_url_expires_at: string | null
          storage_bucket: string
          storage_path: string
          thumbnail_url: string | null
          updated_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          ai_analysis?: Json | null
          ai_description?: string | null
          ai_tags?: string[] | null
          appointment_id?: string | null
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          deliverable_id?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          edit_version?: number | null
          edited_at?: string | null
          edited_by?: string | null
          exif_data?: Json | null
          file_extension?: string | null
          file_size_bytes?: number | null
          filename: string
          height?: number | null
          id?: string
          is_cover?: boolean | null
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_featured?: boolean | null
          is_processed?: boolean | null
          media_type: Database["public"]["Enums"]["media_type"]
          mime_type?: string | null
          order_id?: string | null
          original_asset_id?: string | null
          original_filename?: string | null
          preview_url?: string | null
          processed_at?: string | null
          public_url?: string | null
          qc_issues?: Json | null
          qc_notes?: string | null
          qc_reviewed_at?: string | null
          qc_reviewed_by?: string | null
          qc_score?: number | null
          qc_status?: Database["public"]["Enums"]["qc_status"] | null
          room_type?: string | null
          scene_type?: string | null
          signed_url?: string | null
          signed_url_expires_at?: string | null
          storage_bucket: string
          storage_path: string
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          ai_analysis?: Json | null
          ai_description?: string | null
          ai_tags?: string[] | null
          appointment_id?: string | null
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          deliverable_id?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          edit_version?: number | null
          edited_at?: string | null
          edited_by?: string | null
          exif_data?: Json | null
          file_extension?: string | null
          file_size_bytes?: number | null
          filename?: string
          height?: number | null
          id?: string
          is_cover?: boolean | null
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_featured?: boolean | null
          is_processed?: boolean | null
          media_type?: Database["public"]["Enums"]["media_type"]
          mime_type?: string | null
          order_id?: string | null
          original_asset_id?: string | null
          original_filename?: string | null
          preview_url?: string | null
          processed_at?: string | null
          public_url?: string | null
          qc_issues?: Json | null
          qc_notes?: string | null
          qc_reviewed_at?: string | null
          qc_reviewed_by?: string | null
          qc_score?: number | null
          qc_status?: Database["public"]["Enums"]["qc_status"] | null
          room_type?: string | null
          scene_type?: string | null
          signed_url?: string | null
          signed_url_expires_at?: string | null
          storage_bucket?: string
          storage_path?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_original_asset_id_fkey"
            columns: ["original_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_qc_reviewed_by_fkey"
            columns: ["qc_reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          body_html: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          subject: string | null
          trigger_event: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          body_html?: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          subject?: string | null
          trigger_event?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          body_html?: string | null
          channel?: Database["public"]["Enums"]["message_channel"]
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          subject?: string | null
          trigger_event?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          ai_context: Json | null
          appointment_id: string | null
          attachments: Json | null
          body: string
          body_html: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          company_id: string
          created_at: string | null
          delivered_at: string | null
          external_message_id: string | null
          failed_at: string | null
          failure_reason: string | null
          id: string
          is_ai_generated: boolean | null
          is_read: boolean | null
          order_id: string | null
          parent_message_id: string | null
          read_at: string | null
          recipient_customer_id: string | null
          recipient_id: string | null
          recipient_type: string
          sender_id: string | null
          sender_type: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          thread_id: string | null
        }
        Insert: {
          ai_context?: Json | null
          appointment_id?: string | null
          attachments?: Json | null
          body: string
          body_html?: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          company_id: string
          created_at?: string | null
          delivered_at?: string | null
          external_message_id?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_read?: boolean | null
          order_id?: string | null
          parent_message_id?: string | null
          read_at?: string | null
          recipient_customer_id?: string | null
          recipient_id?: string | null
          recipient_type: string
          sender_id?: string | null
          sender_type?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
        }
        Update: {
          ai_context?: Json | null
          appointment_id?: string | null
          attachments?: Json | null
          body?: string
          body_html?: string | null
          channel?: Database["public"]["Enums"]["message_channel"]
          company_id?: string
          created_at?: string | null
          delivered_at?: string | null
          external_message_id?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_read?: boolean | null
          order_id?: string | null
          parent_message_id?: string | null
          read_at?: string | null
          recipient_customer_id?: string | null
          recipient_id?: string | null
          recipient_type?: string
          sender_id?: string | null
          sender_type?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_customer_id_fkey"
            columns: ["recipient_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_customer_id_fkey"
            columns: ["recipient_customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mileage_logs: {
        Row: {
          appointment_id: string | null
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string | null
          distance_miles: number
          end_address: string
          end_lat: number | null
          end_lng: number | null
          gps_track: Json | null
          id: string
          log_date: string
          notes: string | null
          order_id: string | null
          photographer_id: string
          photographer_invoice_id: string | null
          rate_per_mile: number
          reimbursement_amount: number | null
          source: string | null
          start_address: string
          start_lat: number | null
          start_lng: number | null
          status: Database["public"]["Enums"]["payroll_status"] | null
        }
        Insert: {
          appointment_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string | null
          distance_miles: number
          end_address: string
          end_lat?: number | null
          end_lng?: number | null
          gps_track?: Json | null
          id?: string
          log_date?: string
          notes?: string | null
          order_id?: string | null
          photographer_id: string
          photographer_invoice_id?: string | null
          rate_per_mile: number
          reimbursement_amount?: number | null
          source?: string | null
          start_address: string
          start_lat?: number | null
          start_lng?: number | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
        }
        Update: {
          appointment_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string | null
          distance_miles?: number
          end_address?: string
          end_lat?: number | null
          end_lng?: number | null
          gps_track?: Json | null
          id?: string
          log_date?: string
          notes?: string | null
          order_id?: string | null
          photographer_id?: string
          photographer_invoice_id?: string | null
          rate_per_mile?: number
          reimbursement_amount?: number | null
          source?: string | null
          start_address?: string
          start_lat?: number | null
          start_lng?: number | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "mileage_logs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mileage_logs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mileage_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mileage_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mileage_logs_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "mv_photographer_performance"
            referencedColumns: ["photographer_id"]
          },
          {
            foreignKeyName: "mileage_logs_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mileage_logs_photographer_invoice_id_fkey"
            columns: ["photographer_invoice_id"]
            isOneToOne: false
            referencedRelation: "photographer_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          company_id: string
          content: string
          created_at: string | null
          created_by: string
          entity_id: string
          entity_type: string
          id: string
          is_ai_readable: boolean | null
          is_pinned: boolean | null
          is_private: boolean | null
          mentioned_user_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string | null
          created_by: string
          entity_id: string
          entity_type: string
          id?: string
          is_ai_readable?: boolean | null
          is_pinned?: boolean | null
          is_private?: boolean | null
          mentioned_user_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string | null
          created_by?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_ai_readable?: boolean | null
          is_pinned?: boolean | null
          is_private?: boolean | null
          mentioned_user_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          bundle_id: string | null
          completed_at: string | null
          created_at: string | null
          discount_amount: number | null
          estimated_duration_minutes: number | null
          id: string
          is_completed: boolean | null
          metadata: Json | null
          order_id: string
          photographer_payout: number | null
          product_description: string | null
          product_id: string | null
          product_name: string
          quantity: number
          required_skills: string[] | null
          total_price: number
          turnaround_hours: number | null
          unit_price: number
        }
        Insert: {
          bundle_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          discount_amount?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          order_id: string
          photographer_payout?: number | null
          product_description?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          required_skills?: string[] | null
          total_price: number
          turnaround_hours?: number | null
          unit_price: number
        }
        Update: {
          bundle_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          discount_amount?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          order_id?: string
          photographer_payout?: number | null
          product_description?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          required_skills?: string[] | null
          total_price?: number
          turnaround_hours?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "product_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_events: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          metadata: Json | null
          new_status: Database["public"]["Enums"]["order_status"]
          notification_sent: boolean | null
          notification_sent_at: string | null
          order_id: string
          previous_status: Database["public"]["Enums"]["order_status"] | null
          reason: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          metadata?: Json | null
          new_status: Database["public"]["Enums"]["order_status"]
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          order_id: string
          previous_status?: Database["public"]["Enums"]["order_status"] | null
          reason?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["order_status"]
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          order_id?: string
          previous_status?: Database["public"]["Enums"]["order_status"] | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_events_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_at: string | null
          cancellation_fee: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          commission_rate: number | null
          company_id: string
          coupon_id: string | null
          created_at: string | null
          created_by: string | null
          customer_contact_id: string | null
          customer_id: string
          customer_notes: string | null
          delivery_password: string | null
          delivery_url: string | null
          discount_amount: number | null
          discount_code: string | null
          expected_delivery_at: string | null
          id: string
          internal_notes: string | null
          is_flexible_time: boolean | null
          is_rush: boolean | null
          market_id: string
          metadata: Json | null
          order_number: string
          paid_at: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          preferred_date: string | null
          preferred_time_end: string | null
          preferred_time_start: string | null
          property_id: string
          referral_id: string | null
          rush_fee: number | null
          rush_fee_amount: number | null
          sales_rep_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["order_status"]
          status_changed_at: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total: number
          travel_fee: number | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          actual_delivery_at?: string | null
          cancellation_fee?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          commission_rate?: number | null
          company_id: string
          coupon_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_contact_id?: string | null
          customer_id: string
          customer_notes?: string | null
          delivery_password?: string | null
          delivery_url?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          expected_delivery_at?: string | null
          id?: string
          internal_notes?: string | null
          is_flexible_time?: boolean | null
          is_rush?: boolean | null
          market_id: string
          metadata?: Json | null
          order_number: string
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          preferred_date?: string | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          property_id: string
          referral_id?: string | null
          rush_fee?: number | null
          rush_fee_amount?: number | null
          sales_rep_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          status_changed_at?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          travel_fee?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          actual_delivery_at?: string | null
          cancellation_fee?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          commission_rate?: number | null
          company_id?: string
          coupon_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_contact_id?: string | null
          customer_id?: string
          customer_notes?: string | null
          delivery_password?: string | null
          delivery_url?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          expected_delivery_at?: string | null
          id?: string
          internal_notes?: string | null
          is_flexible_time?: boolean | null
          is_rush?: boolean | null
          market_id?: string
          metadata?: Json | null
          order_number?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          preferred_date?: string | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          property_id?: string
          referral_id?: string | null
          rush_fee?: number | null
          rush_fee_amount?: number | null
          sales_rep_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          status_changed_at?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          travel_fee?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_contact_id_fkey"
            columns: ["customer_contact_id"]
            isOneToOne: false
            referencedRelation: "customer_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "orders_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_sales_rep_id_fkey"
            columns: ["sales_rep_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      photographer_invoice_items: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          item_type: string
          order_id: string | null
          quantity: number | null
          rate: number | null
          service_date: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          item_type: string
          order_id?: string | null
          quantity?: number | null
          rate?: number | null
          service_date?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          item_type?: string
          order_id?: string | null
          quantity?: number | null
          rate?: number | null
          service_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photographer_invoice_items_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photographer_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "photographer_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photographer_invoice_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      photographer_invoices: {
        Row: {
          adjustment_amount: number | null
          approved_at: string | null
          approved_by: string | null
          bonus_earnings: number | null
          company_id: string
          created_at: string | null
          deductions: number | null
          gross_total: number
          id: string
          incentive_earnings: number | null
          invoice_number: string
          job_earnings: number | null
          mileage_earnings: number | null
          net_total: number
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          pdf_url: string | null
          period_end: string
          period_start: string
          photographer_id: string
          quickbooks_bill_id: string | null
          quickbooks_payment_id: string | null
          quickbooks_sync_status: string | null
          quickbooks_synced_at: string | null
          status: Database["public"]["Enums"]["payroll_status"]
          updated_at: string | null
        }
        Insert: {
          adjustment_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          bonus_earnings?: number | null
          company_id: string
          created_at?: string | null
          deductions?: number | null
          gross_total: number
          id?: string
          incentive_earnings?: number | null
          invoice_number: string
          job_earnings?: number | null
          mileage_earnings?: number | null
          net_total: number
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          period_end: string
          period_start: string
          photographer_id: string
          quickbooks_bill_id?: string | null
          quickbooks_payment_id?: string | null
          quickbooks_sync_status?: string | null
          quickbooks_synced_at?: string | null
          status?: Database["public"]["Enums"]["payroll_status"]
          updated_at?: string | null
        }
        Update: {
          adjustment_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          bonus_earnings?: number | null
          company_id?: string
          created_at?: string | null
          deductions?: number | null
          gross_total?: number
          id?: string
          incentive_earnings?: number | null
          invoice_number?: string
          job_earnings?: number | null
          mileage_earnings?: number | null
          net_total?: number
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          photographer_id?: string
          quickbooks_bill_id?: string | null
          quickbooks_payment_id?: string | null
          quickbooks_sync_status?: string | null
          quickbooks_synced_at?: string | null
          status?: Database["public"]["Enums"]["payroll_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photographer_invoices_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photographer_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photographer_invoices_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "mv_photographer_performance"
            referencedColumns: ["photographer_id"]
          },
          {
            foreignKeyName: "photographer_invoices_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      photographer_markets: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          market_id: string
          photographer_id: string
          priority: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          market_id: string
          photographer_id: string
          priority?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          market_id?: string
          photographer_id?: string
          priority?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photographer_markets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photographer_markets_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "mv_photographer_performance"
            referencedColumns: ["photographer_id"]
          },
          {
            foreignKeyName: "photographer_markets_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      photographers: {
        Row: {
          average_rating: number | null
          bank_account_last4: string | null
          bio: string | null
          certifications: Json | null
          company_id: string
          created_at: string | null
          equipment_notes: string | null
          has_own_equipment: boolean | null
          home_address_line1: string | null
          home_address_line2: string | null
          home_city: string | null
          home_lat: number | null
          home_lng: number | null
          home_postal_code: string | null
          home_state: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          max_daily_jobs: number | null
          mileage_rate: number | null
          notes: string | null
          on_time_percentage: number | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          payment_method: string | null
          per_job_base_rate: number | null
          portfolio_url: string | null
          preferred_job_types: string[] | null
          primary_market_id: string | null
          profile_photo_url: string | null
          qc_pass_rate: number | null
          quickbooks_vendor_id: string | null
          service_radius_miles: number | null
          skills: string[] | null
          tax_id_last4: string | null
          tax_id_type: string | null
          total_jobs_completed: number | null
          total_ratings: number | null
          updated_at: string | null
          user_id: string
          w9_on_file: boolean | null
        }
        Insert: {
          average_rating?: number | null
          bank_account_last4?: string | null
          bio?: string | null
          certifications?: Json | null
          company_id: string
          created_at?: string | null
          equipment_notes?: string | null
          has_own_equipment?: boolean | null
          home_address_line1?: string | null
          home_address_line2?: string | null
          home_city?: string | null
          home_lat?: number | null
          home_lng?: number | null
          home_postal_code?: string | null
          home_state?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          max_daily_jobs?: number | null
          mileage_rate?: number | null
          notes?: string | null
          on_time_percentage?: number | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          payment_method?: string | null
          per_job_base_rate?: number | null
          portfolio_url?: string | null
          preferred_job_types?: string[] | null
          primary_market_id?: string | null
          profile_photo_url?: string | null
          qc_pass_rate?: number | null
          quickbooks_vendor_id?: string | null
          service_radius_miles?: number | null
          skills?: string[] | null
          tax_id_last4?: string | null
          tax_id_type?: string | null
          total_jobs_completed?: number | null
          total_ratings?: number | null
          updated_at?: string | null
          user_id: string
          w9_on_file?: boolean | null
        }
        Update: {
          average_rating?: number | null
          bank_account_last4?: string | null
          bio?: string | null
          certifications?: Json | null
          company_id?: string
          created_at?: string | null
          equipment_notes?: string | null
          has_own_equipment?: boolean | null
          home_address_line1?: string | null
          home_address_line2?: string | null
          home_city?: string | null
          home_lat?: number | null
          home_lng?: number | null
          home_postal_code?: string | null
          home_state?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          max_daily_jobs?: number | null
          mileage_rate?: number | null
          notes?: string | null
          on_time_percentage?: number | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          payment_method?: string | null
          per_job_base_rate?: number | null
          portfolio_url?: string | null
          preferred_job_types?: string[] | null
          primary_market_id?: string | null
          profile_photo_url?: string | null
          qc_pass_rate?: number | null
          quickbooks_vendor_id?: string | null
          service_radius_miles?: number | null
          skills?: string[] | null
          tax_id_last4?: string | null
          tax_id_type?: string | null
          total_jobs_completed?: number | null
          total_ratings?: number | null
          updated_at?: string | null
          user_id?: string
          w9_on_file?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "photographers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photographers_primary_market_id_fkey"
            columns: ["primary_market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photographers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_bundles: {
        Row: {
          bundle_price: number
          company_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          original_price: number
          savings_amount: number | null
          savings_percentage: number | null
          slug: string
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          bundle_price: number
          company_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          original_price: number
          savings_amount?: number | null
          savings_percentage?: number | null
          slug: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          bundle_price?: number
          company_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          original_price?: number
          savings_amount?: number | null
          savings_percentage?: number | null
          slug?: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_bundles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          addon_product_ids: string[] | null
          available_markets: string[] | null
          base_price: number
          category_id: string | null
          company_id: string
          cost: number | null
          created_at: string | null
          deliverable_count: number | null
          deliverable_types: Database["public"]["Enums"]["media_type"][] | null
          description: string | null
          display_order: number | null
          estimated_duration_minutes: number | null
          gallery_urls: string[] | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          lead_time_hours: number | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          name: string
          pricing_tiers: Json | null
          pricing_type: string | null
          required_equipment: string[] | null
          required_skills: string[] | null
          setup_time_minutes: number | null
          short_description: string | null
          slug: string
          thumbnail_url: string | null
          turnaround_hours: number | null
          updated_at: string | null
          upsell_product_ids: string[] | null
        }
        Insert: {
          addon_product_ids?: string[] | null
          available_markets?: string[] | null
          base_price: number
          category_id?: string | null
          company_id: string
          cost?: number | null
          created_at?: string | null
          deliverable_count?: number | null
          deliverable_types?: Database["public"]["Enums"]["media_type"][] | null
          description?: string | null
          display_order?: number | null
          estimated_duration_minutes?: number | null
          gallery_urls?: string[] | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          lead_time_hours?: number | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          name: string
          pricing_tiers?: Json | null
          pricing_type?: string | null
          required_equipment?: string[] | null
          required_skills?: string[] | null
          setup_time_minutes?: number | null
          short_description?: string | null
          slug: string
          thumbnail_url?: string | null
          turnaround_hours?: number | null
          updated_at?: string | null
          upsell_product_ids?: string[] | null
        }
        Update: {
          addon_product_ids?: string[] | null
          available_markets?: string[] | null
          base_price?: number
          category_id?: string | null
          company_id?: string
          cost?: number | null
          created_at?: string | null
          deliverable_count?: number | null
          deliverable_types?: Database["public"]["Enums"]["media_type"][] | null
          description?: string | null
          display_order?: number | null
          estimated_duration_minutes?: number | null
          gallery_urls?: string[] | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          lead_time_hours?: number | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          name?: string
          pricing_tiers?: Json | null
          pricing_type?: string | null
          required_equipment?: string[] | null
          required_skills?: string[] | null
          setup_time_minutes?: number | null
          short_description?: string | null
          slug?: string
          thumbnail_url?: string | null
          turnaround_hours?: number | null
          updated_at?: string | null
          upsell_product_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          access_instructions: string | null
          address_line1: string
          address_line2: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          community_name: string | null
          company_id: string
          country: string | null
          created_at: string | null
          customer_id: string | null
          fly_zone_type: string | null
          formatted_address: string | null
          gate_code: string | null
          has_pets: boolean | null
          hoa_contact: string | null
          id: string
          in_fly_zone: boolean | null
          lat: number | null
          listing_price: number | null
          lng: number | null
          lockbox_code: string | null
          lot_size_sqft: number | null
          market_id: string | null
          metadata: Json | null
          mls_number: string | null
          pet_instructions: string | null
          place_id: string | null
          postal_code: string
          property_type: string | null
          requires_hoa_approval: boolean | null
          square_feet: number | null
          state: string
          updated_at: string | null
          year_built: number | null
        }
        Insert: {
          access_instructions?: string | null
          address_line1: string
          address_line2?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          community_name?: string | null
          company_id: string
          country?: string | null
          created_at?: string | null
          customer_id?: string | null
          fly_zone_type?: string | null
          formatted_address?: string | null
          gate_code?: string | null
          has_pets?: boolean | null
          hoa_contact?: string | null
          id?: string
          in_fly_zone?: boolean | null
          lat?: number | null
          listing_price?: number | null
          lng?: number | null
          lockbox_code?: string | null
          lot_size_sqft?: number | null
          market_id?: string | null
          metadata?: Json | null
          mls_number?: string | null
          pet_instructions?: string | null
          place_id?: string | null
          postal_code: string
          property_type?: string | null
          requires_hoa_approval?: boolean | null
          square_feet?: number | null
          state: string
          updated_at?: string | null
          year_built?: number | null
        }
        Update: {
          access_instructions?: string | null
          address_line1?: string
          address_line2?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          community_name?: string | null
          company_id?: string
          country?: string | null
          created_at?: string | null
          customer_id?: string | null
          fly_zone_type?: string | null
          formatted_address?: string | null
          gate_code?: string | null
          has_pets?: boolean | null
          hoa_contact?: string | null
          id?: string
          in_fly_zone?: boolean | null
          lat?: number | null
          listing_price?: number | null
          lng?: number | null
          lockbox_code?: string | null
          lot_size_sqft?: number | null
          market_id?: string | null
          metadata?: Json | null
          mls_number?: string | null
          pet_instructions?: string | null
          place_id?: string | null
          postal_code?: string
          property_type?: string | null
          requires_hoa_approval?: boolean | null
          square_feet?: number | null
          state?: string
          updated_at?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "properties_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_issues: {
        Row: {
          ai_confidence: number | null
          ai_detected: boolean | null
          annotated_image_url: string | null
          created_at: string | null
          description: string
          id: string
          is_resolved: boolean | null
          issue_type: string
          location_x: number | null
          location_y: number | null
          media_asset_id: string
          qc_result_id: string
          region_data: Json | null
          resolution_method: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_detected?: boolean | null
          annotated_image_url?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_resolved?: boolean | null
          issue_type: string
          location_x?: number | null
          location_y?: number | null
          media_asset_id: string
          qc_result_id: string
          region_data?: Json | null
          resolution_method?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
        }
        Update: {
          ai_confidence?: number | null
          ai_detected?: boolean | null
          annotated_image_url?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_resolved?: boolean | null
          issue_type?: string
          location_x?: number | null
          location_y?: number | null
          media_asset_id?: string
          qc_result_id?: string
          region_data?: Json | null
          resolution_method?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "qc_issues_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_issues_qc_result_id_fkey"
            columns: ["qc_result_id"]
            isOneToOne: false
            referencedRelation: "qc_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_jobs: {
        Row: {
          ai_model_version: string | null
          ai_processed: boolean | null
          ai_processed_at: string | null
          assigned_to: string | null
          company_id: string
          completed_at: string | null
          created_at: string | null
          failed_assets: number | null
          id: string
          job_type: string | null
          order_id: string
          overall_score: number | null
          override_approved: boolean | null
          override_at: string | null
          override_by: string | null
          override_reason: string | null
          passed_assets: number | null
          recommendations: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["qc_status"]
          summary: Json | null
          total_assets: number | null
          updated_at: string | null
          upload_job_id: string | null
          warning_assets: number | null
        }
        Insert: {
          ai_model_version?: string | null
          ai_processed?: boolean | null
          ai_processed_at?: string | null
          assigned_to?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          failed_assets?: number | null
          id?: string
          job_type?: string | null
          order_id: string
          overall_score?: number | null
          override_approved?: boolean | null
          override_at?: string | null
          override_by?: string | null
          override_reason?: string | null
          passed_assets?: number | null
          recommendations?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["qc_status"]
          summary?: Json | null
          total_assets?: number | null
          updated_at?: string | null
          upload_job_id?: string | null
          warning_assets?: number | null
        }
        Update: {
          ai_model_version?: string | null
          ai_processed?: boolean | null
          ai_processed_at?: string | null
          assigned_to?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          failed_assets?: number | null
          id?: string
          job_type?: string | null
          order_id?: string
          overall_score?: number | null
          override_approved?: boolean | null
          override_at?: string | null
          override_by?: string | null
          override_reason?: string | null
          passed_assets?: number | null
          recommendations?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["qc_status"]
          summary?: Json | null
          total_assets?: number | null
          updated_at?: string | null
          upload_job_id?: string | null
          warning_assets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qc_jobs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_jobs_override_by_fkey"
            columns: ["override_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_jobs_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_jobs_upload_job_id_fkey"
            columns: ["upload_job_id"]
            isOneToOne: false
            referencedRelation: "upload_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_results: {
        Row: {
          ai_analysis: Json | null
          ai_confidence: number | null
          audio_score: number | null
          color_accuracy_score: number | null
          compliance_score: number | null
          composition_score: number | null
          created_at: string | null
          exposure_score: number | null
          framing_score: number | null
          id: string
          media_asset_id: string
          noise_score: number | null
          overall_score: number | null
          processed_at: string | null
          processing_time_ms: number | null
          qc_job_id: string
          sharpness_score: number | null
          stability_score: number | null
          status: Database["public"]["Enums"]["qc_status"]
          transition_score: number | null
          white_balance_score: number | null
        }
        Insert: {
          ai_analysis?: Json | null
          ai_confidence?: number | null
          audio_score?: number | null
          color_accuracy_score?: number | null
          compliance_score?: number | null
          composition_score?: number | null
          created_at?: string | null
          exposure_score?: number | null
          framing_score?: number | null
          id?: string
          media_asset_id: string
          noise_score?: number | null
          overall_score?: number | null
          processed_at?: string | null
          processing_time_ms?: number | null
          qc_job_id: string
          sharpness_score?: number | null
          stability_score?: number | null
          status?: Database["public"]["Enums"]["qc_status"]
          transition_score?: number | null
          white_balance_score?: number | null
        }
        Update: {
          ai_analysis?: Json | null
          ai_confidence?: number | null
          audio_score?: number | null
          color_accuracy_score?: number | null
          compliance_score?: number | null
          composition_score?: number | null
          created_at?: string | null
          exposure_score?: number | null
          framing_score?: number | null
          id?: string
          media_asset_id?: string
          noise_score?: number | null
          overall_score?: number | null
          processed_at?: string | null
          processing_time_ms?: number | null
          qc_job_id?: string
          sharpness_score?: number | null
          stability_score?: number | null
          status?: Database["public"]["Enums"]["qc_status"]
          transition_score?: number | null
          white_balance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qc_results_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_results_qc_job_id_fkey"
            columns: ["qc_job_id"]
            isOneToOne: false
            referencedRelation: "qc_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_rules: {
        Row: {
          auto_flag: boolean | null
          company_id: string
          conditions: Json
          created_at: string | null
          description: string | null
          fail_on_violation: boolean | null
          id: string
          is_active: boolean | null
          media_types: Database["public"]["Enums"]["media_type"][] | null
          name: string
          notify_photographer: boolean | null
          priority: number | null
          rule_type: string
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          auto_flag?: boolean | null
          company_id: string
          conditions: Json
          created_at?: string | null
          description?: string | null
          fail_on_violation?: boolean | null
          id?: string
          is_active?: boolean | null
          media_types?: Database["public"]["Enums"]["media_type"][] | null
          name: string
          notify_photographer?: boolean | null
          priority?: number | null
          rule_type: string
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_flag?: boolean | null
          company_id?: string
          conditions?: Json
          created_at?: string | null
          description?: string | null
          fail_on_violation?: boolean | null
          id?: string
          is_active?: boolean | null
          media_types?: Database["public"]["Enums"]["media_type"][] | null
          name?: string
          notify_photographer?: boolean | null
          priority?: number | null
          rule_type?: string
          severity?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qc_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_scores: {
        Row: {
          average_score: number | null
          avg_color_score: number | null
          avg_composition_score: number | null
          avg_exposure_score: number | null
          avg_sharpness_score: number | null
          company_id: string
          created_at: string | null
          editor_id: string | null
          failed_assets: number | null
          id: string
          issue_counts: Json | null
          market_id: string | null
          pass_rate: number | null
          passed_assets: number | null
          period_end: string
          period_start: string
          period_type: string
          photographer_id: string | null
          score_trend: number | null
          total_assets: number | null
          warning_assets: number | null
        }
        Insert: {
          average_score?: number | null
          avg_color_score?: number | null
          avg_composition_score?: number | null
          avg_exposure_score?: number | null
          avg_sharpness_score?: number | null
          company_id: string
          created_at?: string | null
          editor_id?: string | null
          failed_assets?: number | null
          id?: string
          issue_counts?: Json | null
          market_id?: string | null
          pass_rate?: number | null
          passed_assets?: number | null
          period_end: string
          period_start: string
          period_type: string
          photographer_id?: string | null
          score_trend?: number | null
          total_assets?: number | null
          warning_assets?: number | null
        }
        Update: {
          average_score?: number | null
          avg_color_score?: number | null
          avg_composition_score?: number | null
          avg_exposure_score?: number | null
          avg_sharpness_score?: number | null
          company_id?: string
          created_at?: string | null
          editor_id?: string | null
          failed_assets?: number | null
          id?: string
          issue_counts?: Json | null
          market_id?: string | null
          pass_rate?: number | null
          passed_assets?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          photographer_id?: string | null
          score_trend?: number | null
          total_assets?: number | null
          warning_assets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qc_scores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_scores_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_scores_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_scores_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "mv_photographer_performance"
            referencedColumns: ["photographer_id"]
          },
          {
            foreignKeyName: "qc_scores_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          company_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          qualification_order_id: string | null
          qualified_at: string | null
          referral_code: string
          referred_customer_id: string | null
          referred_email: string | null
          referred_name: string | null
          referred_phone: string | null
          referred_reward_amount: number | null
          referred_reward_applied: boolean | null
          referred_reward_type: string | null
          referrer_customer_id: string | null
          referrer_reward_amount: number | null
          referrer_reward_paid: boolean | null
          referrer_reward_paid_at: string | null
          referrer_reward_type: string | null
          referrer_type: string
          referrer_user_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["referral_status"] | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          qualification_order_id?: string | null
          qualified_at?: string | null
          referral_code: string
          referred_customer_id?: string | null
          referred_email?: string | null
          referred_name?: string | null
          referred_phone?: string | null
          referred_reward_amount?: number | null
          referred_reward_applied?: boolean | null
          referred_reward_type?: string | null
          referrer_customer_id?: string | null
          referrer_reward_amount?: number | null
          referrer_reward_paid?: boolean | null
          referrer_reward_paid_at?: string | null
          referrer_reward_type?: string | null
          referrer_type: string
          referrer_user_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["referral_status"] | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          qualification_order_id?: string | null
          qualified_at?: string | null
          referral_code?: string
          referred_customer_id?: string | null
          referred_email?: string | null
          referred_name?: string | null
          referred_phone?: string | null
          referred_reward_amount?: number | null
          referred_reward_applied?: boolean | null
          referred_reward_type?: string | null
          referrer_customer_id?: string | null
          referrer_reward_amount?: number | null
          referrer_reward_paid?: boolean | null
          referrer_reward_paid_at?: string | null
          referrer_reward_type?: string | null
          referrer_type?: string
          referrer_user_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["referral_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_qualification_order_id_fkey"
            columns: ["qualification_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_customer_id_fkey"
            columns: ["referred_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_customer_id_fkey"
            columns: ["referred_customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "referrals_referrer_customer_id_fkey"
            columns: ["referrer_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_customer_id_fkey"
            columns: ["referrer_customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          communication_rating: number | null
          company_id: string
          content: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_public: boolean | null
          is_verified: boolean | null
          moderation_notes: string | null
          order_id: string | null
          overall_rating: number
          photographer_id: string | null
          professionalism_rating: number | null
          punctuality_rating: number | null
          quality_rating: number | null
          response: string | null
          response_at: string | null
          response_by: string | null
          review_type: string
          reviewer_customer_id: string | null
          reviewer_name: string | null
          source: string | null
          title: string | null
          updated_at: string | null
          value_rating: number | null
        }
        Insert: {
          communication_rating?: number | null
          company_id: string
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          moderation_notes?: string | null
          order_id?: string | null
          overall_rating: number
          photographer_id?: string | null
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          quality_rating?: number | null
          response?: string | null
          response_at?: string | null
          response_by?: string | null
          review_type: string
          reviewer_customer_id?: string | null
          reviewer_name?: string | null
          source?: string | null
          title?: string | null
          updated_at?: string | null
          value_rating?: number | null
        }
        Update: {
          communication_rating?: number | null
          company_id?: string
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          moderation_notes?: string | null
          order_id?: string | null
          overall_rating?: number
          photographer_id?: string | null
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          quality_rating?: number | null
          response?: string | null
          response_at?: string | null
          response_by?: string | null
          review_type?: string
          reviewer_customer_id?: string | null
          reviewer_name?: string | null
          source?: string | null
          title?: string | null
          updated_at?: string | null
          value_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "mv_photographer_performance"
            referencedColumns: ["photographer_id"]
          },
          {
            foreignKeyName: "reviews_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_response_by_fkey"
            columns: ["response_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_customer_id_fkey"
            columns: ["reviewer_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_customer_id_fkey"
            columns: ["reviewer_customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          appointment_id: string | null
          assigned_by: string | null
          assigned_to: string | null
          company_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          due_at: string | null
          id: string
          order_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          reminder_at: string | null
          reminder_sent: boolean | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          order_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          reminder_at?: string | null
          reminder_sent?: boolean | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          order_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          reminder_at?: string | null
          reminder_sent?: boolean | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_ltv"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          appointment_id: string | null
          approved_at: string | null
          approved_by: string | null
          clock_in: string
          clock_in_lat: number | null
          clock_in_lng: number | null
          clock_out: string | null
          clock_out_lat: number | null
          clock_out_lng: number | null
          company_id: string
          created_at: string | null
          duration_minutes: number | null
          entry_type: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["payroll_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          clock_in: string
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_out?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          company_id: string
          created_at?: string | null
          duration_minutes?: number | null
          entry_type?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          clock_in?: string
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_out?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          company_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          entry_type?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_jobs: {
        Row: {
          appointment_id: string | null
          company_id: string
          completed_at: string | null
          created_at: string | null
          errors: Json | null
          failed_files: number | null
          id: string
          order_id: string
          processed_files: number | null
          started_at: string | null
          status: string | null
          total_files: number | null
          updated_at: string | null
          upload_source: string | null
          uploaded_by: string
        }
        Insert: {
          appointment_id?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          errors?: Json | null
          failed_files?: number | null
          id?: string
          order_id: string
          processed_files?: number | null
          started_at?: string | null
          status?: string | null
          total_files?: number | null
          updated_at?: string | null
          upload_source?: string | null
          uploaded_by: string
        }
        Update: {
          appointment_id?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          errors?: Json | null
          failed_files?: number | null
          id?: string
          order_id?: string
          processed_files?: number | null
          started_at?: string | null
          status?: string | null
          total_files?: number | null
          updated_at?: string | null
          upload_source?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_jobs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upload_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upload_jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upload_jobs_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          granted: boolean
          granted_by: string | null
          id: string
          permission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted?: boolean
          granted_by?: string | null
          id?: string
          permission_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted?: boolean
          granted_by?: string | null
          id?: string
          permission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string | null
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_primary: boolean | null
          market_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_primary?: boolean | null
          market_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_primary?: boolean | null
          market_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          display_name: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_login_at: string | null
          last_name: string
          locale: string | null
          metadata: Json | null
          notification_preferences: Json | null
          phone: string | null
          timezone: string | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          first_name: string
          id: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_name: string
          locale?: string | null
          metadata?: Json | null
          notification_preferences?: Json | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_name?: string
          locale?: string | null
          metadata?: Json | null
          notification_preferences?: Json | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number | null
          attempted_at: string | null
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          next_retry_at: string | null
          payload: Json
          request_payload: Json | null
          response_body: string | null
          response_time_ms: number | null
          status: string | null
          status_code: number | null
          success: boolean | null
          webhook_id: string
        }
        Insert: {
          attempt_count?: number | null
          attempted_at?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          next_retry_at?: string | null
          payload: Json
          request_payload?: Json | null
          response_body?: string | null
          response_time_ms?: number | null
          status?: string | null
          status_code?: number | null
          success?: boolean | null
          webhook_id: string
        }
        Update: {
          attempt_count?: number | null
          attempted_at?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          request_payload?: Json | null
          response_body?: string | null
          response_time_ms?: number | null
          status?: string | null
          status_code?: number | null
          success?: boolean | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          enabled: boolean | null
          events: string[]
          failure_count: number | null
          headers: Json | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          secret: string | null
          success_count: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean | null
          events: string[]
          failure_count?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          secret?: string | null
          success_count?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean | null
          events?: string[]
          failure_count?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          secret?: string | null
          success_count?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mv_customer_ltv: {
        Row: {
          active_months: number | null
          avg_order_value: number | null
          company_id: string | null
          customer_id: string | null
          customer_tenure_days: number | null
          first_order_at: string | null
          last_order_at: string | null
          lifetime_revenue: number | null
          monthly_revenue_avg: number | null
          total_orders: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_daily_order_metrics: {
        Row: {
          avg_order_value: number | null
          cancelled_orders: number | null
          company_id: string | null
          confirmed_orders: number | null
          date: string | null
          delivered_orders: number | null
          market_id: string | null
          timezone: string | null
          total_orders: number | null
          total_revenue: number | null
          unique_customers: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_photographer_performance: {
        Row: {
          avg_job_duration: number | null
          avg_rating: number | null
          company_id: string | null
          completed_appointments: number | null
          completion_rate: number | null
          missed_appointments: number | null
          photographer_id: string | null
          qc_pass_rate: number | null
          total_appointments: number | null
          total_mileage: number | null
          total_reviews: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photographers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photographers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_product_performance: {
        Row: {
          avg_unit_price: number | null
          category_id: string | null
          company_id: string | null
          order_inclusion_rate: number | null
          product_id: string | null
          product_name: string | null
          times_ordered: number | null
          total_quantity: number | null
          total_revenue: number | null
          unique_customers: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_qc_trends: {
        Row: {
          avg_score: number | null
          company_id: string | null
          failed_jobs: number | null
          issue_breakdown: Json | null
          pass_rate: number | null
          passed_jobs: number | null
          total_issues: number | null
          total_jobs: number | null
          week: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qc_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_sales_performance: {
        Row: {
          avg_order_value: number | null
          company_id: string | null
          month: string | null
          new_customers: number | null
          sales_rep_id: string | null
          sales_rep_name: string | null
          total_commissions: number | null
          total_orders: number | null
          total_revenue: number | null
          unique_customers: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_sales_rep_id_fkey"
            columns: ["sales_rep_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      begin_transaction: {
        Args: { isolation_level?: string }
        Returns: undefined
      }
      cleanup_expired_idempotency_keys: { Args: never; Returns: undefined }
      cleanup_old_audit_logs: { Args: never; Returns: undefined }
      commit_transaction: { Args: never; Returns: undefined }
      get_customer_id: { Args: never; Returns: string }
      get_photographer_id: { Args: never; Returns: string }
      get_user_company_id: { Args: never; Returns: string }
      has_company_access: {
        Args: { target_company_id: string }
        Returns: boolean
      }
      has_market_access: {
        Args: { target_market_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_company_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      refresh_analytics_views: { Args: never; Returns: undefined }
      rollback_transaction: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "en_route"
        | "arrived"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
        | "rescheduled"
      availability_type:
        | "available"
        | "unavailable"
        | "tentative"
        | "time_off"
        | "holiday"
      commission_type: "percentage" | "flat_rate" | "tiered"
      discount_type: "percentage" | "fixed_amount" | "free_product"
      equipment_status:
        | "available"
        | "assigned"
        | "in_use"
        | "maintenance"
        | "retired"
      invoice_status:
        | "draft"
        | "pending"
        | "sent"
        | "paid"
        | "overdue"
        | "cancelled"
        | "void"
      media_type:
        | "photo"
        | "video"
        | "drone_photo"
        | "drone_video"
        | "matterport"
        | "floor_plan"
        | "virtual_staging"
        | "twilight"
        | "document"
      message_channel: "in_app" | "sms" | "email" | "push"
      order_status:
        | "draft"
        | "pending_payment"
        | "confirmed"
        | "scheduled"
        | "en_route"
        | "started"
        | "completed"
        | "uploading"
        | "editing"
        | "qc_pending"
        | "qc_failed"
        | "qc_passed"
        | "delivered"
        | "cancelled"
        | "on_hold"
      payment_status:
        | "pending"
        | "processing"
        | "succeeded"
        | "failed"
        | "refunded"
        | "partially_refunded"
        | "disputed"
      payroll_status:
        | "pending"
        | "approved"
        | "processing"
        | "paid"
        | "rejected"
      qc_status:
        | "pending"
        | "in_progress"
        | "passed"
        | "warning"
        | "failed"
        | "override_approved"
      referral_status:
        | "pending"
        | "qualified"
        | "converted"
        | "expired"
        | "rejected"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      user_role:
        | "super_admin"
        | "company_admin"
        | "market_manager"
        | "sales_rep"
        | "photographer"
        | "editor"
        | "qc_reviewer"
        | "customer"
        | "support"
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
      appointment_status: [
        "scheduled",
        "confirmed",
        "en_route",
        "arrived",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
        "rescheduled",
      ],
      availability_type: [
        "available",
        "unavailable",
        "tentative",
        "time_off",
        "holiday",
      ],
      commission_type: ["percentage", "flat_rate", "tiered"],
      discount_type: ["percentage", "fixed_amount", "free_product"],
      equipment_status: [
        "available",
        "assigned",
        "in_use",
        "maintenance",
        "retired",
      ],
      invoice_status: [
        "draft",
        "pending",
        "sent",
        "paid",
        "overdue",
        "cancelled",
        "void",
      ],
      media_type: [
        "photo",
        "video",
        "drone_photo",
        "drone_video",
        "matterport",
        "floor_plan",
        "virtual_staging",
        "twilight",
        "document",
      ],
      message_channel: ["in_app", "sms", "email", "push"],
      order_status: [
        "draft",
        "pending_payment",
        "confirmed",
        "scheduled",
        "en_route",
        "started",
        "completed",
        "uploading",
        "editing",
        "qc_pending",
        "qc_failed",
        "qc_passed",
        "delivered",
        "cancelled",
        "on_hold",
      ],
      payment_status: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "refunded",
        "partially_refunded",
        "disputed",
      ],
      payroll_status: ["pending", "approved", "processing", "paid", "rejected"],
      qc_status: [
        "pending",
        "in_progress",
        "passed",
        "warning",
        "failed",
        "override_approved",
      ],
      referral_status: [
        "pending",
        "qualified",
        "converted",
        "expired",
        "rejected",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      user_role: [
        "super_admin",
        "company_admin",
        "market_manager",
        "sales_rep",
        "photographer",
        "editor",
        "qc_reviewer",
        "customer",
        "support",
      ],
    },
  },
} as const
