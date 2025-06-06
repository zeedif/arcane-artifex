import chatListener from "./ChatListener.js";
import aiHordeApiClient from './aiHordeApiClient.js';
import localA1111APIClient from './localA1111ApiClient.js';
import comfyUiApiClient from './comfyUiApiClient.js';
import openAiApiClient from './openAiApiClient.js';
import stabilityApiClient from './stabilityApiClient.js';

class SdAPIClient {
    constructor() {
        this.settings = {};
    }

    postSkip() {
        let apiUrl = `${game.settings.get("arcane-artifex", "localA1111Url")}/sdapi/v1/skip`;
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

    postInterrupt() {
        let apiUrl = `${game.settings.get("arcane-artifex", "localA1111Url")}/sdapi/v1/interrupt`;
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
    

    
        async textToImg(prompt, message) {
            if (game.settings.get("arcane-artifex", "working")) {
              return ui.notifications.warn("Please wait until the previous job is finished");
            }
          
            const selectedSource = game.settings.get("arcane-artifex", "source");
          
            switch (selectedSource) {
              case "aiHorde":
                await aiHordeApiClient.textToImg(prompt, message);
                break;
              case "localA1111":
                await localA1111APIClient.textToImg(prompt, message);
                break;
              case "comfyUi":
                await comfyUiApiClient.textToImg(prompt, message);
                break;
              case "openAI":
                await openAiApiClient.textToImg(prompt, message);
                break;
              case "stability":
                await stabilityApiClient.textToImg(prompt, message);
                break;
              default:
                ui.notifications.warn('Invalid source selected');
            }
          }
    
        async imgToImg(prompt, message, source) {
            if (game.settings.get("arcane-artifex", "working")) {
                return ui.notifications.warn("please wait until previous job is finished");
            }
            let requestBody = deepClone(game.settings.get("arcane-artifex", "localA1111RequestBody"));
            requestBody.prompt = localA1111APIClient.getFullPrompt(prompt);
            requestBody.init_images = [source];
            requestBody.denoising_strength = this.settings.denoising_strength;
        let apiUrl = `${game.settings.get("arcane-artifex", "localA1111Url")}/sdapi/v1/img2img/`;
        await game.settings.set("arcane-artifex", "working", true);
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
                    game.settings.set("arcane-artifex", "working", false);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch (e) {
            ui.notifications.warn('Error while sending request to stable diffusion');
        }
    }
}

const sdAPIClient = new SdAPIClient();

export default sdAPIClient;