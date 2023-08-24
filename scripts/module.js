3// SPDX-FileCopyrightText: 2020 Cody Swendrowski
//
// SPDX-License-Identifier: MIT


Hooks.once('init', async function () {
    CONFIG.debug.hooks = true;

    Hooks.on('renderChatLog', (log, html, data) => chatListeners(html))

    game.settings.register("stable-images", "preprompt", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "pre-prompt", // Register a module setting with checkbox
        hint: "preprompt", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: String,
        default: "RAW photography portrait of a fantasy character from a dnd adventure, in the style of Keith Parkinson", // The default value for the setting
    });
    game.settings.register("stable-images", "negativePrompt", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "negative-prompt", // Register a module setting with checkbox
        hint: "negative-prompt", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: String,
        default: "nsfw, nude, censored,bad anatomy, bad hands, three hands, three legs, bad arms, missing legs, missing arms, poorly drawn face, bad face, fused face, cloned face, worst face, three crus, extra crus, fused crus, worst feet, three feet, fused feet, fused thigh, three thigh, fused thigh, extra thigh, worst thigh, missing fingers, extra fingers, ugly fingers, long fingers, horn, extra eyes, huge eyes, 2girl, amputation, disconnected limbs, cartoon, cg, 3d, unreal, animate", // The default value for the setting
    });
    game.settings.register("stable-images", "ip", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "stable diffusion server IP", // Register a module setting with checkbox
        hint: "stable diffusion server IP", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: String,
        default: "http://127.0.0.1:7860", // The default value for the setting
    });
    game.settings.register("stable-images", "width", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "width", // Register a module setting with checkbox
        hint: "width of generated image", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Number,
        default: 512,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 128,
            max: 1024,
            step: 64
        }// The default value for the setting
    });

    game.settings.register("stable-images", "height", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "height", // Register a module setting with checkbox
        hint: "height of generated image", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Number,
        default: 512,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 128,
            max: 1024,
            step: 64
        }
    });
    game.settings.register("stable-images", "batchCount", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "batch count", // Register a module setting with checkbox
        hint: "number of generated image", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Number,
        default: 4,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 1,
            max: 8,
            step: 1
        }
    });
    game.settings.register("stable-images", "steps", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "steps", // Register a module setting with checkbox
        hint: "number of steps for generating image", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Number,
        default: 24,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 15,
            max: 50,
            step: 1
        }
    });
    game.settings.register("stable-images", "cfgScale", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "cfg_scale", // Register a module setting with checkbox
        hint: "Classifier Free Guidance Scale - how strongly the image should conform to prompt - lower values produce more creative results", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Number,
        default: 6,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 2,
            max: 20,
            step: 1
        }
    });

});

Hooks.once('ready', async function () {
});
Hooks.on('renderActorSheet5e', async function (sheet, html, data) {

});

Hooks.on('createChatMessage', async function (message, options, id) {
    if (game.user.isGM) {
        if (message.content.indexOf(":sd: ") > -1) {
            console.log(message, id)

            let prompt = message.content.replace(":sd: ", "")
            callStableDiffusion(prompt, message);
            await message.update({
                id: message._id,
                content: "generating image",
                whisper: ChatMessage.getWhisperRecipients("GM")
            })
        }
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
    xhr.open('POST', apiUrl);
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
    let content = `<h3>Image</h3><div title="${prompt}"class="stable-images"> `;
    for (let img of data.images) {
        content += `
        <div class="stable-image-block">
        <img  title="${prompt}" src="data:image/png;base64,${img}" />
        <div class="flexrow">
        <a class="stable-image-show-chat">visible in chat</a>
        <a class="stable-image-show-popout">show in pop-out</a>
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
        html.find(".stable-image-show-popout").remove()
    }
    html.on("click", '.stable-image-show-chat', event => {
        let img = event.currentTarget.closest('.stable-image-block').querySelector('img');
        let content = `
                <div class="stable-image-block">

        ${img.outerHTML} <div class="flexrow">
        <a class="stable-image-show-popout">show in pop-out</a>
                <a class="stable-image-create-journal">create a journal</a>

        </div>
        </div>`;
        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: content
        });

    })
    html.on("click", '.stable-image-show-popout', event => {
        if (game.user.isGM) {
            let img = event.currentTarget.closest('.stable-image-block').querySelector('img');
            let src = img.getAttribute('src');
            // Construct the Application instance
            console
            const ip = new ImagePopout(src, {

            });

            // Display the image popout
            ip.render(true);
        }

    })
    html.on("click", '.stable-image-create-journal',async  (event) => {
        if (game.user.isGM) {
            let img = event.currentTarget.closest('.stable-image-block').querySelector('img');
            let src = img.getAttribute('src');
            // Construct the Application instance
            
            const journal = await JournalEntry.create({
                name:"new Journal",
            });
             let page=await journal.createEmbeddedDocuments("JournalEntryPage",[{
                name:"generated image",
                type:"image",
                src:src
            }])
            journal.sheet.render(true);
        }

    })

}