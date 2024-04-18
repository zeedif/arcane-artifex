import chatListener from "./ChatListener.js";

class LocalA1111APIClient {
    constructor() {
        this.settings = {};
    }

async checkStatus() {
        const selectedSource = game.settings.get('stable-images', 'source');
    
        if (selectedSource === 'localA1111') {
            const a1111url = game.settings.get('stable-images', 'localA1111URL');
            const statusUrl = a1111url;
    
            try {
                const response = await fetch(statusUrl, { method: 'HEAD' });
                console.log("response:", response);
                if (response.ok) {
                    console.log('A1111 server is accessible at:', a1111url);
                    ui.notifications.info('A1111 server is accessible.');
                    await game.settings.set("stable-images", "connected", true);
                    await this.getLocalA1111Settings();
                    return 'A1111 API is accessible.';
                } else {
                    console.error('A1111 server is not accessible: response code', response.status, 'at URL:', a1111url);
                    ui.notifications.error(`A1111 server is not accessible: response code: ${response.status}`);
                    await game.settings.set("stable-images", "connected", false);
                    throw new Error(`A1111 API returned an error: ${response.status}`);
                }
            } catch (error) {
                console.error('Error occurred while trying to access A1111 server at URL:', a1111url, '; error =', error);
                ui.notifications.error(`Error occurred while trying to access A1111 server; error = ${error}`);
                await game.settings.set("stable-images", "connected", false);
            }
        } else {
            console.warn("Local A1111 is not selected. Skipping A1111 status check.");
            return 'Local A1111 is not selected. Skipping A1111 status check.';
        }
    }
    

    async getLocalA1111Settings() {
        const connection = game.settings.get('stable-images', 'connected');

        if (!connection) {
            console.warn("Local A1111 Stable Diffusion connection not established. Skipping API calls.");
            return;
        }
        await this.getA1111EndpointSettings();

        this.settings = game.settings.get("stable-images", "stable-settings");
        console.log("Settings:", this.settings);

        await game.settings.set("stable-images", "localA1111RequestBody",  {
            prompt: game.settings.get("stable-images", "promptPrefix"),
            seed: -1,
            height: game.settings.get("stable-images", "sdheight"),
            width: game.settings.get("stable-images", "sdwidth"),
            negative_prompt: game.settings.get("stable-images", "negativePrompt"),
            n_iter: game.settings.get("stable-images", "numImages"),
            restore_faces: game.settings.get("stable-images", "restoreFaces"),
            steps: game.settings.get("stable-images", "samplerSteps"),
            sampler_name: game.settings.get("stable-images", "localA1111Sampler"),
            enable_hr: game.settings.get("stable-images", "enableHr"),
            hr_upscaler: game.settings.get("stable-images", "localA1111Upscaler"),
            hr_scale: game.settings.get("stable-images", "hrScale"),
            denoising_strength: game.settings.get("stable-images", "denoisingStrength"),
            hr_second_pass_steps: game.settings.get("stable-images", "hrSecondPassSteps"),
            cfg_scale: game.settings.get("stable-images", "cfgScale")
        });
        console.log("Default Request Body:", game.settings.get("stable-images", "localA1111RequestBody"));
    }

    async getA1111EndpointSettings() {
        const stIP = await game.settings.get("stable-images", "localA1111URL");
        try {
            const lorasResponse = await fetch(`${stIP}/sdapi/v1/loras`, { method: 'GET' });
            if (lorasResponse.ok) {
                game.settings.set("stable-images", "localA1111Loras", await lorasResponse.json());
            }

            const stylesResponse = await fetch(`${stIP}/sdapi/v1/prompt-styles`, { method: 'GET' });
            if (stylesResponse.ok) {
                game.settings.set("stable-images", "localA1111Styles", await stylesResponse.json());
            }

            const modelsResponse = await fetch(`${stIP}/sdapi/v1/sd-models`, { method: 'GET' });
            if (modelsResponse.ok) {
                game.settings.set("stable-images", "localA1111Models", await modelsResponse.json());
            }

            const samplersResponse = await fetch(`${stIP}/sdapi/v1/samplers`, { method: 'GET' });
            if (samplersResponse.ok) {
                game.settings.set("stable-images", "localA1111Samplers", await samplersResponse.json());
            }

            const upscalersResponse = await fetch(`${stIP}/sdapi/v1/upscalers`, { method: 'GET' });
            if (upscalersResponse.ok) {
                game.settings.set("stable-images", "localA1111Upscalers", await upscalersResponse.json());
            }

            const optionsResponse = await fetch(`${stIP}/sdapi/v1/options`, { method: 'GET' });
            if (optionsResponse.ok) {
                game.settings.set("stable-images", "localA1111SDOptions", await optionsResponse.json());
            }

        } catch (error) {
            console.error("Error while attempting to access A1111 API endpoints:", error);
        }
    }

  async textToImg(prompt, message) {

    let requestBody = deepClone(game.settings.get("stable-images", "localA1111RequestBody"));
      requestBody.prompt = this.getFullPrompt(prompt);
      await game.settings.set("stable-images", "fullPrompt", requestBody.prompt)
      let apiUrl = `${game.settings.get("stable-images", "localA1111URL")}/sdapi/v1/txt2img/`;
      await game.settings.set("stable-images", "working", true);
    
      try {
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(requestBody)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            chatListener.createImage(data, prompt, message);
            game.settings.set("stable-images", "working", false);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      } catch (e) {
        ui.notifications.warn('Error while sending request to stable diffusion');
        console.error('Catch error:', e);
      }
    }
    
    
  getFullPrompt(userPrompt) {
    return `${this.settings['prompt_prefix']}, ${userPrompt}, ${this.settings.loraPrompt}`;
}

async initProgressRequest(message, attempt = 0, currentState = "undefined") {
  const maxAttempts = 100;
  if (attempt >= maxAttempts) {
      console.warn("stable-images: Max progress check attempts reached, stopping further checks.");
      return;
  }

  if (currentState === "undefined" && attempt === 0) {
      currentState = "idle";
  }

  let apiUrl = `${game.settings.get("stable-images", "localA1111URL")}/sdapi/v1/progress`;
  fetch(apiUrl)
      .then(response => {
          if (!response.ok) {
              throw new Error('Request failed with status ' + response.status);
          }
          return response.json();
      })
      .then(async data => {
          chatListener.displayProgress(message, data);

          if ((currentState === "idle" || currentState === "waiting") && data.progress === 0) {
              if (currentState === "idle") {
                  console.log("stable-images: State transition to 'waiting'");
              }
              currentState = "waiting";
              setTimeout(() => { this.initProgressRequest(message, attempt + 1, currentState) }, 1500);
          } else if (currentState === "waiting" && data.progress > 0) {
              currentState = "processing";
              console.log("stable-images: State transition to 'processing'");
              setTimeout(() => { this.initProgressRequest(message, attempt + 1, currentState) }, 1500);
          } else if (currentState === "processing" && data.progress < 1.0) {
              console.log("stable-images: In 'processing' state, progress: " + data.progress + ", attempt: " + attempt);
              setTimeout(() => { this.initProgressRequest(message, attempt + 1, currentState) }, 1500);
          }

          if (currentState === "processing" && (data.progress === 0 || data.progress === 1)) {
              currentState = "done";
              console.log("stable-images: State transition to 'done'");
          }
      })
      .catch(error => {
          console.error('Error fetching progress:', error);
      });
}



}

const localA1111APIClient = new LocalA1111APIClient();

export default localA1111APIClient;
