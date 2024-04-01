export default class AiHordeSettings extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'aihorde-settings',
            classes: ['stable-images'],
            title: 'AI Horde Settings',
            template: 'modules/stable-images/templates/aihorde-settings.hbs',
            closeOnSubmit: true,
            submitOnChange: true,
            submitOnClose: true,
        });
    }

    getData() {
        return {
            'aihorde-url': game.settings.get('stable-images', 'aihorde-url'),
        };
    }

    async _updateObject(event, formData) {
        await game.settings.set('stable-images', 'aihorde-url', formData['aihorde-url']);
    }
}