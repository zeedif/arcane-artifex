import chatListener from "./ChatListener.js";

class HordeAPIClient {
  async checkStatus() {
    const selectedSource = game.settings.get('stable-images', 'source');
  
    if (selectedSource === 'stableHorde') {
      const aiHordeUrl = game.settings.get('stable-images', 'hordeURL');
      const statusUrl = `${aiHordeUrl}/api/v2/status/heartbeat`;
        
      try {
        const response = await fetch(statusUrl);
        if (response.ok) {
          console.error('AI Horde server is accessible at:', aiHordeUrl);
          ui.notifications.info('AI Horde server is accessible.');
          return 'AI Horde API is accessible.';
        } else {
          console.error('AI Horde server is not accessible: response code', response.status, 'at URL:', aiHordeUrl);
          ui.notifications.error(`AI Horde server is not accessible: response code: ${response.status}`);
          throw new Error(`AI Horde API returned an error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error occurred while trying to access AI Horde server at URL:', aiHordeUrl, '; error =', error);
        ui.notifications.error(`Error occurred while trying to access AI Horde server; error = ${error}`);
      }
    } else {
      console.error("Stable Horde is not selected. Skipping AI Horde status check.");
      return 'Stable Horde is not selected. Skipping AI Horde status check.';
    }
  }

  async getHordeSettings() {
    const connection = game.settings.get('stable-images', 'connected');

    if (!connection) {
      console.warn("Local AI Horde connection not established. Skipping API calls.");
      return;
    }

    const { hordeModels, hordeModel } = await this.loadHordeModels();
    await game.settings.set('stable-images', 'hordeModels', hordeModels);
    await game.settings.set('stable-images', 'hordeModel', hordeModel);
    const samplers = await this.fetchSamplersFromSwagger();
    await game.settings.set('stable-images', 'hordeSamplers', samplers);
    let currentSampler = game.settings.get('stable-images', 'hordeSampler');
    if (!samplers.includes(currentSampler)) {
      currentSampler = samplers[0]; // Default to the first sampler if current is not in the list
      await game.settings.set('stable-images', 'hordeSampler', currentSampler);
    }
  

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
    karras: true,
    tiling: false,
    hires_fix: game.settings.get("stable-images", "enableHr")
  }
};


  game.settings.set('stable-images', 'hordeRequestBody', requestBody);
  console.error("requestBody:", requestBody);

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
    console.error("Image generation initiated:", data);

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

  console.error(`Current state: ${currentState}, Attempt: ${attempt}`);

  if (attempt >= maxAttempts) {
    console.error("Max progress check attempts reached, stopping further checks.");
    return;
  }

  try {
    const statusResponse = await fetch(checkStatusUrl);
    console.error(`Status check response for attempt ${attempt}:`, statusResponse);
    
    if (!statusResponse.ok) {
      throw new Error('Request failed with status ' + statusResponse.status);
    }
    
    const statusData = await statusResponse.json();
    console.error("Polling image generation status:", statusData);

    if (currentState === "undefined" && attempt === 0) {
      currentState = "idle";
      console.error(`State transition to 'idle', statusData:`, statusData);
    }

    if (!statusData.done && currentState !== "waiting") {
      currentState = "waiting";
      console.error(`State transition to 'waiting', statusData:`, statusData);
    } else if (statusData.done && currentState !== "processing") {
      currentState = "processing";
      console.error(`State transition to 'processing', statusData:`, statusData);
    }
    
    // Image is still being processed, increment attempt count and poll again
    if (!statusData.done) {
      setTimeout(() => {
        this.initProgressRequest(generationId, prompt, message, attempt + 1, currentState);
      }, 1500);
    }

    // Image generation is done, proceed to retrieve the image
    if (statusData.done && currentState === "processing") {
      console.error("Image generation complete, proceeding to retrieve the image.");
      console.error('Calling retrieveGeneratedImage with message:', message);
      await this.retrieveGeneratedImage(generationId, prompt, message);

    }
  } catch (error) {
    console.error('Error fetching progress:', error);
  }
}


async retrieveGeneratedImage(generationId, prompt, message) {

  console.error('retrieveGeneratedImage called with message:', generationId, prompt,message);
  const aiHordeUrl = game.settings.get('stable-images', 'hordeURL');
  const retrieveUrl = `${aiHordeUrl}/api/v2/generate/status/${generationId}`;

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
    console.error('Direct URL of the generated image:', imageUrl); // Add this line
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

      console.error(`Image data, prompt, message from fetchAndProcessImage call:`, imageData, prompt, message);
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

export const aiHordeApiClient = new HordeAPIClient();
export default aiHordeApiClient;
