import openAiSettings from "./openAiSettings.js";
import localA1111Settings from "./localA1111Settings.js";
import localA1111APIClient from "./localA1111ApiClient.js";
import hordeSettings from "./aiHordeSettings.js";
import comfyUiSettings from "./comfyUiSettings.js";
import { aiHordeApiClient } from "./aiHordeApiClient.js";
import { comfyUiApiClient } from "./comfyUiApiClient.js";
import { openAiApiClient } from "./openAiApiClient.js";
import { stabilityApiClient } from "./stabilityApiClient.js";
import stabilitySettings from "./stabilitySettings.js";

export default function registerSettings() {

  game.settings.registerMenu('arcane-artifex', 'comfyui-settings', {
    name: 'ComfyUI Settings',
    label: 'ComfyUI Settings',
    icon: 'fas fa-cog',
    type: comfyUiSettings,
    restricted: true,
  });

  game.settings.registerMenu("arcane-artifex", "locala1111-settings", {
    name: "A1111 Settings",
    label: "A1111 Settings",
    icon: "fas fa-cog",
    type: localA1111Settings,
    restricted: true
  });

  game.settings.registerMenu('arcane-artifex', 'horde-settings', {
    name: 'AI Horde Settings',
    label: 'AI Horde Settings',
    icon: 'fas fa-cog',
    type: hordeSettings,
    restricted: true,
  });

  game.settings.registerMenu('arcane-artifex', 'openai-settings', {
    name: 'OpenAI Settings',
    label: 'OpenAI Settings',
    icon: 'fas fa-cog',
    type: openAiSettings,
    restricted: true,
  });

  game.settings.registerMenu('arcane-artifex', 'stability-settings', {
    name: 'Stability Settings',
    label: 'Stability Settings',
    icon: 'fas fa-cog',
    type: stabilitySettings,
    restricted: true,
  });

  // Register main configuration page options
  game.settings.register("arcane-artifex", "source", {
    name: "Source",
    hint: "Select the source for image generation",
    scope: "world",
    config: true,
    type: String,
    choices: {
      aiHorde: "AI Horde",
      localA1111: "A1111",
      comfyUi: "ComfyUI",
      openAI: "OpenAI",
      stability: "Stability"
    },
    default: "ComfyUI",
    requiresReload: true,
    onChange: async value => {
      if (value === "localA1111") {
        await localA1111APIClient.getSettings();
      } else if (value === "aiHorde") {
        await aiHordeApiClient.getSettings();
      } else if (value === "comfyUi") {
        await comfyUiApiClient.getSettings();
      } else if (value === "openAI") {
        await openAiApiClient.getSettings();
      } else if (value === "stability") {
        await stabilityApiClient.getSettings();
      }
      console.log("Source changed to: ", value);
    }
  });

  game.settings.register("arcane-artifex", "stableStoragePath", {
    name: "Storage Path",
    hint: "Set the path for storing generated images",
    scope: "world",
    config: true,
    type: String,
    default: "",
    filePicker: "folder"
  });


    // Register non-configurable settings
  game.settings.register("arcane-artifex", "connected", {
    name: "Connection Status",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register("arcane-artifex", "working", {
    name: "Image Generation Status",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register("arcane-artifex", "localA1111Url", {
    name: "localA1111Url",
    scope: "world",
    type: String,
    default: "http://localhost:7860",
    config: false,
  });

  game.settings.register("arcane-artifex", "hordeUrl", {
    name: "hordeUrl",
    scope: "world",
    type: String,
    default: "https://aihorde.net",
    config: false,
  });

game.settings.register("arcane-artifex", "localA1111Height", {
    name: "Image Height",
    scope: "world",
    config: false,
    type: Number,
    default: 512
  });
  
  game.settings.register("arcane-artifex", "hordeHeight", {
    name: "Image Height",
    scope: "world",
    config: false,
    type: Number,
    default: 512
  });
  
  game.settings.register("arcane-artifex", "comfyUiHeight", {
    name: "Image Height",
    scope: "world",
    config: false,
    type: Number,
    default: 512
  });
  
  game.settings.register("arcane-artifex", "localA1111Width", {
    name: "Image Width",
    scope: "world",
    config: false,
    type: Number,
    default: 512
  });

  game.settings.register("arcane-artifex", "hordeWidth", {
    name: "Image Width",
    scope: "world",
    config: false,
    type: Number,
    default: 512
  });

  game.settings.register("arcane-artifex", "comfyUiWidth", {
    name: "Image Width",
    scope: "world",
    config: false,
    type: Number,
    default: 512
  });

  // Register settings for localSDSettings
  game.settings.register("arcane-artifex", "localSDSettings", {
    name: "Local SD Settings",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  game.settings.register("arcane-artifex", "localA1111Models", {
    name: "localA1111Models",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  game.settings.register("arcane-artifex", "localA1111Loras", {
    name: "localA1111Loras",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  // Register settings for localA1111Styles
  game.settings.register("arcane-artifex", "localA1111Styles", {
    name: "Local A1111 Styles",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  // Register settings for localA1111Samplers
  game.settings.register("arcane-artifex", "localA1111Samplers", {
    name: "localA1111Styles",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  game.settings.register("arcane-artifex", "localA1111Upscalers", {
    name: "localA1111Upscalers",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  game.settings.register("arcane-artifex", "localA1111SDOptions", {
    name: "localA1111SDOptions",
    scope: "world",
    type: Array,
    default: [],
    config: false,
  });

  game.settings.register("arcane-artifex", "localA1111Model", {
    name: "localA1111Model",
    scope: "world",
    type: String,
    default: "",
    config: false,
  });

  game.settings.register("arcane-artifex", "localA1111Sampler", {
    name: "localA1111Sampler",
    scope: "world",
    type: String,
    default: "Euler SGMUniform",
    config: false,
  });

  game.settings.register("arcane-artifex", "localA1111Upscaler", {
    name: "localA1111Upscaler",
    scope: "world",
    type: String,
    default: "4x_foolhardy_Remacri",
    config: false,
  });

  game.settings.register("arcane-artifex", "localA1111RequestBody", {
    name: "localA1111RequestBody",
    scope: "world",
    type: Object,
    config: false,
    default: {}
  });

  game.settings.register("arcane-artifex", "localA1111LoraPrompt", {
    name: "localA1111LoraPrompt",
    scope: "world",
    type: String,
    default: ""
  });

  game.settings.register("arcane-artifex", "rawPrompt", {
    name: "rawPrompt",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  game.settings.register("arcane-artifex", "fullPrompt", {
    name: "fullPrompt",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  // Register settings for Horde models
  game.settings.register("arcane-artifex", "hordeModels", {
    name: "Horde Models",
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  // Register setting for the selected Horde model
  game.settings.register("arcane-artifex", "hordeModel", {
    name: "Selected Horde Model",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  // Register setting for the selected Horde sampler
  game.settings.register("arcane-artifex", "hordeSampler", {
    name: "Selected Horde Sampler",
    scope: "world",
    config: false,
    type: String,
    default: "k_euler",
  });

  // Register settings for Horde samplers
  game.settings.register("arcane-artifex", "hordeSamplers", {
    name: "Horde Samplers",
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  game.settings.register("arcane-artifex", "hordeNSFW", {
    name: "hordeNSFW",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("arcane-artifex", "hordeKarras", {
    name: "hordeKarras",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("arcane-artifex", "hordeAPIKey", {
    name: "hordeAPIKey",
    scope: "world",
    type: String,
    default: "0000000000",
    config: false,
  });

  game.settings.register("arcane-artifex", "hordeRequestBody", {
    name: "hordeRequestBody",
    scope: "world",
    type: Object,
    config: false,
    default: {}
  });

  game.settings.register("arcane-artifex", "comfyUiUrl", {
    name: "comfyUiUrl",
    scope: "world",
    type: String,
    default: "http://localhost:8188",
    config: false,
  });

  game.settings.register("arcane-artifex", "comfyUiModel", {
    name: "comfyUiModel",
    scope: "world",
    type: String,
    default: "juggernautXL_v9Rdphoto2Lightning.safetensors",
    config: false,
  });

  game.settings.register("arcane-artifex", "comfyUiUpscaler", {
    name: "comfyUiUpscaler",
    scope: "world",
    type: String,
    default: "4x_foolhardy_Remacri",
    config: false,
  });    

  game.settings.register("arcane-artifex", "comfyUiSampler", {
    name: "comfyUiSampler",
    scope: "world",
    type: String,
    default: "euler",
    config: false,
  });

  game.settings.register("arcane-artifex", "comfyUiScheduler", {
    name: "comfyUiScheduler",
    scope: "world",
    type: String,
    default: "sgm_uniform",
    config: false,
  });
  game.settings.register('arcane-artifex', 'comfyUiModels', {
    name: 'ComfyUI Models',
    hint: 'List of available models for ComfyUI.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register('arcane-artifex', 'comfyUiLoras', {
    name: 'ComfyUI Loras',
    hint: 'List of available Loras for ComfyUI.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register('arcane-artifex', 'comfyUiSchedulers', {
    name: 'comfyUiSchedulers',
    hint: 'List of available styles for ComfyUI.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register('arcane-artifex', 'comfyUiSamplers', {
    name: 'ComfyUI Samplers',
    hint: 'List of available samplers for ComfyUI.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register('arcane-artifex', 'comfyUiUpscalers', {
    name: 'ComfyUI Upscalers',
    hint: 'List of available upscalers for ComfyUI.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register("arcane-artifex", "comfyRequestBody", {
    name: "comfyRequestBody",
    scope: "world",
    type: Object,
    config: false,
    default: {}
  });


  game.settings.register("arcane-artifex", "comfyUiWorkflowStoragePath", {
    name: "ComfyUI Workflow Storage Path",
    hint: "Set the path for ComfyUI workflow storage",
    scope: "world",
    config: false,
    type: String,
    default: "",
    filePicker: "folder"
  });

  game.settings.register("arcane-artifex", "comfyUiWorkflow", {
    name: "ComfyUI Workflow",
    hint: "Workflow to be used for image generation",
    scope: "world",
    config: false,
    type: String,
    default: "",
    filePicker: "file"
  });

  game.settings.register("arcane-artifex", "comfyUiSaveNode", {
    name: "comfyUiSaveNode",
    scope: "world",
    config: false,
    type: Number,
    default: 9
  });

  game.settings.register("arcane-artifex", "stabilityApiKey", {
    name: "stabilityApiKey",
    scope: "world",
    type: String,
    default: "0000000000",
    config: false,
  });

  game.settings.register("arcane-artifex", "stabilityModel", {
    name: "stabilityModel",
    scope: "world",
    config: false,
    type: String,
    default: "sd3-turbo"
  })

  game.settings.register("arcane-artifex", "stabilityAspectRatio", {
    name: "stabilityAspectRatio",
    hint: "Select a predefined Stable Diffusion 3 aspect ratio",
    scope: "world",
    config: false,
    type: String,
    default: "1:1"
  });

  game.settings.register("arcane-artifex", "openAiApiKey", {
    name: "openAiApiKey",
    scope: "world",
    type: String,
    default: "0000000000",
    config: false,
  });

  game.settings.register("arcane-artifex", "openAiResolutionOption", {
    name: "openAiResolutionOption",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  game.settings.register("arcane-artifex", "openAiHeight", {
    name: "openAiHeight",
    scope: "world",
    config: false,
    type: Number,
    default: 1024
  });

  game.settings.register("arcane-artifex", "openAiWidth", {
    name: "openAiWidth",
    scope: "world",
    config: false,
    type: Number,
    default: 1024
  });

  game.settings.register("arcane-artifex", "openAiHd", {
    name: "openAiHd",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register("arcane-artifex", "openAiVivid", {
    name: "openAiVivid",
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });


  // For image height settings
  game.settings.register("arcane-artifex", "localA1111Height", {
    name: "Image Height",
    scope: "world",
    config: false,
    type: Number,
    default: 512
  });
  game.settings.register("arcane-artifex", "hordeResolutionOption", {
    name: "hordeResolutionOption",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  game.settings.register("arcane-artifex", "hordeHeight", {
    name: "hordeResolutionOption",
    scope: "world",
    config: false,
    type: Number,
    default: 512
  });

  game.settings.register("arcane-artifex", "comfyUiHeight", {
    name: "Image Height",
    scope: "world",
    config: false,
    type: Number,
    default: 512
  });

  // For CFG scale settings
  game.settings.register("arcane-artifex", "localA1111CfgScale", {
    name: "CFG Scale",
    hint: "Set the CFG scale value",
    scope: "world",
    config: false,
    type: Number,
    range: { min: 1, max: 30, step: 0.5 },
    default: 1.5
  });
  game.settings.register("arcane-artifex", "hordeCfgScale", {
    name: "CFG Scale",
    hint: "Set the CFG scale value",
    scope: "world",
    config: false,
    type: Number,
    range: { min: 1, max: 30, step: 0.5 },
    default: 1.5
  });
  game.settings.register("arcane-artifex", "comfyUiCfgScale", {
    name: "CFG Scale",
    hint: "Set the CFG scale value",
    scope: "world",
    config: false,
    type: Number,
    range: { min: 1, max: 30, step: 0.5 },
    default: 1.5
  });

  // For sampler steps settings
  game.settings.register("arcane-artifex", "localA1111SamplerSteps", {
    name: "Sampler Steps",
    hint: "Set the number of sampler steps",
    scope: "world",
    config: false,
    type: Number,
    range: { min: 1, max: 150, step: 1 },
    default: 20
  });
  game.settings.register("arcane-artifex", "hordeSamplerSteps", {
    name: "Sampler Steps",
    hint: "Set the number of sampler steps",
    scope: "world",
    config: false,
    type: Number,
    range: { min: 1, max: 150, step: 1 },
    default: 20
  });
  game.settings.register("arcane-artifex", "comfyUiSamplerSteps", {
    name: "Sampler Steps",
    hint: "Set the number of sampler steps",
    scope: "world",
    config: false,
    type: Number,
    range: { min: 1, max: 150, step: 1 },
    default: 20
  });

  // For restore faces settings
  game.settings.register("arcane-artifex", "localA1111RestoreFaces", {
    name: "Restore Faces",
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });

  // For hires fix settings
  game.settings.register("arcane-artifex", "localA1111EnableHr", {
    name: "Hires. Fix",
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });

  // For HR scale settings
  game.settings.register("arcane-artifex", "localA1111HrScale", {
    name: "Upscale by",
    hint: "What to multiply the resolution by",
    scope: "world",
    config: false,
    type: Number,
    range: { min: 1.0, max: 4.0, step: 0.1 },
    default: 2.0
  });

  // For denoising strength settings
  game.settings.register("arcane-artifex", "localA1111DenoisingStrength", {
    name: "Hires. Fix Denoising Strength",
    hint: "How strongly the upscaler effects image generation",
    scope: "world",
    config: false,
    type: Number,
    range: { min: 0.0, max: 1.0, step: 0.01 },
    default: 0.7
  });

  // For HR second pass steps settings
  game.settings.register("arcane-artifex", "localA1111HrSecondPassSteps", {
    name: "Number of second pass steps",
    hint: "How many steps to take in the second pass",
    scope: "world",
    config: false,
    type: Number,
    range: { min: 0, max: 150, step: 1 },
    default: 0
  });

  game.settings.register("arcane-artifex", "promptPrefix", {
    name: "Prompt Prefix",
    hint: "Set the default prompt prefix",
    scope: "world",
    config: true,
    type: String,
    default: 'best quality'
  });

  game.settings.register("arcane-artifex", "negativePrompt", {
    name: "Negative Prompt",
    hint: "Set the default negative prompt",
    scope: "world",
    config: true,
    type: String,
    default: 'lowres, bad anatomy, bad hands, text, error, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry'
  });

  game.settings.register("arcane-artifex", "prompt", {
    name: "prompt",
    hint: "Set the full prompt",
    scope: "world",
    config: false,
    type: String,
    default: ''
  });

}