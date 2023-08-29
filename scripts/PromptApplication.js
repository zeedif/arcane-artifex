export default class PromptApplication extends FormApplication {




    constructor(prompt, actorId) {
        super();
        this.basePrompt = prompt;
        this.actorId = actorId

    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form', 'stable-image'],
            popOut: true,
            closeOnSubmit: true,
            template: 'modules/stable-images/templates/promptApp.hbs',
            id: 'creaPerso',
            title: "actor prompt",
            width: 400,
            height: 400,
            left: 40,
            top: 40
        });
    }
    setTargetActor(actor) {
        this.targetActor = actor
    };

    getData() {
        return mergeObject(super.getData(), {
            basePrompt: this.basePrompt
        });
    };

    _updateObject() {
        let prompt = this.form.querySelector('[name="basePrompt"]').value
        const msgData = {
            user: game.user.id,
            type: 1,
            speaker: ChatMessage.getSpeaker(),
            content: prompt,
            flags: {
                'stable-images': {
                    fromActor: this.actorId
                }
            }
        };
        ChatMessage.create(msgData)
    }
}