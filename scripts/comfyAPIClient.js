class comfyAPIClient {
    constructor() {
        console.error("comfyAPIClient initialized");
        this.initializeWebSocket();
    }

    initializeWebSocket() {
        // Define the WebSocket URL. Adjust this URL to your server's WebSocket endpoint
        const wsUrl = "ws://127.0.0.1:8188/ws";
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.error("WebSocket connection successfully established.");
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket connection error:", error);
        };

        // Add any additional WebSocket event listeners as needed, for example:
        // this.ws.onmessage = (message) => {
        //     console.error("WebSocket message received:", message.data);
        // };
    }

    async checkQueueStatus() {
        console.error("Checking queue status...");
    
        try {
            const comfyAPIUrl = await game.settings.get("stable-images", "stable-settings")["comfy-IP"];
            const apiUrl = comfyAPIUrl + '/queue';
    
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            });
    
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error(`Error fetching queue status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching queue status:', error);
            throw error;
        }
    }
    async checkImageStatus(executionId) {
        try {
            const comfyAPIUrl = await game.settings.get("stable-images", "stable-settings")["comfy-IP"];
            const statusUrl = comfyAPIUrl + `/status/${executionId}`;
    
            const response = await fetch(statusUrl);
            if (response.ok) {
                const status = await response.json();
                if (status.status === 'completed') {
                    console.log('Image generation completed. Execution ID:', executionId);
                    // TODO: Fetch and upload the generated image
                } else {
                    console.log('Image generation in progress. Execution ID:', executionId);
                    setTimeout(() => this.checkImageStatus(executionId), 1000); // Check again after 1 second
                }
            } else {
                console.error('Error checking image status:', response.status);
            }
        } catch (error) {
            console.error('Error checking image status:', error);
        }
    }
    async sendPrompt() {
        const promptData = {
            "3": {
                "inputs": {
                    "seed": 0,
                    "steps": 8,
                    "cfg": 1.5,
                    "sampler_name": "dpmpp_3m_sde_gpu",
                    "scheduler": "sgm_uniform",
                    "denoise": 1,
                    "model": [
                        "10",
                        0
                    ],
                    "positive": [
                        "6",
                        0
                    ],
                    "negative": [
                        "7",
                        0
                    ],
                    "latent_image": [
                        "5",
                        0
                    ]
                },
                "class_type": "KSampler",
                "_meta": {
                    "title": "KSampler"
                }
            },
            "4": {
                "inputs": {
                    "ckpt_name": "XL\\Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors"
                },
                "class_type": "CheckpointLoaderSimple",
                "_meta": {
                    "title": "Load Checkpoint"
                }
            },
            "5": {
                "inputs": {
                    "width": 1024,
                    "height": 1024,
                    "batch_size": 1
                },
                "class_type": "EmptyLatentImage",
                "_meta": {
                    "title": "Empty Latent Image"
                }
            },
            "6": {
                "inputs": {
                    "text": "a fantasy (Animated Armor),construct,Unaligned, null, Antimagic Susceptibility, False Appearance, Multiattack, Slam, ",
                    "clip": [
                        "10",
                        1
                    ]
                },
                "class_type": "CLIPTextEncode",
                "_meta": {
                    "title": "CLIP Text Encode (Prompt)"
                }
            },
            "7": {
                "inputs": {
                    "text": "",
                    "clip": [
                        "10",
                        1
                    ]
                },
                "class_type": "CLIPTextEncode",
                "_meta": {
                    "title": "CLIP Text Encode (Prompt)"
                }
            },
            "8": {
                "inputs": {
                    "samples": [
                        "3",
                        0
                    ],
                    "vae": [
                        "4",
                        2
                    ]
                },
                "class_type": "VAEDecode",
                "_meta": {
                    "title": "VAE Decode"
                }
            },
            "9": {
                "inputs": {
                    "filename_prefix": "ComfyUI",
                    "images": [
                        "8",
                        0
                    ]
                },
                "class_type": "SaveImage",
                "_meta": {
                    "title": "Save Image"
                }
            },
            "10": {
                "inputs": {
                    "lora_name": "sdxl_lightning_8step_lora.safetensors",
                    "strength_model": 1,
                    "strength_clip": 1,
                    "model": [
                        "4",
                        0
                    ],
                    "clip": [
                        "4",
                        1
                    ]
                },
                "class_type": "LoraLoader",
                "_meta": {
                    "title": "Load LoRA"
                }
            }
        };
    
        try {
            const comfyAPIUrl = await game.settings.get("stable-images", "stable-settings")["comfy-IP"];
            const apiUrl = comfyAPIUrl + '/prompt';
    
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: promptData })
            });
    
            if (response.ok) {
                console.log('Prompt sent successfully');
            } else {
                console.error('Error sending prompt:', response.status);
            }
        } catch (error) {
            console.error('Error sending prompt:', error);
        }
    }

}

const comfyApiClient = new comfyAPIClient();

export default comfyApiClient;