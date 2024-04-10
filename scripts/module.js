import registerSettings from "./registerSettings.js";
import chatListener from './ChatListener.js';
import sdAPIClient from "./sdAPIClient.js";
import PromptApplication from "./PromptApplication.js";
import stableFileManager from "./StableFileManager.js";
import aiHordeApiClient from './aiHordeApiClient.js';
import HordeSettings from './aiHordeSettings.js';
import comfyUiApiClient from "./comfyUiApiClient.js";

Hooks.on('init', async function () {
    CONFIG.debug.hooks = true;
    registerSettings();
});

Hooks.on('getActorSheetHeaderButtons', async function (actor5eSheet, buttons) {
    if (game.user.isGM) {
        buttons.unshift({
            label: 'Generate Art',
            class: 'stable-image-actor',
            icon: 'fas fa-images',
            onclick: () => generateActorChatCommand(actor5eSheet)
        });
    }
});

Hooks.once('ready', async function () {
    if (game.user.isGM) {
        sdAPIClient.checkStatus();
        aiHordeApiClient.checkStatus();
        comfyUiApiClient.checkStatus();
    }
});

Hooks.on('renderChatLog', async (log, html, data) => chatListener.activateListeners(html));

Hooks.on('renderChatMessage', async function (message, html, data) {
    if (!game.user.isGM) {
        html.find(".stable-image-block a").remove();
    }
    if (message.user.id == game.user.id && game.user.isGM) {
        chatListener.getPromptCommand(message);
    }
});

async function generateActorChatCommand(sheet) {
    if (game.settings.get("stable-images", "working")) {
        return ui.notifications.warn('Please wait until the previous job is finished.');
    }
    if (game.user.isGM && game.settings.get('stable-images', 'connected')) {
        generatePromptFromActor(sheet);
    }
}

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

Hooks.on('renderAiHordeSettings', (app, html) => {
    html.find('#aihorde-test-connection').on('click', aiHordeApiClient.checkStatus());
});
