class LocalA1111ApiClient {
    async checkStatus() {
        // Retrieve the selected source from the game settings
        const selectedSource = game.settings.get('stable-images', 'source');
    
        // Only proceed if the stableHorde option is selected
        if (selectedSource === 'stableHorde') {
          const aiHordeUrl = game.settings.get('stable-images', 'horde_url');
          const statusUrl = `${aiHordeUrl}/api/v2/status/heartbeat`;
          
          try {
            const response = await fetch(statusUrl);
            console.error("response:", response);
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
          console.error("Stable Horde is not selected. Skipping AI Horde status check.");
          // Optionally, you could return a message or handle the skipped check appropriately
          return 'Stable Horde is not selected. Skipping AI Horde status check.';
        }
      }
}

export const LocalA1111ApiClient = new LocalA1111ApiClient();
