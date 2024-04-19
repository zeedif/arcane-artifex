# Arcane Artifex README

Arcane Artifex is a powerful Foundry VTT module that facilitates the creation of visual content directly within your gaming sessions. This module integrates with several AI-powered image generation systems, including Automatic1111's Stable Diffusion, Stable Horde, ComfyUI, and OpenAI's DALL-E 3. It enables Game Masters to enhance their storytelling by generating images based on textual prompts provided within the Foundry VTT chat interface.

## Supported Endpoints
- **Automatic1111**: Local or remote installation using Stable Diffusion.
- **Stable Horde**: Integration with the Stable Horde service for cloud-based image generation.
- **DALL-E 3**: Utilizes OpenAI's DALL-E 3 to generate high-quality images from prompts.

## Setup Instructions for Automatic1111
Before using Arcane Artifex in your Foundry VTT environment, ensure that your Automatic1111 webUI for Stable Diffusion is operational. Follow these steps to prepare the environment:

1. **Start Stable Diffusion with Necessary Flags**:
    Ensure that Stable Diffusion is running with the following options to allow API access and handle CORS:
    ```
    --listen --api --cors-allow-origins="[your_local_ip_of_foundry]"
    ```

2. **Launching Foundry VTT**:
    Launch your Foundry VTT world where Arcane Artifex is installed. Make sure it can access the machine where Stable Diffusion is running.

## Generating Images
- **In-Game Image Generation**:
    To generate an image, the Game Master initiates a chat message starting with the trigger `:sd: ` followed by the desired prompt. For example:
    ```
    :sd: A majestic castle at sunset
    ```
    The content after the trigger is sent as a prompt to the configured image generation backend.

- **Customizing Prompts**:
    The beginning of the prompt can be customized in the module's settings to include any required prefixes or stylistic choices that influence the generation style.

## Configuration
Each image generation endpoint can be configured within the Arcane Artifex settings panel in Foundry VTT:
- **Endpoint Selection**: Choose which backend to use for image generation.
- **API Keys and Endpoints**: Configure the necessary API keys and endpoint URLs for DALL-E 3 and other services.
- **Default Styles and Settings**: Set default parameters such as image style (e.g., vivid for DALL-E 3) and resolution.

## Upcoming Features
- **ComfyUI Integration**: Upcoming updates will include support for ComfyUI, enhancing the user interface for selecting options and viewing generated images.

Ensure that all configurations are correctly set to leverage the full capabilities of Arcane Artifex, enriching your gaming experience with seamlessly integrated visual content generation.