/**
 * Represents the StableImageSettings class.
 * This class extends the FormApplication class and handles the settings for stable diffusion image generation.
 */
export default class ComfyUIImageSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "comfy-ui-settings",
            classes: ["stable-images"],
            title: "ComfyUI Images Settings",
            template: "modules/stable-images/templates/comfy-settings.hbs",
            closeOnSubmit: true,
            submitOnChange: true,
            submitOnClose: true,
        });
    }

    getData() {
        // Retrieve and return the current settings to populate the form
        return {
            'comfy_url': game.settings.get('stable-images', 'stable-settings')['comfy_url'],
        };
    }

    async _updateObject(event, formData) {
        // Update the game settings with the new ComfyUI IP address
        await game.settings.set('stable-images', 'stable-settings', {
            ...game.settings.get('stable-images', 'stable-settings'),
            'comfy_url': formData['comfy_url'],
        });
    }
}
