import localA1111APIClient from "./localA1111ApiClient.js";

export default class LocalA1111Settings extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'a1111-settings',
            classes: ["arcane-artifex"],
            title: "A1111 Settings",
            template: "modules/arcane-artifex/templates/a1111-settings.hbs",
            width: 700,
            height: "auto",
            resizable: true
        });
    }

    getData(options) {
        const context = super.getData(options);
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

        return context;
    }


    activateListeners(html) {
        super.activateListeners(html);
    
        html[0].querySelector('[name="a1111_url"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111Url", event.target.value);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_model"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111Model", event.target.value);
            await this.changeModel(event.target.value);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_sampler"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111Sampler", event.target.value);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_upscaler"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111Upscaler", event.target.value);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_cfg_scale"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111CfgScale", event.target.value);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_sampler_steps"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111SamplerSteps", event.target.value);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_height"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111Height", event.target.value);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_width"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111Width", event.target.value);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_restore_faces"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111RestoreFaces", event.target.checked);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_enable_hr"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111EnableHr", event.target.checked);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_hr_scale"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111HrScale", event.target.value);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_denoising_strength"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111DenoisingStrength", event.target.value);
            this.render(true);
        });
    
        html[0].querySelector('[name="a1111_hr_second_pass_steps"]').addEventListener('change', async (event) => {
            await game.settings.set("arcane-artifex", "localA1111HrSecondPassSteps", event.target.value);
            this.render(true);
        });
    
        this.changeLoraPrompt();
     
        const a1111Loras = this.getData().a1111_loras;
        for (let span of html[0].querySelectorAll('span.lora-choice')) {
            let loraAlias = span.innerText.trim();
            let lora = a1111Loras.find(l => l.alias === loraAlias);
            if (lora && lora.active) {
                span.classList.add('active');
            }
            span.addEventListener('click', (event) => this.toggleLora(event, lora));
        }

        html[0].querySelectorAll('.form-group.active-lora .stable-lora-value').forEach(range => {
            range.addEventListener('change', (event) => this.changeLoraStrength(event, range.dataset.loraAlias));
        });
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
        if (Array.isArray(loras)) {
            loras.forEach(lora => {
                if (lora.active) {
                    let newString = `<lora:${lora.alias}:${lora.strength}>`;
                    loraPrompt += newString;
                }
            });
        }
        if (this.form) {
            this.form.querySelector('textarea[name="loraPrompt"]').value = loraPrompt;
        }
        await game.settings.set('arcane-artifex', 'localA1111LoraPrompt', loraPrompt);
    }

    async changeModel(title) {
        return await this.postOption({
            sd_model_checkpoint: title,
        });
    }

    async postOption(option) {
        let stIP = await game.settings.get("arcane-artifex", "localA1111Url");
        let optionsUrl = `${stIP}/sdapi/v1/options`;
        try {
            fetch(optionsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(option)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(async () => {
                    await localA1111APIClient.getA1111EndpointSettings();
                    if (ui.activeWindow.title == "settings for stable diffusion image generation") {
                        ui.activeWindow.render(true);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch (e) {
            ui.notifications.warn('Error while sending request to stable diffusion');
        }
    }

    async _updateObject(event, formData) {
        this.render(true);
    }
}
