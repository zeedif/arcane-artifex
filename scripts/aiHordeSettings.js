import {defaultSettings} from './registerSettings.js';

export default class AiHordeSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'aihorde-settings',
            classes: ['stable-images'],
            title: 'AI Horde Settings',
            template: 'modules/stable-images/templates/aihorde-settings.hbs',
            width: 800,
            height: "auto",
            rezisable: true
        });
    }

   
    async getData() {
        console.error("getData called");
    
        let savedSettings = game.settings.get('stable-images', 'stable-settings') || {};
        console.error("savedSettings:", savedSettings);
    
        // Retrieve AI Horde horde_models and horde_model
        const { horde_models, horde_model } = await this.loadHordeModels();
        console.error("horde_models:", horde_models);
        console.error("horde_model:", horde_model);
    
    
        // Fetch samplers
        const samplers = await this.loadHordeSamplers();


        // Merge defaults with saved settings, with saved settings taking precedence
        let context = mergeObject(defaultSettings, savedSettings);
        console.error("context after merging defaults and saved settings:", context);
    
        // Add the retrieved horde_models and horde_model to the context
        context.horde_models = horde_models; // Assign the 'horde_models' array directly to the context
        context.horde_model = horde_model;
    
        console.error("context after adding horde_models and horde_model:", context);
    
        this.context = context;
        console.error("this.context:", this.context);
    
        return context;
    }
    async loadHordeModels() {
        console.error("loadHordeModels called");
    
        try {
            const hordeUrl = defaultSettings.horde_url;
            console.error("hordeUrl:", hordeUrl);
    
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
    
                console.error("horde_model:", horde_model);
    
                return { horde_models, horde_model };
            } else {
                console.error("Error while attempting to retrieve Horde models:", response.statusText);
                ui.notifications.error("Error while attempting to retrieve Horde models; error = " + response.statusText);
                return { horde_models: [], horde_model: '' };
            }
        } catch (error) {
            console.error("Error while attempting to retrieve Horde models:", error);
            ui.notifications.error("Error while attempting to retrieve Horde models; error = " + error);
            return { horde_models: [], horde_model: '' };
        }
    }
    async loadHordeSamplers() {
        // Directly return an array with a single sampler object
        return [{ name: 'k_euler' }];
    }
    
    



    activateListeners(html) {
        super.activateListeners(html);
        console.error("Activating listeners for aiHorde form.");
    
        // Add change listener for the NSFW toggle
        html.find('[name="horde_nsfw"]').change(event => this.onToggleChange(event));
    }

    async onToggleChange(event) {
        // Example: Update a specific setting directly on toggle change, or store it for form submission
        console.error("Toggle changed", event.currentTarget.checked);

    }

    async _updateObject(event, formData) {
        console.error("_updateObject called with formData:", formData);
    
        // Directly merge formData into saved settings and save
        const savedSettings = game.settings.get('stable-images', 'stable-settings');
        const updatedSettings = mergeObject(savedSettings, formData);
        await game.settings.set('stable-images', 'stable-settings', updatedSettings);
        console.error("Settings updated successfully.");
    
        // Re-render the form with the updated data
        // This call is correct; 'true' would also work and is often recommended to force re-render
        this.render(true);
    }
    
    
    
}