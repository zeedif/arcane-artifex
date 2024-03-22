//import the form app that manage the stable-images settings
import stableFileManager from "./StableFileManager.js";
import StableImageSettings from "./StableImageSettings.js";
//import the api client
import sdAPIClient from "./sdAPIClient.js";

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
        name: "Stable Images Settings",
        label: "Stable Images Settings",
        hint: "A window to set parameters for image generation.",
        icon: "fas fa-images",
        type: StableImageSettings,
        restricted: true
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
            "server-IP": "https://c73b549f105a.ngrok.app",
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
        onChange: () => {
            console.warn("onChange triggered for stable-settings.");
    
            try {
                sdAPIClient.getStableDiffusionSettings();
                console.warn("getStableDiffusionSettings called successfully.");
            } catch (error) {
                console.warn("Error calling getStableDiffusionSettings:", error);
            }
    
            try {
                stableFileManager.setStoragePath();
                console.warn("setStoragePath called successfully.");
            } catch (error) {
                console.warn("Error calling setStoragePath:", error);
            }
        }
    });
    
}