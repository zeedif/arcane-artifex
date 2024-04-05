export default class SourceSettings extends FormApplication {
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        id: "source-settings",
        title: "Source Settings",
        template: "modules/stable-images/templates/source-settings.hbs",
        width: 500,
        closeOnSubmit: true
      });
    }
  
    getData() {
      return {
        source: game.settings.get("stable-images", "source")
      };
    }
  
    activateListeners(html) {
      super.activateListeners(html);
    }
  
    async _updateObject(event, formData) {
      await game.settings.set("stable-images", "source", formData.source);
    }
  }