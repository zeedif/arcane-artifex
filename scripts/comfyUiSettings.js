import comfyUIAPIClient from "./comfyUiApiClient.js";

export default class ComfyUISettings extends FormApplication {
    constructor(...args) {
        super();
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["stable-images", "stable-setting-sheet"],
            template: "modules/stable-images/templates/comfyui-settings.hbs",
            width: 800,
            height: "auto",
            title: "Settings for Stable Diffusion Image Generation",
            resizable: true
        });
    }

    getData() {
        let context = game.settings.get('stable-images', 'stable-settings');
        context.source = game.settings.get("stable-images", "source");

        context.comfyUIModel = game.settings.get("stable-images", "comfyUIModel");
        context.comfyUISampler = game.settings.get("stable-images", "comfyUISampler");
        context.comfyUIScheduler = game.settings.get("stable-images", "comfyUIScheduler");
        context.comfyUIUpscaler = game.settings.get("stable-images", "comfyUIUpscaler");
        context.comfyUIModels = game.settings.get("stable-images", "comfyUIModels");
        context.comfyUISamplers = game.settings.get("stable-images", "comfyUISamplers");
        context.comfyUISchedulers = game.settings.get("stable-images", "comfyUISchedulers");
        context.comfyUIUpscalers = game.settings.get("stable-images", "comfyUIUpscalers");
        context.comfyUILoras = game.settings.get("stable-images", "comfyUILoras");
          
        console.log("Context after adding data:", context);
    
        this.context = context;
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.changeLoraPrompt();
    
        html[0].querySelector('select#change-model').addEventListener('change', this.changeModel.bind(this));
        html[0].querySelector('select#change-sampler').addEventListener('change', this.changeSampler.bind(this));
        html[0].querySelector('select#change-scheduler').addEventListener('change', this.changeScheduler.bind(this));
        html[0].querySelector('select#change-upscaler').addEventListener('change', this.changeUpscaler.bind(this));
    
    // Adjust event listener setup for 'span.lora-choice'
    for (let span of html[0].querySelectorAll('span.lora-choice')) {
        let loraName = span.innerText.trim();
        // Check if the lora is active by finding it in the array and checking its 'active' property
        let lora = this.context.comfyUILoras.find(l => l.lora === loraName);
        if (lora && lora.active) {
            span.classList.add('active');
        }
        span.addEventListener('click', (event) => this.toggleLora(event, lora));
    }

    // Attach event listeners to range inputs for Lora strength adjustments
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
        await game.settings.set("stable-images", "comfyUIModel", modelTitle);
        this.render(true);
    }

    async changeSampler(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let samplerName = sel.options[sel.selectedIndex].value;
        await game.settings.set("stable-images", "comfyUISampler", samplerName);
        this.render(true);
    }

    async changeScheduler(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let schedulerName = sel.options[sel.selectedIndex].value;
        await game.settings.set("stable-images", "comfyUIScheduler", schedulerName);
        this.render(true);
    }

    async changeUpscaler(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let upscalerName = sel.options[sel.selectedIndex].value;
        await game.settings.set("stable-images", "comfyUIUpscaler", upscalerName);
        this.render(true);
    }

    async toggleLora(ev) {
        let loraName = ev.currentTarget.innerText.trim();
        let loras = game.settings.get('stable-images', 'comfyUILoras');
        let lora = loras.find(l => l.lora === loraName);
    
        if (!lora) {
            console.error("Lora not found:", loraName);
            return;
        }
    
        // Toggle the 'active' state of the Lora
        lora.active = !lora.active;
    
        // If toggling lora to active, set a default strength if not already set
        if (lora.active && lora.strength === undefined) {
            lora.strength = 0.5; // Default strength value
        }
    
        // Update the game setting with the modified loras array
        // Make a shallow copy of the array to ensure the setting system detects the change
        await game.settings.set('stable-images', 'comfyUILoras', [...loras]);
    
        // Call a render method to update the UI immediately
        this.render(true);
    }
    
    

    async changeLoraStrength(event, loraAlias) {
        let value = parseFloat(event.target.value);
        let loras = game.settings.get('stable-images', 'comfyUILoras');
        let lora = loras.find(l => l.lora === loraAlias);
        if (lora) {
            lora.strength = value; // Update the strength value
            // Update settings as needed
            await game.settings.set('stable-images', 'comfyUILoras', [...loras]);
        }
        this.render(true);
    }
    

    async changeLoraPrompt() {
        let loras = game.settings.get('stable-images', 'comfyUILoras');  // Retrieve the array of Loras from the settings.
        let loraPrompt = "";
    
        // Iterate over all loras and construct the prompt string for active loras.
        loras.forEach(lora => {
            if (lora.active) {  // Check if the Lora is active.
                let newString = `<lora:${lora.lora}:${lora.strength}>`;  // Construct the string using the lora's alias and its current strength.
                loraPrompt += newString;  // Append the new string to the prompt.
            }
        });
    
        // Update the textarea for loraPrompt
        if (this.form) {
            this.form.querySelector('textarea[name="loraPrompt"]').value = loraPrompt;  // Update the textarea with the new lora prompt.
        }
    
        // Save the updated loras back to the settings, ensuring changes are recognized by Foundry's settings management
        await game.settings.set('stable-images', 'comfyUILoras', loras);
    
        // Optionally update the local context if it is used elsewhere
        this.context.loraPrompt = loraPrompt;
        
    }
    
    
    _updateObject(event, formData) {
        // Assuming `expandObject` correctly expands formData into an object
        const data = { ...this.context, ...expandObject(formData) };
        game.settings.set('stable-images', 'stable-settings', data);
    }
    
}
