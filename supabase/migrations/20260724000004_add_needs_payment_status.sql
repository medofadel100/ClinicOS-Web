-- Add 'needs_payment' status to appointment_status enum
-- Run this in Supabase SQL Editor

ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'needs_payment' AFTER 'completed';

-- Add a note column to appointments for doctor's work notes
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_notes text;
