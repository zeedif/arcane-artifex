import chatListenner from "./ChatListenner.js";
import { defaultSettings } from './registerSettings.js';
/**
 * Represents the SdAPIClient class.
 * This class handles the communication with the stable diffusion API.
 */
class SdAPIClient {
    /**
     * Constructs a new instance of the SdAPIClient class.
     * Initializes the class properties.
     */
    constructor() {
        /**
         * Represents the settings for the stable diffusion API.
         * @type {Object}
         */
        this.settings = {};

        /**
         * Represents the default request body for API requests.
         * @type {Object}
         */
        this.defaultRequestBody = {};

        /**
         * Represents the working status of the API client.
         * @type {boolean}
         */
        this.working = false;

        /**
         * Represents the list of loras retrieved from the API.
         * @type {Array}
         */
        this.loras = [];
        this.styles = [];
        this.samplers = [];
    }

    /**
     * Initializes the connection with the stable diffusion API.
     * Retrieves the server IP from the game settings and sends a HEAD request to check the server accessibility.
     */
    async checkStatus() {
        // Retrieve the selected source from the game settings
        const selectedSource = game.settings.get('stable-images', 'source');
    
        // Only proceed if the stableHorde option is selected
        if (selectedSource === 'automatic1111') { 
          const a1111url = game.settings.get('stable-images', 'auto_url');
          const statusUrl = a1111url;
          
          try {
            const response =await fetch(statusUrl, { method: 'HEAD' });
            console.log("response:", response);
            if (response.ok) {
              console.log('A1111 server is accessible at:', a1111url);
              ui.notifications.info('A1111 server is accessible.');
              await game.settings.set("stable-images", "connected", true);
              this.getLocalA1111Settings();
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
          console.warn("Local A1111 is not selected. Skipping Local A1111 status check.");
          // Optionally, you could return a message or handle the skipped check appropriately
          return 'Local A1111 is not selected. Skipping Local A1111 status check.';
        }
      }


    /**
     * Retrieves the stable diffusion settings from the game settings and initializes the class properties.
     */
    async getLocalA1111Settings() {

        const connection = game.settings.get('stable-images', 'connected');

        if (!connection) {
          console.warn("Stable Diffusion connection not established. Skipping API calls.");
          return;
        }
      
        await this.getLoras();
        await this.getModels();
        await this.getStyles();
        await this.getSdOptions();
        await this.getSamplers();
      
        this.settings = game.settings.get("stable-images", "stable-settings");
        console.log("Settings:", this.settings);
      
        this.defaultRequestBody = {
          prompt: game.settings.get("stable-images", "promptPrefix"),
          seed: -1,
          height: game.settings.get("stable-images", "sdheight"),
          width: game.settings.get("stable-images", "sdwidth"),
          negative_prompt: game.settings.get("stable-images", "negativePrompt"),
          n_iter: this.settings.batchCount,
          restore_faces: game.settings.get("stable-images", "restoreFaces"),
          steps: game.settings.get("stable-images", "samplerSteps"),
          sampler_name: game.settings.get("stable-images", "a1111Sampler"),
          cfg_scale: game.settings.get("stable-images", "cfgScale")
        };
        console.log("Default Request Body:", this.defaultRequestBody);

        console.log("SD Options:", this.sdOptions);
        console.log("Samplers:", this.samplers);
      }

    /**
     * Retrieves the list of loras from the stable diffusion API.
     */
    async getLoras() {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let lorasUrl = stIP + '/sdapi/v1/loras';
        try {
            // Send a GET request to the server
            const response = await fetch(lorasUrl, { method: 'GET' });
            if (response.ok) {
                this.loras = await response.json();
            } else {
                // Handle error
            }
        } catch (error) {
            console.error('Error while attempting to access the stable diffusion loras:', error);
        }
    }
    async getStyles() {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let styleUrl = stIP + '/sdapi/v1/prompt-styles';
        try {
            // Send a GET request to the server
            const response = await fetch(styleUrl, { method: 'GET' });
            if (response.ok) {
                this.styles = await response.json();
            } else {
                // Handle error
            }
        } catch (error) {
            console.error('Error while attempting to access the stable diffusion styles:', error);
        }
    }

    /**
     * Retrieves the list of models from the stable diffusion API.
     */
    async getModels() {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let modelsUrl = stIP + '/sdapi/v1/sd-models';
        try {
            // Send a GET request to the server
            const response = await fetch(modelsUrl, { method: 'GET' });
            if (response.ok) {
                this.models = await response.json();
            } else {
                // Handle error
            }
        } catch (error) {
            console.error("Error while attempting to access the stable diffusion models:", error);
        }
    }

    /**
     * Retrieves the stable diffusion options from the stable diffusion API.
     */
    async getSdOptions() {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let optionsUrl = stIP + '/sdapi/v1/options';
        try {
            // Send a GET request to the server
            const response = await fetch(optionsUrl, { method: 'GET' });
            if (response.ok) {
                this.sdOptions = await response.json();
            } else {
                // Handle error
            }
        } catch (error) {
            console.error("Error while attempting to access the stable diffusion options:", error);
        }
    }
    async getSamplers() {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let samplersUrl = stIP + '/sdapi/v1/samplers';
        try {
            const response = await fetch(samplersUrl, { method: 'GET' });
            if (response.ok) {
                this.samplers = await response.json();
            } else {
                console.error(`Error while trying to access the samplers from stable diffusion: Status Code ${response.status} - ${response.statusText}`);
                ui.notifications.error(`Error while trying to access the samplers from stable diffusion; error = Status Code ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error while trying to access the samplers from stable diffusion:", error);
            ui.notifications.error(`Error while trying to access the samplers from stable diffusion; error = ${error}`);
        }
    }
    
    
    postSkip() {
        let apiUrl = game.settings.get("stable-images", "auto_url") + '/sdapi/v1/skip';
        try {
            // Send a POST request to the stable diffusion API
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch (e) {
            ui.notifications.warn('Error while sending request to stable diffusion');
        }
    }
    postInterrupt() {
        let apiUrl = game.settings.get("stable-images", "auto_url") + '/sdapi/v1/interrupt';
        try {
            // Send a POST request to the stable diffusion API
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch (e) {
            ui.notifications.warn('Error while sending request to stable diffusion');
        }
    }
    /**
     * Generates the full prompt by combining the prompt_prefix, user prompt, and lora prompt from the settings.
     * @param {string} userPrompt - The user input prompt
     * @returns {string} - The full prompt
     */
    getFullPrompt(userPrompt) {
        return this.settings['prompt_prefix'] + ', ' + userPrompt + ', ' + this.settings.loraPrompt;
    }

    /**
     * Converts a text prompt to an image using the stable diffusion API.
     * @param {string} prompt - The text prompt
     * @param {Message} message - The chat message object
     */
    async textToImg(prompt, message) {
        if (this.working) {
            return ui.notifications.warn("please wait until previous job is finished");
        }
        let requestBody = deepClone(this.defaultRequestBody);
        requestBody.prompt = this.getFullPrompt(prompt);
        let apiUrl = game.settings.get("stable-images", "auto_url") + '/sdapi/v1/txt2img/';
        this.working = true;
        console.log('requestBody', requestBody);
        try {
            // Send a POST request to the stable diffusion API
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
                    // Create the image based on the response data
                    chatListenner.createImage(data, prompt, message);
                    this.working = false;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch (e) {
            ui.notifications.warn('Error while sending request to stable diffusion');
        }
    }

    /**
     * Changes the model used by the stable diffusion API.
     * @param {string} title - The title of the model to change to
     * @returns {Promise}
     */
    async changeModel(title) {
        return await this.postOption({
            sd_model_checkpoint: title,
        });
    }
    /**
     * Sends a POST request to the stable diffusion API to update an option.
     * @param {Object} option - The option to update
     * @returns {Promise}
     */
    async postOption(option) {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let optionsUrl = stIP + '/sdapi/v1/options';
        try {
            // Send a POST request to the server
            fetch(optionsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(option)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(async () => {
                    // Update the sdOptions after successful update
                    await this.getSdOptions();
                    if (ui.activeWindow.title == "settings for stable diffusion image generation") {
                        ui.activeWindow.render(true);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch (e) {
            ui.notifications.warn('Error while sending request to stable diffusion');
        }
    }

    /**
     * Converts an image to another image using the stable diffusion API.
     * @param {string} prompt - The text prompt
     * @param {Message} message - The chat message object
     * @param {string} source - The source image data
     */
    async imgToImg(prompt, message, source) {
        if (this.working) {
            return ui.notifications.warn("please wait until previous job is finished");
        }
        let requestBody = deepClone(this.defaultRequestBody);
        requestBody.prompt = this.getFullPrompt(prompt);
        requestBody.init_images = [source];
        requestBody.denoising_strength = this.settings.denoising_strength;
        let apiUrl = game.settings.get("stable-images", "auto_url") + '/sdapi/v1/img2img/';
        this.working = true;
        try {
            // Send a POST request to the stable diffusion API
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
                    // Create the image based on the response data
                    chatListenner.createImage(data, prompt, message);
                    this.working = false;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch (e) {
            ui.notifications.warn('Error while sending request to stable diffusion');
        }
    }

    /**
     * Initializes a progress request to track the progress of an image generation.
     * @param {Message} message - The chat message object
     */
    async initProgressRequest(message, attempt = 0, currentState = "undefined") {
        const maxAttempts = 100; // Maximum number of attempts to check progress
        if (attempt >= maxAttempts) {
            console.warn("stable-images: Max progress check attempts reached, stopping further checks.");
            return; // Exit if the maximum number of attempts has been reached
        }
    
        if (currentState === "undefined" && attempt === 0) {
            currentState = "idle";
        }
    
        let apiUrl = game.settings.get("stable-images", "auto_url") + '/sdapi/v1/progress';
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Request failed with status ' + response.status);
                }
                return response.json();
            })
            .then(async data => {
                chatListenner.displayProgress(message, data);
    
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

/**
 * Represents an instance of the SdAPIClient class.
 * @type {SdAPIClient}
 */
const sdAPIClient = new SdAPIClient();

export default sdAPIClient;