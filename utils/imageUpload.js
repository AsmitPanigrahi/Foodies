const fs = require('fs');
const path = require('path');
const AppError = require('./appError');
const { cloudinary, localUpload } = require('../config/cloudinary');

const uploadImage = async (file) => {
    try {
        // Save image to local storage
        const localFilePath = path.join(__dirname, '../uploads', file.filename);
        
        // Ensure upload directory exists
        const uploadDir = path.dirname(localFilePath);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        await localUpload.single('image')(file);

        // Upload image to Cloudinary with retries
        let result;
        let retries = 3;
        while (retries > 0) {
            try {
                result = await cloudinary.uploader.upload(localFilePath, {
                    folder: 'foodies',
                    use_filename: true,
                    unique_filename: true,
                    resource_type: 'auto'
                });
                break;
            } catch (uploadError) {
                retries--;
                if (retries === 0) throw uploadError;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            }
        }

        // Only delete local file after successful Cloudinary upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        if (!result || !result.secure_url) {
            throw new Error('Failed to get secure URL from Cloudinary');
        }

        return result.secure_url;
    } catch (error) {
        console.error('Image upload error:', error);
        throw new AppError(`Error uploading image: ${error.message}`, 500);
    }
};

const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};

module.exports = {
    uploadImage,
    deleteImage
};
