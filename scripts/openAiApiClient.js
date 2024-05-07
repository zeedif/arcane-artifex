import chatListener from "./ChatListener.js";

class OpenAiApiClient {
  async checkStatus() {
    const selectedSource = game.settings.get('arcane-artifex', 'source');

    if (selectedSource === 'openAI') {
        const openAiApiKey = game.settings.get('arcane-artifex', 'openAiApiKey');
    
        console.error('Checking OpenAI API status...');

        if (!openAiApiKey || openAiApiKey === '0000000000') {
            console.error('OpenAI API key is not configured correctly.');
            ui.notifications.error('OpenAI API key is not configured. Please check your settings.');
            return 'OpenAI API key is not configured.';
        }
    
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAiApiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ "role": "user", "content": "Say this is a test!" }],
                    temperature: 0
                })
            });
    
            const responseData = await response.json();
            console.error('OpenAI API response:', responseData);
            if (response.ok) {
                if (responseData.choices && responseData.choices[0].message.content.trim() !== "") {
                    console.log('OpenAI text API is accessible and operational.');
                    ui.notifications.info('OpenAI text API is accessible.');
                    return 'OpenAI text API is accessible and functioning.';
                } else {
                    console.error('OpenAI text API did not return the expected content:', responseData);
                    ui.notifications.error('OpenAI text API is operational but did not return the expected content.');
                    return 'OpenAI text API operational but check content.';
                }
            } else {
                console.error('OpenAI text API is not accessible:', responseData.error.message);
                ui.notifications.error(`OpenAI text API is not accessible: ${responseData.error.message}`);
                throw new Error(`OpenAI text API returned an error: ${responseData.error.message}`);
            }
        } catch (error) {
            console.error('Error occurred while trying to access OpenAI text API;', error);
            ui.notifications.error(`Error occurred while trying to access OpenAI text API; error = ${error.message}`);
        }
    } else {
        console.log("OpenAI is not the selected source. Skipping OpenAI status check.");
        return 'OpenAI is not the selected source. Skipping OpenAI status check.';
    }
}

  

  async getSettings() {
    const connection = game.settings.get('arcane-artifex', 'connected');

    if (!connection) {
      console.warn("OpenAI connections not established. Skipping API calls.");
      return;
    }

    // put setting of OpenAI here

  }




  async textToImg(prompt, message) {
    const openAiUrl = 'https://api.openai.com/v1/images/generations';
    const apiKey = game.settings.get('arcane-artifex', 'openAiApiKey');
    const requestBody = {
      prompt: prompt,
      model: 'dall-e-3',
      n: 1,
      size: game.settings.get("arcane-artifex", "sdwidth") + 'x' + game.settings.get("arcane-artifex", "sdheight"),
      quality: game.settings.get("arcane-artifex", "openAiHd") ? 'hd' : 'standard',  // Toggle between 'hd' and 'standard'
      style: game.settings.get("arcane-artifex", "openAiVivid") ? 'vivid' : 'natural',  // Toggle between 'vivid' and 'natural'
      response_format: 'b64_json'  // Use base64-encoded image directly
    };
    
  
    try {
      const response = await fetch(openAiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error while generating image, status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.data[0].b64_json) {
        // Assuming function createImage exists to handle the display of the image
        chatListener.createImage(data.data[0].b64_json, prompt, message);
      } else {
        throw new Error("No image returned from OpenAI.");
      }
    }
    catch (error) {
      console.error('Error in generating image with OpenAI:', error);
      ui.notifications.error(`Error while sending request to OpenAI: ${error.message}`);
    }


  }
async fetchAndProcessImage(imageUrl, prompt, message, attempts = 0) {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Image fetch error! Status: ${imageResponse.status}`);
    }
    const imageBlob = await imageResponse.blob();

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = {
        images: [{
          id: foundry.utils.randomID(),
          data: reader.result
        }],
        title: prompt,
        send: false
      };
      chatListener.createImage(imageData, prompt, message);
    };
    reader.onerror = error => {
      console.error('Error converting blob to base64:', error);
    };
    reader.readAsDataURL(imageBlob);
  } catch (error) {
    if (attempts < 3) { // Retry up to 3 times
      console.error(`Attempt ${attempts + 1}: Retrying after error fetching image:`, error);
      setTimeout(() => this.fetchAndProcessImage(imageUrl, prompt, message, attempts + 1), 2000); // Wait 2 seconds before retrying
    } else {
      console.error('Failed to fetch image after multiple attempts:', error);
    }
  }
}

}

export const openAiApiClient = new OpenAiApiClient();
export default openAiApiClient;