export default class openAiSettings extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'openai-settings',
            classes: ['arcane-artifex'],
            title: 'OpenAI Settings',
            template: 'modules/arcane-artifex/templates/openai-settings.hbs',
            width: 700,
            height: "auto",
            resizable: true
        });
    }

    getData(options) {
        const context = super.getData(options);
        context.openai_api_key = game.settings.get("arcane-artifex", "openAiApiKey");
        context.openai_resolution = game.settings.get("arcane-artifex", "openAiResolutionOption");
        context.openai_hd = game.settings.get("arcane-artifex", "openAiHd");
        context.openai_vivid = game.settings.get("arcane-artifex", "openAiVivid");

        const openAiResolutionOptions = this.prepareResolutionOptions();
        context.openai_resolutions = Object.entries(openAiResolutionOptions).map(([key, value]) => ({ text: key, value: key }));

        return context;
    }

    prepareResolutionOptions() {
        const openAiResolutionOptions = {
            "1024x1024 (1:1)": { width: 1024, height: 1024},
            "1792x1024 (Landscape)": { width: 1792, height: 1024 },
            "1024x1792 (Portrait)": { width: 1024, height: 1792  }
        };
        return openAiResolutionOptions;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html[0].querySelector('[name="openai_api_key"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "openAiApiKey", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="openai_hd"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "openAiHd", event.target.checked);
        });
        html[0].querySelector('[name="openai_vivid"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "openAiVivid", event.target.checked);
        });

        html[0].querySelector('select[name="openai_resolution"]').addEventListener('change', async (event) => {
            const openAiResolutionOptions = this.prepareResolutionOptions();
            const resolutionObject = openAiResolutionOptions[event.target.value];
            const { width, height } = resolutionObject;

            await game.settings.set("arcane-artifex", "openAiResolutionOption", event.target.value);
            await game.settings.set("arcane-artifex", "openAiHeight", height);
            await game.settings.set("arcane-artifex", "openAiWidth", width);

            this.render(true);

        });
    }

    async _updateObject(event, formData) {
        this.render(true);
    }
    
}
