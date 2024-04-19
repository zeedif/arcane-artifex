import { defaultSettings } from './registerSettings.js';

export default class HordeSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'aihorde-settings',
            classes: ['arcane-artifex'],
            title: 'AI Horde Settings',
            template: 'modules/arcane-artifex/templates/aihorde-settings.hbs',
            width: 700,
            height: "auto",
            resizable: true
        });
    }

    async getData() {
        let context = {};
        context.horde_models = game.settings.get("arcane-artifex", "hordeModels");
        context.horde_model = game.settings.get("arcane-artifex", "hordeModel");
        context.horde_sampler = game.settings.get("arcane-artifex", "hordeSampler");
        context.horde_samplers = game.settings.get("arcane-artifex", "hordeSamplers");
        context.horde_nsfw = game.settings.get("arcane-artifex", "hordeNSFW");
        context.horde_karras = game.settings.get("arcane-artifex", "hordeKarras");
        context.horde_url = game.settings.get("arcane-artifex", "hordeURL");
        context.horde_api_key = game.settings.get("arcane-artifex", "hordeAPIKey");
        context.source = game.settings.get("arcane-artifex", "source");

        this.context = context;

        console.error("context", context);

        return context;
    }

activateListeners(html) {
        super.activateListeners(html);
        html.find('[name="horde_nsfw"]').change(event => this.onToggleNSFWChange(event));
        html.find('[name="horde_karras"]').change(event => this.onToggleKarrasChange(event));
        html.find('[name="horde_api_key"]').change(event => this.onAPIKeyChange(event));
        html.find('select[name="source"]').on("change", async (event) => {
            await game.settings.set("arcane-artifex", "source", event.target.value);
            this.render();
        });
        html.find('select[name="horde_model"]').on("change", async (event) => {
            await game.settings.set("arcane-artifex", "hordeModel", event.target.value);
            this.render();
        });
        html.find('select[name="horde_sampler"]').on("change", async (event) => {
            await game.settings.set("arcane-artifex", "hordeSampler", event.target.value);
            this.render();
        });
    }
    

    async onToggleNSFWChange(event) {
        const isChecked = event.target.checked;
        await game.settings.set("arcane-artifex", "hordeNSFW", isChecked);
        this.render(true);
    }

    async onToggleKarrasChange(event) {
        const isChecked = event.target.checked;
        await game.settings.set("arcane-artifex", "hordeKarras", isChecked);
        this.render(true);
    }

    async onAPIKeyChange(event) {
        const newAPIKey = event.target.value;
        await game.settings.set("arcane-artifex", "hordeAPIKey", newAPIKey);
        this.render(true);
    }

    async _updateObject(event, formData) {
        const savedSettings = game.settings.get('arcane-artifex', 'stable-settings');
        const updatedSettings = mergeObject(savedSettings, formData);
        await game.settings.set('arcane-artifex', 'stable-settings', updatedSettings);

        this.render(true);
    }
}

