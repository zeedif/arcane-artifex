import stableFileManager from "./StableFileManager.js";
import openAiSettings from "./openAiSettings.js";
import localA1111Settings from "./localA1111Settings.js";
import localA1111APIClient from "./localA1111APIClient.js";
import HordeSettings from "./aiHordeSettings.js";
import comfyUISettings from "./comfyUiSettings.js";
import { aiHordeApiClient } from "./aiHordeApiClient.js";
import { comfyUIApiClient } from "./comfyUIApiClient.js";
import { openAiApiClient } from "./openAiApiClient.js";

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

const openAiResolutionOptions = {
  "dalle_res_1024x1024": { width: 1024, height: 1024, name: "1024x1024 (1:1)" },
  "dalle_res_1792x1024": { width: 1792, height: 1024, name: "1792x1024 (Landscape)" },
  "dalle_res_1024x1792": { width: 1024, height: 1792, name: "1024x1792 (Portriat)" }
};


const defaultSettings = {

  horde_model: '',
  horde_models: [],



  prompts: promptTemplates,

  style: 'Default',
  styles: defaultStyles,

  // stable-images old settings TO BE DEPRECATED
  batchCount: 4,
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
    type: HordeSettings,
    restricted: true,
  });

  game.settings.registerMenu('stable-images', 'comfyui-settings', {
    name: 'ComfyUI Settings',
    label: 'ComfyUI Settings',
    icon: 'fas fa-cog',
    type: comfyUISettings,
    restricted: true,
  });

  game.settings.registerMenu('stable-images', 'openai-settings', {
    name: 'OpenAI Settings',
    label: 'OpenAI Settings',
    icon: 'fas fa-cog',
    type: openAiSettings,
    restricted: true,
  });

  // Register non-configurable settings
  game.settings.register("stable-images", "connected", {
    name: "Connection Status",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register("stable-images", "working", {
    name: "Image Generation Status",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register("stable-images", "localA1111URL", {
    name: "localA1111URL",
    scope: "world",
    type: String,
    default: "http://localhost:7860",
    config: false,
  });

  game.settings.register("stable-images", "hordeURL", {
    name: "hordeURL",
    scope: "world",
    type: String,
    default: "https://stablehorde.net",
    config: false,
  });

  game.settings.register("stable-images", "comfyUIURL", {
    name: "comfyUIURL",
    scope: "world",
    type: String,
    default: "http://localhost:8188",
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

  // Register settings for localSDSettings
  game.settings.register("stable-images", "localSDSettings", {
    name: "Local SD Settings",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  // Register settings for localA1111Models
  game.settings.register("stable-images", "localA1111Models", {
    name: "localA1111Models",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  // Register settings for localA1111Loras
  game.settings.register("stable-images", "localA1111Loras", {
    name: "localA1111Loras",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  // Register settings for localA1111Styles
  game.settings.register("stable-images", "localA1111Styles", {
    name: "Local A1111 Styles",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  // Register settings for localA1111Samplers
  game.settings.register("stable-images", "localA1111Samplers", {
    name: "localA1111Styles",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  // Register settings for localA1111Upscalers
  game.settings.register("stable-images", "localA1111Upscalers", {
    name: "localA1111Upscalers",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  game.settings.register("stable-images", "localA1111SDOptions", {
    name: "localA1111SDOptions",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  game.settings.register("stable-images", "localA1111Model", {
    name: "localA1111Model",
    scope: "world",
    type: String,
    default: "",
    config: false,
  });

  game.settings.register("stable-images", "localA1111Sampler", {
    name: "localA1111Sampler",
    scope: "world",
    type: String,
    default: "Euler SGMUniform",
    config: false,
  });

  game.settings.register("stable-images", "localA1111Upscaler", {
    name: "localA1111Upscaler",
    scope: "world",
    type: String,
    default: "4x_foolhardy_Remacri",
    config: false,
  });

  game.settings.register("stable-images", "localA1111RequestBody", {
    name: "localA1111RequestBody",
    scope: "world",
    type: Object,
    config: false,
    default: {}
  });

  game.settings.register("stable-images", "rawPrompt", {
    name: "rawPrompt",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  game.settings.register("stable-images", "fullPrompt", {
    name: "fullPrompt",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  // Register settings for Horde models
  game.settings.register("stable-images", "hordeModels", {
    name: "Horde Models",
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  // Register setting for the selected Horde model
  game.settings.register("stable-images", "hordeModel", {
    name: "Selected Horde Model",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  // Register setting for the selected Horde sampler
  game.settings.register("stable-images", "hordeSampler", {
    name: "Selected Horde Sampler",
    scope: "world",
    config: false,
    type: String,
    default: "k_euler",
  });

  // Register settings for Horde samplers
  game.settings.register("stable-images", "hordeSamplers", {
    name: "Horde Samplers",
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  game.settings.register("stable-images", "hordeNSFW", {
    name: "hordeNSFW",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
    onChange: async () => {
      await aiHordeApiClient.getHordeSettings();
    }
  });

  game.settings.register("stable-images", "hordeKarras", {
    name: "hordeKarras",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
    onChange: async () => {
      await aiHordeApiClient.getHordeSettings();
    }
  });

  game.settings.register("stable-images", "hordeAPIKey", {
    name: "hordeAPIKey",
    scope: "world",
    type: String,
    default: "0000000000",
    config: false,
  });

  game.settings.register("stable-images", "hordeRequestBody", {
    name: "hordeRequestBody",
    scope: "world",
    type: Object,
    config: false,
    default: {}
  });

  game.settings.register("stable-images", "comfyUIModel", {
    name: "comfyUIModel",
    scope: "world",
    type: String,
    default: "juggernautXL_v9Rdphoto2Lightning.safetensors",
    config: false,
  });

  game.settings.register("stable-images", "comfyUIUpscaler", {
    name: "comfyUIUpscaler",
    scope: "world",
    type: String,
    default: "4x_foolhardy_Remacri",
    config: false,
  });    

  game.settings.register("stable-images", "comfyUISampler", {
    name: "comfyUISampler",
    scope: "world",
    type: String,
    default: "euler",
    config: false,
  });

  game.settings.register("stable-images", "comfyUIScheduler", {
    name: "comfyUIScheduler",
    scope: "world",
    type: String,
    default: "sgm_uniform",
    config: false,
  });
  game.settings.register('stable-images', 'comfyUIModels', {
    name: 'ComfyUI Models',
    hint: 'List of available models for ComfyUI.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register('stable-images', 'comfyUILoras', {
    name: 'ComfyUI Loras',
    hint: 'List of available Loras for ComfyUI.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register('stable-images', 'comfyUISchedulers', {
    name: 'comfyUISchedulers',
    hint: 'List of available styles for ComfyUI.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register('stable-images', 'comfyUISamplers', {
    name: 'ComfyUI Samplers',
    hint: 'List of available samplers for ComfyUI.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register('stable-images', 'comfyUIUpscalers', {
    name: 'ComfyUI Upscalers',
    hint: 'List of available upscalers for ComfyUI.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register("stable-images", "openAiApiKey", {
    name: "openAiApiKey",
    scope: "world",
    type: String,
    default: "0000000000",
    config: false,
  });

  game.settings.register("stable-images", "openAiResolutionOptions", {
    name: "openAiResolutionOptions",
    hint: "Select a predefined DALLE-3 resolution",
    scope: "world",
    config: false,
    type: String,
    choices: Object.keys(openAiResolutionOptions).reduce((choices, key) => {
      choices[key] = openAiResolutionOptions[key].name;
      return choices;
    }, {}),
    default: "dalle_res_1024x1024",
    onChange: async value => {
      const selectedResolution = openAiResolutionOptions[value];
      await game.settings.set("stable-images", "sdwidth", selectedResolution.width);
      await game.settings.set("stable-images", "sdheight", selectedResolution.height);
    }
  });

  game.settings.register("stable-images", "openAiHd", {
    name: "openAiHd",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register("stable-images", "openAiVivid", {
    name: "openAiVivid",
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });

  game.settings.register("stable-images", "numImages", {
    name: "numImages",
    hint: "Number of images to produce per generation",
    scope: "world",
    config: false,
    type: Number,
    range: {
      min: 0,
      max: 4,
      step: 1
    },
    default: 1
  });

  // Register main configuration page options
  game.settings.register("stable-images", "source", {
    name: "Source",
    hint: "Select the source for image generation",
    scope: "world",
    config: true,
    type: String,
    choices: {
      stableHorde: "Stable Horde",
      localA1111: "Local Web UI (AUTOMATIC1111)",
      comfyUI: "ComfyUI",
      openAI: "OpenAI"
    },
    default: "ComfyUI",
    requiresReload: true,
    onChange: async value => {
      if (value === "localA1111") {
        await localA1111APIClient.getLocalA1111Settings();
      } else if (value === "stableHorde") {
        await aiHordeApiClient.getHordeSettings();
      } else if (value === "comfyUI") {
        await comfyUIApiClient.getComfyUISettings();
      } else if (value === "openAI") {
        await openAiApiClient.getOpenAiSettings();
      }

      console.log("Source changed to: ", value);
    }
  });

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

  game.settings.register("stable-images", "prompt", {
    name: "prompt",
    hint: "Set the full prompt",
    scope: "world",
    config: false,
    type: String,
    default: ''
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
    onChange: async value => {
      const selectedResolution = resolutionOptions[value];
      await game.settings.set("stable-images", "sdwidth", selectedResolution.width);
      await game.settings.set("stable-images", "sdheight", selectedResolution.height);
      await localA1111APIClient.getLocalA1111Settings();
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

  game.settings.register("stable-images", "hrScale", {
    name: "Upscale by",
    hint: "What to multiply the resolution by",
    scope: "world",
    config: true,
    type: Number,
    range: {
      min: 1.0,
      max: 4.0,
      step: 0.1
    },
    default: 2.0,
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

  game.settings.register("stable-images", "hrSecondPassSteps", {
    name: "Number of second pass steps",
    hint: "How many steps to take in the second pass",
    scope: "world",
    config: true,
    type: Number,
    range: {
      min: 0,
      max: 150,
      step: 1
    },
    default: 0
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
    default: {}
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

export { defaultSettings };
