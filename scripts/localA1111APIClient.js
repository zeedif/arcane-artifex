class LocalA1111ApiClient {
    async checkStatus() {
        // Retrieve the source options from the game settings
        const sourceOptions = game.settings.get('stable-images', 'SOURCE_OPTIONS') || [];
        
        // Find the stable-horde option and check if it is selected
        const stableHordeSelected = sourceOptions.find(option => option.value === 'stable-horde')?.selected;

        // Only proceed if the stable-horde option is selected
        if (stableHordeSelected) {
            const aiHordeUrl = game.settings.get('stable-images', 'horde_url');
            const statusUrl = `${aiHordeUrl}/api/v2/status/heartbeat`;

            try {
                const response = await fetch(statusUrl);

                if (response.ok) {
                    return 'AI Horde API is accessible.';
                } else {
                    throw new Error(`AI Horde API returned an error: ${response.status}`);
                }
            } catch (error) {
                console.error('Error accessing AI Horde API:', error);
                throw error;
            }
        } else {
            console.log("Stable Horde is not selected. Skipping AI Horde status check.");
            // Optionally, you could return a message or handle the skipped check appropriately
            return 'Stable Horde is not selected. Skipping AI Horde status check.';
        }
    }
}

export const LocalA1111ApiClient = new LocalA1111ApiClient();
