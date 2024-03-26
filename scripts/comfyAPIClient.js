/**
 * Represents the comfyAPIClient class.
 * This class handles the communication with the stable diffusion API.
 */
class comfyAPIClient {
    constructor() {
        // The base URL for your ComfyUI API
        this.apiBase = "http://127.0.0.1:8188"; 
    }

    // Utility function to perform GET requests to the ComfyUI API
    async fetchApi(route) {
        const url = `${this.apiBase}${route}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                // If the server response was not OK, throw an error
                throw new Error(`API call failed with status: ${response.status}`);
            }
            return await response.json(); // Return the response data as JSON
        } catch (error) {
            console.error("Error during API call:", error);
            throw error; // Rethrow the error for further handling
        }
    }

    // Function to check the status of the queue
    async checkQueueStatus() {
        try {
            const queueStatus = await this.fetchApi("/queue");
            console.log("Queue status:", queueStatus);
            return queueStatus; // Return the queue status for further processing
        } catch (error) {
            console.error("Failed to check queue status:", error);
            // Handle the error appropriately
            // Depending on your application's needs, you might want to return a default status, notify the user, etc.
        }
    }
}

// Example usage
const comfyApiClient = new ComfyAPIClient();
comfyApiClient.checkQueueStatus().then(status => {
    // Process the queue status as needed
    // This is where you could update the UI or log the status for debugging purposes
}).catch(error => {
    // Handle any errors that occurred during the status check
});
