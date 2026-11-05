/**
 * Image upload helpers shared by the application.
 * Large photos are resized and compressed in the browser before they are
 * converted to Base64, keeping previews and API requests reasonably small.
 */

export const IMAGE_CONFIG = {
  MAX_FILES: 15,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // hard limit for the processed image
  MAX_SOURCE_FILE_SIZE: 30 * 1024 * 1024, // protect the browser from huge inputs
  MAX_DIMENSIONS: { width: 7000, height: 7000 },
  MAX_SOURCE_DIMENSIONS: { width: 12000, height: 12000 },
  MAX_SOURCE_PIXELS: 64_000_000,
  COMPRESSION_MAX_DIMENSION: 2560,
  COMPRESSION_TARGET_SIZE: 1024 * 1024, // aim for 1 MB per image
  ACCEPTED_FORMATS: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/bmp',
    'image/heic',
    'image/heif',
  ],
};

const FORMAT_LABELS = 'JPG, PNG, GIF, WebP, AVIF, BMP, HEIC or HEIF';
const RASTER_OUTPUT_TYPE = 'image/webp';
const MIME_ALIASES = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/x-png': 'image/png',
  'image/heic-sequence': 'image/heic',
  'image/heif-sequence': 'image/heif',
};

const getFileType = (file) => {
  if (file?.type) {
    const type = file.type.toLowerCase();
    return MIME_ALIASES[type] || type;
  }

  const extension = file?.name?.split('.').pop()?.toLowerCase();
  const typesByExtension = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    bmp: 'image/bmp',
    heic: 'image/heic',
    heif: 'image/heif',
  };

  return typesByExtension[extension] || '';
};

/**
 * Validate the source file before attempting to decode it. Files over the old
 * 5 MB limit are allowed here because they will be compressed before upload.
 */
export const validateImageFile = (file) => {
  const fileType = getFileType(file);

  if (!IMAGE_CONFIG.ACCEPTED_FORMATS.includes(fileType)) {
    return {
      valid: false,
      error: `Unsupported image format. Please use ${FORMAT_LABELS}.`,
    };
  }

  if (file.size > IMAGE_CONFIG.MAX_SOURCE_FILE_SIZE) {
    return {
      valid: false,
      error: `Image is larger than ${IMAGE_CONFIG.MAX_SOURCE_FILE_SIZE / (1024 * 1024)} MB and cannot be processed safely.`,
    };
  }

  return { valid: true, error: null };
};

const loadImage = (file) => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('The browser could not decode this image'));
  };
  image.src = objectUrl;
});

const getImageDimensions = (image) => ({
  width: image.naturalWidth || image.width,
  height: image.naturalHeight || image.height,
});

/**
 * Validate source dimensions. Oversized-but-safe images are handled by the
 * compression pipeline; only images that would risk exhausting browser memory
 * are rejected.
 */
export const validateImageDimensions = async (file) => {
  try {
    const image = await loadImage(file);
    const { width, height } = getImageDimensions(image);
    const exceedsSafeDimensions =
      width > IMAGE_CONFIG.MAX_SOURCE_DIMENSIONS.width ||
      height > IMAGE_CONFIG.MAX_SOURCE_DIMENSIONS.height ||
      width * height > IMAGE_CONFIG.MAX_SOURCE_PIXELS;

    if (exceedsSafeDimensions) {
      return {
        valid: false,
        error: `Image resolution is too large to process safely (${width}x${height}px).`,
      };
    }

    return { valid: true, error: null, width, height };
  } catch {
    return {
      valid: false,
      error: 'This image could not be read. Try converting it to JPG, PNG or WebP.',
    };
  }
};

const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
  canvas.toBlob(
    (blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Image compression is not supported by this browser'));
    },
    type,
    quality,
  );
});

const replaceFileExtension = (name, extension) => {
  const baseName = (name || 'image').replace(/\.[^/.]+$/, '');
  return `${baseName}.${extension}`;
};

/**
 * Resize and compress an image. GIFs that already meet the hard limits are
 * preserved so animation is not lost.
 */
export const compressImageFile = async (file, dimensions = null) => {
  const fileType = getFileType(file);
  const image = await loadImage(file);
  const sourceDimensions = dimensions || getImageDimensions(image);
  const { width: sourceWidth, height: sourceHeight } = sourceDimensions;

  const isGif = fileType === 'image/gif';
  const withinDimensions =
    sourceWidth <= IMAGE_CONFIG.MAX_DIMENSIONS.width &&
    sourceHeight <= IMAGE_CONFIG.MAX_DIMENSIONS.height;
  const needsCompression =
    !withinDimensions ||
    file.size > IMAGE_CONFIG.COMPRESSION_TARGET_SIZE ||
    !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(fileType);

  if (!needsCompression) {
    return {
      file,
      compressed: false,
      originalSize: file.size,
      originalWidth: sourceWidth,
      originalHeight: sourceHeight,
      width: sourceWidth,
      height: sourceHeight,
    };
  }

  if (isGif && withinDimensions && file.size <= IMAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      file,
      compressed: false,
      originalSize: file.size,
      originalWidth: sourceWidth,
      originalHeight: sourceHeight,
      width: sourceWidth,
      height: sourceHeight,
    };
  }

  if (isGif) {
    throw new Error('Animated GIF is too large. Please use a smaller GIF or convert it to JPG, PNG or WebP.');
  }

  const initialScale = Math.min(
    1,
    IMAGE_CONFIG.COMPRESSION_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight),
  );
  let outputWidth = Math.max(1, Math.round(sourceWidth * initialScale));
  let outputHeight = Math.max(1, Math.round(sourceHeight * initialScale));
  let quality = 0.86;
  let outputBlob = null;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) throw new Error('Image compression is not available in this browser.');

  for (let attempt = 0; attempt < 10; attempt += 1) {
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    context.clearRect(0, 0, outputWidth, outputHeight);
    context.drawImage(image, 0, 0, outputWidth, outputHeight);
    outputBlob = await canvasToBlob(canvas, RASTER_OUTPUT_TYPE, quality);

    if (outputBlob.size <= IMAGE_CONFIG.COMPRESSION_TARGET_SIZE) break;

    if (quality > 0.58) {
      quality = Math.max(0.58, quality - 0.08);
    } else {
      outputWidth = Math.max(1, Math.round(outputWidth * 0.82));
      outputHeight = Math.max(1, Math.round(outputHeight * 0.82));
      quality = 0.78;
    }
  }

  if (!outputBlob || outputBlob.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    throw new Error('Image could not be compressed below the 5 MB upload limit.');
  }

  const compressedFile = new File(
    [outputBlob],
    replaceFileExtension(file.name, 'webp'),
    { type: outputBlob.type || RASTER_OUTPUT_TYPE, lastModified: file.lastModified },
  );

  return {
    file: compressedFile,
    compressed: true,
    originalSize: file.size,
    originalWidth: sourceWidth,
    originalHeight: sourceHeight,
    width: outputWidth,
    height: outputHeight,
  };
};

/** Convert a file to a Base64 data URL. */
export const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Failed to read image'));
  reader.readAsDataURL(file);
});

/** Validate, compress and convert multiple files for preview/upload. */
export const processImageFiles = async (files) => {
  const results = [];
  const errors = [];
  const selectedFiles = Array.from(files || []);

  if (selectedFiles.length > IMAGE_CONFIG.MAX_FILES) {
    errors.push(`Only the first ${IMAGE_CONFIG.MAX_FILES} images were processed.`);
  }

  for (const file of selectedFiles.slice(0, IMAGE_CONFIG.MAX_FILES)) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      errors.push(`${file.name}: ${validation.error}`);
      continue;
    }

    const dimensionValidation = await validateImageDimensions(file);
    if (!dimensionValidation.valid) {
      errors.push(`${file.name}: ${dimensionValidation.error}`);
      continue;
    }

    try {
      const processed = await compressImageFile(file, {
        width: dimensionValidation.width,
        height: dimensionValidation.height,
      });
      const base64 = await fileToBase64(processed.file);

      results.push({
        base64,
        name: processed.file.name,
        size: processed.file.size,
        type: processed.file.type,
        compressed: processed.compressed,
        originalName: file.name,
        originalSize: processed.originalSize,
        originalWidth: processed.originalWidth,
        originalHeight: processed.originalHeight,
        width: processed.width,
        height: processed.height,
      });
    } catch (error) {
      errors.push(`${file.name}: ${error.message || 'Failed to process image'}`);
    }
  }

  return { images: results, errors };
};

export const getFilesFromDragEvent = (event) => {
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) return [];

  if (dataTransfer.items) {
    const files = Array.from(dataTransfer.items)
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter(Boolean);
    if (files.length > 0) return files;
  }

  return Array.from(dataTransfer.files || []);
};

export const triggerFileInput = (fileInputRef) => {
  fileInputRef?.current?.click();
};
