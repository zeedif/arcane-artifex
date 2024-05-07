import chatListener from "./ChatListener.js";

class StabilityApiClient {
  async checkStatus() {
    const selectedSource = game.settings.get('arcane-artifex', 'source');
  
    if (selectedSource === 'stability') {
      const stabilityApiKey = game.settings.get('arcane-artifex', 'stabilityApiKey');
  
      console.log('Checking Stability API status...');
  
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
        console.log('Stability API response:', responseData);
  
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

  async getSettings() {
    const connection = game.settings.get('arcane-artifex', 'connected');

    if (!connection) {
      console.log("Stability connections not established. Skipping API calls.");
      return;
    }
  }
  async textToImg(prompt, message) {
    const stabilityUrl = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';
    const apiKey = game.settings.get('arcane-artifex', 'stabilityApiKey');
  
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('model', game.settings.get("arcane-artifex", "stabilityModel"));
    formData.append('aspect_ratio', game.settings.get("arcane-artifex", "stabilityAspectRatio"));
    formData.append('negative_prompt', game.settings.get("arcane-artifex", "negativePrompt"));
    formData.append('output_format', 'png');
  
    console.log('Sending request to Stability with form data:', Object.fromEntries(formData));
  
    try {
      const response = await fetch(stabilityUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'image/*'
        },
        body: formData
      });

      if (response.status === 200) {
        const imageBlob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.replace(/^data:image\/\w+;base64,/, '');
  
          const imageData = {
            images: [{
              id: foundry.utils.randomID(),
              data: `data:image/png;base64,${base64Data}`
            }],
            title: prompt,
            send: false
          };
          chatListener.createImage(imageData, prompt, message);
        };
        reader.onerror = error => {
          console.error('FileReader encountered an error:', error);
        };
        reader.readAsDataURL(imageBlob);
      } else if (response.status === 400) {
        const errorData = await response.json();
        console.error('Bad Request error:', errorData);
        throw new Error(`Bad Request: ${errorData.errors.join(', ')}`);
      } else if (response.status === 403) {
        const errorData = await response.json();
        console.error('Content Moderation error:', errorData);
        throw new Error(`Content Moderation: ${errorData.errors.join(', ')}`);
      } else if (response.status === 413) {
        const errorData = await response.json();
        console.error('Payload Too Large error:', errorData);
        throw new Error(`Payload Too Large: ${errorData.errors.join(', ')}`);
      } else if (response.status === 429) {
        const errorData = await response.json();
        console.error('Rate Limit Exceeded error:', errorData);
        throw new Error(`Rate Limit Exceeded: ${errorData.errors.join(', ')}`);
      } else if (response.status === 500) {
        const errorData = await response.json();
        console.error('Internal Server Error:', errorData);
        throw new Error(`Internal Server Error: ${errorData.errors.join(', ')}`);
      } else {
        console.error('Unexpected HTTP error:', response);
        throw new Error(`HTTP error while generating image, status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error in generating image with Stability:', error);
      ui.notifications.error(`Error while sending request to Stability: ${error.message}`);
    }
  }
}

export const stabilityApiClient = new StabilityApiClient();
export default stabilityApiClient;