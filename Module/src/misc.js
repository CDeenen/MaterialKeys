import * as MODULE from "../MaterialKeys.js";

export class playlistConfigForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "playlist-config",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.Sett.PlaylistConfig"),
            template: "./modules/MaterialKeys/templates/playlistConfig.html",
            classes: ["sheet"],
            width: 500
        });
    }
    
    

    /**
     * Provide data to the template
     */
    getData() {
        const selectedPlaylists = game.settings.get(MODULE.moduleName,'selectedPlaylists');
        let playlistData = {};

        for (let i=0; i<8; i++){
            let playlist;
            playlist = MODULE.getFromJSONArray(selectedPlaylists,i);

            let dataThis = {
                iteration: i+1,
                playlist: selectedPlaylists[i],
                playlists: game.playlists.entities
            }
            MODULE.setToJSONArray(playlistData,i,dataThis);
        }
    
        if (!this.data && selectedPlaylists) {
            this.data = selectedPlaylists;
        }
        return {
            playlists: game.playlists.entities,
            playlistData: playlistData,
            playMethod: game.settings.get(MODULE.moduleName,'playlistMethod')
        } 
    }

    /**
     * Update on form submit
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
        await game.settings.set(MODULE.moduleName,'selectedPlaylists', formData["selectedPlaylist"]);
        await game.settings.set(MODULE.moduleName,'playlistMethod',formData["playMethod"]);
        

    }

    activateListeners(html) {
        super.activateListeners(html);

        
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class soundboardConfigForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
        //this.soundData = {};
        this.playlist;
        this.updatePlaylist = false;
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "soundboard-config",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.Sett.SoundboardConfig"),
            template: "./modules/MaterialKeys/templates/soundboardConfig.html",
            classes: ["sheet"],
            width: 1200,
            height: 720
        });
    }
    
    getArray(data){
        let array = [data.a,data.b,data.c,data.d,data.e,data.f,data.g,data.h];
        return array;
    }

    /**
     * Provide data to the template
     */
    getData() {
        let playlistId = game.settings.get(MODULE.moduleName,'soundboardSettings').playlist;
        if (this.updatePlaylist) playlistId = this.playlist;
        this.updatePlaylist = false;
        let playlist = 'none';
        let sounds = [];
        if (playlistId != undefined){
            playlist = game.playlists.entities.find(p => p._id == playlistId);
            if (playlist != undefined) sounds = playlist.sounds;
            else playlist = 'none';
        }
        let selectedSounds = game.settings.get(MODULE.moduleName,'soundboardSettings').sounds;
        let colorOn = game.settings.get(MODULE.moduleName,'soundboardSettings').colorOn;
        let colorOff = game.settings.get(MODULE.moduleName,'soundboardSettings').colorOff;
        let mode = game.settings.get(MODULE.moduleName,'soundboardSettings').mode;
        let toggle = game.settings.get(MODULE.moduleName,'soundboardSettings').toggle;
        let volume = game.settings.get(MODULE.moduleName,'soundboardSettings').volume;

        if (selectedSounds == undefined) selectedSounds = [];
        if (colorOn == undefined) colorOn = [];
        if (colorOff == undefined) colorOff = [];
        if (mode == undefined) mode = [];
        if (toggle == undefined) toggle = [];
        let soundData = {};

        for (let j=0; j<8; j++){
            let soundsThis = {};
            for (let i=0; i<8; i++){
                if (volume == undefined) volume = 50;
                

                let dataThis = {
                    iteration: 10*(8-j)+i+1,
                    sound: selectedSounds[j*8+i],
                    sounds: sounds,
                    colorOn: colorOn[j*8+i],
                    colorOff: colorOff[j*8+i],
                    mode: mode[j*8+i],
                    toggle: toggle[j*8+i],
                    volume: volume[j*8+i]
                }
                MODULE.setToJSONArray(soundsThis,i,dataThis);
            }
            let data = {
                dataThis: soundsThis,
            };
            MODULE.setToJSONArray(soundData,j,data);

        }
        return {
            playlists: game.playlists.entities,
            playlist: playlistId,
            sounds: sounds,
            selectedSound81: selectedSounds.a,
            soundData: soundData,
        } 
    }

    /**
     * Update on form submit
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
        await game.settings.set(MODULE.moduleName,'soundboardSettings',{
            playlist: formData["playlist"],
            sounds: formData["sounds"],
            colorOn: formData["colorOn"],
            colorOff: formData["colorOff"],
            mode: formData["mode"],
            toggle: formData["toggle"],
            volume: formData["volume"]
        });
        MODULE.launchpad.audioSoundboardUpdate();
    }

    async activateListeners(html) {
        super.activateListeners(html);
        const colorPickerOn = html.find("button[name='colorPickerOn']");
        const colorPickerOff = html.find("button[name='colorPickerOff']");
        const playlistSelect = html.find("select[name='playlist']");
        const volumeSlider = html.find("input[name='volume']");
        const soundSelect = html.find("select[name='sounds']");

        colorPickerOn.on('click',(event) => {
            let target = event.currentTarget.value;
            let color = document.getElementById("colorOn"+target).value;
            if ((color < 0 && color > 127) || color == "") color = 0;
            MODULE.launchpad.colorPicker(target,1,color);
            
        });
        colorPickerOff.on('click',(event) => {
            let target = event.currentTarget.value;
            let color = document.getElementById("colorOff"+target).value;
            if ((color < 0 && color > 127) || color == "") color = 0;
            MODULE.launchpad.colorPicker(target,0,color);
            
        });
        if (playlistSelect.length > 0) {
            playlistSelect.on("change", event => {
                this.playlist = event.target.value;
                this.updatePlaylist = true;
                this.render();
            });
        }
        volumeSlider.on('change', event => {
            let id = event.target.id.replace('volume','');
            let column = id%10-1;
            let row = 8-Math.floor(id/10);
            id = row*8+column;
            let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
            settings.volume[id] = event.target.value;
            game.settings.set(MODULE.moduleName,'soundboardSettings',settings);
            if (MODULE.launchpad.activeSounds[id] != false){
                let volume = AudioHelper.inputToVolume(event.target.value/100) * game.settings.get("core", "globalInterfaceVolume");
                MODULE.launchpad.activeSounds[id].volume(volume);
            }
        });
        if (soundSelect.length > 0) {
            soundSelect.on("change",event => {
                let id = event.target.id.replace('soundSelect','');
                let column = id%10-1;
                let row = 8-Math.floor(id/10);
                id = row*8+column;
                let settings = game.settings.get(MODULE.moduleName,'soundboardSettings');
                settings.sounds[id] = event.target.value;
                game.settings.set(MODULE.moduleName,'soundboardSettings',settings);
                if (MODULE.launchpad.activeSounds[id] != false){
                    let mode = settings.mode[id];
                    let repeat = false;
                    if (mode == 1) repeat = true;
                    MODULE.launchpad.playSound(id,repeat,false);
                }
            });
        }
    }
    
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class macroConfigForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.data = data;
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "macro-config",
            title: "Material Keys: "+game.i18n.localize("MaterialKeys.Sett.MacroConfig"),
            template: "./modules/MaterialKeys/templates/macroConfig.html",
            classes: ["sheet"],
            width: 1200,
            height: 720
        });
    }
    
    /**
     * Provide data to the template
     */
    getData() {
        var selectedMacros = game.settings.get(MODULE.moduleName,'macroSettings').macros;
        var color = game.settings.get(MODULE.moduleName,'macroSettings').color;
        var args = game.settings.get(MODULE.moduleName,'macroArgs');
        if (selectedMacros == undefined) selectedMacros = [];
        if (color == undefined) color = [];
        if (args == undefined) args = [];
        let macroData = {};

        let furnaceEnabled = false;
        let furnace = game.modules.get("furnace");
        if (furnace != undefined && furnace.active) furnaceEnabled = true;
        let height = 100;
        if (furnaceEnabled) height += 50;

        for (let j=0; j<8; j++){
            let macroThis = {};
      
            for (let i=0; i<8; i++){
                let dataThis = {
                    iteration: 10*(8-j)+i+1,
                    macro: selectedMacros[j*8+i],
                    color: color[j*8+i],
                    macros:game.macros,
                    args: args[j*8+i],
                    furnace: furnaceEnabled
                }
                MODULE.setToJSONArray(macroThis,i,dataThis);
            }
            let data = {
                dataThis: macroThis,
            };
            MODULE.setToJSONArray(macroData,j,data);
        }
        
        return {
            height: height,
            macros: game.macros,
            selectedMacros: selectedMacros,
            macroData: macroData,
        } 
    }

    /**
     * Update on form submit
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
       await game.settings.set(MODULE.moduleName,'macroSettings',{
            macros: formData["macros"],
            color: formData["color"]
       });

        let furnace = game.modules.get("furnace");
        if (furnace != undefined && furnace.active) 
            await game.settings.set(MODULE.moduleName,'macroArgs', formData["args"]);
       
       MODULE.launchpad.setMode(MODULE.launchpad.keyMode);
       MODULE.launchpad.macroUpdate();
    }

    activateListeners(html) {
        super.activateListeners(html);
        const colorPicker = html.find("button[name='colorPicker']");

        colorPicker.on('click',(event) => {
            let target = event.currentTarget.value;
            let color = document.getElementById("color"+target).value;
            if ((color < 0 && color > 127) || color == "") color = 0;
            MODULE.launchpad.colorPicker(target,0,color);
        });
    }
}