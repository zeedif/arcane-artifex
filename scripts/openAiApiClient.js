import chatListener from "./ChatListener.js";

class OpenAiApiClient {
  async checkStatus() {
      const openAiApiKey = game.settings.get('stable-images', 'openAiApiKey');
  
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
  }
  

  async getOpenAISettings() {
    const connection = game.settings.get('stable-images', 'connected');

    if (!connection) {
      console.warn("Local AI Horde connection not established. Skipping API calls.");
      return;
    }

    // put setting of OpenAI here

  }
  async fetchSamplersFromSwagger() {
    const hordeUrl = game.settings.get('stable-images', 'hordeURL');
    const url = `${hordeUrl}/api/swagger.json`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Navigate directly to the enum for samplers based on the JSON structure you provided
        const samplers = data.definitions.ModelPayloadRootStable.properties.sampler_name.enum;
        console.error("Samplers:", samplers);
        return samplers;
    } catch (error) {
        console.error('Failed to fetch or parse the Swagger JSON:', error);
        return null;
    }
}
  async loadHordeModels() {
    try {
        const hordeUrl = game.settings.get('stable-images', 'hordeURL');
        const response = await fetch(`${hordeUrl}/api/v2/status/models`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            data.sort((a, b) => b.count - a.count);

            const hordeModels = data.map(x => ({
                value: x.name,
                text: `${x.name} (ETA: ${x.eta}s, Queue: ${x.queued}, Workers: ${x.count})`
            }));

            let hordeModel = game.settings.get('stable-images', 'hordeModel');

            if (!hordeModel || !hordeModels.some(model => model.value === hordeModel)) {
                hordeModel = hordeModels[0].value;
            }

            return { hordeModels, hordeModel };
        } else {
            ui.notifications.error(`Error while retrieving Horde models: ${response.statusText}`);
            return { hordeModels: [], hordeModel: '' };
        }
    } catch (error) {
        ui.notifications.error(`Error while retrieving Horde models: ${error}`);
        return { hordeModels: [], hordeModel: '' };
    }
}


async textToImg(prompt, message) {
  const aiHordeUrl = game.settings.get('stable-images', 'hordeURL');
  const apiUrl = `${aiHordeUrl}/api/v2/generate/async`;
 
const requestBody = {
  prompt: prompt,
  nsfw: game.settings.get("stable-images", "hordeNSFW"), 
  censor_nsfw: false,
  trusted_workers: false,
  slow_workers: true,
  shared: true,
  replacement_filter: true,
  worker_blacklist: false,
  dry_run: false,
  r2: true,
  models: [game.settings.get("stable-images", "hordeModel")],
  workers: [], 
  params: {
    n: game.settings.get("stable-images", "numImages"),
    width: game.settings.get("stable-images", "sdwidth"),
    height: game.settings.get("stable-images", "sdheight"),
    steps: game.settings.get("stable-images", "samplerSteps"),
    denoising_strength: 1.0,
    sampler_name: game.settings.get("stable-images", "hordeSampler"),
    cfg_scale: game.settings.get("stable-images", "cfgScale"),
    karras: game.settings.get("stable-images", "hordeKarras"),
    tiling: false,
    hires_fix: game.settings.get("stable-images", "enableHr")
  }
};


  game.settings.set('stable-images', 'hordeRequestBody', requestBody);

  try {
    const apiKey = game.settings.get('stable-images', 'hordeAPIKey');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error while generating image, status: ${response.status}`);
    }

    const data = await response.json();

    // Begin the polling process for image generation status
    await this.initProgressRequest(data.id, prompt, message);
  }
  catch (error) {
    console.error('Error in generating image:', error);
    ui.notifications.error(`Error while sending request to Horde AI: ${error.message}`);
  }
}


async initProgressRequest(generationId, prompt, message, attempt = 0, currentState = "undefined") {
  const maxAttempts = 100;
  const aiHordeUrl = game.settings.get('stable-images', 'hordeURL');
  let checkStatusUrl = `${aiHordeUrl}/api/v2/generate/check/${generationId}`;

  if (attempt >= maxAttempts) {
    console.error("Max progress check attempts reached, stopping further checks.");
    return;
  }

  try {
    const statusResponse = await fetch(checkStatusUrl);

    
    if (!statusResponse.ok) {
      throw new Error('Request failed with status ' + statusResponse.status);
    }
    
    const statusData = await statusResponse.json();

    // Update the UI with the current status
    chatListener.displayHordeProgress(message, statusData);

    if (currentState === "undefined" && attempt === 0) {
      currentState = "idle";
    }

    if (!statusData.done && currentState !== "waiting") {
      currentState = "waiting";
    } else if (statusData.done && currentState !== "processing") {
      currentState = "processing";
    }
    
    // Image is still being processed, increment attempt count and poll again
    if (!statusData.done) {
      setTimeout(() => {
        this.initProgressRequest(generationId, prompt, message, attempt + 1, currentState);
      }, 2500);
    }

    // Image generation is done, proceed to retrieve the image
        if (statusData.done && currentState === "processing") {
          await this.retrieveGeneratedImage(generationId, prompt, message);

        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    }
    

async retrieveGeneratedImage(generationId, prompt, message) {
  const aiHordeUrl = game.settings.get('stable-images', 'hordeURL');
  const retrieveUrl = `${aiHordeUrl}/api/v2/generate/status/${generationId}`;


  // wait one second before attempting to fetch the retrieveUrl
  await new Promise(resolve => setTimeout(resolve, 5000));


  try {
    const retrieveResponse = await fetch(retrieveUrl);
    if (!retrieveResponse.ok) {
      throw new Error(`HTTP error! Status: ${retrieveResponse.status}`);
    }
    const retrieveData = await retrieveResponse.json();

    if (!retrieveData.done || !retrieveData.generations || retrieveData.generations.length === 0) {
      console.error('No image generation data found or image generation not complete.');
      return;
    }

    const imageUrl = retrieveData.generations[0].img;
    console.log('Direct URL of the generated image:', imageUrl); // Add this line
    await this.fetchAndProcessImage(imageUrl, prompt, message);
  } catch (error) {
    console.error('Error during image retrieval and processing:', error);
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