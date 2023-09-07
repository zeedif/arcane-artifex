import sdAPIClient from "./sdAPIClient.js";

/**
 * Represents the StableImageSettings class.
 * This class extends the FormApplication class and handles the settings for stable diffusion image generation.
 */
export default class StableImageSettings extends FormApplication {


    constructor(...args) {
        super();
        /**
         * Represents the loadingModel variable.
         * @type {boolean}
         * @default false
         */
        this.loadingModel = false;
    }
    /**
     * Retrieves the default options for the StableImageSettings class.
     * @returns {Object} - The default options
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["stable-images", "stable-setting-sheet"],
            template: "modules/stable-images/templates/stable-settings.hbs",
            width: 800,
            height: "auto",
            title: "settings for stable diffusion image generation",
            rezisable: true
        });
    }

    /**
     * Retrieves the data for the StableImageSettings form.
     * @returns {Object} - The data for the form
     */
    getData() {
        // Get the stable-settings from game settings
        let context = game.settings.get('stable-images', 'stable-settings');
        // Assign loras, activeModel, and models from sdAPIClient
        context.loras = sdAPIClient.loras;
        context.activeModel = sdAPIClient.sdOptions.sd_model_checkpoint;
        context.models = sdAPIClient.models;
        context.styles = sdAPIClient.styles;
        if (!context.activeLoras) { context.activeLoras = [] }
        // Store the context
        this.context = context;
        return context;
    }

    /**
     * Adds event listeners to the form elements.
     * @param {HTMLElement} html - The HTML element of the form
     */
    activateListeners(html) {
        super.activateListeners(html);
        this.changeLoraPrompt()


        // Event listener for the choose-stable-storage button
        html.find('#choose-stable-storage').click(this.onChooseStableStorage.bind(this));

        // Event listener for the model change
        html[0].querySelector('select#change-model').addEventListener('change', this.changeModel.bind(this));

        // Event listeners for lora choices
        for (let span of html[0].querySelectorAll('span.lora-choice')) {
            // Check if the span's innerText is in the activeLoras aliases
            let activeMap = this.context.activeLoras?.map(l => l.alias);
            if (activeMap?.indexOf(span.innerText) > -1) {
                span.classList.add('active');
            }
            span.addEventListener('click', this.toggleLora.bind(this));
        }

        // Event listeners for activeLora selections
        for (let range of html.find('.form-group.active-lora .stable-lora-value')) {
            range.addEventListener('change', this.changeLoraPrompt.bind(this));
        }
    }
    /**
  * Opens the file picker dialog to choose a stable storage directory.
  * @param {Event} event - The event object
  */
    async onChooseStableStorage(event) {
        event.preventDefault();
        // Open the file picker dialog
        const pickerOptions = {
            /**
             * Callback function that is called when a directory is selected.
             * @param {string} path - The selected directory path
             */
            callback: (path) => {
                // Update the stable storage directory path
                this.context.stableStoragePath = path;
                this.render();
            },
            multiple: false,
            type: 'folder',
            current: this.context.stableStoragePath
        };
        new FilePicker(pickerOptions).browse();
    }
    /**
     * Handles the model change event.
     * @param {Event} ev - The event object
     */
    async changeModel(ev) {
        ev.preventDefault();
        let sel = ev.currentTarget;
        let modelTitle = sel.options[sel.selectedIndex].value;
        // Change the model using sdAPIClient and render the form
        sdAPIClient.changeModel(modelTitle).then(this.render(true));
    }

    /**
     * Handles the lora toggle event.
     * @param {Event} ev - The event object
     */
    async toggleLora(ev) {
        let loraAlias = ev.currentTarget.innerText;
        let lora = this.context.loras.find(l => l.alias === loraAlias);
        lora.value = 0;
        let toActive = true;
        // Iterate through activeLoras and check if the lora is already active
        this.context.activeLoras.forEach((active, index) => {
            if (active.alias === lora.alias) {
                // If the lora is already active, remove it from activeLoras
                this.context.activeLoras.splice(index, 1);
                toActive = false;
            }
        });
        if (toActive) {
            // If the lora is not active, add it to activeLoras
            this.context.activeLoras.push(lora);
        }
        //be sure active loras stay an empty array if last index was spliced
        if (!this.context.activeLoras) { this.context.activeLoras = [] }
        // Update the stable-settings in game settings and render the form
        await game.settings.set('stable-images', 'stable-settings', this.context);
        this.render(true);
    }

    /**
     * Handles the lora prompt change event.
     * @param {Event} ev - The event object
     */
    async changeLoraPrompt() {
        //getting the form element
        let html = this.form;
        //initiating the prompt string for loras
        let lorPrompt = "";

        // Loop through each element with the class 'active-lora' in the HTML
        for (let loraEl of html.getElementsByClassName('active-lora')) {
            let range = loraEl.querySelector('input');
            // Find the targetLora in the activeLoras array based on the loraName attribute of the range
            let targetLora = this.context.activeLoras.find(l => l.name == range.dataset.loraAlias);
            if (targetLora) {
                // Set the value of the targetLora to the value of the range
                targetLora.value = range.value;
            }
            // Add the loraPrompt string with the format <lora:name:value>
            let newString = `<lora:${range.dataset.loraAlias}:${range.value}>`
            lorPrompt += newString;

        }

        // Set the value of the textarea with the name 'loraPrompt' to the lorPrompt string
        html.querySelector('textarea[name="loraPrompt"]').value = lorPrompt;

        // Update the loraPrompt property of the context object
        this.context.loraPrompt = lorPrompt;

    }

    /**
     * Updates the object with the form data.
     * @param {Event} event - The event object
     * @param {Object} formData - The form data
     */
    _updateObject(event, formData) {
        const data = { ...this.context, ...expandObject(formData) };
        // Update the stable-settings in game settings
        game.settings.set('stable-images', 'stable-settings', data);

    }
}