export default class ComfyUISettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'comfyui-settings',
            classes: ['arcane-artifex'],
            title: 'ComfyUI Settings',
            template: 'modules/arcane-artifex/templates/comfyui-settings.hbs',
            width: 700,
            height: "auto",
            resizable: true
        });
    }
    getData() {
        let context = {};
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

        this.context = context;

        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('[name="comfyui_url"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiUrl", event.target.value);
            this.render(true);
        });
        html.find('[name="comfyui_workflow_storage_path"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiWorkflowStoragePath", event.target.value);
            this.render(true);
        });
        html.find('[name="comfyui_workflow"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiWorkflow", event.target.value);
            this.render(true);
        });
        html.find('[name="comfyui_model"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiModel", event.target.value);
            this.render(true);
        });
        html.find('[name="comfyui_sampler"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiSampler", event.target.value);
            this.render(true);
        });
        html.find('[name="comfyui_scheduler"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiScheduler", event.target.value);
            this.render(true);
        });
        html.find('[name="comfyui_upscaler"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiUpscaler", event.target.value);
            this.render(true);
        });
        html.find('[name="comfyui_cfg_scale"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiCfgScale", event.target.value);
            this.render(true);
        });
        html.find('[name="comfyui_sampler_steps"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiSamplerSteps", event.target.value);
            this.render(true);
        });
        html.find('[name="comfyui_height"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiHeight", event.target.value);
            this.render(true);
        });
        html.find('[name="comfyui_width"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "comfyUiWidth", event.target.value);
            this.render(true);
        });

        
        this.changeLoraPrompt();

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

    _updateObject(event, formData) {
        this.render(true);
    }
}
