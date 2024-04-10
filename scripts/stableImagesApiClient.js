import localA1111ApiClient from "./localA1111ApiClient.js";
import comfyUiApiClient from "./comfyUiApiClient.js";
import aiHordeApiClient from "./aiHordeApiClient.js";

const apiClients = {
    automatic1111: localA1111ApiClient,
    comfyui: comfyUiApiClient,
    horde: aiHordeApiClient
  };
/**
 * Represents the stableImagesApiClient class.
 * This class handles the communication with the various image generation APIs.
 */
class stableImagesApiClient {

    /**
     * Calls the appropriate checkStatus() API call based on the selected source.
     */
    async checkStatus() {
        const selectedSource = game.settings.get('stable-images', 'source');
        
        if (selectedSource in apiClients) {
          try {
            console.error('selectedSource:', selectedSource, 'apiClients[selectedSource]:', apiClients[selectedSource]);
            const response = await apiClients[selectedSource].checkStatus();
            console.log(`${selectedSource} server is accessible:`, response);
            ui.notifications.info(`${selectedSource} server is accessible.`);
            await game.settings.set("stable-images", "connected", true);
          } catch (error) {
            console.error(`Error occurred while trying to access ${selectedSource} server:`, error);
            ui.notifications.error(`Error occurred while trying to access ${selectedSource} server; error = ${error}`);
            await game.settings.set("stable-images", "connected", false);
          }
        } else {
          console.warn(`Unknown source selected: ${selectedSource}. Skipping status check.`);
        }
      }
    
}

const stableImagesApiClient = new stableImagesApiClient();

export default stableImagesApiClient;
