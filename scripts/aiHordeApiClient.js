class HordeAPIClient {
  async checkStatus() {
    const selectedSource = game.settings.get('stable-images', 'source');
  
    if (selectedSource === 'stableHorde') {
      const aiHordeUrl = game.settings.get('stable-images', 'stableHordeURL');
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

async generateImage(prompt, message, sourceImage = null) {
  if (game.settings.get("stable-images", "working")) {
    return ui.notifications.warn("Please wait until the previous job is finished");
  }

  const aiHordeUrl = game.settings.get('stable-images', 'stableHordeURL');
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
