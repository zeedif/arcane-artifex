## _This module enables communication between Foundry VTT and an instance of Automatic 1111 webUI Stable Diffusion installed on a machine accessible to FoundryVTT - either local or through a tunneling service like ngrok_

Before launching Foundry and your world where this module will reside, you'll need to start Stable Diffusion with these options:
<br>

```
--listen --api --cors-allow-origins="[your_local_ip_of_foundry]"
```

### The Game Master who has launched Stable Diffusion on their machine with these options will be able to generate images in the Foundry VTT chat.

They should initiate a chat message with ":sd: ", _remember the space at the end._ The content of the text sent in the chat will then become a part of the prompt sent to Stable Diffusion. The beginning of the prompt is editable in the module's settings.