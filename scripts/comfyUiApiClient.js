import stableFileManager from "./StableFileManager.js";
import chatListener from "./ChatListener.js";

class ComfyUiApiClient {
  constructor() {
    this.settings = {};
    this.comfyUIDefaultRequestBody = {};
    this.socket = null;
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
                //await this.initWebSocket()
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

async textToImg(prompt, message) {
  // takes a prompt and constructs a workflow to send to ComfyUI, then sends a POST request to ComfyUI and hands off to a websocket for image status updates and retrieval

  const stIP = await game.settings.get("arcane-artifex", "comfyUiUrl");
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

      // Substitute settings into the workflow
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

      const jsonPayload = JSON.stringify({ prompt: workflow });
        const url = `${stIP}/prompt`;
        const reqHeaders = {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'User-Agent': 'FoundryVTT/1.0'
        };
        const fetchOptions = {
            method: 'POST',
            body: jsonPayload,
            headers: reqHeaders
        };

        const fetchResponse = await fetch(url, fetchOptions);
        if (!fetchResponse.ok) {
            throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
        }
        const responseContent = await fetchResponse.json();
        const promptId = responseContent.prompt_id;
        console.error('Captured prompt_id:', promptId);

        this.initWebSocketEventListeners(promptId, message);

    } catch (error) {
        console.error('Error in txt2Img:', error);
    }
}


async initWebSocketEventListeners(promptId, message) {
  const stIP = await game.settings.get("arcane-artifex", "comfyUiUrl");
  const socketUrl = stIP.replace('http://', 'ws://') + '/ws';
  const socket = new WebSocket(socketUrl);
  socket.promptId = promptId;

  socket.addEventListener('open', () => {
    console.log('WebSocket connection established, with promptID:', socket, socket.promptId);
  });

  socket.addEventListener('message', async (event) => {
    if (event.data instanceof Blob) {
      console.error('Received Blob data from ComfyUI:', event.data);
      const objectURL = URL.createObjectURL(event.data);
      console.log('Object URL for Blob:', objectURL);
    } else if (typeof event.data === 'string') {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'status') {
          console.warn(`Queue remaining: ${data.data.status.exec_info.queue_remaining}`);
          if (data.data.status.exec_info.queue_remaining === 0) {
            const historyUrl = `${stIP}/history`;
            const historyResponse = await fetch(historyUrl);
            const historyData = await historyResponse.json(); 
            const processInfo = historyData[promptId];
            if (processInfo && processInfo.status.status_str === "success" && processInfo.status.completed) {
                const outputImages = processInfo.outputs["9"].images;
                for (const image of outputImages) {
                    const imageUrlParams = new URLSearchParams({
                        filename: image.filename,
                        subfolder: image.subfolder,
                        type: image.type
                    });
                    const viewUrl = `${stIP}/view?${imageUrlParams}`;
                    console.error('View Image URL:', viewUrl);
                    // This URL can be used directly in a web browser to view/download the image
                }
            }
        }else{
          // Tell chatListener to update the UI with the queue position
          const progressData = {
              prompt_id: data.data.prompt_id,
              current_steps: 0,
              max_steps: 0,
              queue_position: data.data.status.exec_info.queue_remaining
          };
          chatListener.displayComfyUiProgress(message, progressData);
        }
      } else if (data.type === 'progress') {
        console.warn(`Progress update: ${data.data.value}/${data.data.max} for prompt ID ${data.data.prompt_id}`);
    
        // Create a structured data object
        const progressData = {
            prompt_id: data.data.prompt_id,  // Unique identifier for the prompt/message
            current_steps: data.data.value,  // Current steps completed
            max_steps: data.data.max,        // Total steps to complete the task
            queue_position: 0  // Position in the queue, if applicable
        };
    
        // Pass the structured data to console.error for inspection
        console.error('Progress Data Structure:', progressData);
    
        // This line will be used to update the UI, commented out for now
        chatListener.displayComfyUiProgress(message, progressData);
    }
    
      } catch (error) {
        console.error('Error parsing message from ComfyUI:', error, 'Original message:', event.data);
      }
    } else {
      console.error('Received non-string data from ComfyUI:', event.data);
    }
  });

  socket.addEventListener('close', () => {
    console.log('WebSocket connection closed');
  });

  socket.addEventListener('error', (event) => {
    console.error('WebSocket error occurred:', event);
  });
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

}

export const comfyUiApiClient = new ComfyUiApiClient();
export default comfyUiApiClient;
