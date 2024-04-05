import { defaultSettings } from './registerSettings.js';

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

        const samplers = await this.loadHordeSamplers();

        // Merge defaults with saved settings, with saved settings taking precedence
        const context = mergeObject(defaultSettings, savedSettings);
        this.context = context;
        return context;
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
        await game.settings.set('stable-images', 'stable-settings', updatedSettings);

        // Re-render the form with the updated data
        this.render(true);
    }
}