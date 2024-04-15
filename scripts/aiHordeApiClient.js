class HordeAPIClient {
  async checkStatus() {
    const selectedSource = game.settings.get('stable-images', 'source');
  
    if (selectedSource === 'stableHorde') {
      const aiHordeUrl = game.settings.get('stable-images', 'hordeURL');
      const statusUrl = `${aiHordeUrl}/api/v2/status/heartbeat`;
        
      try {
        const response = await fetch(statusUrl);
        if (response.ok) {
          console.log('AI Horde server is accessible at:', aiHordeUrl);
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
      console.log("Stable Horde is not selected. Skipping AI Horde status check.");
      return 'Stable Horde is not selected. Skipping AI Horde status check.';
    }
  }

  async getHordeSettings() {
    const connection = game.settings.get('stable-images', 'connected');

    if (!connection) {
      console.warn("Local AI Horde connection not established. Skipping API calls.");
      return;
    }

    const { horde_models, horde_model } = await this.loadHordeModels();
    game.settings.set('stable-images', 'hordeModels', horde_models);
    game.settings.set('stable-images', 'hordeModel', horde_model);
    const samplers = await this.fetchSamplersFromSwagger();
    game.settings.set('stable-images', 'hordeSamplers', samplers);

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

            const horde_models = data.map(x => ({
                value: x.name,
                text: `${x.name} (ETA: ${x.eta}s, Queue: ${x.queued}, Workers: ${x.count})`
            }));

            const savedSettings = game.settings.get('stable-images', 'stable-settings') || {};
            let horde_model = savedSettings.horde_model;

            if (!horde_model || !horde_models.some(model => model.value === horde_model)) {
                horde_model = horde_models[0].value;
            }

            return { horde_models, horde_model };
        } else {
            ui.notifications.error(`Error while retrieving Horde models: ${response.statusText}`);
            return { horde_models: [], horde_model: '' };
        }
    } catch (error) {
        ui.notifications.error(`Error while retrieving Horde models: ${error}`);
        return { horde_models: [], horde_model: '' };
    }
}


async generateImage(prompt, message, sourceImage = null) {
  if (game.settings.get("stable-images", "working")) {
    return ui.notifications.warn("Please wait until the previous job is finished");
  }

  const aiHordeUrl = game.settings.get('stable-images', 'hordeURL');
  const apiUrl = `${aiHordeUrl}/api/v2/generate/async`;

  const requestBody = {
    prompt: prompt,
    params: {
      n: game.settings.get("stable-images", "numImages"),
      width: game.settings.get("stable-images", "sdwidth"),
      height: game.settings.get("stable-images", "sdheight"),
      steps: game.settings.get("stable-images", "samplerSteps"),
      sampler_name: game.settings.get("stable-images", "hordeAISampler"),
      cfg_scale: game.settings.get("stable-images", "cfgScale"),
      seed: -1,
      source_image: sourceImage || null,
      source_processing: sourceImage ? "img2img" : null,
      denoising_strength: sourceImage ? game.settings.get("stable-images", "denoisingStrength") : null,
    },
    nsfw: game.settings.get("stable-images", "allowNSFW"),
  };

  await game.settings.set("stable-images", "working", true);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': game.settings.get("stable-images", "hordeApiKey"),
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    await this.checkImageProgress(data.id, prompt, message);
  } catch (error) {
    console.error('Error:', error);
    ui.notifications.error(`Error while sending request to Horde AI: ${error.message}`);
  } finally {
    await game.settings.set("stable-images", "working", false);
  }
}

async testImageGeneration() {
  const prompt = "A beautiful sunset over a serene beach";
  await this.generateImage(prompt);
}




}

export const aiHordeApiClient = new HordeAPIClient();
export default aiHordeApiClient;
