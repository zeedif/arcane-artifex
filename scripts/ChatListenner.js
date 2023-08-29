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
            this.showInChatImage(event)

        });

        // Open image in a popout when the image is clicked
        html.on("click", '.stable-message img', event => {
            let src = event.currentTarget.getAttribute('src');
            const ip = new ImagePopout(src, {});
            ip.render(true);
        });

        // Create a journal from the image when the "stable-image-create-journal" button is clicked
        html.on("click", '.stable-image-create-journal', async (event) => {
            this.createJournal(event)

        });
        html.on("click", '.stable-image-img2img', async (event) => {
            this.createImg2ImgRequest(event)
        });
        html.on("click", '.stable-image-copySrc', async (event) => {
            this.copyImgSrc(event)
        });
    }
    copyImgSrc(event) {
        let src = event.currentTarget.closest('.stable-image-block').querySelector('img').src;
        navigator.clipboard.writeText(src)
            .then(() => {
                ui.notifications.notify("image source copied in clipboard")
            })
            .catch((error) => {
                ui.notifications.error('unabled to copy image source')
            });

    }
    async createImg2ImgRequest(event) {
        let img = event.currentTarget.closest('.stable-image-block').querySelector('img')
        let imgData = img.src.replace('data:image/png;base64,', '');
        let prompt = event.currentTarget.closest('li.chat-message').querySelector('.stable-message h3').innerText;

        let messageData = {
            title: "variations",
            sourceSrc: img.src,
            send: true,
            imgToImg: true
        }
        let content = await renderTemplate(this.template, messageData);
        // Create a chat message with the image content
        let message = await ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: content,
            whisper: ChatMessage.getWhisperRecipients("GM")

        });

        sdAPIClient.imgToImg(prompt, message, imgData);
        sdAPIClient.initProgressRequest(message)

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
                name: "new Journal",
            });

            // Create a new journal entry page with the image
            await journal.createEmbeddedDocuments("JournalEntryPage", [{
                name: "generated image",
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
                 <a class="stable-image-create-journal">create a journal</a>
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
     */
    async updateGMMessage(message, options) {
        let messageData = mergeObject(message, options)
        // Render the template with the message data
        let content = await renderTemplate(this.template, messageData);

        // Update the message content and whisper it to the GM
        message.update({
            id: message._id,
            content: content,
            whisper: ChatMessage.getWhisperRecipients("GM")
        }).then(msg => {
            if (options.send) {
                sdAPIClient.initProgressRequest(msg)
            }
            ui.sidebar.tabs.chat.scrollBottom()

        });


    }


    /**
     * Extracts the prompt command from the chat message
     * @param {Object} message - The chat message object
     */

    getPromptCommand(message) {
        // Check if the user is the GM and the stable-images connection is enabled
        // Check if the message content starts with ":sd: "
        if (message.content.indexOf(":sd: ") == 0) {
            // Extract the prompt from the message content
            let prompt = message.content.replace(":sd: ", "");

            // Update the message content with the progress bar
            this.updateGMMessage(message, { send: true, title: prompt })
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
            send: false
        })
    }

}


/**
 * Export an instance of the StableImagesChatListenner class
 */
const chatListenner = new StableImagesChatListenner();
export default chatListenner 