// a1111ApiClient.js
import chatListener from "./ChatListener.js";

class A1111ApiClient {
    constructor() {
        this.settings = {};
    }

    async checkStatus() {
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
    console.error("DEBUG: LocalA1111ApiClient:textToImg:prompt", prompt);
    console.error("DEBUG: LocalA1111ApiClient:textToImg:message", message);

    let requestBody = deepClone(game.settings.get("stable-images", "localA1111RequestBody"));
      requestBody.prompt = this.getFullPrompt(prompt);
      await game.settings.set("stable-images", "fullPrompt", requestBody.prompt)
      let apiUrl = `${game.settings.get("stable-images", "localA1111URL")}/sdapi/v1/txt2img/`;
      await game.settings.set("stable-images", "working", true);
      console.error('LocalA1111ApiClient:txtToImg:requestBody', requestBody);
    
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
            console.error('Received data from A1111 API:', JSON.stringify(data, null, 2));
            console.error("DEBUG: LocalA1111ApiClient:textToImg:prompt", prompt);
            console.error("DEBUG: LocalA1111ApiClient:textToImg:message", message);
            console.error("DEBUG: LocalA1111ApiClient:textToImg:data", data);
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

}

const a1111ApiClient = new A1111ApiClient();

export default a1111ApiClient;
