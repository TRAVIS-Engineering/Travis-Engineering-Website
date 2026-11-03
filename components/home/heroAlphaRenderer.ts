/** Reconstruct transparency from an H.264 frame: RGB left, alpha right.
 * Canvas 2D avoids WebKit texture-upload/context loss at video loop boundaries.
 */
export function createHeroAlphaRenderer(canvas: HTMLCanvasElement) {
    const width = 960, height = 540;
    canvas.width = width; canvas.height = height;
    const output = canvas.getContext('2d', { alpha: true });
    const source = document.createElement('canvas');
    source.width = width * 2; source.height = height;
    const input = source.getContext('2d', { willReadFrequently: true });
    if (!input || !output) throw new Error('Hero canvas unavailable');
    const frame = output.createImageData(width, height);
    return {
        draw(video: HTMLVideoElement, verify = false) {
            input.drawImage(video, 0, 0, source.width, source.height);
            const packed = input.getImageData(0, 0, source.width, source.height).data;
            const pixels = frame.data;
            for (let y = 0; y < height; y++) {
                const row = y * width * 8;
                for (let x = 0; x < width; x++) {
                    const src = row + x * 4, dst = (y * width + x) * 4;
                    pixels[dst] = packed[src];
                    pixels[dst + 1] = packed[src + 1];
                    pixels[dst + 2] = packed[src + 2];
                    // Remove near-black codec noise while retaining antialiased edges.
                    pixels[dst + 3] = (packed[src + width * 4] - 1) / .992;
                }
            }
            if (verify) {
                const corners = [0, width - 1, (height - 1) * width, width * height - 1];
                if (!corners.every(i => pixels[i * 4 + 3] < 16) ||
                    !pixels.some((v, i) => i % 4 === 3 && v > 240)) {
                    throw new Error('Hero transparency unavailable');
                }
            }
            output.putImageData(frame, 0, 0);
        },
        dispose() {
            source.width = source.height = 0;
            output.clearRect(0, 0, width, height);
        },
    };
}
