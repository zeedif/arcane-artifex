import chatListener from "./ChatListener.js";

class StabilityApiClient {
  async checkStatus() {
    const selectedSource = game.settings.get('arcane-artifex', 'source');
  
    if (selectedSource === 'stability') {
      const stabilityApiKey = game.settings.get('arcane-artifex', 'stabilityApiKey');
  
      console.error('Checking Stability API status...');
  
      if (!stabilityApiKey || stabilityApiKey === '0000000000') {
        console.error('Stability API key is not configured correctly.');
        ui.notifications.error('Stability API key is not configured. Please check your settings.');
        return 'Stability API key is not configured.';
      }
  
      try {
        const response = await fetch('https://api.stability.ai/v1/user/account', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${stabilityApiKey}`
          }
        });
  
        const responseData = await response.json();
        console.error('Stability API response:', responseData);
  
        if (response.ok) {
          console.log('Stability API is accessible and operational.');
          ui.notifications.info(`Stability API is accessible. Email: ${responseData.email}`);
          return `Stability API is accessible and functioning. Email: ${responseData.email}`;
        } else if (response.status === 401) {
          console.error('Unauthorized access to Stability API:', responseData.message);
          ui.notifications.error(`Unauthorized access to Stability API: ${responseData.message}`);
          throw new Error(`Unauthorized access to Stability API: ${responseData.message}`);
        } else {
          console.error('Stability API encountered an error:', responseData.message);
          ui.notifications.error(`Stability API encountered an error: ${responseData.message}`);
          throw new Error(`Stability API encountered an error: ${responseData.message}`);
        }
      } catch (error) {
        console.error('Error occurred while trying to access Stability API:', error);
        ui.notifications.error(`Error occurred while trying to access Stability API: ${error.message}`);
      }
    } else {
      console.log("Stability is not the selected source. Skipping Stability status check.");
      return 'Stability is not the selected source. Skipping Stability status check.';
    }
  }

  

  async getStabilitySettings() {
    const connection = game.settings.get('arcane-artifex', 'connected');

    if (!connection) {
      console.warn("Stability connections not established. Skipping API calls.");
      return;
    }

    // put setting of Stability here

  }




  async textToImg(prompt, message) {
    const stabilityUrl = 'https://api.stability.com/v1/images/generations';
    const apiKey = game.settings.get('arcane-artifex', 'stabilityApiKey');
    const requestBody = {
      prompt: prompt,
      model: 'dall-e-3',
      n: 1,
      size: game.settings.get("arcane-artifex", "sdwidth") + 'x' + game.settings.get("arcane-artifex", "sdheight"),
      quality: game.settings.get("arcane-artifex", "stabilityHd") ? 'hd' : 'standard',  // Toggle between 'hd' and 'standard'
      style: game.settings.get("arcane-artifex", "stabilityVivid") ? 'vivid' : 'natural',  // Toggle between 'vivid' and 'natural'
      response_format: 'b64_json'  // Use base64-encoded image directly
    };
    
  
    try {
      const response = await fetch(stabilityUrl, {
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
        throw new Error("No image returned from Stability.");
      }
    }
    catch (error) {
      console.error('Error in generating image with Stability:', error);
      ui.notifications.error(`Error while sending request to Stability: ${error.message}`);
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

export const stabilityApiClient = new StabilityApiClient();
export default stabilityApiClient;