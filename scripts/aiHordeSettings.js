import registerSettings from './registerSettings.js';

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

        registerDynamicSettings();
        console.error("getData called");
    
        let savedSettings = game.settings.get('stable-images', 'stable-settings') || {};
        console.error("savedSettings:", savedSettings);
    
        // Retrieve AI Horde models and activeModel
        const { models, activeModel } = await this.loadHordeModels();
        console.error("models:", models);
        console.error("activeModel:", activeModel);
    
        // Merge defaults with saved settings, with saved settings taking precedence
        let context = mergeObject(defaultSettings, savedSettings);
        console.error("context after merging defaults and saved settings:", context);
    
        // Add the retrieved models and activeModel to the context
        context.models = models; // Assign the 'models' array directly to the context
        context.activeModel = activeModel;
    
        console.error("context after adding models and activeModel:", context);
    
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
    
                const models = data.map(x => ({
                    value: x.name,
                    text: `${x.name} (ETA: ${x.eta}s, Queue: ${x.queued}, Workers: ${x.count})`
                }));
    
                // Retrieve the activeModel from the settings
                const savedSettings = game.settings.get('stable-images', 'stable-settings') || {};
                let activeModel = savedSettings.activeModel;
    
                // If the activeModel is not set or is not in the models array, set it to the first model
                if (!activeModel || !models.some(model => model.value === activeModel)) {
                    activeModel = models[0].value;
                }
    
                console.error("activeModel:", activeModel);
    
                return { models, activeModel };
            } else {
                console.error("Error while attempting to retrieve Horde models:", response.statusText);
                ui.notifications.error("Error while attempting to retrieve Horde models; error = " + response.statusText);
                return { models: [], activeModel: '' };
            }
        } catch (error) {
            console.error("Error while attempting to retrieve Horde models:", error);
            ui.notifications.error("Error while attempting to retrieve Horde models; error = " + error);
            return { models: [], activeModel: '' };
        }
    }
    activateListeners(html) {
        super.activateListeners(html);
        console.error("Activating listeners for aiHorde form.");

        // Event listener for the model change
       // html[0].querySelector('select#change-model').addEventListener('change', this.changeModel.bind(this));
       // console.error("Listener for model change activated.");

    }

    async _updateObject(event, formData) {
        console.error("_updateObject called");
        console.error("formData:", formData);

        // Directly update the settings with the formData without re-fetching the models
        // Since the models are already loaded in getData, we can omit loading them again here.
        await game.settings.set('stable-images', 'stable-settings', {
            ...this.context, // Use existing context which includes models and activeModel
            ...formData // Apply the form changes
        });
    
        // Re-render the form with the updated data
        this.render(true);
    }
    
}