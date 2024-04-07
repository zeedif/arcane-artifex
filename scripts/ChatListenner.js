import stableFileManager from "./StableFileManager.js";
import sdAPIClient from "./sdAPIClient.js";

/**
 * Class representing the Stable Images Chat Listener
 */
class StableImagesChatListenner {
    /**
     * Constructor for the StableImagesChatListenner class
     */
    constructor() {
        /**
         * Template path for the stable message
         * @type {string}
         */
        this.template = "modules/stable-images/templates/stable-message.hbs";
    }

    /**
     * Activates the chat listeners
     * @param {HTMLElement} html - The HTML element of the chat log
     */
    async activateListenners(html) {
        // Remove stable buttons if the user is not the GM
        if (!game.user.isGM) {
            html.find(".stable-block a").remove();
        }

        // Show image in chat when the "stable-image-show-chat" button is clicked
        html.on("click", '.stable-image-show-chat', event => {
            this.showInChatImage(event);
        });

        // Open image in a popout when the image is clicked
        html.on("click", '.stable-message img', event => {
            let src = event.currentTarget.getAttribute('src');
            const ip = new ImagePopout(src, {});
            ip.render(true);
        });

        // Create a journal from the image when the "stable-image-create-journal" button is clicked
        html.on("click", '.stable-image-create-journal', async (event) => {
            this.createJournal(event);
        });

        // Activates the click event listener for the '.stable-image-img2img' button.
        html.on("click", '.stable-image-img2img', async (event) => {
            this.createImg2ImgRequest(event);
        });


        // Activates the click event listener for the '.stable-image-copySrc' button.
        html.on("click", '.stable-image-copySrc', async (event) => {
            this.copyImgSrc(event);
        });
        //Activates the click event listener for the '.stable-image-actor-image' button.
        html.on("click", '.stable-image-actor-image', async (event) => {
            this.updateActorImg(event);
        });
        html.on("click", '.stable-image-skip', async (event) => {
            this.callSkip(event);
        });
        html.on("click", '.stable-image-interrupt', async (event) => {
            this.callInterrupt(event);
        });
    };

    async callInterrupt(ev) {
        await sdAPIClient.postInterrupt()
    }
    async callSkip(ev) {
        await sdAPIClient.postSkip()
    }
    /**
     * Updates the actor image with the clicked stable image
     * @param {Event} ev - The click event
     */
    async updateActorImg(ev) {
        let src = ev.currentTarget.closest('.stable-image-block').querySelector('img').src;
        let actor = await fromUuid(ev.currentTarget.closest('.stable-message').dataset.actorId);
        if (!actor) {
            return ui.notifications.error("This actor isn't in your world yet");
        } else {
            let imgId = ev.currentTarget.closest(".stable-image-block").dataset.imageId
            let filename = actor.name + '_' + imgId + ".png";
            stableFileManager.checkFileExists(filename).then(async (exist) => {
                if (!!exist) {
                    actor.update({ img: stableFileManager.storagePath + filename })
                } else {
                    await stableFileManager.saveBase64(filename, src).then(url => {
                        actor.update({ img: url })
                    })
                }
            });



        }
    }

    /**
     * Copies the image source to the clipboard
     * @param {Event} event - The click event
     */
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

    /**
     * Creates an image-to-image request for the stable diffusion API
     * @param {Event} event - The click event
     */
    async createImg2ImgRequest(event) {
        /**
            * Retrieves the image element from the closest '.stable-image-block' container.
            * @type {HTMLElement}
            */
        let img = event.currentTarget.closest('.stable-image-block').querySelector('img');

        /**
         * Extracts the base64-encoded image data from the 'src' attribute of the image.
         * @type {string}
         */
        let imgData = img.src.replace('data:image/png;base64,', '');

        /**
         * Retrieves the prompt text from the closest '.stable-message' container.
         * @type {string}
         */
        let prompt = event.currentTarget.closest('li.chat-message').querySelector('.stable-message h3').innerText;

        /**
         * Represents the data object for the chat message.
         * @type {Object}
         */
        let messageData = {
            title: "variations",
            prompt: prompt,
            sourceSrc: img.src,
            send: true,
            imgToImg: true,
        };

        /**
         * Renders the template with the message data and retrieves the resulting content.
         * @type {string}
         */
        let content = await renderTemplate(this.template, messageData);

        // Create a chat message with the image content
        /**
         * Represents the chat message created with the image content.
         * @type {ChatMessage}
         */
        let message = await ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: content,
            whisper: ChatMessage.getWhisperRecipients("GM")
        });

        /**
         * Calls the 'imgToImg' function of the 'sdAPIClient' with the prompt, message, and image data.
         */
        sdAPIClient.imgToImg(prompt, message, imgData);

        /**
         * Initializes a progress request using the 'initProgressRequest' function of the 'sdAPIClient' with the message.
         */
        setTimeout(sdAPIClient.initProgressRequest(message), 500)

    }

    /**
     * Creates a new journal entry with the generated image
     * @param {Event} event - The click event
     */
    async createJournal(event) {
        // Check if the user is the GM
        if (game.user.isGM) {
            // Get the image element from the clicked button
            let img = event.currentTarget.closest('.stable-image-block').querySelector('img');
            let src = img.getAttribute('src');

            // Create a new journal entry
            let journal = await JournalEntry.create({
                name: "New Journal",
            });

            // Create a new journal entry page with the image
            await journal.createEmbeddedDocuments("JournalEntryPage", [{
                name: "Generated Image",
                type: "image",
                src: src
            }]);

            // Render the journal sheet
            journal.sheet.render(true);
        };
    }

    /**
     * Shows the image in the chat when the "stable-image-show-chat" button is clicked
     * @param {Event} event - The click event
     */
    async showInChatImage(event) {
        // Get the image element from the clicked button
        let img = event.currentTarget.closest('.stable-image-block').querySelector('img');
        let content = `
            <div class="stable-image-block">
            ${img.outerHTML} <div class="flexrow">
                 <a class="stable-image-create-journal">Create a Journal</a>
            </div>
            </div>`;

        // Create a chat message with the image content
        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: content
        });
    }

    /**
     * Updates the GM message with the generated image content
     * @param {Object} message - The chat message object
     * @param {Object} options - Additional options for the message update
     */
    async updateGMMessage(message, options) {
        let messageData = mergeObject(message, options);

        // Render the template with the message data
        let content = await renderTemplate(this.template, messageData);

        // Update the message content and whisper it to the GM
        message.update({
            id: message._id,
            content: content,
            whisper: ChatMessage.getWhisperRecipients("GM")
        }).then(msg => {
            if (options.send) {
                sdAPIClient.initProgressRequest(msg);
            }
        });
    }

    /**
     * Extracts the prompt command from the chat message and generates an image
     * @param {Object} message - The chat message object
     */
    async getPromptCommand(message) {
        // Check if the user is a GM and the stable-images connection is enabled
        if (!game.user.isGM || !game.settings.get('stable-images', 'connected')) { return; }
        // Check if the message content starts with ":sd: "
        if (message.content.startsWith(":sd: ")) {
            // Extract the prompt from the message content
            let prompt = message.content.substring(":sd: ".length);
    
            // Assuming an updateGMMessage function exists to handle message updates
            await this.updateGMMessage(message, { send: true, title: prompt });
    
            // Assuming sdAPIClient has a method textToImg for image generation
            sdAPIClient.textToImg(prompt, message);
        }
    }
    
   
    
    displayProgress(message, data) {
        let messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (!messageElement) {
            // Correctly delay the execution
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
         // Check if current_image is null and choose the image source accordingly
        if (img) {
            if (data.current_image) {
                img.src = "data:image/png;base64," + data.current_image;
            } else {
                img.src = "/modules/stable-images/assets/stable-images-progress.webp";
            }
        }
    }
    
    
    /**
     * Creates the image in the chat message
     * @param {Object} data - The response data from the stable diffusion API
     * @param {string} prompt - The prompt for the image generation
     * @param {Object} message - The chat message object
     */
    async createImage(data, prompt, message) {
        let images = [];
        for (let imgData of data.images) {
            images.push({
                id: foundry.utils.randomID(),
                data: imgData
            })
        }

        this.updateGMMessage(message, {
            images: images,
            send: false,
            title: prompt
        });
    }
}

/**
 * Export an instance of the StableImagesChatListenner class
 */
const chatListenner = new StableImagesChatListenner();
export default chatListenner;