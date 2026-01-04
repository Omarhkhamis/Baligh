const Jimp = require('jimp');

// Debugging: Print what Jimp is
console.log('Jimp export:', Jimp);

const inputPath = '/Users/mohammadaljssem/.gemini/antigravity/brain/fa13f72b-a5ff-4c94-99cf-3d2964ac3575/uploaded_image_1764019516323.png';
const outputPath = '/Users/mohammadaljssem/Desktop/balghapp/public/logo.png';

async function processImage() {
    try {
        // Try different ways to access read
        const readFunc = Jimp.read || (Jimp.default && Jimp.default.read) || (Jimp.Jimp && Jimp.Jimp.read);

        if (!readFunc) {
            throw new Error('Could not find Jimp.read function');
        }

        const image = await readFunc(inputPath);

        // Get the color of the top-left pixel to use as the background color
        const bgColor = image.getPixelColor(0, 0);

        // Scan all pixels and make pixels matching the background color transparent
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const currentColor = this.getPixelColor(x, y);

            // Calculate color difference (simple distance)
            const bg = Jimp.intToRGBA ? Jimp.intToRGBA(bgColor) : (image.constructor.intToRGBA(bgColor));
            const current = Jimp.intToRGBA ? Jimp.intToRGBA(currentColor) : (image.constructor.intToRGBA(currentColor));

            const distance = Math.sqrt(
                Math.pow(current.r - bg.r, 2) +
                Math.pow(current.g - bg.g, 2) +
                Math.pow(current.b - bg.b, 2)
            );

            // If the color is close to the background color, make it transparent
            if (distance < 50) {
                this.bitmap.data[idx + 3] = 0; // Set alpha to 0
            }
        });

        await image.writeAsync(outputPath);
        console.log('Logo processed and saved to:', outputPath);
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

processImage();
