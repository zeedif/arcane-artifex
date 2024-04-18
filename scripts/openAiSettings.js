import { defaultSettings } from './registerSettings.js';

export default class openAiSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'openai-settings',
            classes: ['stable-images'],
            title: 'OpenAI Settings',
            template: 'modules/stable-images/templates/openai-settings.hbs',
            width: 700,
            height: "auto",
            resizable: true
        });
    }

    async getData() {
        let context = {
            openai_api_key: game.settings.get("stable-images", "openAiApiKey"),
            openai_resolution: game.settings.get("stable-images", "openAiResolutionOptions"),
            openai_resolutions: this.prepareResolutionOptions()
        };
        console.error("context", context);
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
            await game.settings.set("stable-images", "openAiResolutionOptions", event.target.value);
            this.render();
        });
    }

    async onAPIKeyChange(event) {
        const newAPIKey = event.target.value;
        await game.settings.set("stable-images", "openAiApiKey", newAPIKey);
        this.render(true);
    }

    async _updateObject(event, formData) {
        if (formData.openai_api_key !== undefined) {
            await game.settings.set("stable-images", "openAiApiKey", formData.openai_api_key);
        }
        if (formData.openai_resolution !== undefined) {
            await game.settings.set("stable-images", "openAiResolutionOptions", formData.openai_resolution);
        }
    }
}
