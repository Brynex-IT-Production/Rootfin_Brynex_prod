import { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import {
  IMAGE_CONFIG,
  processImageFiles,
  getFilesFromDragEvent,
  triggerFileInput,
} from '../utils/imageUpload';

/**
 * Reusable Image Upload Component
 * Supports drag & drop, file selection, and image preview
 * 
 * @param {Function} onImagesSelect - Callback when images are selected
 * @param {Array} existingImages - Array of existing image base64 strings
 * @param {Function} onRemoveImage - Callback to remove an image
 * @param {Boolean} multiple - Allow multiple image uploads (default: true)
 */
const ImageUpload = ({
  onImagesSelect,
  existingImages = [],
  onRemoveImage,
  multiple = true,
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = getFilesFromDragEvent(e);
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    setErrors([]);

    try {
      const { images, errors: validationErrors } = await processImageFiles(files);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      }

      if (images.length > 0) {
        if (multiple) {
          onImagesSelect([...existingImages, ...images]);
        } else {
          // For single image upload, replace the existing image
          onImagesSelect([images[0]]);
        }
      }
    } catch (error) {
      setErrors(['Error processing images. Please try again.']);
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClickUpload = () => {
    triggerFileInput(fileInputRef);
  };

  const handleRemoveImage = (index) => {
    const newImages = existingImages.filter((_, i) => i !== index);
    onImagesSelect(newImages);
    if (onRemoveImage) {
      onRemoveImage(index);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-none border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? 'border-[#8B5CF6] bg-[#F5F3FF]'
            : 'border-[#E5E7EB] hover:border-[#8B5CF6] bg-white'
        }`}
      >
        <UploadCloud size={36} className="mb-3 text-[#9CA3AF]" />
        <p className="text-sm font-semibold text-[#111827]">
          Drag image(s) here or browse images
        </p>
        <p className="mt-1.5 text-xs leading-5 text-[#6B7280]">
          Up to {IMAGE_CONFIG.MAX_FILES} images. Large images (up to{' '}
          {IMAGE_CONFIG.MAX_SOURCE_FILE_SIZE / (1024 * 1024)}MB) are compressed automatically.
        </p>
        <button
          type="button"
          onClick={handleClickUpload}
          disabled={uploading}
          className="mt-4 rounded-none border border-[#E5E7EB] bg-[#EEEEEE] hover:bg-[#E2E2E2] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#111827] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*,.heic,.heif"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, idx) => (
            <div
              key={idx}
              className="rounded-none bg-[#fee2e2] border border-red-200 p-3 text-xs font-semibold text-[#991b1b]"
            >
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Image Preview */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Images ({existingImages.length}/{IMAGE_CONFIG.MAX_FILES})
          </h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {existingImages.map((image, idx) => {
              // Check if it's a base64 string or URL
              const isBase64 = image.base64 || image;
              const imageSrc = image.base64 || image;
              const imageName = image.name || `Image ${idx + 1}`;

              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-none border border-[#E5E7EB] bg-[#F9FAFB]"
                >
                  <img
                    src={imageSrc}
                    alt={imageName}
                    className="h-24 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-none bg-[#EF4444] text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                    title="Remove image"
                  >
                    <X size={13} />
                  </button>
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;


