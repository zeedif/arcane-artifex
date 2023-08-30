import chatListenner from "./ChatListenner.js";

class SdAPIClient {
    constructor() {
        this.connexion = false;
        this.settings = {};
        this.defaultRequestBody = {};
        this.working = false;
        this.loras = [];
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
        await this.getLoras();
        await this.getModels();
        await this.getSdOptions();
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



    async getLoras() {
        let stIP = await game.settings.get("stable-images", "stable-settings")["server-IP"];
        let lorasUrl = stIP + '/sdapi/v1/loras';

        try {
            // Envoi d'une requête HEAD au serveur
            const response = await fetch(lorasUrl, { method: 'GET' });

            if (response.ok) {
                console.log(response)
                this.loras = await response.json();


            } else {

            }
        } catch (error) {
            console.error('Erreur lors de la tentative d\'accès au loras de stable diffusion :', error);
            ui.notifications.error('Erreur lors de la tentative d\'accès au loras de stable diffusion ; erreur = ' + error);

        }
    }

    async getModels() {
        let stIP = await game.settings.get("stable-images", "stable-settings")["server-IP"];
        let modelsUrl = stIP + '/sdapi/v1/sd-models';

        try {
            // Envoi d'une requête HEAD au serveur
            const response = await fetch(modelsUrl, { method: 'GET' });

            if (response.ok) {
                console.log(response)
                this.models = await response.json();


            } else {

            }
        } catch (error) {
            console.error("Erreur lors de la tentative d\'accès au loras de stable diffusion :", error);
            ui.notifications.error("Erreur lors de la tentative d\'accès au loras de stable diffusion ; erreur = " + error);

        }
    }
    async getSdOptions() {
        let stIP = await game.settings.get("stable-images", "stable-settings")["server-IP"];
        let optionsUrl = stIP + '/sdapi/v1/options';

        try {
            // Envoi d'une requête HEAD au serveur
            const response = await fetch(optionsUrl, { method: 'GET' });

            if (response.ok) {
                console.log(response)
                this.sdOptions = await response.json();


            } else {

            }
        } catch (error) {
            console.error("Erreur lors de la tentative d\'accès au options de stable diffusion :", error);
            ui.notifications.error("Erreur lors de la tentative d\'accès au options de stable diffusion ; erreur = " + error);

        }
    }
    getFullPrompt(userPrompt) {
        return this.settings['pre-prompt'] + ', ' + userPrompt + ', ' + this.settings.loraPrompt
    }
    async textToImg(prompt, message) {
        if (this.working) { return ui.notifications.warn("please wait until previous job is finished") }
        let requestBody = deepClone(this.defaultRequestBody);
        requestBody.prompt = this.getFullPrompt(prompt);
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
    async changeModel(title) {
        return await this.postOption({
            sd_model_checkpoint: title,
        })
    }

    async postOption(option) {
        let stIP = await game.settings.get("stable-images", "stable-settings")["server-IP"];
        let optionsUrl = stIP + '/sdapi/v1/options';
        try {
            // Send a POST request to the stable diffusion API
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
                    // Create the image based on the response data
                    await this.getSdOptions();
                    if (ui.activeWindow.title == "settings for stable diffusion image generation") {
                        ui.activeWindow.render(true)
                    }

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
        requestBody.prompt = this.getFullPrompt(prompt);
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

                if (progressState && progressBar) {
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