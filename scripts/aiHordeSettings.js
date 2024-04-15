import { defaultSettings } from './registerSettings.js';

export default class HordeSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'aihorde-settings',
            classes: ['stable-images'],
            title: 'AI Horde Settings',
            template: 'modules/stable-images/templates/aihorde-settings.hbs',
            width: 700,
            height: "auto",
            resizable: true
        });
    }

    async getData() {

        context.horde_models = game.settings.get("stable-images", "hordeModels");
        context.horde_model = game.settings.get("stable-images", "hordeModel");
        context.horde_sampler = game.settings.get("stable-images", "hordeSampler");
        context.horde_samplers = game.settings.get("stable-images", "hordeSamplers");
        context.horde_nsfw = game.settings.get("stable-images", "hordeNSFW");
        context.horde_url = game.settings.get("stable-images", "hordeURL");
        context.horde_api_key = game.settings.get("stable-images", "hordeAPIKey");



        context.source = game.settings.get("stable-images", "source");

        this.context = context;
        return context;
    }





    activateListeners(html) {
        super.activateListeners(html);
        html.find('[name="horde_nsfw"]').change(event => this.onToggleChange(event));

        html.find('select[name="source"]').on("change", async (event) => {
            await game.settings.set("stable-images", "source", event.target.value);
            this.render();
        });
    }

    async onToggleChange(event) {
        // Handle toggle change event
    }

    async _updateObject(event, formData) {
        const savedSettings = game.settings.get('stable-images', 'stable-settings');
        const updatedSettings = mergeObject(savedSettings, formData);
        await game.settings.set('stable-images', 'stable-settings', updatedSettings);

        this.render(true);
    }
}
