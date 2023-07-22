export {CHUTtsProvider}

class CHUTtsProvider {

    settings
    voices = []
    separator = ' ~~~ ~~~ ~~~ '
    defaultSettings = {
        noise: 0.1,
        noisew: 0.8,
        apiKey: "",
        multilingual: false,
        voiceMap: {},
        voicelists: ''
    }

    get settings() {
        return this.settings
    }

    get settingsHtml() {
        let html = `
        <label for="elevenlabs_tts_API_URL">自定义TTS地址</label>
        <input id="elevenlabs_tts_API_URL" type="text" class="text_pole" placeholder="<自定义TTS地址>"/>
        <span>声音列表</span> </br>
        <select id="chu_tts">
        </select>
        <span>语言列表</span> </br>
        <select id="chu_tts_lang">
        </select>
        <label for="elevenlabs_tts_stability">语气(越小越平缓): <span id="elevenlabs_tts_stability_output"></span></label>
        <input id="elevenlabs_tts_stability" type="range" value="${this.defaultSettings.noise}" min="0" max="1" step="0.05" />
        <label for="elevenlabs_tts_similarity_boost">语速(越大越慢): <span id="elevenlabs_tts_similarity_boost_output"></span></label>
        <input id="elevenlabs_tts_similarity_boost" type="range" value="${this.defaultSettings.noisew}" min="0" max="1" step="0.05" />
<!--        <label class="checkbox_label" for="elevenlabs_tts_multilingual">-->
<!--            <input id="elevenlabs_tts_multilingual" type="checkbox" value="${this.defaultSettings.multilingual}" />-->
<!--            Enable Multilingual-->
<!--        </label>-->
        `
        return html
    }

    onSettingsChange() {
        // Update dynamically
        this.settings.noise = Number($('#elevenlabs_tts_stability').val());
        this.settings.noisew = Number($('#elevenlabs_tts_similarity_boost').val());
        $('#elevenlabs_tts_stability_output').text(this.settings.noise);
        $('#elevenlabs_tts_similarity_boost_output').text(this.settings.noisew);
        this.settings.multilingual = $('#elevenlabs_tts_multilingual').prop('checked')
    }


    loadSettings(settings) {
        // Pupulate Provider UI given input settings
        if (Object.keys(settings).length == 0) {
            console.info("Using default TTS Provider settings")
        }

        // Only accept keys defined in defaultSettings
        this.settings = this.defaultSettings

        for (const key in settings) {
            if (key in this.settings) {
                this.settings[key] = settings[key]
            } else {
                throw `Invalid setting passed to TTS Provider: ${key}`
            }
        }

        $('#elevenlabs_tts_stability').val(this.settings.noise)
        $('#elevenlabs_tts_similarity_boost').val(this.settings.noisew)
        $('#elevenlabs_tts_stability_output').text(this.settings.noise);
        $('#elevenlabs_tts_similarity_boost_output').text(this.settings.noisew);
        $('#elevenlabs_tts_API_URL').val(this.settings.apiKey)
        $('#tts_auto_generation').prop('checked', this.settings.multilingual)
        console.info("Settings loaded")
    }

    async onApplyClick() {
        // Update on Apply click
        return await this.updateapiKey().catch((error) => {
            throw error
        })
    }


    async updateapiKey() {
        // Using this call to validate API key
        this.settings.apiKey = $('#elevenlabs_tts_API_URL').val()
        try {
            const responseJson = await this.fetchTtsVoiceIds();
            this.settings.voicelists = responseJson;
            this.settings.apiKey = this.settings.apiKey;
            console.debug(`Saved new API_URL: ${this.settings.apiKey}`)
        } catch (error) {
            throw new Error('TTS API key validation failed');
        }
    }

    async getVoice(voiceName) {
        if (this.voices.length == 0) {
            this.voices = await this.fetchTtsVoiceIds()
        }
        const match = this.voices.filter(
            elevenVoice => elevenVoice.name == voiceName
        )[0]
        if (!match) {
            throw `TTS Voice name ${voiceName} not found in ElevenLabs account`
        }
        return match
    }


    async generateTts(text, voiceId, lang = null) {
        let response
        response = await this.fetchTtsGeneration(text, voiceId, lang)
        return response
    }

    async fetchTtsVoiceIds() {
        const response = await fetch(`${this.settings.apiKey}/voice/speakers`)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }
        const responseJson = await response.json()
        console.log(responseJson);
        return responseJson.VITS;
    }


    async fetchTtsGeneration(text, id, lang) {
        const format = 'mp3';
        const url = `${this.settings.apiKey}/voice/vits?text=${encodeURIComponent(text)}~&id=${id}&lang=${lang}&format=${format}&noise=${this.settings.noise}&noisew=${this.settings.noisew}`;
        const response = await fetch(`${url}`)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }
        return response
    }
}

