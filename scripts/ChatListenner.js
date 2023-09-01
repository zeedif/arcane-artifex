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
    };
    /**
     * Vérifie si un fichier existe à une certaine URL.
     * @param {string} url - L'URL du fichier à vérifier.
     * @returns {Promise<boolean>} - Une promesse résolue avec la valeur true si le fichier existe, sinon false.
     */
    async checkFileExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.error('Une erreur s\'est produite lors de la vérification du fichier :', error);
            return false;
        }
    }

    /**
     * Updates the actor image with the clicked stable image
     * @param {Event} ev - The click event
     */
    async updateActorImg(ev) {
        console.log(ev.currentTarget.closest('.stable-image-block').querySelector('img'))
        let src = ev.currentTarget.closest('.stable-image-block').querySelector('img').src;
        let actor = await fromUuid(ev.currentTarget.closest('.stable-message').dataset.actorId);
        if (!actor) {
            return ui.notifications.error("This actor isn't in your world yet");
        } else {
            let msgId = ev.currentTarget.closest(".message").dataset.messageId
            let filename = actor.name + '_' + msgId + ".png";
            let path = game.settings.get('stable-images', 'stable-settings').stableStoragePath;
            let fileUrl = path + '/' + filename

            this.checkFileExists(fileUrl)
                .then(async exists => {
                    if (exists) {
                        actor.update({ img: fileUrl })
                    } else {
                        ui.notifications.notify('uploading file : ' + fileUrl);
                        await ImageHelper.uploadBase64(src, filename, path);
                        actor.update({ img: fileUrl })

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
        sdAPIClient.initProgressRequest(message);
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
            ui.sidebar.tabs.chat.scrollBottom();
        });
    }

    /**
     * Extracts the prompt command from the chat message and generates an image
     * @param {Object} message - The chat message object
     */
    getPromptCommand(message) {
        // Check if the user is the GM and the stable-images connection is enabled
        if (!game.user.isGM || !sdAPIClient.connexion) { return }
        // Check if the message content starts with ":sd: "
        if (message.content.indexOf(":sd: ") == 0) {
            // Extract the prompt from the message content
            let prompt = message.content.replace(":sd: ", "");

            // Update the message content with the progress bar
            this.updateGMMessage(message, { send: true, title: prompt });

            // Call the stable diffusion API to generate the image
            sdAPIClient.textToImg(prompt, message);
        };
    }

    /**
     * Creates the image in the chat message
     * @param {Object} data - The response data from the stable diffusion API
     * @param {string} prompt - The prompt for the image generation
     * @param {Object} message - The chat message object
     */
    async createImage(data, prompt, message) {
        this.updateGMMessage(message, {
            images: data.images,
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