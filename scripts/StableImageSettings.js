import sdAPIClient from "./sdAPIClient.js";


export default class StableImageSettings extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["stable-images", "stable-setting-sheet"],
            template: "modules/stable-images/templates/stable-settings.hbs",
            width: 512,
            height: "auto",
            title: "settings for stable diffusion image generation"
        });
    }
    getData() {
        return game.settings.get('stable-images', 'stable-settings');
    }

    _updateObject(event, formData) {

        const data = expandObject(formData);
        game.settings.set('stable-images', 'stable-settings', data);
        console.log("setttObj______", data);
        foundry.utils.debounce(() => window.location.reload(), 100);
    }
}