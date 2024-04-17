import stableFileManager from "./StableFileManager.js";
import localA1111APIClient from './localA1111APIClient.js';
console.error('localA1111APIClient', localA1111APIClient);
import aiHordeApiClient from "./aiHordeApiClient.js";
import sdAPIClient from "./sdAPIClient.js";

class StableImagesChatListener {
    constructor() {
        this.template = "modules/stable-images/templates/stable-message.hbs";
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
            let filename = actor.name + '_' + imgId + ".png";
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
                console.error('DEBUG:updateGMMessage:msg', msg);
                const selectedSource = game.settings.get('stable-images', 'source');
                if (selectedSource === 'localA1111') {
                    localA1111APIClient.initProgressRequest(msg);
                } else if (selectedSource === 'stableHorde') {
                    aiHordeApiClient.initProgressRequest(msg.id, msg.content, msg, 0, "undefined");
                }
            }
        });
    }
    
    

    async getPromptCommand(message) {
        if (!game.user.isGM || !game.settings.get('stable-images', 'connected')) {
            return;
        }
        if (message.content.startsWith(":sd: ")) {
            let prompt = message.content.substring(":sd: ".length);

            console.error('DEBUG:getPromptCommand:message', message);
            console.error('DEBUG:getPromptCommand:prompt', prompt);


            await this.updateGMMessage(message, { send: true, title: prompt });


            await game.settings.set('stable-images', 'rawPrompt', prompt);

            sdAPIClient.textToImg(prompt, message);
        }
    }

    displayProgress(message, data) {

        console.error('displaying A1111 progress', data);
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
                img.src = "/modules/stable-images/assets/stable-images-progress.webp";
            }
        }
    }

    displayHordeProgress(message, data) {

        console.error('displaying Horde progress', data);
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
            img.src = data.done ? "data:image/png;base64," + data.current_image : "/modules/stable-images/assets/stable-images-progress.webp";
        }
    }
    

    async createImage(data, prompt, message) {
        console.error('createImage called with:', {data, prompt, message}); // Additional debug log
      
        let images = [];
        for (let imgData of data.images) {
          images.push({
            id: imgData.id,
            data: imgData.data
          });
        }
      
        this.updateGMMessage(message, {
          images: images,
          send: false,
          title: prompt
        });
      }
    
    
}

const chatListener = new StableImagesChatListener();
export default chatListener;
