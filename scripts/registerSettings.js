export default function registerSettings() {
    game.settings.register("stable-images", "preprompt", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "pre-prompt", // Register a module setting with checkbox
        hint: "preprompt", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: String,
        default: "RAW photography portrait of a fantasy character from a dnd adventure, in the style of Keith Parkinson", // The default value for the setting
    });
    game.settings.register("stable-images", "connection", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "connection", // Register a module setting with checkbox
        hint: "conncetion", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: false, // This specifies that the setting appears in the configuration view
        type: Boolean,
        default: false
    });
    game.settings.register("stable-images", "negativePrompt", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "negative-prompt", // Register a module setting with checkbox
        hint: "negative-prompt", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: String,
        default: "nsfw, nude, censored,bad anatomy, bad hands, three hands, three legs, bad arms, missing legs, missing arms, poorly drawn face, bad face, fused face, cloned face, worst face, three crus, extra crus, fused crus, worst feet, three feet, fused feet, fused thigh, three thigh, fused thigh, extra thigh, worst thigh, missing fingers, extra fingers, ugly fingers, long fingers, horn, extra eyes, huge eyes, 2girl, amputation, disconnected limbs, cartoon, cg, 3d, unreal, animate", // The default value for the setting
    });
    game.settings.register("stable-images", "ip", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "stable diffusion server IP", // Register a module setting with checkbox
        hint: "stable diffusion server IP", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: String,
        default: "http://127.0.0.1:7860", // The default value for the setting
    });
    game.settings.register("stable-images", "width", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "width", // Register a module setting with checkbox
        hint: "width of generated image", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Number,
        default: 512,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 128,
            max: 1024,
            step: 64
        }// The default value for the setting
    });

    game.settings.register("stable-images", "height", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "height", // Register a module setting with checkbox
        hint: "height of generated image", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Number,
        default: 512,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 128,
            max: 1024,
            step: 64
        }
    });
    game.settings.register("stable-images", "batchCount", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "batch count", // Register a module setting with checkbox
        hint: "number of generated image", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Number,
        default: 4,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 1,
            max: 8,
            step: 1
        }
    });
    game.settings.register("stable-images", "steps", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "steps", // Register a module setting with checkbox
        hint: "number of steps for generating image", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Number,
        default: 24,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 15,
            max: 50,
            step: 1
        }
    });
    game.settings.register("stable-images", "cfgScale", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "cfg_scale", // Register a module setting with checkbox
        hint: "Classifier Free Guidance Scale - how strongly the image should conform to prompt - lower values produce more creative results", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Number,
        default: 6,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 2,
            max: 20,
            step: 1
        }
    });

}