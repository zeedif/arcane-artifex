//import the form app that manage the stable-images settings
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
            "pre-prompt": "((SFW)), masterpiece,cinematic pose, bokeh",
            "negative-prompt": "((NSFW, nude)) bad-artist,bad face, bad anatomy, bad proportions, bad perspective, multiple views, mutated hands and fingers, interlocked fingers, twisted fingers, excessively bent fingers, more than five fingers, lowres, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, low quality lowres multiple breasts, low quality lowres mutated hands and fingers, more than two arms, more than two hands, more than two legs, more than two feet,",
            "server-IP": "http://localhost:7860",
            "width": 512,
            "height": 512,
            "face_restoration": true,
            "imgDenoising": 0.7,
            "steps": 22,
            "cfgScale": 7.5,
            "batchCount": 4,
            "loras": [],
            "loraPrompt": "",
            "activeLoras": [],
            "activeModel": "",
            "models": {},
            "stableStoragePath": "/worlds/" + game.world.id

        },
        /**
         * Handles the onChange event for the stable-settings.
         * Calls the getStableDiffusionSettings function from the sdAPIClient.
         */
        onChange: () => sdAPIClient.getStableDiffusionSettings()
    });
}