import chatListener from "./ChatListener.js";

class LocalA1111APIClient {
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

        if (selectedSource === 'automatic1111') {
            const a1111url = game.settings.get('stable-images', 'auto_url');
            const statusUrl = a1111url;

            try {
                const response = await fetch(statusUrl, { method: 'HEAD' });
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
            return 'Local A1111 is not selected. Skipping Local A1111 status check.';
        }
    }

    async getLocalA1111Settings() {
        const connection = game.settings.get('stable-images', 'connected');

        if (!connection) {
            console.warn("Local A1111 Stable Diffusion connection not established. Skipping API calls.");
            return;
        }

        await this.localA1111getLoras();
        await this.localA1111getModels();
        await this.localA1111getStyles();
        await this.localA1111getSdOptions();
        await this.localA1111getSamplers();
        await this.localA1111getUpscalers();

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

    async localA1111getLoras() {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let lorasUrl = stIP + '/sdapi/v1/loras';
        try {
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

    async localA1111getStyles() {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let styleUrl = stIP + '/sdapi/v1/prompt-styles';
        try {
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

    async localA1111getModels() {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let modelsUrl = stIP + '/sdapi/v1/sd-models';
        try {
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

    async localA1111getSdOptions() {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let optionsUrl = stIP + '/sdapi/v1/options';
        try {
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

    async localA1111getSamplers() {
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

    async localA1111getUpscalers() {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let upscalersUrl = stIP + '/sdapi/v1/upscalers';
        try {
            const response = await fetch(upscalersUrl, { method: 'GET' });
            if (response.ok) {
                this.upscalers = await response.json();
            } else {
                console.error(`Error while trying to access the upscalers from stable diffusion: Status Code ${response.status} - ${response.statusText}`);
                ui.notifications.error(`Error while trying to access the upscalers from stable diffusion; error = Status Code ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error while trying to access the upscalers from stable diffusion:", error);
            ui.notifications.error(`Error while trying to access the upscalers from stable diffusion; error = ${error}`);
        }
    }

    localA1111postSkip() {
        let apiUrl = game.settings.get("stable-images", "auto_url") + '/sdapi/v1/skip';
        try {
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

    localA1111postInterrupt() {
        let apiUrl = game.settings.get("stable-images", "auto_url") + '/sdapi/v1/interrupt';
        try {
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

    localA1111getFullPrompt(userPrompt) {
        return this.settings['prompt_prefix'] + ', ' + userPrompt + ', ' + this.settings.loraPrompt;
    }

    async localA1111textToImg(prompt, message) {
        if (game.settings.get("stable-images", "working")) {
            return ui.notifications.warn("please wait until previous job is finished");
        }
        let requestBody = deepClone(this.defaultRequestBody);
        requestBody.prompt = this.getFullPrompt(prompt);
        let apiUrl = game.settings.get("stable-images", "auto_url") + '/sdapi/v1/txt2img/';
        await game.settings.set("stable-images", "working", true);
        console.log('requestBody', requestBody);
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
        }
    }

    async localA1111ChangeModel(title) {
        return await this.postOption({
            sd_model_checkpoint: title,
        });
    }

    async localA1111PostOption(option) {
        let stIP = await game.settings.get("stable-images", "auto_url");
        let optionsUrl = stIP + '/sdapi/v1/options';
        try {
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

    async localA1111ImgToImg(prompt, message, source) {
        if (game.settings.get("stable-images", "working")) {
            return ui.notifications.warn("please wait until previous job is finished");
        }
        let requestBody = deepClone(this.defaultRequestBody);
        requestBody.prompt = this.getFullPrompt(prompt);
        requestBody.init_images = [source];
        requestBody.denoising_strength = this.settings.denoising_strength;
        let apiUrl = game.settings.get("stable-images", "auto_url") + '/sdapi/v1/img2img/';
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
        }
    }

    async localA1111InitProgressRequest(message, attempt = 0, currentState = "undefined") {
        const maxAttempts = 100;
        if (attempt >= maxAttempts) {
            console.warn("stable-images: Max progress check attempts reached, stopping further checks.");
            return;
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

export const localA1111APIClient = new LocalA1111APIClient();
export default localA1111APIClient;
