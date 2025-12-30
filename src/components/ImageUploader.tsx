/*
 * Copyright 2025 Suvink
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { resizeImageIfNeeded, formatDimensions, MAX_IMAGE_DIMENSION } from '../utils/imageResize';
import { toast } from '../store/useToastStore';
import clsx from 'clsx';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageUploader: React.FC = () => {
    const setOriginalImage = useAppStore((state) => state.setOriginalImage);
    const setError = useAppStore((state) => state.setError);
    const [isResizing, setIsResizing] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError(`Invalid file type. Please use: ${ALLOWED_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}`);
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
            return;
        }

        // Clear any previous errors
        setError(null);

        const reader = new FileReader();
        reader.onload = async () => {
            const result = reader.result as string;
            
            try {
                setIsResizing(true);
                
                // Check if image needs resizing
                const resizeResult = await resizeImageIfNeeded(result, MAX_IMAGE_DIMENSION);
                
                if (resizeResult.wasResized) {
                    toast.info(
                        `Image resized from ${formatDimensions(resizeResult.originalDimensions)} to ${formatDimensions(resizeResult.newDimensions)} for optimal performance`
                    );
                }
                
                setOriginalImage(resizeResult.dataUrl);
            } catch (err) {
                console.error('Image resize failed:', err);
                // Fall back to original image if resize fails
                setOriginalImage(result);
            } finally {
                setIsResizing(false);
            }
        };
        reader.onerror = () => {
            setError('Failed to read file. Please try again.');
        };
        reader.readAsDataURL(file);
    }, [setOriginalImage, setError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        multiple: false,
        disabled: isResizing
    });

    return (
        <div
            {...getRootProps()}
            className={clsx(
                "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ease-in-out",
                isResizing
                    ? "border-zinc-700 bg-zinc-900/50 cursor-wait"
                    : isDragActive
                        ? "border-lime-500 bg-lime-500/10 scale-[1.02]"
                        : "border-zinc-800 hover:border-lime-500/50 hover:bg-zinc-900 bg-zinc-900/50"
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
                <div className={clsx(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                    isResizing ? "bg-lime-500/20" : isDragActive ? "bg-lime-500/20 text-lime-400" : "bg-zinc-800 text-zinc-500"
                )}>
                    {isResizing ? (
                        <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Upload className="w-8 h-8" />
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-medium text-zinc-200">
                        {isResizing 
                            ? "Preparing image..." 
                            : isDragActive 
                                ? "Drop image here" 
                                : "Click or drag image to upload"}
                    </p>
                    <p className="text-sm text-zinc-500">
                        {isResizing 
                            ? "Optimizing for best performance"
                            : "Supports JPG, PNG, WEBP (Max 10MB)"}
                    </p>
                </div>
            </div>
        </div>
    );
};
