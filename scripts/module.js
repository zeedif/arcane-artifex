/**
 * Importing the registerSettings module from "./registerSettings.js"
 */
import registerSettings from "./registerSettings.js";

/**
 * Importing the chatListenner module from './ChatListenner.js'
 */
import chatListenner from './ChatListenner.js';

/**
 * Importing the sdAPIClient module from "./sdAPIClient.js"
 */
import sdAPIClient from "./sdAPIClient.js";
import PromptApplication from "./PromptApplication.js";
import stableFileManager from "./StableFileManager.js";

/**
 * Hook that runs when the game is initialized
 */
Hooks.on('init', async function () {
    // Enable debug hooks
    CONFIG.debug.hooks = true;
});

/**
 * Hook that runs when the actor sheet header buttons are rendered
 */
Hooks.on('getActorSheetHeaderButtons', async function (actor5eSheet, buttons) {
    if (game.user.isGM) {
        // Add a button to generate art

        buttons.unshift({
            label: 'generate art',
            class: 'stable-image-actor',
            icon: 'fas fa-images',
            onclick: () => generateActorChatCommand(actor5eSheet)
        })
    }

});



/**
 * Hook that runs once the game is ready
 */
Hooks.once('ready', async function () {
    // Register the settings
    registerSettings();
    sdAPIClient.getStableDiffusionSettings();
    stableFileManager.setStoragePath();
    // Initialize the stable diffusion API client if the user is the GM
    if (game.user.isGM) {
        sdAPIClient.initConnexion();
    }

});

// Activate listeners for the chat log
Hooks.on('renderChatLog', async (log, html, data) => chatListenner.activateListenners(html));


Hooks.on('renderChatMessage', async function (message, html, data) {
    // Remove the stable image buttons from chat messages if the user is not the GM
    if (!game.user.isGM) {
        html.find(".stable-image-block a").remove();
    }
    if (message.user.id == game.user.id && game.user.isGM) {
        chatListenner.getPromptCommand(message);

    }

});


/**
 * Generates an image based on the actor's information
 * @param {Object} sheet - The actor sheet
 */
async function generateActorChatCommand(sheet) {
    if (sdAPIClient.working) { return ui.notifications.warn('please wait until previous job is finished') }
    // Check if the user is the GM and the stable-images connection is enabled
    if (game.user.isGM && game.settings.get('stable-images', 'connection')) {
        // Generate the prompt from the actor's information
        generatePromptFromActor(sheet);


    }
};

/**
 * Generates the prompt from the actor's information
 * @param {Object} sheet - The actor sheet
 * @returns {string} - The generated prompt
 */
function generatePromptFromActor(sheet) {
    let prompt = ":sd: ";
    if (game.system.id == "dnd5e") {
        prompt += "a fantasy "
        // Check if the actor is an npc
        if (sheet.actor.type == "npc") {
            prompt += `(${sheet.actor.name}),${sheet.actor.system.details.type.value},${sheet.actor.system.details.alignment}, ${sheet.actor.system.details.race}, `;
        }

        // Check if the actor is a character
        if (sheet.actor.type == "character") {
            prompt += ` hero, ${sheet.actor.name}, `;
            let classes = sheet.actor.items.filter(it => it.type == "class");
            classes.forEach(c => prompt += `(${c.name})`);
        }

        // Filter out important items from the actor's items
        let importantsItems = sheet.actor.items.filter(it =>
            (it.type != "backpack") &&
            (it.type != "consumable") &&
            (it.type != "tool") &&
            (it.type != "spell")
        );

        // Add the names of the important items to the prompt
        importantsItems.forEach(it => prompt += `${it.name}, `);

        prompt;
    }
    else {
        prompt += '((' + sheet.actor.name + ')), ';
        sheet.actor.items.forEach(it => prompt += it.name + ', ');
    }
    new PromptApplication(prompt, sheet.actor.uuid).render(true)
}
