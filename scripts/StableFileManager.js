class StableFileManager {
    constructor() {
        this.storagePath = '';
    }

    async checkFileExists(filename) {
        try {
            const response = await fetch(`${game.settings.get('stable-images', 'stableStoragePath')}/${filename}`, { method: 'HEAD' });
            if (response.ok) {
                return true;
            }
        } catch (error) {
            console.warn(error);
            return false;
        }
        return false;
    }

    async saveBase64(filename, src) {
        const fileUrl = `${game.settings.get('stable-images', 'stableStoragePath')}/${filename}`;
        await ImageHelper.uploadBase64(src, filename, game.settings.get('stable-images', 'stableStoragePath'));
        return fileUrl;
    }
}

const stableFileManager = new StableFileManager();
export default stableFileManager;
