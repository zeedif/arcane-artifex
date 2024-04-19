class ComfyUIAPIClient {
  constructor() {
    this.settings = {};
    this.comfyUIDefaultRequestBody = {};
  }

  async checkStatus() {
    const selectedSource = game.settings.get('arcane-artifex', 'source');

    if (selectedSource === 'comfyUI') {
      const comfyUrl = game.settings.get('arcane-artifex', 'comfyUIURL');
      const statusUrl = `${comfyUrl}/system_stats`;

      try {
        const response = await fetch(statusUrl);

        if (response.ok) {
          console.log('ComfyUI server is accessible at:', comfyUrl);
          ui.notifications.info('ComfyUI server is accessible.');
          await game.settings.set("arcane-artifex", "connected", true);
          await this.getComfyUISettings();
          return 'ComfyUI API is accessible.';
        } else {
          console.error('ComfyUI server is not accessible: response code', response.status, 'at URL:', comfyUrl);
          ui.notifications.error(`ComfyUI server is not accessible: response code: ${response.status}`);
          await game.settings.set("arcane-artifex", "connected", false);
          throw new Error(`ComfyUI API returned an error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error occurred while trying to access ComfyUI server at URL:', comfyUrl, '; error =', error);
        ui.notifications.error(`Error occurred while trying to access ComfyUI server; error = ${error}`);
        await game.settings.set("arcane-artifex", "connected", false);
      }
    } else {
      console.log("ComfyUI is not selected. Skipping ComfyUI status check.");
      return 'ComfyUI is not selected. Skipping ComfyUI status check.';
    }
  }

  async getComfyUISettings() {
    const connection = game.settings.get('arcane-artifex', 'connected');

    if (!connection) {
      console.warn("Local ComfyUI connection not established. Skipping API calls.");
      return;
    }

    let stIP = await game.settings.get("arcane-artifex", "comfyUIURL");
    let objectInfoURL = `${stIP}/object_info`;

    try {
      const response = await fetch(objectInfoURL, { method: 'GET' });

      if (response.ok) {
        this.objectInfo = await response.json();
        await game.settings.set("arcane-artifex", "comfyUIModels", this.objectInfo.CheckpointLoaderSimple.input.required.ckpt_name[0]);
        await game.settings.set("arcane-artifex", "comfyUISamplers", this.objectInfo.KSampler.input.required.sampler_name[0]);
        await game.settings.set("arcane-artifex", "comfyUISchedulers", this.objectInfo.KSampler.input.required.scheduler[0]);
        this.initializeOrUpdateLoras();
        await game.settings.set("arcane-artifex", "comfyUIUpscalers", this.objectInfo.UpscaleModelLoader.input.required.model_name[0]);
      } else {
        console.error('Error while attempting to access the ComfyUI object info:', response.status);
      }
    } catch (error) {
      console.error('Error while attempting to access the ComfyUI object info:', error);
    }

    this.settings = game.settings.get("arcane-artifex", "stable-settings");
    console.log("Settings:", this.settings);

    this.defaultRequestBody = {
      prompt: game.settings.get("arcane-artifex", "promptPrefix"),
      seed: -1,
      height: game.settings.get("arcane-artifex", "sdheight"),
      width: game.settings.get("arcane-artifex", "sdwidth"),
      negative_prompt: game.settings.get("arcane-artifex", "negativePrompt"),
      n_iter: game.settings.get("arcane-artifex", "numImages"),
      restore_faces: game.settings.get("arcane-artifex", "restoreFaces"),
      steps: game.settings.get("arcane-artifex", "samplerSteps"),
      sampler_name: game.settings.get("arcane-artifex", "localA1111Sampler"),
      enable_hr: game.settings.get("arcane-artifex", "enableHr"),
      hr_upscaler: game.settings.get("arcane-artifex", "localA1111Upscaler"),
      hr_scale: game.settings.get("arcane-artifex", "hrScale"),
      denoising_strength: game.settings.get("arcane-artifex", "denoisingStrength"),
      hr_second_pass_steps: game.settings.get("arcane-artifex", "hrSecondPassSteps"),
      cfg_scale: game.settings.get("arcane-artifex", "cfgScale")
    };
    console.log("Default Request Body:", this.defaultRequestBody);
  }

  async initializeOrUpdateLoras() {
    let loraNames = this.objectInfo.LoraLoader.input.required.lora_name[0];
    let existingLoras = game.settings.get("arcane-artifex", "comfyUILoras");
    let updatedLoras = loraNames.map(name => {
      let foundLora = existingLoras.find(l => l.lora === name);
      if (foundLora) {
        return foundLora;
      } else {
        return { lora: name, active: false, strength: 0.5 };
      }
    });

    updatedLoras = updatedLoras.filter(lora => loraNames.includes(lora.lora));

    await game.settings.set("arcane-artifex", "comfyUILoras", updatedLoras);
  }
}

export const comfyUIApiClient = new ComfyUIAPIClient();
export default comfyUIApiClient;
