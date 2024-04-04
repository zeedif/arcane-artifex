import { defaultSettings, resolutionOptions } from './registerSettings.js';

export default class AiHordeSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'aihorde-settings',
            classes: ['stable-images'],
            title: 'AI Horde Settings',
            template: 'modules/stable-images/templates/aihorde-settings.hbs',
            width: 700,
            height: "auto",
            rezisable: true
        });
    }

    /**
     * Retrieve data for the form.
     * @returns {Promise<Object>} The form data.
     */
    async getData() {
        const savedSettings = game.settings.get('stable-images', 'stable-settings') || {};
        console.error("savedSettings:", savedSettings);
        const { horde_models, horde_model } = await this.loadHordeModels();
        const samplers = await this.loadHordeSamplers();

        // Merge defaults with saved settings, with saved settings taking precedence
        const context = mergeObject(defaultSettings, savedSettings);
        context.resolutionOptions = resolutionOptions;
        context.horde_models = horde_models;
        context.horde_model = horde_model;

        this.context = context;
        return context;
    }

    /**
     * Load Horde models from the API.
     * @returns {Promise<Object>} An object containing horde_models and horde_model.
     */
    async loadHordeModels() {
        try {
            const hordeUrl = defaultSettings.horde_url;
            const response = await fetch(`${hordeUrl}/api/v2/status/models`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                data.sort((a, b) => b.count - a.count);

                const horde_models = data.map(x => ({
                    value: x.name,
                    text: `${x.name} (ETA: ${x.eta}s, Queue: ${x.queued}, Workers: ${x.count})`
                }));

                // Retrieve the horde_model from the settings
                const savedSettings = game.settings.get('stable-images', 'stable-settings') || {};
                let horde_model = savedSettings.horde_model;

                // If the horde_model is not set or is not in the horde_models array, set it to the first model
                if (!horde_model || !horde_models.some(model => model.value === horde_model)) {
                    horde_model = horde_models[0].value;
                }

                return { horde_models, horde_model };
            } else {
                ui.notifications.error(`Error while retrieving Horde models: ${response.statusText}`);
                return { horde_models: [], horde_model: '' };
            }
        } catch (error) {
            ui.notifications.error(`Error while retrieving Horde models: ${error}`);
            return { horde_models: [], horde_model: '' };
        }
    }

    /**
     * Load Horde samplers.
     * @returns {Promise<Array>} An array of sampler objects.
     */
    async loadHordeSamplers() {
        return [{ name: 'k_euler' }];
    }

    /**
     * Activate form listeners.
     * @param {JQuery} html - The form HTML.
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('[name="horde_nsfw"]').change(event => this.onToggleChange(event));
    }

    /**
     * Handle toggle change event.
     * @param {Event} event - The toggle change event.
     */
    async onToggleChange(event) {
        // Handle toggle change event
    }

    /**
     * Update form object.
     * @param {Event} event - The form submission event.
     * @param {Object} formData - The form data.
     */
    async _updateObject(event, formData) {
        const savedSettings = game.settings.get('stable-images', 'stable-settings');
        const updatedSettings = mergeObject(savedSettings, formData);
        const selectedResolution = resolutionOptions[formData.sd_resolution];
        formData.width = selectedResolution.width;
        formData.height = selectedResolution.height;
        await game.settings.set('stable-images', 'stable-settings', updatedSettings);

        // Re-render the form with the updated data
        this.render(true);
    }
}