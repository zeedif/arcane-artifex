class ComfyUIAPIClient {
  async checkStatus() {
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
      console.log("ComfyUI is not selected. Skipping ComfyUI status check.");
      return 'ComfyUI is not selected. Skipping ComfyUI status check.';
    }
  }
  async getComfyUISettings() {
    const connection = game.settings.get('stable-images', 'connected');

    if (!connection) {
        console.warn("Local ComfyUI connection not established. Skipping API calls.");
        return;
    }


    
    await this.getLoras();
    await this.getModels();
    await this.getStyles();
    await this.getSdOptions();
    await this.getSamplers();
    await this.getUpscalers();

    this.settings = game.settings.get("stable-images", "stable-settings");
    console.log("Settings:", this.settings);

    this.defaultRequestBody = {
        prompt: game.settings.get("stable-images", "promptPrefix"),
        seed: -1,
        height: game.settings.get("stable-images", "sdheight"),
        width: game.settings.get("stable-images", "sdwidth"),
        negative_prompt: game.settings.get("stable-images", "negativePrompt"),
        n_iter: game.settings.get("stable-images", "numImages"),
        restore_faces: game.settings.get("stable-images", "restoreFaces"),
        steps: game.settings.get("stable-images", "samplerSteps"),
        sampler_name: game.settings.get("stable-images", "a1111Sampler"),
        enable_hr: game.settings.get("stable-images", "enableHr"),
        hr_upscaler: game.settings.get("stable-images", "a1111Upscaler"),
        hr_scale: game.settings.get("stable-images", "hrScale"),
        denoising_strength: game.settings.get("stable-images", "denoisingStrength"),
        hr_second_pass_steps: game.settings.get("stable-images", "hrSecondPassSteps"),
        cfg_scale: game.settings.get("stable-images", "cfgScale")
    };
    console.log("Default Request Body:", this.defaultRequestBody);
}




  
}




export const comfyUiApiClient = new ComfyUIAPIClient();
export default comfyUiApiClient;
