class ComfyUIAPIClient {
  constructor() {
    this.settings = {};
    this.defaultRequestBody = {};
    this.models = [];
    this.loras = [];
    this.styles = [];
    this.samplers = [];
    this.upscalers = [];
}
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
        this.models = this.objectInfo.CheckpointLoaderSimple.input.required.ckpt_name[0];
        this.samplers = this.objectInfo.KSampler.input.required.sampler_name[0];
        this.schedulers = this.objectInfo.KSampler.input.required.scheduler[0];
        this.loras = this.objectInfo.LoraLoader.input.required.lora_name[0];
        this.upscalers = this.objectInfo.UpscaleModelLoader.input.required.model_name[0];
        console.error("Models:", this.models);
        console.error("Samplers:", this.samplers);
        console.error("Schedulers:", this.schedulers);
        console.error("Loras:", this.loras);
        console.error("Upscalers:", this.upscalers);
        
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




export const comfyUiApiClient = new ComfyUIAPIClient();
export default comfyUiApiClient;
