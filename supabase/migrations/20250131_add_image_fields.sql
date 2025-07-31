-- Add image fields to coffee_records table
ALTER TABLE coffee_records
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS additional_images TEXT[];

-- Create coffee-images storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('coffee-images', 'coffee-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for coffee-images bucket
-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'coffee-images' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Allow users to update their own images
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'coffee-images' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'coffee-images' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Allow public to view images
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'coffee-images');

-- Add RLS policies for the new columns
-- These inherit from existing RLS policies on the coffee_records table