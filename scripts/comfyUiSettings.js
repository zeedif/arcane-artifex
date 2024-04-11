import comfyUIAPIClient from "./comfyUiApiClient.js";

export default class ComfyUISettings extends FormApplication {
    constructor(...args) {
        super();
        this.loadingModel = false;
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
        context.comfyUISamplingMethod = game.settings.get("stable-images", "comfyUISamplingMethod");
        context.comfyUIScheduler = game.settings.get("stable-images", "comfyUIScheduler");
        
        // Add the data retrieved from the ComfyUI API
        context.comfyUIModels = comfyUIAPIClient.comfyUIModels;
        context.comfyUISamplers = comfyUIAPIClient.comfyUISamplers;
        context.comfyUISchedulers = comfyUIAPIClient.comfyUISchedulers;
        context.comfyUIUpscalers = comfyUIAPIClient.comfyUIUpscalers;
        context.comfyUILoras = comfyUIAPIClient.comfyUILoras;
        
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
    
        for (let span of html[0].querySelectorAll('span.lora-choice')) {
            let activeMap = this.context.activeLoras?.map(l => l);
            if (activeMap?.indexOf(span.innerText) > -1) {
                span.classList.add('active');
            }
            span.addEventListener('click', this.toggleLora.bind(this));
        }
    
        for (let range of html.find('.form-group.active-lora .stable-lora-value')) {
            range.addEventListener('change', this.changeLoraPrompt.bind(this));
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
       // sdAPIClient.changeModel(modelTitle).then(this.render(true));
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
        let samplerName = sel.options[sel.selectedIndex].value;
        await game.settings.set("stable-images", "comfyUISampler", schedulerName);
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
        let loraAlias = ev.currentTarget.innerText;
        let lora = this.context.loras.find(l => l.alias === loraAlias);
        lora.value = 0;
        let toActive = true;
        this.context.activeLoras.forEach((active, index) => {
            if (active.alias === lora.alias) {
                this.context.activeLoras.splice(index, 1);
                toActive = false;
            }
        });
        if (toActive) {
            this.context.activeLoras.push(lora);
        }
        if (!this.context.activeLoras) { this.context.activeLoras = [] }
        await game.settings.set('stable-images', 'stable-settings', this.context);
        this.render(true);
    }

    async changeLoraPrompt() {
        let html = this.form;
        let lorPrompt = "";

        for (let loraEl of html.getElementsByClassName('active-lora')) {
            let range = loraEl.querySelector('input');
            let targetLora = this.context.activeLoras.find(l => l.name == range.dataset.loraAlias);
            if (targetLora) {
                targetLora.value = range.value;
            }
            let newString = `<lora:${range.dataset.loraAlias}:${range.value}>`
            lorPrompt += newString;
        }

        html.querySelector('textarea[name="loraPrompt"]').value = lorPrompt;
        this.context.loraPrompt = lorPrompt;
    }

    _updateObject(event, formData) {
        const data = { ...this.context, ...expandObject(formData) };
        game.settings.set('stable-images', 'stable-settings', data);
    }
}
