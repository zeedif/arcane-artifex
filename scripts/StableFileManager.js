/**
 * Class representing a Stable File Manager.
 */
class StableFileManager {
    /**
     * Create a StableFileManager instance.
     */
    constructor() {
        /** @type {string} - The storage path for files. */
        this.storagePath = ''
    }

    /** 
     * Checks if a file exists by sending a HEAD request to the storagePath + filename. 
     * @param {string} filename - The name of the file to check. 
     * @returns {Promise<boolean>} - Returns a promise that resolves to true if the file exists, false otherwise. 
     */
    async checkFileExists(filename) {
        // Send a HEAD request to the storagePath + filename  
        try {
            const response = await fetch(this.storagePath + filename, { method: 'HEAD' });
            // Check if the response is successful (status in the range of 200-299)  
            if (response.ok) {
                // Return true if the file exists  
                return true;
            } else {
                // Throw an error if the file is not found  
                throw new Error("file not found: " + filename);
            }
        } catch (error) {
            // Log any errors to the console and return false  
            console.warn(error);
            return false;
        }
    }
    /**
     * Save a file with base64 data.
     * @param {string} filename - The name of the file.
     * @returns {Promise<string>} - A promise resolved with the file URL.
     */
    async saveBase64(filename, src) {
        /** @type {string} - The path for stable storage. */
        /** @type {string} - The URL of the file. */
        let fileUrl = this.storagePath + filename;

        await ImageHelper.uploadBase64(src, filename, this.storagePath);
        return fileUrl;

    }
}
/**
 * Create a new instance of StableFileManager.
 * @type {StableFileManager}
 */
const stableFileManager = new StableFileManager();

/**
 * Export the stableFileManager as the default export of the module.
 * @type {StableFileManager}
 */
export default stableFileManager;