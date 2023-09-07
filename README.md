![](https://github.com/rwanoux/stable-images/raw/master/demo3sd.mp4)

# EN

## _This module enables communication between Foundry VTT and an instance of Automatic 1111 webUI Stable Diffusion installed on the same machine_

Before launching Foundry and your world where this module will reside, you'll need to start Stable Diffusion with these options:
<br>

```
--listen --api --cors-allow-origins="[your_local_ip_of_foundry]"
```

### The Game Master who has launched Stable Diffusion on their machine with these options will be able to generate images in the Foundry VTT chat.

They should initiate a chat message with ":sd: ", _remember the space at the end._ The content of the text sent in the chat will then become a part of the prompt sent to Stable Diffusion. The beginning of the prompt is editable in the module's settings.

<figure >
  <video controls="true" allowfullscreen="true" >
    <source src="https://github.com/rwanoux/stable-images/raw/master/demo3sd.mp4" type="video/mp4">  
  </video>
</figure>

# FR

## _Ce module permet de faire communiquer foundry vtt avec une instance de stable diffusion installer sur le meme poste._

Avant de lancer foundry et votre world ou sera ce module vous devrez lancer Stable diffusion avec ces options:

```
--listen  --api --cors-allow-origins="[your_local_ip_of_foundry]"
```

### Le GM qui aura lancer satble diffusion sur son poste avec ces options pourra générer des images dans le chat de foundryVtt.

<br>
il devra commencer un chat message par ":sd: ", *ne pas oublier l'espace à la fin. L*e contenu du texte envoyer dans le chat sera ensuite une partie du prompt envoyé à stable diffusion. Le début du prompt est éditable dans les settings du module.

Dans les settings du module vous serez à même de définir le début du prompt, le prompt negatif, le nombre de steps, la taille et le nombre d'images générés ainsi que le cfg_scale (l'importance du prompt)
