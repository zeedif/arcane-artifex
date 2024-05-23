import sdAPIClient from "./sdAPIClient.js";

export default class LocalA1111Settings extends FormApplication {
    constructor(...args) {
        super();
        this.loadingModel = false;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["arcane-artifex", "stable-setting-sheet"],
            template: "modules/arcane-artifex/templates/stable-settings.hbs",
            width: 800,
            height: "auto",
            title: "Settings for A1111 Image Generation",
            resizable: true
        });
    }

    getData() {
        let context = {};
        context.a1111_url = game.settings.get("arcane-artifex", "localA1111Url");
        context.a1111_model = game.settings.get("arcane-artifex", "localA1111Model");
        context.a1111_sampler = game.settings.get("arcane-artifex", "localA1111Sampler");
        context.a1111_upscaler = game.settings.get("arcane-artifex", "localA1111Upscaler");
        context.a1111_loras = game.settings.get("arcane-artifex", "localA1111Loras");
        context.a1111_models = game.settings.get("arcane-artifex", "localA1111Models");
        context.a1111_upscalers = game.settings.get("arcane-artifex", "localA1111Upscalers");
        context.a1111_samplers = game.settings.get("arcane-artifex", "localA1111Samplers");
        context.a1111_width = game.settings.get("arcane-artifex", "localA1111Width");
        context.a1111_height = game.settings.get("arcane-artifex", "localA1111Height");
        context.a1111_cfg_scale = game.settings.get("arcane-artifex", "localA1111CfgScale");
        context.a1111_sampler_steps = game.settings.get("arcane-artifex", "localA1111SamplerSteps");
        context.a1111_restore_faces = game.settings.get("arcane-artifex", "localA1111RestoreFaces");
        context.a1111_enable_hr = game.settings.get("arcane-artifex", "localA1111EnableHr");
        context.a1111_hr_scale = game.settings.get("arcane-artifex", "localA1111HrScale");
        context.a1111_denoising_strength = game.settings.get("arcane-artifex", "localA1111DenoisingStrength");
        context.a1111_hr_second_pass_steps = game.settings.get("arcane-artifex", "localA1111HrSecondPassSteps");
        context.a1111_lora_prompt = game.settings.get("arcane-artifex", "localA1111LoraPrompt");

        console.error(context);

        if (!context.activeLoras) {
            context.activeLoras = [];
        }

        this.context = context;
        return context;
    }


    activateListeners(html) {
        super.activateListeners(html);
    
        html.find('[name="a1111_url"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111Url", event.target.value);
            this.render(true);
        });
    
        html.find('[name="a1111_model"]').change(async (event) => {
            console.error("Model changed", event.target.value);
            await game.settings.set("arcane-artifex", "localA1111Model", event.target.value);
            await sdAPIClient.changeModel(event.target.value);
            this.render(true);
        });
    
        html.find('[name="a1111_sampler"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111Sampler", event.target.value);
            this.render(true);
        });
    
        html.find('[name="a1111_upscaler"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111Upscaler", event.target.value);
            this.render(true);
        });
    
        html.find('[name="a1111_cfg_scale"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111CfgScale", event.target.value);
            this.render(true);
        });
    
        html.find('[name="a1111_sampler_steps"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111SamplerSteps", event.target.value);
            this.render(true);
        });
    
        html.find('[name="a1111_height"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111Height", event.target.value);
            this.render(true);
        });
    
        html.find('[name="a1111_width"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111Width", event.target.value);
            this.render(true);
        });
    
        html.find('[name="a1111_restore_faces"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111RestoreFaces", event.target.checked);
            this.render(true);
        });
    
        html.find('[name="a1111_enable_hr"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111EnableHr", event.target.checked);
            this.render(true);
        });
    
        html.find('[name="a1111_hr_scale"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111HrScale", event.target.value);
            this.render(true);
        });
    
        html.find('[name="a1111_denoising_strength"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111DenoisingStrength", event.target.value);
            this.render(true);
        });
    
        html.find('[name="a1111_hr_second_pass_steps"]').change(async (event) => {
            await game.settings.set("arcane-artifex", "localA1111HrSecondPassSteps", event.target.value);
            this.render(true);
        });
    
        this.changeLoraPrompt();
    
        for (let span of html[0].querySelectorAll('span.lora-choice')) {
            let loraAlias = span.innerText.trim();
            let lora = this.context.a1111_loras.find(l => l.alias === loraAlias);
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
        let loraAlias = ev.currentTarget.innerText.trim();
        let loras = game.settings.get('arcane-artifex', 'localA1111Loras');
        if (!lora) {
            console.error("Lora not found:", loraAlias);
            return;
        }
        lora.active = !lora.active;
        if (lora.active && lora.strength === undefined) {
            lora.strength = 0.5;
        }
        await game.settings.set('arcane-artifex', 'localA1111Loras', [...loras]);
        this.render(true);
    }
    
    async changeLoraStrength(event, loraAlias) {
        let value = parseFloat(event.target.value);
        let loras = game.settings.get('arcane-artifex', 'localA1111Loras');
        let lora = loras.find(l => l.alias === loraAlias);
        if (lora) {
            lora.strength = value;
            await game.settings.set('arcane-artifex', 'localA1111Loras', [...loras]);
        }
        this.render(true);
    }
      

      async changeLoraPrompt() {
        let loras = game.settings.get('arcane-artifex', 'localA1111Loras');
        let loraPrompt = "";
        loras.forEach(lora => {
          if (lora.active) {
            let newString = `<lora:${lora.alias}:${lora.strength}>`;
            loraPrompt += newString;
          }
        });
        if (this.form) {
          this.form.querySelector('textarea[name="loraPrompt"]').value = loraPrompt;
        }
        await game.settings.set('arcane-artifex', 'localA1111LoraPrompt', loraPrompt);
      }
      

      

    _updateObject(event, formData) {
        const data = {  };
        

        game.settings.set('arcane-artifex', 'stable-settings', data);
    }
}
