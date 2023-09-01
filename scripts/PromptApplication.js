/**
 * Represents a PromptApplication class that extends FormApplication.
 * This class is responsible for creating a form application for prompting the user.
 */
export default class PromptApplication extends FormApplication {
    /**
     * Creates an instance of PromptApplication.
     * @param {string} prompt - The prompt message.
     * @param {string} actorUuid - The UUID of the actor.
     */
    constructor(prompt, actorUuid) {
        super();
        this.basePrompt = prompt; // Initialize basePrompt variable with the provided prompt
        this.actorId = actorUuid; // Initialize actorId variable with the provided actorUuid
    }

    /**
     * Returns the default options for the PromptApplication.
     * @returns {Object} - The default options object.
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form', 'stable-image'], // Add 'form' and 'stable-image' classes to the options
            popOut: true, // Enable pop-out feature
            closeOnSubmit: true, // Close the form on submit
            template: 'modules/stable-images/templates/promptApp.hbs', // Set the template for the form
            id: 'creaPerso', // Set the id of the form
            title: "actor prompt", // Set the title of the form
            width: 400, // Set the width of the form
            height: 400, // Set the height of the form
            left: 40, // Set the left position of the form
            top: 40 // Set the top position of the form
        });
    }

    /**
     * Retrieves the data for the PromptApplication.
     * @returns {Object} - The data object.
     */
    getData() {
        return mergeObject(super.getData(), {
            basePrompt: this.basePrompt // Add the basePrompt to the data object
        });
    };

    /**
     * Updates the object with the form data.
     */
    _updateObject() {
        let prompt = this.form.querySelector('[name="basePrompt"]').value; // Get the value of the input field with name "basePrompt"
        const msgData = {
            user: game.user.id, // Set the user property to the current user's ID
            type: 1, // Set the message type to 1
            speaker: ChatMessage.getSpeaker(), // Get the speaker object for the chat message
            content: prompt, // Set the content of the message to the prompt value
            flags: {
                'stable-images': {
                    fromActor: this.actorId // Set the fromActor flag to the actorId
                }
            }
        };
        ChatMessage.create(msgData); // Create a new chat message with the msgData
    }
}