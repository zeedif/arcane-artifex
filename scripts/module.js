import registerSettings from "./registerSettings.js";
import chatListenner from './ChatListenner.js';
import sdAPIClient from "./sdAPIClient.js";
import PromptApplication from "./PromptApplication.js";
import stableFileManager from "./StableFileManager.js";
import aiHordeApiClient from './aiHordeApiClient.js';
import AiHordeSettings from './aiHordeSettings.js';
import comfyApiClient from "./comfyUiApiClient.js";

/**
 * Hook that runs when the game is initialized.
 */
Hooks.on('init', async function () {
    CONFIG.debug.hooks = true;
    registerSettings();
});

/**
 * Hook that runs when the actor sheet header buttons are rendered.
 * @param {Object} actor5eSheet - The actor sheet.
 * @param {Array} buttons - The array of buttons.
 */
Hooks.on('getActorSheetHeaderButtons', async function (actor5eSheet, buttons) {
    if (game.user.isGM) {
        buttons.unshift({
            label: 'generate art',
            class: 'stable-image-actor',
            icon: 'fas fa-images',
            onclick: () => generateActorChatCommand(actor5eSheet)
        });
    }
});

/**
 * Hook that runs once the game is ready.
 */
Hooks.once('ready', async function () {
    if (game.user.isGM) {
        sdAPIClient.checkStatus();
        aiHordeApiClient.checkStatus();
        comfyUiApiClient.checkStatus();
    }
});

/**
 * Hook that runs when the chat log is rendered.
 * @param {Object} log - The chat log.
 * @param {Object} html - The HTML element.
 * @param {Object} data - The data object.
 */
Hooks.on('renderChatLog', async (log, html, data) => chatListenner.activateListenners(html));

/**
 * Hook that runs when a chat message is rendered.
 * @param {Object} message - The chat message.
 * @param {Object} html - The HTML element.
 * @param {Object} data - The data object.
 */
Hooks.on('renderChatMessage', async function (message, html, data) {
    if (!game.user.isGM) {
        html.find(".stable-image-block a").remove();
    }
    if (message.user.id == game.user.id && game.user.isGM) {
        chatListenner.getPromptCommand(message);
    }
});

/**
 * Generates an image based on the actor's information.
 * @param {Object} sheet - The actor sheet.
 */
async function generateActorChatCommand(sheet) {
    if (sdAPIClient.working) {
        return ui.notifications.warn('Please wait until the previous job is finished.');
    }
    if (game.user.isGM && game.settings.get('stable-images', 'connected')) {
        generatePromptFromActor(sheet);
    }
}

/**
 * Generates the prompt from the actor's information.
 * @param {Object} sheet - The actor sheet.
 * @returns {string} The generated prompt.
 */
function generatePromptFromActor(sheet) {
    let prompt = ":sd: ";

    if (game.system.id == "dnd5e") {
        prompt += "a fantasy ";

        if (sheet.actor.type == "npc") {
            prompt += `(${sheet.actor.name}), ${sheet.actor.system.details.type.value}, ${sheet.actor.system.details.alignment}, ${sheet.actor.system.details.race}, `;
        }

        if (sheet.actor.type == "character") {
            prompt += ` hero, ${sheet.actor.name}, `;
            let classes = sheet.actor.items.filter(it => it.type == "class");
            classes.forEach(c => prompt += `(${c.name})`);
        }

        let importantItems = sheet.actor.items.filter(it =>
            (it.type != "backpack") &&
            (it.type != "consumable") &&
            (it.type != "tool") &&
            (it.type != "spell")
        );

        importantItems.forEach(it => prompt += `${it.name}, `);
    } else {
        prompt += '((' + sheet.actor.name + ')), ';
        sheet.actor.items.forEach(it => prompt += it.name + ', ');
    }

    new PromptApplication(prompt, sheet.actor.uuid).render(true);
}

/**
 * Hook that runs when the AI Horde settings are rendered.
 * @param {Object} app - The application.
 * @param {Object} html - The HTML element.
 */
Hooks.on('renderAiHordeSettings', (app, html) => {
    html.find('#aihorde-test-connection').on('click', aiHordeApiClient.checkStatus());
});