import sdAPIClient from "./sdAPIClient.js";


export default class StableImageSettings extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["stable-images", "stable-setting-sheet"],
            template: "modules/stable-images/templates/stable-settings.hbs",
            width: "auto",
            height: "auto",
            title: "settings for stable diffusion image generation"
        });
    }
    getData() {
        let context = game.settings.get('stable-images', 'stable-settings');
        context.loras = sdAPIClient.loras
        context.activeModel = sdAPIClient.sdOptions.sd_model_checkpoint;
        context.models = sdAPIClient.models;
        console.log(context);
        this.context = context;
        return context;
    }
    activateListeners(html) {
        super.activateListeners(html);
        console.log(html)
        html[0].querySelector('select#change-model').addEventListener('change', this.changeModel.bind(this))
        for (let span of html[0].querySelectorAll('span.lora-choice')) {
            let activeMap = this.context.activeLoras?.map(l => l.alias);
            if (activeMap?.indexOf(span.innerText) > -1) { span.classList.add('active') }
            span.addEventListener('click', this.toggleLora.bind(this))
        }
        //selections of activeLora

        for (let range of html.find('.form-group.active-lora .stable-lora-value')) {
            range.addEventListener('change', this.changeLoraPrompt.bind(this));
            

        }


    }
    async changeModel(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let modelTitle = sel.options[sel.selectedIndex].value;
        sdAPIClient.changeModel(modelTitle).then(this.render(true))

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

        console.log(this.context);

        await game.settings.set('stable-images', 'stable-settings', this.context);
        await this.render(true);
    }

    async changeLoraPrompt(ev) {
        let html = this.form;
        let lorPrompt = ""
        for (let loraEl of html.getElementsByClassName('active-lora')) {
            let range = loraEl.querySelector('input')
            
                let targetLora=this.context.activeLoras.find(l => l.name == range.dataset.loraName)
                if (targetLora){targetLora.value = range.value}
                lorPrompt += `<lora:${range.dataset.loraName}:${range.value}>`
            
        }
        console.log(this.context.activeLoras)
        html.querySelector('textarea[name="loraPrompt"]').value = lorPrompt;
        this.context.loraPrompt=lorPrompt
        await game.settings.set('stable-images', 'stable-settings', this.context)
        this.render(true)
    }
    _updateObject(event, formData) {

        const data = expandObject(formData);
        game.settings.set('stable-images', 'stable-settings', data);
        console.log("setttObj______", data);
        foundry.utils.debounce(() => window.location.reload(), 100);
    }
}