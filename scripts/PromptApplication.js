export default class PromptApplication extends FormApplication {
    constructor(prompt, actorUuid, options = {}) {
        super({}, options);
        this.basePrompt = prompt;
        this.actorId = actorUuid;
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['form', 'stable-image'],
            popOut: true,
            closeOnSubmit: true,
            template: 'modules/arcane-artifex/templates/promptApp.hbs',
            id: 'creaPerso',
            title: "actor prompt",
            width: 400,
            height: 400,
            left: 200,
            top: 200
        });
    }

    getData(options) {
        const context = super.getData(options);
        return foundry.utils.mergeObject(context, {
            basePrompt: this.basePrompt
        });
    }

    async _updateObject(event, formData) {
        const prompt = formData.basePrompt;
        const msgData = {
             user: game.user.id,
            type: CONST.CHAT_MESSAGE_TYPES.OOC,
            speaker: ChatMessage.getSpeaker(),
            content: prompt,
            flags: {
                'arcane-artifex': {
                    fromActor: this.actorId
                }
            }
        };
        await ChatMessage.create(msgData);
    }
}
