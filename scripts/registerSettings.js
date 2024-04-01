//import the form app that manage the stable-images settings
import stableFileManager from "./StableFileManager.js";
import StableImageSettings from "./StableImageSettings.js";
import ComfyUIImageSettings from "./ComfyUISettings.js";
//import the api client
import sdAPIClient from "./sdAPIClient.js";
import AiHordeSettings from "./aiHordeSettings.js";


/**
 * Registers the settings for the Stable Images module.
 */
export default function registerSettings() {
    // Initiating the connection state with Stable Diffusion
    game.settings.register("stable-images", "connection", {
        name: "connection",
        hint: "connection",
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    // Creating the sub menu for Stable Images Settings
    game.settings.registerMenu("stable-images", "stable-image-menu", {
        name: "Local A1111 Images Settings",
        label: "Local A1111 Images Settings",
        hint: "A window to set parameters for A1111 image generation.",
        icon: "fas fa-images",
        type: StableImageSettings,
        restricted: true
    });

    game.settings.registerMenu("stable-images", "comfyui-image-settings", {
        name: "ComfyUI Images Settings",
        label: "Configure ComfyUI",
        hint: "Configure the IP address for the ComfyUI server.",
        icon: "fas fa-network-wired",
        type: ComfyUIImageSettings,
        restricted: true,
    });
    
    game.settings.register('stable-images', 'aihorde-url', {
        name: 'AI Horde API URL',
        scope: 'world',
        config: false,
        type: String,
        default: 'https://stablehorde.net',
    });

    game.settings.register('stable-images', 'aihorde-connection', {
        name: 'AI Horde Connection',
        scope: 'world',
        config: false,
        type: Boolean,
        default: false,
    });

    game.settings.registerMenu('stable-images', 'aihorde-settings', {
        name: 'AI Horde Settings',
        label: 'AI Horde Settings',
        hint: 'Configure the connection to the AI Horde API.',
        icon: 'fas fa-cog',
        type: AiHordeSettings,
        restricted: true,
    });


    /**
     * Represents the default stable-settings object.
     * @type {Object}
     */
    game.settings.register('stable-images', 'stable-settings', {
        scope: 'world',
        config: false,
        type: Object,
        default: {
            "pre-prompt": "",
            "negative-prompt": "",
            "server-IP": "http://127.0.0.1:7860",
            "comfy-IP": "http://127.0.0.1:8188",
            "width": 1024,
            "height": 1024,
            "face_restoration": false,
            "imgDenoising": 1.0,
            "steps": 8,
            "cfgScale": 1.5,
            "batchCount": 1,
            "loras": [],
            "styles": [],
            "loraPrompt": "",
            "activeLoras": [],
            "activeModel": "",
            "models": {},
            "stableStoragePath": "/worlds/" + game.world.id
    
        },
        /**
         * Handles the onChange event for the stable-settings.
         * Calls the getStableDiffusionSettings function from the sdAPIClient.
         * Logs are added to monitor the execution and warn about the trigger.
         */
        onChange: async () => {
            console.warn("onChange triggered for stable-settings.");
        
            try {
                await sdAPIClient.getStableDiffusionSettings();
                console.warn("getStableDiffusionSettings called successfully.");
            } catch (error) {
                console.warn("Error calling getStableDiffusionSettings:", error);
                ui.notifications.warn("Failed to retrieve Stable Diffusion settings. Check the console for more details.");
            }
        
            try {
                await stableFileManager.setStoragePath();
                console.warn("setStoragePath called successfully.");
            } catch (error) {
                console.warn("Error calling setStoragePath:", error);
                ui.notifications.warn("Failed to set the storage path. Check the console for more details.");
            }
        }
    });
    
}