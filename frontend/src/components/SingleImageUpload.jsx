import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  IMAGE_CONFIG,
  processImageFiles,
  getFilesFromDragEvent,
  triggerFileInput,
} from '../utils/imageUpload';

/**
 * Single Image Upload Component
 * For uploading a single image with preview
 * 
 * @param {Function} onImageSelect - Callback when image is selected
 * @param {String} existingImage - Existing image base64 string
 * @param {Function} onRemoveImage - Callback to remove image
 * @param {Boolean} required - Whether the field is required
 */
const SingleImageUpload = ({
  onImageSelect,
  existingImage = null,
  onRemoveImage,
  required = false,
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
      await handleFiles(files[0]); // Only take first file
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFiles(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = async (file) => {
    setUploading(true);
    setErrors([]);

    try {
      const { images, errors: processingErrors } = await processImageFiles([file]);
      if (processingErrors.length > 0) setErrors(processingErrors);
      if (images[0]) onImageSelect(images[0]);
    } catch (error) {
      setErrors(['Failed to process image']);
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClickUpload = () => {
    triggerFileInput(fileInputRef);
  };

  const handleRemoveImage = () => {
    onImageSelect(null);
    if (onRemoveImage) {
      onRemoveImage();
    }
  };

  return (
    <div className="space-y-4">
      {!existingImage ? (
        <>
          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              dragActive
                ? 'border-[#2563eb] bg-[#eff6ff]'
                : 'border-[#d7dcf5] bg-[#f8f9ff]'
            }`}
          >
            <p className="text-sm font-medium text-[#64748b]">
              Drag image here or browse
            </p>
            <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
              Images up to {IMAGE_CONFIG.MAX_SOURCE_FILE_SIZE / (1024 * 1024)}MB are compressed automatically
            </p>
            <button
              type="button"
              onClick={handleClickUpload}
              disabled={uploading}
              className="mt-3 rounded-full border border-[#cbd5f5] px-3 py-1.5 text-xs font-medium text-[#3762f9] hover:bg-[#eef2ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Browse'}
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>
        </>
      ) : (
        <>
          {/* Image Preview */}
          <div className="relative overflow-hidden rounded-lg border border-[#e6eafb] bg-[#f8f9ff] w-full max-w-xs">
            <img
              src={existingImage.base64 || existingImage}
              alt={existingImage.name || 'Uploaded image'}
              className="h-32 w-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#ef4444] text-white shadow-md hover:bg-[#dc2626] transition-colors"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onImageSelect(null)}
            className="text-sm text-[#3762f9] hover:underline"
          >
            Change image
          </button>
        </>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, idx) => (
            <div
              key={idx}
              className="rounded-md bg-[#fee2e2] p-2.5 text-xs text-[#991b1b]"
            >
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleImageUpload;


