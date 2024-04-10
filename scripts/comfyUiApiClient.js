class ComfyUiApiClient {
    async checkStatus() {
        // Retrieve the selected source from the game settings
        const selectedSource = game.settings.get('stable-images', 'source');

        if (selectedSource === 'comfyUi') { 
          const comfyUrl = game.settings.get('stable-images', 'comfyui_url');
          const statusUrl = `${comfyUrl}/system_stats`;

          try {
            const response = await fetch(statusUrl);
            if (response.ok) {
              console.log('ComfyUI server is accessible at:', comfyUrl);
              ui.notifications.info('ComfyUI server is accessible.');
              return 'ComfyUI API is accessible.';
            } else {
              console.error('ComfyUI server is not accessible: response code', response.status, 'at URL:', comfyUrl);
              ui.notifications.error(`ComfyUI server is not accessible: response code: ${response.status}`);
              throw new Error(`ComfyUI API returned an error: ${response.status}`);
            }
          } catch (error) {
              console.error('Error occurred while trying to access ComfyUI server at URL:', comfyUrl, '; error =', error);
              ui.notifications.error(`Error occurred while trying to access ComfyUI server; error = ${error}`);
          }
        } else {
          console.log("Stable Horde is not selected. Skipping ComfyUI status check.");

          return 'Stable Horde is not selected. Skipping ComfyUI status check.';
        }
    }
}
export const comfyUiApiClient = new ComfyUiApiClient();
export default comfyUiApiClient;


