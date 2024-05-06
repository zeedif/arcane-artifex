export default class stabilitySettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'stability-settings',
            classes: ['arcane-artifex'],
            title: 'stability Settings',
            template: 'modules/arcane-artifex/templates/stability-settings.hbs',
            width: 700,
            height: "auto",
            resizable: true
        });
    }

    async getData() {
        let context = {
            stability_api_key: game.settings.get("arcane-artifex", "stabilityApiKey"),
            stability_aspect_ratio: game.settings.get("arcane-artifex", "stabilityAspectRatio"),
            stability_aspect_ratios: this.prepareAspectRatios(),
            stability_model: game.settings.get("arcane-artifex", "stabilityModel"),
            stability_models: this.prepareModels()
        };
        return context;
    }

    prepareAspectRatios() {
        const stabilityAspectRatios = {
            "16:9": "2040x1152 (16:9, SD3)",
            "9:16": "1152x2040 (9:16, SD3)",
            "1:1": "1536x1536 (1:1, SD3)",
            "21:9": "2336x992 (21:9, SD3)",
            "9:21": "992x2336 (9:21, SD3)",
            "2:3": "1248x1872 (2:3, SD3)",
            "3:2": "1872x1248 (3:2, SD3)",
            "4:5": "1368x1712 (4:5, SD3)",
            "5:4": "1712x1368 (5:4, SD3)"
          };
        return Object.keys(stabilityAspectRatios).map(key => ({
            value: key,
            text: stabilityAspectRatios[key]
        }));
    }

    prepareModels() {
        const stabilityModels = {
            "sd3": "SD3",
            "sd3-turbo": "SD3 Turbo",
          };
        return Object.keys(stabilityModels).map(key => ({
            value: key,
            text: stabilityModels[key]
        }));
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('[name="stability_api_key"]').change(event => this.onAPIKeyChange(event));
        html.find('select[name="stability_aspect_ratio"]').on("change", async (event) => {
            await game.settings.set("arcane-artifex", "stabilityAspectRatio", event.target.value);
            this.render();
        });
        html.find('select[name="stability_model"]').on("change", async (event) => {
            await game.settings.set("arcane-artifex", "stabilityModel", event.target.value);
            this.render();
        });

    }
          async onAPIKeyChange(event) {
        const newAPIKey = event.target.value;
        await game.settings.set("arcane-artifex", "stabilityApiKey", newAPIKey);
        this.render(true);
    }

    async _updateObject(event, formData) {
        if (formData.stability_api_key !== undefined) {
            await game.settings.set("arcane-artifex", "stabilityApiKey", formData.stability_api_key);
        }
        if (formData.stability_aspect_ratio !== undefined) {
            await game.settings.set("arcane-artifex", "stabilityAspectRatio", formData.stability_aspect_ratio);
        }
        if (formData.stability_model !== undefined) {
            await game.settings.set("arcane-artifex", "stabilityModel", formData.stability_model);
        }

    }
    
}