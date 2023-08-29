import chatListenner from "./ChatListenner.js";

class SdAPIClient {
    constructor() {
        this.connexion = false;
        this.settings = {};
        this.defaultRequestBody = {};
        this.working = false;
    }
    async initConnexion() {
        let stIP = await game.settings.get("stable-images", "stable-settings")["server-IP"];
        try {
            // Envoi d'une requête HEAD au serveur
            const response = await fetch(stIP, { method: 'HEAD' });

            if (response.ok) {
                ui.notifications.notify('Le serveur distant de stable diffusion est accessible.');
                game.settings.set("stable-images", "connection", true);
                this.connexion = true;
            } else {
                console.error('Le serveur distant de stable diffusion n\'est pas accessible. Code de réponse:', response.status);
                ui.notifications.error('Le serveur distant de stable diffusion n\'est pas accessible. Code de réponse:' + response.status);
            }
        } catch (error) {
            console.error('Erreur lors de la tentative d\'accès au serveur distant de stable diffusion :', error);
            ui.notifications.error('Erreur lors de la tentative d\'accès au serveur distant de stable diffusion ; erreur = ' + error);

        }
    }

    async getStableDiffusionSettings() {
        this.settings = game.settings.get("stable-images", "stable-settings");

        this.defaultRequestBody = {
            prompt: this.settings['pre-prompt'],
            seed: -1,
            height: this.settings.height,
            width: this.settings.width,
            negative_prompt: this.settings['negative-prompt'],
            n_iter: this.settings.batchCount,
            restore_faces: this.settings.restoreFaces,
            steps: this.settings.steps,
            cfg_scale: this.settings.cfgScale,
            seed: -1
        }
    }

    /**
       * Calls the stable diffusion API to generate an image
       * @param {string} prompt - The prompt for the image generation
       * @param {Object} message - The chat message object that initiated the call
       */


    async textToImg(prompt, message) {
        if (this.working) { return ui.notifications.warn("please wait until previous job is finished") }
        let requestBody = deepClone(this.defaultRequestBody);
        requestBody.prompt += prompt;
        console.log(requestBody);
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
    async imgToImg(prompt, message, source) {
        if (this.working) { return ui.notifications.warn("please wait until previous job is finished") }
        let requestBody = deepClone(this.defaultRequestBody);
        requestBody.prompt += prompt;
        requestBody.init_images = [source]
        requestBody.denoising_strength = this.settings.imgDenoising;
        console.log(requestBody);
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
                // Get the HTML elements
                let html = document.body.querySelector(`[data-message-id="${message.id}"]`);
                let progressBar = html.querySelector(".stable-progress-bar");
                let progressState = html.querySelector(".stable-progress-state");

                if (progress) {
                    // Update the progress bar
                    let percent = Math.trunc(data.progress * 100);
                    progressState.innerText = `ETA : ${Math.trunc(data.eta_relative)}s__${Math.trunc(data.progress * 100)}%`;
                    progressBar.style = `width:${Math.trunc(data.progress * 100)}%`;
                }
                if (data.progress < 0.99) {
                    // Call the initProgressRequest function again after a delay if the progress is not complete
                    setTimeout(() => { this.initProgressRequest(message) }, 500);
                }
            })
            .catch(error => {
                console.error('Error fetching progress:', error);
            });
    }

}

const sdAPIClient = new SdAPIClient()
export default sdAPIClient