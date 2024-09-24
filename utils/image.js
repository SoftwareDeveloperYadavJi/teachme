const cloudinary = require('cloudinary').v2; // Use v2 API

// Cloudinary configuration
cloudinary.config({ 
    cloud_name: 'dtsmlxvja', 
    api_key: '227162313266228', 
    api_secret: 'L8hRcOAOk9fdGDeLNY_tzIVVd7M' // Make sure you handle this securely in a real-world scenario
});

/**
 * Upload an image from a URL to Cloudinary, optimize, and crop it.
 * @param {string} imageUrl - The URL of the image to upload.
 * @param {string} publicId - The public ID to use for the uploaded image (optional).
 * @returns {Promise<string>} - Returns a promise that resolves to the secure URL of the uploaded image.
 */
async function uploadAndTransformImage(imageUrl, publicId = 'default_image_id') {
    try {
        // Upload the image from URL
        const uploadResult = await cloudinary.uploader.upload(imageUrl, {
            public_id: publicId
        });

        console.log("Upload result:", uploadResult);

        // Return the secure URL of the uploaded image (can store this in DB)
        return uploadResult.secure_url;

    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}

// Export the function for use in other modules
module.exports = {
    uploadAndTransformImage:uploadAndTransformImage
};
