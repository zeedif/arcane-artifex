class comfyAPIClient {
    constructor() {
        console.error("comfyAPIClient initialized");
    }

    async checkQueueStatus() {
        console.error("Checking queue status...");
        // Simulated response
        return { queue_running: [], queue_pending: [] };
    }
}

const comfyApiClient = new comfyAPIClient();

export default comfyApiClient;
