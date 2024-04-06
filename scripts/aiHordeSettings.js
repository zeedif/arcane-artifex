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
      
        const { horde_models, horde_model } = await this.loadHordeModels();
        const samplers = await this.loadHordeSamplers();
      
        // Merge defaults with saved settings, with saved settings taking precedence
        const context = mergeObject(defaultSettings, savedSettings);
        context.horde_models = horde_models;
        context.horde_model = horde_model;
        context.horde_sampler = savedSettings.horde_sampler || 'k_euler'; // Default to 'k_euler' if not set
        context.samplers = await this.loadHordeSamplers();
        context.source = game.settings.get("stable-images", "source");
      
      
        this.context = context;
        return context;
      }


    async loadHordeModels() {
        try {
            const hordeUrl = game.settings.get('stable-images', 'horde_url');
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
        return [
          { name: 'k_lms' },
          { name: 'k_heun' },
          { name: 'k_euler' },
          { name: 'k_dpm_2' },
          { name: 'k_dpm_2_a' },
          { name: 'DDIM' },
          { name: 'PLMS' },
          { name: 'k_dpm_fast' },
          { name: 'k_dpm_adaptive' },
          { name: 'k_dpmpp_2s_a' },
          { name: 'k_dpmpp_2m' },
          { name: 'dpmsolver' }
        ];
      }
    /**
     * Activate form listeners.
     * @param {JQuery} html - The form HTML.
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('[name="horde_nsfw"]').change(event => this.onToggleChange(event));
      
        // Add event listener for source selection change
        html.find('select[name="source"]').on("change", async (event) => {
          await game.settings.set("stable-images", "source", event.target.value);
          this.render();
        });
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