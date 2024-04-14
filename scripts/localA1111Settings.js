import sdAPIClient from "./sdAPIClient.js";

export default class LocalA1111Settings extends FormApplication {
    constructor(...args) {
        super();
        this.loadingModel = false;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["stable-images", "stable-setting-sheet"],
            template: "modules/stable-images/templates/stable-settings.hbs",
            width: 800,
            height: "auto",
            title: "Settings for Stable Diffusion Image Generation",
            resizable: true
        });
    }

    getData() {
        let context = game.settings.get('stable-images', 'stable-settings');
        context.source = game.settings.get("stable-images", "source");
        context.localA1111URL = game.settings.get("stable-images", "localA1111URL");


        context.localA1111Sampler = game.settings.get("stable-images", "localA1111Sampler");
        context.localA1111Upscaler = game.settings.get("stable-images", "localA1111Upscaler");
        context.activeModel = game.settings.get("stable-images", "localA1111Model");
        context.numImages = game.settings.get("stable-images", "numImages");
        context.stableStoragePath = game.settings.get("stable-images", "stableStoragePath");



        context.loras = game.settings.get("stable-images", "localA1111Loras");
        context.models = game.settings.get("stable-images", "localA1111Models");
        context.styles = game.settings.get("stable-images", "localA1111Styles");
        context.upscalers = game.settings.get("stable-images", "localA1111Upscalers");
        context.samplers = game.settings.get("stable-images", "localA1111Samplers");

        console.error(context);

        if (!context.activeLoras) {
            context.activeLoras = [];
        }

        this.context = context;
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.changeLoraPrompt();
    
        html[0].querySelector('select#change-model').addEventListener('change', this.changeModel.bind(this));
        html[0].querySelector('select#change-sampler').addEventListener('change', this.changeSampler.bind(this));
        html[0].querySelector('select#change-upscaler').addEventListener('change', this.changeUpscaler.bind(this));
    
        for (let span of html[0].querySelectorAll('span.lora-choice')) {
            let loraAlias = span.innerText.trim();
            let lora = this.context.loras.find(l => l.alias === loraAlias);
            if (lora && lora.active) {
                span.classList.add('active');
            }
            span.addEventListener('click', (event) => this.toggleLora(event, lora));
        }
    
        for (let range of html.find('.form-group.active-lora .stable-lora-value')) {
            range.addEventListener('change', (event) => this.changeLoraStrength(event, range.dataset.loraAlias));
        }
    
        html.find('input[name="numImages"]').on("input", async (event) => {
            await game.settings.set("stable-images", "numImages", parseInt(event.target.value));
            this.render(true);
        });
    
        html.find('select[name="source"]').on("change", async (event) => {
            await game.settings.set("stable-images", "source", event.target.value);
            this.render();
        });
    }

    async onChooseStableStorage(event) {
        event.preventDefault();
        const pickerOptions = {
            callback: (path) => {
                this.context.stableStoragePath = path;
                this.render();
            },
            multiple: false,
            type: 'folder',
            current: this.context.stableStoragePath
        };
        new FilePicker(pickerOptions).browse();
    }

    async changeModel(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let modelTitle = sel.options[sel.selectedIndex].value;
        await game.settings.set("stable-images", "localA1111Model", modelTitle);
        sdAPIClient.changeModel(modelTitle).then(this.render(true));
    }

    async changeSampler(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let samplerName = sel.options[sel.selectedIndex].value;
        await game.settings.set("stable-images", "localA1111Sampler", samplerName);
        this.render(true);
    }

    async changeUpscaler(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let upscalerName = sel.options[sel.selectedIndex].value;
        await game.settings.set("stable-images", "localA1111Upscaler", upscalerName);
        this.render(true);
    }

    async toggleLora(ev, lora) {
        let loraAlias = ev.currentTarget.innerText.trim();
        let loras = game.settings.get('stable-images', 'localA1111Loras');
        if (!lora) {
            console.error("Lora not found:", loraAlias);
            return;
        }
        lora.active = !lora.active;
        if (lora.active && lora.strength === undefined) {
            lora.strength = 0.5;
        }
        await game.settings.set('stable-images', 'localA1111Loras', [...loras]);
        this.render(true);
    }
    
    async changeLoraStrength(event, loraAlias) {
        let value = parseFloat(event.target.value);
        let loras = game.settings.get('stable-images', 'localA1111Loras');
        let lora = loras.find(l => l.alias === loraAlias);
        if (lora) {
            lora.strength = value;
            await game.settings.set('stable-images', 'localA1111Loras', [...loras]);
        }
        this.render(true);
    }
      

      async changeLoraPrompt() {
        let loras = game.settings.get('stable-images', 'localA1111Loras');
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
        await game.settings.set('stable-images', 'localA1111Loras', loras);
        this.context.loraPrompt = loraPrompt;
      }
      

    _updateObject(event, formData) {
        const data = {  };
        

        game.settings.set('stable-images', 'stable-settings', data);
    }
}
