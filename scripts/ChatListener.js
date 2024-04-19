import stableFileManager from "./StableFileManager.js";
import localA1111APIClient from './localA1111APIClient.js';
import aiHordeApiClient from "./aiHordeApiClient.js";
import sdAPIClient from "./sdAPIClient.js";

class StableImagesChatListener {
    constructor() {
        this.template = "modules/arcane-artifex/templates/stable-message.hbs";
    }

    async activateListeners(html) {
        if (!game.user.isGM) {
            html.find(".stable-block a").remove();
        }

        html.on("click", '.stable-image-show-chat', event => {
            this.showInChatImage(event);
        });

        html.on("click", '.stable-message img', event => {
            let src = event.currentTarget.getAttribute('src');
            const ip = new ImagePopout(src, {});
            ip.render(true);
        });

        html.on("click", '.stable-image-create-journal', async (event) => {
            this.createJournal(event);
        });

        html.on("click", '.stable-image-img2img', async (event) => {
            this.createImg2ImgRequest(event);
        });

        html.on("click", '.stable-image-copySrc', async (event) => {
            this.copyImgSrc(event);
        });

        html.on("click", '.stable-image-actor-image', async (event) => {
            this.updateActorImg(event);
        });

        html.on("click", '.stable-image-skip', async (event) => {
            this.callSkip(event);
        });

        html.on("click", '.stable-image-interrupt', async (event) => {
            this.callInterrupt(event);
        });
    }

    async callInterrupt(ev) {
        await sdAPIClient.postInterrupt();
    }

    async callSkip(ev) {
        await sdAPIClient.postSkip();
    }

async updateActorImg(ev) {
        let src = ev.currentTarget.closest('.stable-image-block').querySelector('img').src;
        let actor = await fromUuid(ev.currentTarget.closest('.stable-message').dataset.actorId);
        if (!actor) {
            return ui.notifications.error("This actor isn't in your world yet");
        } else {
            let imgId = ev.currentTarget.closest(".stable-image-block").dataset.imageId;
            const selectedSource = game.settings.get('arcane-artifex', 'source');
            const fileExtension = selectedSource === 'stableHorde' ? 'webp' : 'png';
            let filename = `${actor.name}_${imgId}.${fileExtension}`;
            await stableFileManager.saveBase64(filename, src).then(url => {
                actor.update({ img: url });
            });
        }
    }
    

    copyImgSrc(event) {
        let src = event.currentTarget.closest('.stable-image-block').querySelector('img').src;
        navigator.clipboard.writeText(src)
            .then(() => {
                ui.notifications.notify("Image source copied to clipboard");
            })
            .catch((error) => {
                ui.notifications.error('Unable to copy image source');
            });
    }

    async createImg2ImgRequest(event) {
        let img = event.currentTarget.closest('.stable-image-block').querySelector('img');
        let imgData = img.src.replace('data:image/png;base64,', '');
        let prompt = event.currentTarget.closest('li.chat-message').querySelector('.stable-message h3').innerText;
        let messageData = {
            title: "Refined version",
            prompt: prompt,
            sourceSrc: img.src,
            send: true,
            imgToImg: true,
        };
        let content = await renderTemplate(this.template, messageData);
        let message = await ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: content,
            whisper: ChatMessage.getWhisperRecipients("GM")
        });
        sdAPIClient.imgToImg(prompt, message, imgData);
        setTimeout(() => sdAPIClient.initProgressRequest(message), 500);
    }

    async createJournal(event) {
        if (game.user.isGM) {
            let img = event.currentTarget.closest('.stable-image-block').querySelector('img');
            let src = img.getAttribute('src');
            let journal = await JournalEntry.create({
                name: "New Journal",
            });
            await journal.createEmbeddedDocuments("JournalEntryPage", [{
                name: "Generated Image",
                type: "image",
                src: src
            }]);
            journal.sheet.render(true);
        }
    }

    async showInChatImage(event) {
        let img = event.currentTarget.closest('.stable-image-block').querySelector('img');
        let content = `
            <div class="stable-image-block">
            ${img.outerHTML} <div class="flexrow">
                 <a class="stable-image-create-journal">Create a Journal</a>
            </div>
            </div>`;
        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: content
        });
    }

    async updateGMMessage(message, options) {
        if (typeof message !== 'object' || message === null || typeof options !== 'object' || options === null) {
            console.error('Invalid arguments passed to updateGMMessage:', { message, options });
            return; // Stop execution if data is not as expected
        }
    
        let messageData = mergeObject(message, options);
        let content = await renderTemplate(this.template, messageData);
    
        message.update({
            id: message._id,
            content: content,
            whisper: ChatMessage.getWhisperRecipients("GM")
        }).then(msg => {
            if (options.send) {
                const selectedSource = game.settings.get('arcane-artifex', 'source');
                if (selectedSource === 'localA1111') {
                    localA1111APIClient.initProgressRequest(msg);
                } else if (selectedSource === 'stableHorde') {
                    aiHordeApiClient.initProgressRequest(msg.id, msg.content, msg, 0, "undefined");
                } else if (selectedSource === 'openAI') {
                    // Assuming no progress tracking is required, directly update as complete
                    this.finalizeMessageUpdate(msg);
                }
            }
        });
    }
    
    finalizeMessageUpdate(message) {
        console.log("arcane-artifex: Message update finalized for OpenAI.");
        // Perform any cleanup or final notification updates here
        // Example: ui.notifications.info("OpenAI image generation complete.");
    }
    
    
    

    async getPromptCommand(message) {
        if (!game.user.isGM || !game.settings.get('arcane-artifex', 'connected')) {
            return;
        }
        if (message.content.startsWith(":sd: ")) {
            let prompt = message.content.substring(":sd: ".length);

            await this.updateGMMessage(message, { send: true, title: prompt });


            await game.settings.set('arcane-artifex', 'rawPrompt', prompt);

            sdAPIClient.textToImg(prompt, message);
        }
    }

    displayProgress(message, data) {

        let messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (!messageElement) {
            setTimeout(() => this.displayProgress(message, data), 500);
            return;
        }
        let progressBarElement = messageElement.querySelector('.stable-progress-bar');
        let progressStateElement = messageElement.querySelector('.stable-progress-state');
        let titleEl = messageElement.querySelector('h4.stable-job');
        let img = messageElement.querySelector('img.stable-temp-image');

        let percent = Math.trunc(data.progress * 100);
        if (progressBarElement) {
            progressBarElement.style.width = `${percent}%`;
        }
        if (progressStateElement) {
            progressStateElement.innerText = `${percent}%`;
        }
        if (titleEl) {
            titleEl.innerText = "Working : " + data.state.job;
        }
        if (img) {
            if (data.current_image) {
                img.src = "data:image/png;base64," + data.current_image;
            } else {
                img.src = "/modules/arcane-artifex/assets/arcane-artifex-progress.webp";
            }
        }
    }

    displayHordeProgress(message, data) {

        let messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (!messageElement) {
            setTimeout(() => this.displayHordeProgress(message, data), 500);
            return;
        }
        let progressBarElement = messageElement.querySelector('.stable-progress-bar');
        let progressStateElement = messageElement.querySelector('.stable-progress-state');
        let titleEl = messageElement.querySelector('h4.stable-job');
        let img = messageElement.querySelector('img.stable-temp-image');

        // Calculate the percentage based on wait time and queue position
        let percent = data.done ? 100 : Math.max(0, 100 - (data.queue_position * 10)); // Simplified calculation
        if (progressBarElement) {
            progressBarElement.style.width = `${percent}%`;
        }
        if (progressStateElement) {
            progressStateElement.innerText = data.done ? "Complete" : `Queue Position: ${data.queue_position}, Wait Time: ${data.wait_time}s`;
        }
        if (titleEl) {
            titleEl.innerText = data.done ? "Processing Complete" : "Processing...";
        }
        if (img) {
            img.src = data.done ? "data:image/webp;base64," + data.current_image : "/modules/arcane-artifex/assets/arcane-artifex-progress.webp";
        }
    }
    
    displayOpenAiProgress(message, base64ImageData) {
        let messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (!messageElement) {
            setTimeout(() => this.displayOpenAiProgress(message, base64ImageData), 500);
            return;
        }
        let progressBarElement = messageElement.querySelector('.stable-progress-bar');
        let progressStateElement = messageElement.querySelector('.stable-progress-state');
        let titleEl = messageElement.querySelector('h4.stable-job');
        let img = messageElement.querySelector('img.stable-temp-image');
    
        // Since data is expected to be a base64 string, we directly use it
        let isComplete = base64ImageData ? true : false;
        let percent = isComplete ? 100 : 0;
        
        if (progressBarElement) {
            progressBarElement.style.width = `${percent}%`;
        }
        if (progressStateElement) {
            progressStateElement.innerText = isComplete ? "Complete" : "Awaiting Response...";
        }
        if (titleEl) {
            titleEl.innerText = isComplete ? "Image Generation Complete" : "Generating Image...";
        }
        if (img) {
            img.src = isComplete ? base64ImageData : "/modules/arcane-artifex/assets/arcane-artifex-progress.webp";
        }
    }
    
    



    async createImage(data, prompt, message) {
        let source = game.settings.get("arcane-artifex", "source");
    
        let images = [];
    
        if (source === "localA1111") {
            for (let imgData of data.images) {
                images.push({
                    id: foundry.utils.randomID(),
                    data: "data:image/png;base64," + imgData
                });
            }
        } else if (source === "stableHorde") {
            for (let imgData of data.images) {
                let newImage = {
                    id: imgData.id,
                    data: imgData.data
                };
                images.push(newImage);
            }
        } else if (source === "comfyUI") {
            for (let imgData of data.images) {
                let newImage = {
                    id: foundry.utils.randomID(),
                    data: imgData
                };
                images.push(newImage);
            }
        } else if (source === "openAI") {
            // Correctly handle the base64 string directly passed as `data`
            images.push({
                id: foundry.utils.randomID(),
                data: "data:image/png;base64," + data  // Use `data` directly as it's the base64 string
            });
        } else {
            console.error('Unknown source for image creation:', source);
            return;
        }
    
        try {
            await this.updateGMMessage(message, {
                images: images,
                send: false,
                title: prompt
            });
        } catch (error) {
            console.error('Error in updateGMMessage:', error);
        }
    }
    
    

    
    
    
}

const chatListener = new StableImagesChatListener();
export default chatListener;
