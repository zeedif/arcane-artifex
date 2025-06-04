export default class HordeSettings extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'aihorde-settings',
            classes: ['arcane-artifex'],
            title: 'AI Horde Settings',
            template: 'modules/arcane-artifex/templates/aihorde-settings.hbs',
            width: 700,
            height: "auto",
            resizable: true
        });
    }

    getData(options) {
        const context = super.getData(options);
        context.horde_models = game.settings.get("arcane-artifex", "hordeModels");
        context.horde_model = game.settings.get("arcane-artifex", "hordeModel");
        context.horde_sampler = game.settings.get("arcane-artifex", "hordeSampler");
        context.horde_samplers = game.settings.get("arcane-artifex", "hordeSamplers");
        context.horde_nsfw = game.settings.get("arcane-artifex", "hordeNSFW");
        context.horde_karras = game.settings.get("arcane-artifex", "hordeKarras");
        context.horde_url = game.settings.get("arcane-artifex", "hordeUrl");
        context.horde_api_key = game.settings.get("arcane-artifex", "hordeAPIKey");
        context.horde_cfg_scale = game.settings.get("arcane-artifex", "hordeCfgScale");
        context.horde_sampler_steps = game.settings.get("arcane-artifex", "hordeSamplerSteps");
        context.horde_resolution = game.settings.get("arcane-artifex", "hordeResolutionOption");
        
        const hordeResolutionOptions = this.prepareResolutionOptions();
        context.horde_resolutions = Object.entries(hordeResolutionOptions).map(([key, value]) => ({ text: key, value: key }));

        return context;
    }

    prepareResolutionOptions() {
        const hordeResolutionOptions = {
            "512x512 (1:1, icons, profile pictures. SD1.5)": { width: 512, height: 512 },
            "600x600 (1:1, icons, profile pictures, SD1.5)": { width: 600, height: 600 },
            "512x768 (2:3, vertical character card, SD1.5)": { width: 512, height: 768 },
            "768x512 (3:2, horizontal 35-mm movie film, SD1.5)": { width: 768, height: 512 },
            "960x540 (16:9, horizontal wallpaper, SD1.5)": { width: 960, height: 540 },
            "540x960 (9:16, vertical wallpaper, SD1.5)": { width: 540, height: 960 },
            "1920x1088 (16:9, 1080p, horizontal wallpaper)": { width: 1920, height: 1088 },
            "1088x1920 (9:16, 1080p, vertical wallpaper)": { width: 1088, height: 1920 },
            "1280x720 (16:9, 720p, horizontal wallpaper)": { width: 1280, height: 720 },
            "720x1280 (9:16, 720p, vertical wallpaper)": { width: 720, height: 1280 },
            "1024x1024 (1:1, SDXL)": { width: 1024, height: 1024 },
            "1152x896 (9:7, SDXL)": { width: 1152, height: 896 },
            "896x1152 (7:9, SDXL)": { width: 896, height: 1152 },
            "1216x832 (19:13, SDXL)": { width: 1216, height: 832 },
            "832x1216 (13:19, SDXL)": { width: 832, height: 1216 },
            "1344x768 (4:3, SDXL)": { width: 1344, height: 768 },
            "768x1344 (3:4, SDXL)": { width: 768, height: 1344 },
            "1536x640 (24:10, SDXL)": { width: 1536, height: 640 },
            "640x1536 (10:24, SDXL)": { width: 640, height: 1536 }
        };
        
        return hordeResolutionOptions;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html[0].querySelector('[name="horde_model"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "hordeModel", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="horde_sampler"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "hordeSampler", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="horde_nsfw"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "hordeNSFW", event.target.checked);
            this.render(true);
        });
        html[0].querySelector('[name="horde_karras"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "hordeKarras", event.target.checked);
            this.render(true);
        });
        html[0].querySelector('[name="horde_url"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "hordeUrl", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="horde_api_key"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "hordeAPIKey", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="horde_cfg_scale"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "hordeCfgScale", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="horde_sampler_steps"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "hordeSamplerSteps", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="horde_resolution"]').addEventListener('change', async (event) => {
            const hordeResolutionOptions = this.prepareResolutionOptions();
            const resolutionObject = hordeResolutionOptions[event.target.value];
            const { width, height } = resolutionObject;

            await game.settings.set("arcane-artifex", "hordeResolutionOption", event.target.value);
            await game.settings.set("arcane-artifex", "hordeHeight", height);
            await game.settings.set("arcane-artifex", "hordeWidth", width);
        
            this.render(true);
        });
    }
    
    async _updateObject(event, formData) {
        this.render(true);
    }
}

