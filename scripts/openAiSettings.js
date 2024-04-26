import { defaultSettings } from './registerSettings.js';

export default class openAiSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'openai-settings',
            classes: ['arcane-artifex'],
            title: 'OpenAI Settings',
            template: 'modules/arcane-artifex/templates/openai-settings.hbs',
            width: 700,
            height: "auto",
            resizable: true
        });
    }

    async getData() {
        let context = {
            openai_api_key: game.settings.get("arcane-artifex", "openAiApiKey"),
            openai_resolution: game.settings.get("arcane-artifex", "openAiResolutionOptions"),
            openai_resolutions: this.prepareResolutionOptions(),
            openai_hd: game.settings.get("arcane-artifex", "openAiHd"),
            openai_vivid: game.settings.get("arcane-artifex", "openAiVivid")
        };
        console.warn("context", context);
        return context;
    }

    prepareResolutionOptions() {
        const openAiResolutionOptions = {
            "dalle_res_1024x1024": { width: 1024, height: 1024, name: "1024x1024 (1:1)" },
            "dalle_res_1792x1024": { width: 1792, height: 1024, name: "1792x1024 (Landscape)" },
            "dalle_res_1024x1792": { width: 1024, height: 1792, name: "1024x1792 (Portrait)" }
        };
        return Object.keys(openAiResolutionOptions).map(key => ({
            value: key,
            text: openAiResolutionOptions[key].name
        }));
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('[name="openai_api_key"]').change(event => this.onAPIKeyChange(event));
        html.find('select[name="openai_resolution"]').on("change", async (event) => {
            await game.settings.set("arcane-artifex", "openAiResolutionOptions", event.target.value);
            this.render();
        });
        // Update handlers for HD and Vivid checkboxes
        html.find('[name="openai_hd"]').change(event => this.onSettingChange(event, "openAiHd"));
        html.find('[name="openai_vivid"]').change(event => this.onSettingChange(event, "openAiVivid"));
    }
    
    async onSettingChange(event, settingKey) {
        const newValue = event.target.checked;
        await game.settings.set("arcane-artifex", settingKey, newValue);
    }
    
    

    async onAPIKeyChange(event) {
        const newAPIKey = event.target.value;
        await game.settings.set("arcane-artifex", "openAiApiKey", newAPIKey);
        this.render(true);
    }

    async _updateObject(event, formData) {
        if (formData.openai_api_key !== undefined) {
            await game.settings.set("arcane-artifex", "openAiApiKey", formData.openai_api_key);
        }
        if (formData.openai_resolution !== undefined) {
            await game.settings.set("arcane-artifex", "openAiResolutionOptions", formData.openai_resolution);
        }
        // Handle HD and Vivid settings
        if (formData.openai_hd !== undefined) {
            await game.settings.set("arcane-artifex", "openAiHd", formData.openai_hd);
        }
        if (formData.openai_vivid !== undefined) {
            await game.settings.set("arcane-artifex", "openAiVivid", formData.openai_vivid);
        }
    }
    
}
