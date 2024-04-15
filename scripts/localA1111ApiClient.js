// a1111ApiClient.js
import chatListener from "./ChatListener.js";
import sdAPIClient from "./sdAPIClient.js";

class A1111ApiClient {
  async textToImg(prompt, message) {
    let requestBody = deepClone(sdAPIClient.localA111DefaultRequestBody);
    requestBody.prompt = sdAPIClient.getFullPrompt(prompt);
    let apiUrl = `${game.settings.get("stable-images", "localA1111URL")}/sdapi/v1/txt2img/`;
    await game.settings.set("stable-images", "working", true);
    console.log('requestBody', requestBody);

    try {
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(requestBody)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          chatListener.createImage(data, prompt, message);
          game.settings.set("stable-images", "working", false);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    } catch (e) {
      ui.notifications.warn('Error while sending request to stable diffusion');
    }
  }
}

const a1111ApiClient = new A1111ApiClient();

export default a1111ApiClient;
