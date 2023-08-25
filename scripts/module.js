import registerSettings from "./registerSettings.js";

3// SPDX-FileCopyrightText: 2020 Cody Swendrowski
//
// SPDX-License-Identifier: MIT


Hooks.once('init', async function () {
    CONFIG.debug.hooks = true;

    Hooks.on('renderChatLog', (log, html, data) => chatListeners(html))

    registerSettings();

});

Hooks.once('ready', async function () {

    let stIP = await game.settings.get("stable-images", "ip");
    try {
        // Envoi d'une requête HEAD au serveur
        const response = await fetch(stIP, { method: 'HEAD' });

        if (response.ok) {
            ui.notifications.notify('Le serveur distant de stable diffusion est accessible.');
            game.settings.set("stable-images", "connection", true)
        } else {
            console.error('Le serveur distant de stable diffusion n\'est pas accessible. Code de réponse:', response.status);
            ui.notifications.error('Le serveur distant de stable diffusion n\'est pas accessible. Code de réponse:' + response.status);
        }
    } catch (error) {
        console.error('Erreur lors de la tentative d\'accès au serveur distant de stable diffusion :', error);
        ui.notifications.error('Erreur lors de la tentative d\'accès au serveur distant de stable diffusion ; erreur = ' + error);

    }

});
Hooks.on('renderActorSheet5e', async function (sheet, html, data) {

});

Hooks.on('createChatMessage', async function (message, options, id) {
    if (game.user.isGM) {
        if (message.content.indexOf(":sd: ") > -1) {

            let prompt = message.content.replace(":sd: ", "")
            callStableDiffusion(prompt, message);
            await message.update({
                id: message._id,
                content: `<h3>generating image
                            <i class="fa-solid fa-spinner fa-spin"></i>
                </h3>
                            `,
                whisper: ChatMessage.getWhisperRecipients("GM")
            })
        }
    }

})
Hooks.on('renderChatMessage', async function (messge, html, data) {
    if (!game.user.isGM) {
        html.find(".stable-image-block a").remove()
    }
})

async function callStableDiffusion(prompt, message) {
    //getting settings
    let preprompt = await game.settings.get("stable-images", "preprompt");
    let stIP = await game.settings.get("stable-images", "ip");
    let negativePrompt = await game.settings.get("stable-images", "negativePrompt");
    let imgWidth = await game.settings.get("stable-images", "width");
    let imgHeight = await game.settings.get("stable-images", "height");
    let count = await game.settings.get("stable-images", "batchCount");
    let steps = await game.settings.get("stable-images", "steps");
    let apiUrl = stIP + '/sdapi/v1/txt2img';
    let cfg = await game.settings.get("stable-images", "cfgScale");

    // request body construction
    const requestBody = {
        "prompt": prompt,
        "seed": -1,
        "height": imgHeight,
        "width": imgWidth,
        "negative_prompt": negativePrompt,
        "n_iter": count,
        steps: steps,
        cfg_scale: cfg

    }
    // request construction
    var xhr = new XMLHttpRequest();
    try {
        xhr.open('POST', apiUrl);
    } catch (e) {

    }

    xhr.setRequestHeader("Content-type", "application/json; charset=utf-8"); xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");

    xhr.onload = () => {
        //managing request state
        if (xhr.readyState == 4 && xhr.status == 200) {
            const data = xhr.response;
            createImage(JSON.parse(data), prompt, message)
        } else {
            console.error(`Error: `, xhr.response);
        }
    };

    //sending request

    xhr.send(JSON.stringify(requestBody));

}
async function createImage(data, prompt, message) {
    console.log(data, prompt, message);
    let content = `<h3>${prompt}</h3><div title="${prompt}"class="stable-images"> `;
    for (let img of data.images) {
        content += `
        <div class="stable-image-block">
        <img  title="${prompt}" src="data:image/png;base64,${img}" />
        <div class="flexrow">
        <a class="stable-image-show-chat">visible in chat</a>
        <a class="stable-image-create-journal">create a journal</a>
        </div>
        </div>`
    }
    content += "</div>"
    await message.update({
        content: content,
    })

}
async function chatListeners(html) {
    if (!game.user.isGM) {
        html.find(".stable-image-block div").remove()
    }

    html.on("click", '.stable-image-show-chat', event => {
        let img = event.currentTarget.closest('.stable-image-block').querySelector('img');
        let content = `
                <div class="stable-image-block">

        ${img.outerHTML} <div class="flexrow">
             <a class="stable-image-create-journal">create a journal</a>

        </div>
        </div>`;
        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: content
        });

    })
    html.on("click", '.stable-image-block img', event => {

        let src = event.currentTarget.getAttribute('src');
        const ip = new ImagePopout(src, {});
        ip.render(true);

    })
    html.on("click", '.stable-image-create-journal', async (event) => {
        if (game.user.isGM) {
            let img = event.currentTarget.closest('.stable-image-block').querySelector('img');
            let src = img.getAttribute('src');
            // Construct the Application instance

            const journal = await JournalEntry.create({
                name: "new Journal",
            });
            let page = await journal.createEmbeddedDocuments("JournalEntryPage", [{
                name: "generated image",
                type: "image",
                src: src
            }])
            journal.sheet.render(true);
        }

    })

}