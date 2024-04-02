//import the form app that manage the stable-images settings
import stableFileManager from "./StableFileManager.js";
import StableImageSettings from "./StableImageSettings.js";
//import the api client

import sdAPIClient from "./sdAPIClient.js";
import AiHordeSettings from "./aiHordeSettings.js";
import { aiHordeApiClient } from "./aiHordeApiClient.js";

const defaultPrefix = 'best quality, absurdres, aesthetic,';
const defaultNegative = 'lowres, bad anatomy, bad hands, text, error, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry';

const defaultStyles = [
    {
        name: 'Default',
        negative: defaultNegative,
        prefix: defaultPrefix,
    },
];

const promptTemplates = {};

const defaultSettings = {
    // CFG Scale
    scale_min: 1,
    scale_max: 30,
    scale_step: 0.5,
    scale: 7,
    // Sampler steps
    steps_min: 1,
    steps_max: 150,
    steps_step: 1,
    steps: 20,

    // Scheduler
    scheduler: 'normal',
    // Image dimensions (Width & Height)
    dimension_min: 64,
    dimension_max: 2048,
    dimension_step: 64,
    width: 512,
    height: 512,

    prompt_prefix: defaultPrefix,
    negative_prompt: defaultNegative,
    sampler: 'DDIM',
    model: '',
    vae: '',
    
    // Automatic1111/Horde exclusives
    restore_faces: false,
    enable_hr: false,

    // Horde settings
    horde_url: 'https://stablehorde.net',
    horde: false,
    horde_nsfw: false,
    horde_karras: true,
    horde_sanitize: true,
    horde_model: '',
    horde_models: [],

    // Refine mode
    refine_mode: false,
    expand: false,
    interactive_mode: false,
    multimodal_captioning: false,
    snap: false,

    prompts: promptTemplates,
    
    // AUTOMATIC1111 settings
    auto_url: 'http://localhost:7860',
    auto_auth: '',

    vlad_url: 'http://localhost:7860',
    vlad_auth: '',

    hr_upscaler: 'Latent',
    hr_scale: 2.0,
    hr_scale_min: 1.0,
    hr_scale_max: 4.0,
    hr_scale_step: 0.1,
    denoising_strength: 0.7,
    denoising_strength_min: 0.0,
    denoising_strength_max: 1.0,
    denoising_strength_step: 0.01,
    hr_second_pass_steps: 0,
    hr_second_pass_steps_min: 0,
    hr_second_pass_steps_max: 150,
    hr_second_pass_steps_step: 1,

    // NovelAI settings
    novel_upscale_ratio_min: 1.0,
    novel_upscale_ratio_max: 4.0,
    novel_upscale_ratio_step: 0.1,
    novel_upscale_ratio: 1.0,
    novel_anlas_guard: false,

    // OpenAI settings
    openai_style: 'vivid',
    openai_quality: 'standard',

    style: 'Default',
    styles: defaultStyles,

    // ComyUI settings
    comfy_url: 'http://127.0.0.1:8188',
    comfy_workflow: 'Default_Comfy_Workflow.json',

    // stable-images old settings TO BE DEPRECATED
    batchCount: 1,
    loras: [],
    styles: [],
    loraPrompt: '',
    activeLoras: [],
    activeModel: '',
    models: {},

};



/**
 * Registers the settings for the Stable Images module.
 */
export default function registerSettings() {
    console.error("Starting dynamic settings registration for 'stable-images'.");

    // Presuming defaultSettings is accessible here
    Object.entries(defaultSettings).forEach(([key, defaultValue]) => {
        console.log(`Registering setting for 'stable-images': ${key}`);
        game.settings.register('stable-images', key, {
            name: key, // Simplified for demonstration; consider more descriptive names
            hint: `Setting for ${key}`, // Consider more helpful hints
            scope: 'world', // 'world' or 'client' as appropriate
            config: false, // Show in the module's configuration settings
            type: determineSettingType(defaultValue),
            default: defaultValue,
            onChange: value => console.error(`Setting '${key}' changed to:`, value)
        });
    });

    console.error("Finished dynamic settings registration for 'stable-images'.");

    // Existing code to register menus remains unchanged
    game.settings.registerMenu("stable-images", "stable-image-menu", {
        name: "Local A1111 Images Settings",
        label: "Local A1111 Images Settings",
        hint: "A window to set parameters for A1111 image generation.",
        icon: "fas fa-images",
        type: StableImageSettings,
        restricted: true
    });
    
    game.settings.registerMenu('stable-images', 'aihorde-settings', {
        name: 'AI Horde Settings',
        label: 'AI Horde Settings',
        hint: 'Configure the connection to the AI Horde API.',
        icon: 'fas fa-cog',
        type: AiHordeSettings,
        restricted: true,
    });

    game.settings.register('stable-images', 'stable-settings', {
        scope: 'world',
        config: false,
        type: Object,
        default: {},
        /**
         * Handles the onChange event for the stable-settings.
         * Calls the getStableDiffusionSettings function from the sdAPIClient.
         * Logs are added to monitor the execution and warn about the trigger.
         */
        onChange: async () => {
            console.warn("onChange triggered for stable-settings.");
        
            try {
                await sdAPIClient.getStableDiffusionSettings();
                await aiHordeApiClient.getAiHordeSettings();
                console.warn("getStableDiffusionSettings called successfully.");
            } catch (error) {
                console.warn("Error calling getStableDiffusionSettings:", error);
                ui.notifications.warn("Failed to retrieve Stable Diffusion settings. Check the console for more details.");
            }
        }
    });
}

function determineSettingType(value) {
    if (typeof value === 'boolean') return Boolean;
    if (typeof value === 'number') return Number;
    if (Array.isArray(value)) return Array;
    if (typeof value === 'object' && value !== null) return Object;
    return String; // Default to string for everything else
}



export { defaultSettings };