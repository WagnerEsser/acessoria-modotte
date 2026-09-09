import type { SupabaseClient } from "@supabase/supabase-js";

export const PROPERTY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROPERTY_IMAGE_MAX_COUNT = 20;
export const PROPERTY_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const PROPERTY_VIDEO_MAX_COUNT = 3;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm", "video/ogg"]);
const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/ogg": "ogv",
};

export function getPropertyImageFiles(formData: FormData) {
  return formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
}

export function getPropertyVideoFiles(formData: FormData) {
  return formData.getAll("videos").filter((value): value is File => value instanceof File && value.size > 0);
}

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/png") {
    return bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10";
  }

  if (file.type === "image/webp") {
    return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }

  if (file.type === "image/avif") {
    return String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
  }

  return false;
}

export async function validatePropertyImageFiles(files: File[], existingCount = 0) {
  if (files.length + existingCount > PROPERTY_IMAGE_MAX_COUNT) {
    return "Você pode manter no máximo 20 imagens por imóvel.";
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return "Use apenas imagens JPG, PNG, WebP ou AVIF.";
    }

    if (file.size > PROPERTY_IMAGE_MAX_BYTES) {
      return "Cada imagem pode ter no máximo 5 MB.";
    }

    if (!(await hasValidImageSignature(file))) {
      return "Uma das imagens não pôde ser validada. Selecione o arquivo novamente.";
    }
  }

  return null;
}

async function hasValidVideoSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  if (file.type === "video/webm") {
    return bytes.slice(0, 4).join(",") === "26,69,223,163";
  }

  if (file.type === "video/ogg") {
    return String.fromCharCode(...bytes.slice(0, 4)) === "OggS";
  }

  if (file.type === "video/mp4" || file.type === "video/quicktime") {
    return String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
  }

  return false;
}

export async function validatePropertyVideoFiles(files: File[], existingCount = 0) {
  if (files.length + existingCount > PROPERTY_VIDEO_MAX_COUNT) {
    return "Você pode manter no máximo 3 vídeos por imóvel.";
  }

  for (const file of files) {
    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      return "Use apenas vídeos MP4, MOV, WebM ou OGG.";
    }

    if (file.size > PROPERTY_VIDEO_MAX_BYTES) {
      return "Cada vídeo pode ter no máximo 50 MB.";
    }

    if (!(await hasValidVideoSignature(file))) {
      return "Um dos vídeos não pôde ser validado. Selecione o arquivo novamente.";
    }
  }

  return null;
}

async function removeUploadedFiles(supabase: SupabaseClient, paths: string[]) {
  if (paths.length) {
    await supabase.storage.from("property-images").remove(paths);
  }
}

export async function uploadPropertyImages(
  supabase: SupabaseClient,
  propertyId: string,
  propertyTitle: string,
  files: File[],
  sortOrderStart: number,
) {
  const uploadedPaths: string[] = [];
  const rows: Array<Record<string, unknown>> = [];

  try {
    for (const [index, file] of files.entries()) {
      const extension = IMAGE_EXTENSIONS[file.type];
      const path = `${propertyId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      uploadedPaths.push(path);
      const { data } = supabase.storage.from("property-images").getPublicUrl(path);
      rows.push({
        property_id: propertyId,
        url: data.publicUrl,
        alt_text: `${propertyTitle} - imagem ${sortOrderStart + index + 1}`,
        sort_order: sortOrderStart + index,
        is_cover: sortOrderStart === 0 && index === 0,
      });
    }

    if (rows.length) {
      const { error } = await supabase.from("property_images").insert(rows);

      if (error) {
        throw error;
      }
    }

    return rows;
  } catch (error) {
    await removeUploadedFiles(supabase, uploadedPaths);
    throw error;
  }
}

export async function deletePropertyImages(
  supabase: SupabaseClient,
  propertyId: string,
  imageIds: string[],
) {
  if (!imageIds.length) {
    return;
  }

  const { data, error: readError } = await supabase
    .from("property_images")
    .select("id, url")
    .eq("property_id", propertyId)
    .in("id", imageIds);

  if (readError) {
    throw readError;
  }

  const paths = (data ?? []).map((image) => {
    const marker = "/property-images/";
    const index = image.url.indexOf(marker);
    return index === -1 ? null : image.url.slice(index + marker.length);
  }).filter((path): path is string => Boolean(path));

  const { error: deleteError } = await supabase
    .from("property_images")
    .delete()
    .eq("property_id", propertyId)
    .in("id", imageIds);

  if (deleteError) {
    throw deleteError;
  }

  await removeUploadedFiles(supabase, paths);
}

export async function uploadPropertyVideos(
  supabase: SupabaseClient,
  propertyId: string,
  files: File[],
  sortOrderStart: number,
) {
  const uploadedPaths: string[] = [];
  const rows: Array<Record<string, unknown>> = [];

  try {
    for (const [index, file] of files.entries()) {
      const extension = VIDEO_EXTENSIONS[file.type];
      const path = `${propertyId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("property-videos")
        .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      uploadedPaths.push(path);
      const { data } = supabase.storage.from("property-videos").getPublicUrl(path);
      rows.push({
        property_id: propertyId,
        storage_path: path,
        url: data.publicUrl,
        file_name: file.name.slice(0, 255),
        mime_type: file.type,
        size_bytes: file.size,
        sort_order: sortOrderStart + index,
      });
    }

    if (rows.length) {
      const { error } = await supabase.from("property_videos").insert(rows);

      if (error) {
        throw error;
      }
    }

    return rows;
  } catch (error) {
    await supabase.storage.from("property-videos").remove(uploadedPaths);
    throw error;
  }
}

export async function deletePropertyVideos(
  supabase: SupabaseClient,
  propertyId: string,
  videoIds: string[],
) {
  if (!videoIds.length) {
    return;
  }

  const { data, error: readError } = await supabase
    .from("property_videos")
    .select("id, storage_path")
    .eq("property_id", propertyId)
    .in("id", videoIds);

  if (readError) {
    throw readError;
  }

  const { error: deleteError } = await supabase
    .from("property_videos")
    .delete()
    .eq("property_id", propertyId)
    .in("id", videoIds);

  if (deleteError) {
    throw deleteError;
  }

  await supabase.storage
    .from("property-videos")
    .remove((data ?? []).map((video) => video.storage_path));
}

export async function syncPropertyFeatures(
  supabase: SupabaseClient,
  propertyId: string,
  features: Array<{ label: string; value: string | null; sortOrder: number }>,
) {
  const { error: clearError } = await supabase.from("property_features").delete().eq("property_id", propertyId);

  if (clearError) {
    throw clearError;
  }

  if (features.length) {
    const { error } = await supabase.from("property_features").insert(
      features.map((feature) => ({ property_id: propertyId, label: feature.label, value: feature.value, sort_order: feature.sortOrder })),
    );

    if (error) {
      throw error;
    }
  }
}
