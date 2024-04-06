import stableFileManager from "./StableFileManager.js";
import localA1111Settings from "./localA1111Settings.js";
import sdAPIClient from "./sdAPIClient.js";
import AiHordeSettings from "./aiHordeSettings.js";
import SourceSettings from "./SourceSettings.js";
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

const resolutionOptions = {
    "sd_res_512x512": { width: 512, height: 512, name: "512x512 (1:1, icons, profile pictures)" },
    "sd_res_600x600": { width: 600, height: 600, name: "600x600 (1:1, icons, profile pictures)" },
    "sd_res_512x768": { width: 512, height: 768, name: "512x768 (2:3, vertical character card)" },
    "sd_res_768x512": { width: 768, height: 512, name: "768x512 (3:2, horizontal 35-mm movie film)" },
    "sd_res_960x540": { width: 960, height: 540, name: "960x540 (16:9, horizontal wallpaper)" },
    "sd_res_540x960": { width: 540, height: 960, name: "540x960 (9:16, vertical wallpaper)" },
    "sd_res_1920x1088": { width: 1920, height: 1088, name: "1920x1088 (16:9, 1080p, horizontal wallpaper)" },
    "sd_res_1088x1920": { width: 1088, height: 1920, name: "1088x1920 (9:16, 1080p, vertical wallpaper)" },
    "sd_res_1280x720": { width: 1280, height: 720, name: "1280x720 (16:9, 720p, horizontal wallpaper)" },
    "sd_res_720x1280": { width: 720, height: 1280, name: "720x1280 (9:16, 720p, vertical wallpaper)" },
    "sd_res_1024x1024": { width: 1024, height: 1024, name: "1024x1024 (1:1, SDXL)" },
    "sd_res_1152x896": { width: 1152, height: 896, name: "1152x896 (9:7, SDXL)" },
    "sd_res_896x1152": { width: 896, height: 1152, name: "896x1152 (7:9, SDXL)" },
    "sd_res_1216x832": { width: 1216, height: 832, name: "1216x832 (19:13, SDXL)" },
    "sd_res_832x1216": { width: 832, height: 1216, name: "832x1216 (13:19, SDXL)" },
    "sd_res_1344x768": { width: 1344, height: 768, name: "1344x768 (4:3, SDXL)" },
    "sd_res_768x1344": { width: 768, height: 1344, name: "768x1344 (3:4, SDXL)" },
    "sd_res_1536x640": { width: 1536, height: 640, name: "1536x640 (24:10, SDXL)" },
    "sd_res_640x1536": { width: 640, height: 1536, name: "640x1536 (10:24, SDXL)" }
  };

const defaultSettings = {
    // Scheduler
    scheduler: 'normal',

    sampler: 'DDIM',
    model: '',
    vae: '',


    sd_resolution: 'sd_res_512x512',

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


    hr_upscaler: 'Latent',
    hr_scale: 2.0,
    hr_scale_min: 1.0,
    hr_scale_max: 4.0,
    hr_scale_step: 0.1,

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
};

/**
 * Registers the settings for the Stable Images module.
 */





export default function registerSettings() {
    // Register menus
    game.settings.registerMenu("stable-images", "source-menu", {
      name: "Image Generation Source",
      label: "Image Generation Source",
      icon: "fas fa-cog",
      type: SourceSettings,
      restricted: true
    });

    game.settings.registerMenu("stable-images", "stable-image-menu", {
      name: "Local A1111 Images Settings",
      label: "Local A1111 Images Settings",
      icon: "fas fa-images",
      type: localA1111Settings,
      restricted: true
    });

    game.settings.registerMenu('stable-images', 'aihorde-settings', {
      name: 'AI Horde Settings',
      label: 'AI Horde Settings',
      icon: 'fas fa-cog',
      type: AiHordeSettings,
      restricted: true,
    });

    // Register non-configurable settings
    game.settings.register("stable-images", "connected", {
        name: "Connection Status",
        scope: "world",
        config: false, // Not visible in the UI
        type: Boolean,
        default: false
    });

    game.settings.register("stable-images", "source", {
      name: "Source",
      scope: "world",
      type: String,
      default: "stableHorde",
      config: false,
    });

    game.settings.register("stable-images", "auto_url", {
      name: "auto_url",
      scope: "world",
      type: String,
      default: "http://localhost:7860",
      config: false,
    });

    game.settings.register("stable-images", "horde_url", {
      name: "auto_url",
      scope: "world",
      type: String,
      default: "https://stablehorde.net",
      config: false,
    });

    game.settings.register("stable-images", "sdwidth", {
      name: "Image Width",
      scope: "world",
      config: false,
      type: Number,
      default: 512
    });
  
    game.settings.register("stable-images", "sdheight", {
      name: "Image Height",
      scope: "world",
      config: false,
      type: Number,
      default: 512
    });

    game.settings.register("stable-images", "a1111Sampler", {
      name: "a1111Sampler",
      scope: "world",
      type: String,
      default: "Euler SGMUniform",
      config: false,
    });

    // Register main configuration page options

    game.settings.register("stable-images", "stableStoragePath", {
      name: "Storage Path",
      hint: "Set the path for storing generated images",
      scope: "world",
      config: true,
      type: String,
      default: "",
      filePicker: "folder"
    });
    
    game.settings.register("stable-images", "cfgScale", {
        name: "CFG Scale",
        hint: "Set the CFG scale value",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 1,
            max: 30,
            step: 0.5
        },
        default: 1.5
    });

    game.settings.register("stable-images", "samplerSteps", {
        name: "Sampler Steps",
        hint: "Set the number of sampler steps",
        scope: "world",
        config: true,
        type: Number,
        range: {
          min: 1,
          max: 150,
          step: 1
        },
        default: 20
    });

    game.settings.register("stable-images", "promptPrefix", {
        name: "Prompt Prefix",
        hint: "Set the default prompt prefix",
        scope: "world",
        config: true,
        type: String,
        default: 'best quality, absurdres, aesthetic,'
    });

    game.settings.register("stable-images", "negativePrompt", {
        name: "Negative Prompt",
        hint: "Set the default negative prompt",
        scope: "world",
        config: true,
        type: String,
        default: 'lowres, bad anatomy, bad hands, text, error, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry'
    });

    game.settings.register("stable-images", "resolutionOptions", {
      name: "Resolution Options",
      hint: "Select a predefined resolution",
      scope: "world",
      config: true,
      type: String,
      choices: Object.keys(resolutionOptions).reduce((choices, key) => {
        choices[key] = resolutionOptions[key].name;
        return choices;
      }, {}),
      default: "sd_res_512x512",
      onChange: value => {
        const selectedResolution = resolutionOptions[value];
        game.settings.set("stable-images", "sdwidth", selectedResolution.width);
        game.settings.set("stable-images", "sdheight", selectedResolution.height);
      }
    });

    game.settings.register("stable-images", "restoreFaces", {
      name: "Restore Faces",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register("stable-images", "enableHr", {
      name: "Hires. Fix",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register("stable-images", "denoisingStrength", {
      name: "Hires. Fix Denoising Strength",
      hint: "How strongly the upscaler effects image generation",
      scope: "world",
      config: true,
      type: Number,
      range: {
          min: 0.0,
          max: 1.0,
          step: 0.01
      },
      default: 0.7
  });

    // Dynamically register settings based on defaultSettings
    Object.entries(defaultSettings).forEach(([key, defaultValue]) => {
        game.settings.register('stable-images', key, {
            name: key,
            hint: `Setting for ${key}`,
            scope: 'world',
            config: false,
            type: determineSettingType(defaultValue),
            default: defaultValue,
            onChange: value => console.log(`Setting '${key}' changed to:`, value)
        });
    });


    // Register stable-settings
    game.settings.register('stable-images', 'stable-settings', {
        scope: 'world',
        config: false,
        type: Object,
        default: {},
        /**
         * Handles the onChange event for the stable-settings.
         * Calls the getLocalA1111Settings function from the sdAPIClient.
         */
        onChange: async () => {
            try {
                await sdAPIClient.getLocalA1111Settings();
            } catch (error) {
                console.error("Error calling getLocalA1111Settings:", error);
                ui.notifications.error("Failed to retrieve Local A1111 settings. Check the console for more details.");
            }
        }
    });
}

/**
 * Determines the setting type based on the provided value.
 * @param {*} value - The value to determine the setting type for.
 * @returns {Function} The determined setting type.
 */
function determineSettingType(value) {
    if (typeof value === 'boolean') return Boolean;
    if (typeof value === 'number') return Number;
    if (Array.isArray(value)) return Array;
    if (typeof value === 'object' && value !== null) return Object;
    return String; // Default to string for everything else
}


async function fetchModels() {
    const selectedSource = game.settings.get('stable-images', 'source');
    console.error("Selected source:", selectedSource);
  
    const sourceHandlers = {
      automatic1111: async () => {
        const stIP = await game.settings.get("stable-images", "auto_url");
        const modelsUrl = stIP + '/sdapi/v1/sd-models';
        console.error("Fetching A1111 models from URL:", modelsUrl);
  
        try {
          const response = await fetch(modelsUrl, { method: 'GET' });
          if (response.ok) {
            const data = await response.json();
            console.error("A1111 models fetched successfully", data);
            return data.map(model => ({ [model.title]: model.model_name }));
          } else {
            console.error("Error while fetching A1111 models:", response.statusText);
            ui.notifications.error("Error while fetching A1111 models");
          }
        } catch (error) {
          console.error("Error while attempting to access the stable diffusion models:", error);
          ui.notifications.error("Error while attempting to access the stable diffusion models; error = " + error);
        }
      },
  
      'stableHorde': async () => {
        try {
          const hordeUrl = game.settings.get('stable-images', 'horde_url');
          const response = await fetch(`${hordeUrl}/api/v2/status/models`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          console.error("Fetching Stable Horde models from URL:", `${hordeUrl}/api/v2/status/models`);
  
          if (response.ok) {
            const data = await response.json();
            console.error("Stable Horde models fetched successfully");
            console.error("Fetched models data:", data);
          
            data.sort((a, b) => b.count - a.count);
            console.error("Sorted models data:", data);
          
            const choices = data.reduce((choices, model) => {
              choices[model.name] = `${model.name} (ETA: ${model.eta}s, Queue: ${model.queued}, Workers: ${model.count})`;
              return choices;
            }, {});
          
            console.error("Formatted choices object:", choices);
          
            return choices;
          } else {
            console.error("Error while fetching Horde models:", response.statusText);
            ui.notifications.error("Error while fetching Horde models");
          }
        } catch (error) {
          console.error("Error while retrieving Horde models:", error);
          ui.notifications.error("Error while retrieving Horde models: " + error);
        }
      },
  
      // Add more source handlers here as needed
    };
  
    const fetchHandler = sourceHandlers[selectedSource];
    console.error("Fetch handler:", fetchHandler);
  
    if (fetchHandler) {
      console.error("Calling fetch handler for source:", selectedSource);
      return await fetchHandler();
    } else {
      console.error("Unsupported source:", selectedSource);
      ui.notifications.error("Unsupported source: " + selectedSource);
      return {};
    }
  }


export { defaultSettings };