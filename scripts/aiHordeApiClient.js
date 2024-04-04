class AiHordeApiClient {
    async checkStatus() {
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
    }
}

export const aiHordeApiClient = new AiHordeApiClient();