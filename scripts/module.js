import registerSettings from "./registerSettings.js";
import chatListener from './ChatListener.js';
import localA1111APIClient from './localA1111ApiClient.js';
import PromptApplication from "./PromptApplication.js";
import aiHordeApiClient from './aiHordeApiClient.js';
import openAiApiClient from './openAiApiClient.js';
import comfyUiApiClient from './comfyUiApiClient.js';
import stabilityApiClient from './stabilityApiClient.js';

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
        await game.settings.set("arcane-artifex", "working", false);
        localA1111APIClient.checkStatus();
        aiHordeApiClient.checkStatus();
        comfyUiApiClient.checkStatus();
        openAiApiClient.checkStatus();
        stabilityApiClient.checkStatus();
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
    if (game.settings.get("arcane-artifex", "working")) {
        return ui.notifications.warn('Please wait until the previous job is finished.');
    }
    if (game.user.isGM && game.settings.get('arcane-artifex', 'connected')) {
        generatePromptFromActor(sheet);
    }
}

function generatePromptFromActor(sheet) {
    let prompt = ":aa: ";

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