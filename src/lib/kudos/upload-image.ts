"use client";

/**
 * Client-side image upload helper for Kudos image attachments.
 *
 * Uploads a file to the `images` Supabase Storage bucket and returns
 * the public URL. Uses the browser Supabase client (authenticated session).
 *
 * Validation (client-side guard — server RLS is the authoritative check):
 * - File must be an image (MIME type starts with "image/").
 * - File size must be ≤ 5 MB.
 *
 * Path convention: kudos/{userId}/{uuid}.{ext}
 */

import { createClient } from "@/lib/supabase/client";

const BUCKET = "images";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Uploads an image file to Supabase Storage and returns its public URL.
 *
 * @throws {Error} If the file is not an image, exceeds 5 MB, or the upload fails.
 */
export async function uploadKudosImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Must be signed in to upload images.");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `kudos/${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}
