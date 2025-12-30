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

import { useCallback } from 'react';
import { toast } from '../store/useToastStore';
import type { ExportFormat, ShadowSettings, EdgeRefinementSettings } from '../store/useAppStore';
import type { CanvasRefs } from './useCanvasRenderer';
import { applyEdgeRefinement } from '../utils/edgeRefinement';

interface UseExportCanvasProps {
    refs: CanvasRefs;
    backgroundColor: string | null;
    backgroundImage: string | null;
    featherRadius: number;
    shadowSettings: ShadowSettings;
    edgeRefinement: EdgeRefinementSettings;
    exportFormat: ExportFormat;
    exportQuality: number;
    originalImageRef?: React.RefObject<HTMLImageElement | null>;
    onDownloadComplete?: () => void;
}

export interface ExportCanvasOptions {
    /** Force PNG format (for clipboard) */
    forcePng?: boolean;
    /** Include JPEG white background when needed */
    includeJpegBackground?: boolean;
}

/**
 * Creates an export canvas with all effects applied (background, shadow, feathering, edge refinement)
 * Returns a Promise to properly handle async background image loading
 */
async function createExportCanvas(
    sourceCanvas: HTMLCanvasElement,
    options: {
        backgroundColor: string | null;
        backgroundImage: string | null;
        featherRadius: number;
        shadowSettings: ShadowSettings;
        edgeRefinement: EdgeRefinementSettings;
        exportFormat: ExportFormat;
        includeJpegBackground?: boolean;
        originalImage?: HTMLImageElement | null;
    }
): Promise<HTMLCanvasElement | null> {
    const { backgroundColor, backgroundImage, featherRadius, shadowSettings, edgeRefinement, exportFormat, includeJpegBackground = true, originalImage } = options;

    // First, apply edge refinement to the source canvas if enabled
    let refinedCanvas = sourceCanvas;
    if (edgeRefinement.mode !== 'off') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = sourceCanvas.width;
        tempCanvas.height = sourceCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
            tempCtx.drawImage(sourceCanvas, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Get original image data for color decontamination
            let originalImageData: ImageData | undefined;
            if (originalImage && edgeRefinement.colorDecontamination > 0) {
                const origCanvas = document.createElement('canvas');
                origCanvas.width = sourceCanvas.width;
                origCanvas.height = sourceCanvas.height;
                const origCtx = origCanvas.getContext('2d');
                if (origCtx) {
                    origCtx.drawImage(originalImage, 0, 0, origCanvas.width, origCanvas.height);
                    originalImageData = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height);
                }
            }
            
            const refinedData = applyEdgeRefinement(tempCtx, imageData, edgeRefinement, originalImageData);
            tempCtx.putImageData(refinedData, 0, 0);
            refinedCanvas = tempCanvas;
        }
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = sourceCanvas.width;
    exportCanvas.height = sourceCanvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return null;

    // For JPEG format, we need a solid background since JPEG doesn't support transparency
    const needsSolidBackground = includeJpegBackground && exportFormat === 'jpeg' && !backgroundColor && !backgroundImage;
    if (needsSolidBackground) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }

    // Draw background if set
    if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    } else if (backgroundImage) {
        // Load background image asynchronously to ensure it's ready
        const bgImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load background image'));
            img.src = backgroundImage;
        });
        
        const scale = Math.max(
            exportCanvas.width / bgImg.width,
            exportCanvas.height / bgImg.height
        );
        const scaledWidth = bgImg.width * scale;
        const scaledHeight = bgImg.height * scale;
        const x = (exportCanvas.width - scaledWidth) / 2;
        const y = (exportCanvas.height - scaledHeight) / 2;
        ctx.drawImage(bgImg, x, y, scaledWidth, scaledHeight);
    }

    // Draw shadow/glow effect if enabled
    if (shadowSettings.type !== 'none') {
        ctx.save();

        if (shadowSettings.type === 'drop-shadow') {
            ctx.shadowColor = shadowSettings.color;
            ctx.shadowBlur = shadowSettings.blur;
            ctx.shadowOffsetX = shadowSettings.offsetX;
            ctx.shadowOffsetY = shadowSettings.offsetY;
            ctx.drawImage(refinedCanvas, 0, 0);
            ctx.restore();
        } else if (shadowSettings.type === 'glow') {
            // Use up to 5 layers for export quality
            const layers = Math.min(5, shadowSettings.spread);
            for (let i = layers; i > 0; i--) {
                ctx.save();
                ctx.shadowColor = shadowSettings.color;
                ctx.shadowBlur = shadowSettings.blur * (i / layers);
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.globalAlpha = 0.4 / i;
                ctx.drawImage(refinedCanvas, 0, 0);
                ctx.restore();
            }
        }
    }

    // Draw the edited image on top with feathering if set
    if (featherRadius > 0) {
        // Create a temporary canvas for the feathered result
        const featherCanvas = document.createElement('canvas');
        featherCanvas.width = refinedCanvas.width;
        featherCanvas.height = refinedCanvas.height;
        const featherCtx = featherCanvas.getContext('2d');
        if (featherCtx) {
            // Draw the original image with blur to create soft edges
            featherCtx.filter = `blur(${featherRadius}px)`;
            featherCtx.drawImage(refinedCanvas, 0, 0);
            featherCtx.filter = 'none';

            // Use the blurred version as a mask, but keep original colors
            featherCtx.globalCompositeOperation = 'source-atop';
            featherCtx.drawImage(refinedCanvas, 0, 0);

            ctx.drawImage(featherCanvas, 0, 0);
        } else {
            ctx.drawImage(refinedCanvas, 0, 0);
        }
    } else {
        ctx.drawImage(refinedCanvas, 0, 0);
    }

    return exportCanvas;
}

export function useExportCanvas({
    refs,
    backgroundColor,
    backgroundImage,
    featherRadius,
    shadowSettings,
    edgeRefinement,
    exportFormat,
    exportQuality,
    onDownloadComplete,
}: UseExportCanvasProps) {
    const handleDownload = useCallback(async () => {
        const osc = refs.offscreenCanvasRef.current;
        if (!osc) return;

        try {
            const exportCanvas = await createExportCanvas(osc, {
                backgroundColor,
                backgroundImage,
                featherRadius,
                shadowSettings,
                edgeRefinement,
                exportFormat,
                includeJpegBackground: true,
            });
            if (!exportCanvas) return;

            // Determine MIME type and file extension
            const mimeTypes: Record<ExportFormat, string> = {
                png: 'image/png',
                jpeg: 'image/jpeg',
                webp: 'image/webp',
            };
            const extensions: Record<ExportFormat, string> = {
                png: 'png',
                jpeg: 'jpg',
                webp: 'webp',
            };

            // Download
            const link = document.createElement('a');
            const baseName = backgroundColor || backgroundImage
                ? 'image-with-background'
                : 'removed-background';
            link.download = `${baseName}.${extensions[exportFormat]}`;
            link.href = exportFormat === 'png'
                ? exportCanvas.toDataURL(mimeTypes[exportFormat])
                : exportCanvas.toDataURL(mimeTypes[exportFormat], exportQuality);
            link.click();
            toast.success('Image downloaded');
            onDownloadComplete?.();
        } catch (err) {
            console.error('Failed to export image:', err);
            toast.error('Failed to download image');
        }
    }, [refs, backgroundColor, backgroundImage, featherRadius, shadowSettings, edgeRefinement, exportFormat, exportQuality, onDownloadComplete]);

    const handleCopyToClipboard = useCallback(async () => {
        const osc = refs.offscreenCanvasRef.current;
        if (!osc) return;

        try {
            // Always use PNG for clipboard (supports transparency)
            const exportCanvas = await createExportCanvas(osc, {
                backgroundColor,
                backgroundImage,
                featherRadius,
                shadowSettings,
                edgeRefinement,
                exportFormat: 'png',
                includeJpegBackground: false,
            });
            if (!exportCanvas) return;

            // Copy to clipboard
            const blob = await new Promise<Blob | null>((resolve) =>
                exportCanvas.toBlob(resolve, 'image/png')
            );
            if (blob) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                toast.success('Copied to clipboard');
            }
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            toast.error('Failed to copy to clipboard');
        }
    }, [refs, backgroundColor, backgroundImage, featherRadius, shadowSettings, edgeRefinement]);

    return {
        handleDownload,
        handleCopyToClipboard,
    };
}
