export default class ComfyUISettings extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'comfyui-settings',
            classes: ['arcane-artifex'],
            title: 'ComfyUI Settings',
            template: 'modules/arcane-artifex/templates/comfyui-settings.hbs',
            width: 700,
            height: "auto",
            resizable: true
        });
    }
    getData(options) {
        const context = super.getData(options);
        context.comfyui_url = game.settings.get("arcane-artifex", "comfyUiUrl");
        context.comfyui_workflow_storage_path = game.settings.get("arcane-artifex", "comfyUiWorkflowStoragePath");
        context.comfyui_workflow = game.settings.get("arcane-artifex", "comfyUiWorkflow");
        context.comfyui_model = game.settings.get("arcane-artifex", "comfyUiModel");
        context.comfyui_sampler = game.settings.get("arcane-artifex", "comfyUiSampler");
        context.comfyui_scheduler = game.settings.get("arcane-artifex", "comfyUiScheduler");
        context.comfyui_upscaler = game.settings.get("arcane-artifex", "comfyUiUpscaler");
        context.comfyui_models = game.settings.get("arcane-artifex", "comfyUiModels");
        context.comfyui_samplers = game.settings.get("arcane-artifex", "comfyUiSamplers");
        context.comfyui_schedulers = game.settings.get("arcane-artifex", "comfyUiSchedulers");
        context.comfyui_upscalers = game.settings.get("arcane-artifex", "comfyUiUpscalers");
        context.comfyui_loras = game.settings.get("arcane-artifex", "comfyUiLoras");
        context.comfyui_width = game.settings.get("arcane-artifex", "comfyUiWidth");
        context.comfyui_height = game.settings.get("arcane-artifex", "comfyUiHeight");
        context.comfyui_cfg_scale = game.settings.get("arcane-artifex", "comfyUiCfgScale");
        context.comfyui_sampler_steps = game.settings.get("arcane-artifex", "comfyUiSamplerSteps");

        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html[0].querySelector('[name="comfyui_url"]').addEventListener('click', async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiUrl", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="comfyui_workflow_storage_path"]').addEventListener('click', async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiWorkflowStoragePath", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="comfyui_workflow"]').addEventListener('click', async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiWorkflow", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="comfyui_model"]').addEventListener('click', async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiModel", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="comfyui_sampler"]').addEventListener('click', async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiSampler", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="comfyui_scheduler"]').addEventListener('click', async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiScheduler", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="comfyui_upscaler"]').addEventListener('click', async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiUpscaler", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="comfyui_cfg_scale"]').addEventListener('click', async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiCfgScale", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="comfyui_sampler_steps"]').addEventListener('click', async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiSamplerSteps", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="comfyui_height"]').addEventListener('click', async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiHeight", event.target.value);
            this.render(true);
        });
        html[0].querySelector('[name="comfyui_width"]').addEventListener('click', async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiWidth", event.target.value);
            this.render(true);
        });
        
        html[0].querySelector('button.file-picker').addEventListener('click', async (event) => {
            new FilePicker({
                type: event.currentTarget.dataset.type,
                current: html.find(event.currentTarget.dataset.target).val(),
                callback: async (path) => {
                    html.find(event.currentTarget.dataset.target).val(path).change();
                    if (event.currentTarget.dataset.type === 'folder') {
                        await game.settings.set("arcane-artifex", "comfyUiWorkflowStoragePath", path);
                    } else if (event.currentTarget.dataset.type === 'file') {
                        await game.settings.set("arcane-artifex", "comfyUiWorkflow", path);
                    }
                    this.render(true);
                }
            }).render(true);
        });
        

        
        this.changeLoraPrompt();

        const comfyUiLoras = this.getData().comfyui_loras;
        for (let span of html[0].querySelectorAll('span.lora-choice')) {
            let loraName = span.innerText.trim();
            let lora = comfyUiLoras.find(l => l.lora === loraName);
            if (lora && lora.active) {
                span.classList.add('active');
            }
            span.addEventListener('click', (event) => this.toggleLora(event, lora));
        }

        html[0].querySelectorAll('.form-group.active-lora .stable-lora-value')
            .forEach(range => {
                range.addEventListener('change', (event) => this.changeLoraStrength(event, range.dataset.loraAlias));
            });



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
        if (Array.isArray(loras)) {
            loras.forEach(lora => {
                if (lora.active) {
                    let newString = `<lora:${lora.lora}:${lora.strength}>`;
                    loraPrompt += newString;
                }
            });
        }
        if (this.form) {
            this.form.querySelector('textarea[name="loraPrompt"]').value = loraPrompt;
        }
        await game.settings.set('arcane-artifex', 'comfyUiLoras', loras);
        this.context.loraPrompt = loraPrompt;
    }

    async _updateObject(event, formData) {
        // Settings are saved by individual listeners on 'change'.
        // This method is called on form submission.
        // Re-rendering will ensure the form reflects any state not caught by immediate listeners.
        this.render(true);
    }
}
