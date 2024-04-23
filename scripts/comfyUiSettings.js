export default class ComfyUISettings extends FormApplication {
    constructor(...args) {
        super();
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["arcane-artifex", "stable-setting-sheet"],
            template: "modules/arcane-artifex/templates/comfyui-settings.hbs",
            width: 800,
            height: "auto",
            title: "Settings for Stable Diffusion Image Generation",
            resizable: true
        });
    }

    getData() {
        const context = game.settings.get('arcane-artifex', 'stable-settings');
        context.source = game.settings.get("arcane-artifex", "source");
        context.comfyui_url = game.settings.get("arcane-artifex", "comfyUiUrl");


        context.comfyui_model = game.settings.get("arcane-artifex", "comfyUiModel");
        context.comfyui_sampler = game.settings.get("arcane-artifex", "comfyUiSampler");
        context.comfyui_scheduler = game.settings.get("arcane-artifex", "comfyUiScheduler");
        context.comfyui_upscaler = game.settings.get("arcane-artifex", "comfyUiUpscaler");
        context.comfyui_models = game.settings.get("arcane-artifex", "comfyUiModels");
        context.comfyui_samplers = game.settings.get("arcane-artifex", "comfyUiSamplers");
        context.comfyui_schedulers = game.settings.get("arcane-artifex", "comfyUiSchedulers");
        context.comfyui_upscalers = game.settings.get("arcane-artifex", "comfyUiUpscalers");
        context.comfyui_loras = game.settings.get("arcane-artifex", "comfyUiLoras");
        context.comfyui_stability_api_key = game.settings.get("arcane-artifex", "comfyUiStabilityApiKey");
        context.comfyui_usesd3 = game.settings.get("arcane-artifex", "comfyUiUseSd3");
        context.comfyui_usesd3upscaler = game.settings.get("arcane-artifex", "comfyUiUseSd3Upscaler");
        context.comfyui_s3d_aspect_ratio = game.settings.get("arcane-artifex", "comfyUiS3dAspectRatio");
        context.comfyui_s3d_aspect_ratio_choices = {
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

        console.error("Context after adding data:", context);

        this.context = context;
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.changeLoraPrompt();

        html.find('[name="comfyui_usesd3"]').change(event => this.onToggleUseSd3Change(event));
        html.find('[name="comfyui_usesd3upscaler"]').change(event => this.onToggleUseSd3UpscalerChange(event));
        html.find('[name="stability_api_key"]').change(event => this.onAPIKeyChange(event));

        html[0].querySelector('select#change-model').addEventListener('change', this.changeModel.bind(this));
        html[0].querySelector('select#change-sampler').addEventListener('change', this.changeSampler.bind(this));
        html[0].querySelector('select#change-scheduler').addEventListener('change', this.changeScheduler.bind(this));
        html[0].querySelector('select#change-upscaler').addEventListener('change', this.changeUpscaler.bind(this));

        for (let span of html[0].querySelectorAll('span.lora-choice')) {
            let loraName = span.innerText.trim();
            let lora = this.context.comfyui_loras.find(l => l.lora === loraName);
            if (lora && lora.active) {
                span.classList.add('active');
            }
            span.addEventListener('click', (event) => this.toggleLora(event, lora));
        }

        for (let range of html.find('.form-group.active-lora .stable-lora-value')) {
            range.addEventListener('change', (event) => this.changeLoraStrength(event, range.dataset.loraAlias));
        }

        html.find('input[name="comfyui_url"]').on("change", async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiUrl", event.target.value.trim());
            console.error("ComfyUI URL updated to:", event.target.value.trim());
            this.render();
        });

    }


    async changeModel(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let modelTitle = sel.options[sel.selectedIndex].value;
        await game.settings.set("arcane-artifex", "comfyUiModel", modelTitle);
        this.render(true);
    }

    async changeSampler(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let samplerName = sel.options[sel.selectedIndex].value;
        await game.settings.set("arcane-artifex", "comfyUiSampler", samplerName);
        this.render(true);
    }

    async changeScheduler(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let schedulerName = sel.options[sel.selectedIndex].value;
        await game.settings.set("arcane-artifex", "comfyUiScheduler", schedulerName);
        this.render(true);
    }

    async changeUpscaler(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let upscalerName = sel.options[sel.selectedIndex].value;
        await game.settings.set("arcane-artifex", "comfyUiUpscaler", upscalerName);
        this.render(true);
    }

    async toggleLora(ev, lora) {
        let loraName = ev.currentTarget.innerText.trim();
        let loras = game.settings.get('arcane-artifex', 'comfyUiLoras');
        if (!lora) {
            console.error("Lora not found:", loraName);
            return;
        }
        lora.active = !lora.active;
        if (lora.active && lora.strength === undefined) {
            lora.strength = 0.5;
        }
        await game.settings.set('arcane-artifex', 'comfyUiLoras', [...loras]);
        this.render(true);
    }

    async changeLoraStrength(event, loraAlias) {
        let value = parseFloat(event.target.value);
        let loras = game.settings.get('arcane-artifex', 'comfyUiLoras');
        let lora = loras.find(l => l.lora === loraAlias);
        if (lora) {
            lora.strength = value;
            await game.settings.set('arcane-artifex', 'comfyUiLoras', [...loras]);
        }
        this.render(true);
    }

    async changeLoraPrompt() {
        let loras = game.settings.get('arcane-artifex', 'comfyUiLoras');
        let loraPrompt = "";
        loras.forEach(lora => {
            if (lora.active) {
                let newString = `<lora:${lora.lora}:${lora.strength}>`;
                loraPrompt += newString;
            }
        });
        if (this.form) {
            this.form.querySelector('textarea[name="loraPrompt"]').value = loraPrompt;
        }
        await game.settings.set('arcane-artifex', 'comfyUiLoras', loras);
        this.context.loraPrompt = loraPrompt;
    }

    async onToggleUseSd3Change(event) {
        const isChecked = event.target.checked;
        await game.settings.set("arcane-artifex", "comfyUiUseSd3", isChecked);
        this.render(true);
    }

    async onToggleUseSd3UpscalerChange(event) {
        const isChecked = event.target.checked;
        await game.settings.set("arcane-artifex", "comfyUiUseSd3Upscaler", isChecked);
        this.render(true);
    }

    async onAPIKeyChange(event) {
        const newAPIKey = event.target.value;
        await game.settings.set("arcane-artifex", "comfyUiStabilityApiKey", newAPIKey);
        this.render(true);
    }



    _updateObject(event, formData) {
        const data = { ...this.context, ...expandObject(formData) };
        game.settings.set('arcane-artifex', 'stable-settings', data);
    }
}
