import chatListenner from "./ChatListenner.js";
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
         * Represents the connection status with the stable diffusion API.
         * @type {boolean}
         */
        this.connexion = false;

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
    }

    /**
     * Initializes the connection with the stable diffusion API.
     * Retrieves the server IP from the game settings and sends a HEAD request to check the server accessibility.
     */
    async initConnexion() {
        let stIP = await game.settings.get("stable-images", "stable-settings")["server-IP"];
        try {
            // Send a HEAD request to the server
            const response = await fetch(stIP, { method: 'HEAD' });
            if (response.ok) {
                ui.notifications.notify('The remote server for stable diffusion is accessible.');
                game.settings.set("stable-images", "connection", true);
                this.connexion = true;
            } else {
                console.error('The remote server for stable diffusion is not accessible : response code ', response.status);
                ui.notifications.error('The remote server for stable diffusion is not accessible : response code:' + response.status);
            }
        } catch (error) {
            console.error('Error occurred while trying to access the remote server for stable broadcasting :', error);
            ui.notifications.error('Error occurred while trying to access the remote server for stable broadcasting; error = ' + error);
        }
    }

    /**
     * Retrieves the stable diffusion settings from the game settings and initializes the class properties.
     */
    async getStableDiffusionSettings() {
        await this.getLoras();
        await this.getModels();
        await this.getStyles();
        await this.getSdOptions();
        this.settings = game.settings.get("stable-images", "stable-settings");
        this.defaultRequestBody = {
            prompt: this.settings['pre-prompt'],
            seed: -1,
            height: this.settings.height,
            width: this.settings.width,
            negative_prompt: this.settings['negative-prompt'],
            n_iter: this.settings.batchCount,
            face_restoration: this.settings.face_restoration,
            steps: this.settings.steps,
            cfg_scale: this.settings.cfgScale,
            seed: -1
        };
    }

    /**
     * Retrieves the list of loras from the stable diffusion API.
     */
    async getLoras() {
        let stIP = await game.settings.get("stable-images", "stable-settings")["server-IP"];
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
            console.error('Erreur lors de la tentative d\'accès au loras de stable diffusion :', error);
            ui.notifications.error('Erreur lors de la tentative d\'accès au loras de stable diffusion ; erreur = ' + error);
        }
    }
    async getStyles() {
        let stIP = await game.settings.get("stable-images", "stable-settings")["server-IP"];
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
            console.error('Erreur lors de la tentative d\'accès au loras de stable diffusion :', error);
            ui.notifications.error('Erreur lors de la tentative d\'accès au styles de stable diffusion ; erreur = ' + error);
        }
    }

    /**
     * Retrieves the list of models from the stable diffusion API.
     */
    async getModels() {
        let stIP = await game.settings.get("stable-images", "stable-settings")["server-IP"];
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
            console.error("Erreur lors de la tentative d\'accès au loras de stable diffusion :", error);
            ui.notifications.error("Erreur lors de la tentative d\'accès au loras de stable diffusion ; erreur = " + error);
        }
    }

    /**
     * Retrieves the stable diffusion options from the stable diffusion API.
     */
    async getSdOptions() {
        let stIP = await game.settings.get("stable-images", "stable-settings")["server-IP"];
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
            console.error("Erreur lors de la tentative d\'accès au options de stable diffusion :", error);
            ui.notifications.error("Erreur lors de la tentative d\'accès au options de stable diffusion ; erreur = " + error);
        }
    }
    postSkip() {
        let apiUrl = game.settings.get("stable-images", "stable-settings")["server-IP"] + '/sdapi/v1/skip';
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
        let apiUrl = game.settings.get("stable-images", "stable-settings")["server-IP"] + '/sdapi/v1/interrupt';
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
     * Generates the full prompt by combining the pre-prompt, user prompt, and lora prompt from the settings.
     * @param {string} userPrompt - The user input prompt
     * @returns {string} - The full prompt
     */
    getFullPrompt(userPrompt) {
        return this.settings['pre-prompt'] + ', ' + userPrompt + ', ' + this.settings.loraPrompt;
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
        let apiUrl = this.settings['server-IP'] + '/sdapi/v1/txt2img/';
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
        let stIP = await game.settings.get("stable-images", "stable-settings")["server-IP"];
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
        requestBody.denoising_strength = this.settings.imgDenoising;
        let apiUrl = this.settings['server-IP'] + '/sdapi/v1/img2img/';
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
    async initProgressRequest(message) {
        // Get the settings value
        let apiUrl = this.settings['server-IP'] + '/sdapi/v1/progress';
        // Send a GET request to the stable diffusion API to get the progress
        fetch(apiUrl)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Request failed with status ' + response.status);
                }
            })
            .then(async data => {
                chatListenner.displayProgress(message, data)

                // Get the HTML elements

                if (data.progress < 0.99) {
                    // Call the initProgressRequest function again after a delay if the progress is not complete
                    setTimeout(() => { this.initProgressRequest(message) }, 1000);
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