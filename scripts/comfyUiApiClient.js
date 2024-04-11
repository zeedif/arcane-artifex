class ComfyUIAPIClient {
  constructor() {
    this.settings = {};
    this.comfyUIDefaultRequestBody = {};
    this.comfyUIModels = [];
    this.comfyUILoras = [];
    this.comfyUIStyles = [];
    this.comfyUISamplers = [];
    this.comfyUIUpscalers = [];
}
  async checkStatus() {
    const selectedSource = game.settings.get('stable-images', 'source');
  
    if (selectedSource === 'comfyUI') {
      const comfyUrl = game.settings.get('stable-images', 'comfyui_url');
      const statusUrl = `${comfyUrl}/system_stats`;
  
      try {
        const response = await fetch(statusUrl);
  
        if (response.ok) {
          console.log('ComfyUI server is accessible at:', comfyUrl);
          ui.notifications.info('ComfyUI server is accessible.');
          await game.settings.set("stable-images", "connected", true);
          await this.getComfyUISettings();
          return 'ComfyUI API is accessible.';
        } else {
          console.error('ComfyUI server is not accessible: response code', response.status, 'at URL:', comfyUrl);
          ui.notifications.error(`ComfyUI server is not accessible: response code: ${response.status}`);
          await game.settings.set("stable-images", "connected", false);
          throw new Error(`ComfyUI API returned an error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error occurred while trying to access ComfyUI server at URL:', comfyUrl, '; error =', error);
        ui.notifications.error(`Error occurred while trying to access ComfyUI server; error = ${error}`);
        await game.settings.set("stable-images", "connected", false);
      }
    } else {
      console.warn("ComfyUI is not selected. Skipping ComfyUI status check.");
      return 'ComfyUI is not selected. Skipping ComfyUI status check.';
    }
  }




  async getComfyUISettings() {
    const connection = game.settings.get('stable-images', 'connected');
  
    if (!connection) {
      console.warn("Local ComfyUI connection not established. Skipping API calls.");
      return;
    }
    let stIP = await game.settings.get("stable-images", "comfyui_url");
    let objectInfoURL = `${stIP}/object_info`;
    try {
      const response = await fetch(objectInfoURL, { method: 'GET' });
      if (response.ok) {
        this.objectInfo = await response.json();
        console.error("Object Info:", this.objectInfo);
        this.comfyUIModels = this.objectInfo.CheckpointLoaderSimple.input.required.ckpt_name[0];
        this.comfyUISamplers = this.objectInfo.KSampler.input.required.sampler_name[0];
        this.comfyUISchedulers = this.objectInfo.KSampler.input.required.scheduler[0];
        this.comfyUILoras = this.objectInfo.LoraLoader.input.required.lora_name[0];
        this.comfyUIUpscalers = this.objectInfo.UpscaleModelLoader.input.required.model_name[0];
        console.error("Models:", this.comfyUIModels );
        console.error("Samplers:", this.comfyUISamplers);
        console.error("Schedulers:", this.comfyUISchedulers);
        console.error("Loras:", this.comfyUILoras);
        console.error("Upscalers:", this.comfyUIUpscalers);

      } else {
        console.error('Error while attempting to access the ComfyUI object info:', response.status);
      }
    } catch (error) {
      console.error('Error while attempting to access the ComfyUI object info:', error);
    }
  
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




export const comfyUIApiClient = new ComfyUIAPIClient();
export default comfyUIApiClient;
