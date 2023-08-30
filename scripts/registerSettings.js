import StableImageSettings from "./StableImageSettings.js";
import sdAPIClient from "./sdAPIClient.js";

export default function registerSettings() {

    // initiating the connexion state with stable diffusion

    game.settings.register("stable-images", "connection", {

        name: "connection",
        hint: "conncetion",
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    //creating the sub menu
    game.settings.registerMenu("stable-images", "stable-image-menu", {
        name: "Stable Images Settings",
        label: "Stable Images Settings",
        hint: "A window to set parameters for image generation.",
        icon: "fas fa-images",
        type: StableImageSettings,
        restricted: true
    });

    // creating setting object
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
            "restoreFaces": true,
            "imgDenoising": 0.7,
            "steps": 22,
            "cfgScale": 7.5,
            "batchCount": 4,
            "loras": [],
            "loraPromt": "",
            "activeLoras": [],
            "activeModel": "",
            "models": {}

        },
        onChange: () => sdAPIClient.getStableDiffusionSettings()

    });



}