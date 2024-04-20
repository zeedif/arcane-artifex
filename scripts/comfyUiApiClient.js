class ComfyUiApiClient {
  constructor() {
    this.settings = {};
    this.comfyUIDefaultRequestBody = {};
  }

  async checkStatus() {
    const selectedSource = game.settings.get('arcane-artifex', 'source');

    if (selectedSource === 'comfyUi') {
        const comfyUrl = game.settings.get('arcane-artifex', 'comfyUiUrl');
        const statusUrl = `${comfyUrl}/system_stats`;

        try {
            const response = await fetch(statusUrl);

            if (response.ok) {
                console.log('ComfyUI server is accessible at:', comfyUrl);
                ui.notifications.info('ComfyUI server is accessible.');
                await game.settings.set("arcane-artifex", "connected", true);

                await this.getComfyUISettings();

                await this.initWebSocket()
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

  let stIP = await game.settings.get("arcane-artifex", "comfyUiUrl");
  let objectInfoURL = `${stIP}/object_info`;

  try {
    const response = await fetch(objectInfoURL, { method: 'GET' });

    if (response.ok) {
      this.objectInfo = await response.json();

      await game.settings.set("arcane-artifex", "comfyUiModels", this.objectInfo.CheckpointLoaderSimple.input.required.ckpt_name[0]);
      await game.settings.set("arcane-artifex", "comfyUiSamplers", this.objectInfo.KSampler.input.required.sampler_name[0]);
      await game.settings.set("arcane-artifex", "comfyUiSchedulers", this.objectInfo.KSampler.input.required.scheduler[0]);

      this.initializeOrUpdateLoras();
      await game.settings.set("arcane-artifex", "comfyUiUpscalers", this.objectInfo.UpscaleModelLoader.input.required.model_name[0]);
    } else {
      console.error('Error while attempting to access the ComfyUI object info:', response.status);
    }
  } catch (error) {
    console.error('Error while attempting to access the ComfyUI object info:', error);
  }
}


  async initializeOrUpdateLoras() {
    let loraNames = this.objectInfo.LoraLoader.input.required.lora_name[0];
    let existingLoras = game.settings.get("arcane-artifex", "comfyUiLoras");
    let updatedLoras = loraNames.map(name => {
      let foundLora = existingLoras.find(l => l.lora === name);
      if (foundLora) {
        return foundLora;
      } else {
        return { lora: name, active: false, strength: 0.5 };
      }
    });

    updatedLoras = updatedLoras.filter(lora => loraNames.includes(lora.lora));

    await game.settings.set("arcane-artifex", "comfyUiLoras", updatedLoras);
  }

  async initWebSocket() {
    const comfyUiUrl = game.settings.get('arcane-artifex', 'comfyUiUrl');
    const socketUrl = comfyUiUrl.replace('http://', 'ws://') + '/ws';
  
    try {
      const socket = new WebSocket(socketUrl);
  
      socket.addEventListener('open', (event) => {
        console.error('WebSocket connection established');
        // Perform any necessary actions upon successful connection
      });
  
      socket.addEventListener('message', (event) => {
        console.error('Received message from ComfyUI:', event.data);
        // Handle incoming messages from ComfyUI
      });
  
      socket.addEventListener('close', (event) => {
        console.error('WebSocket connection closed');
        // Perform any necessary cleanup or reconnection logic
      });
  
      socket.addEventListener('error', (event) => {
        console.error('WebSocket error occurred:', event);
        // Handle WebSocket errors
      });
  
      return socket;
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      throw error;
    }
  }



  async textToImg(prompt, message) {
    const comfyUiUrl = game.settings.get('arcane-artifex', 'comfyUiUrl');
    const apiUrl = `${comfyUiUrl}/prompt`;
    const workflowPath = "/modules/arcane-artifex/assets/comfy_workflows/arcane_artifex_simple.json";
  
    try {
      const responseWorkflow = await fetch(workflowPath);
      if (!responseWorkflow.ok) {
        throw new Error(`Failed to load workflow from local assets: ${responseWorkflow.statusText}`);
      }
      const workflow = await responseWorkflow.json();
  
      const settings = {
        model: game.settings.get("arcane-artifex", "comfyUiModel"),
        sampler: game.settings.get("arcane-artifex", "comfyUiSampler"),
        scheduler: game.settings.get("arcane-artifex", "comfyUiScheduler"),
        scale: game.settings.get("arcane-artifex", "cfgScale"),
        seed: Math.round(Math.random() * Number.MAX_SAFE_INTEGER),
        steps: game.settings.get("arcane-artifex", "samplerSteps"),
        height: game.settings.get("arcane-artifex", "sdheight"),
        width: game.settings.get("arcane-artifex", "sdwidth"),
        prompt: prompt,
        negative_prompt: game.settings.get("arcane-artifex", "negativePrompt")
      };
  
      Object.keys(workflow).forEach(key => {
        const node = workflow[key];
        if (node.inputs) {
          Object.entries(node.inputs).forEach(([inputKey, inputValue]) => {
            if (typeof inputValue === 'string' && inputValue.startsWith('%') && inputValue.endsWith('%')) {
              const settingKey = inputValue.slice(1, -1);
              if (settings[settingKey] !== undefined) {
                node.inputs[inputKey] = settings[settingKey];
              }
            }
          });
        }
      });
  
      // Wrap the workflow inside the "prompt" field
      const promptData = {
        prompt: workflow
      };
  
      game.settings.set('arcane-artifex', 'comfyRequestBody', promptData);
      console.log('Generated ComfyUI Payload:', JSON.stringify(promptData, null, 2));
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promptData)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error while generating image, status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Begin the polling process for image generation status
      await this.initProgressRequest(data.id, prompt, message);
    } catch (error) {
      console.error('Error in generating image:', error);
      ui.notifications.error(`Error while sending request to ComfyUI: ${error.message}`);
    }
  }

  async initProgressRequest(id, prompt, message) {
    const comfyUiUrl = game.settings.get('arcane-artifex', 'comfyUiUrl');
    const progressUrl = `${comfyUiUrl}/progress/${id}`;
  
    try {
      const response = await fetch(progressUrl);
      if (!response.ok) {
        throw new Error(`Failed to check progress of image generation, status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.status === 'done') {
        await this.getImage(id, prompt, message);
      } else if (data.status === 'error') {
        throw new Error(`Error while generating image: ${data.error}`);
      } else {
        console.log('Image generation in progress:', data);
        ui.notifications.info('Image generation in progress. Please wait...');
        await this.pollProgressRequest(id, prompt, message);
      }
    } catch (error) {
      console.error('Error in checking image generation progress:', error);
      ui.notifications.error(`Error while checking image generation progress: ${error.message}`);
    }
  }


}

export const comfyUiApiClient = new ComfyUiApiClient();
export default comfyUiApiClient;
