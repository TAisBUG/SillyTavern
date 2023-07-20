import {callPopup, is_send_press, saveSettingsDebounced} from "../../../script.js";
import {getContext, extension_settings} from "../../extensions.js";
import {sendOpenAIRequest} from "../../openai.js";

export {MODULE_NAME};
const MODULE_NAME = 'chu-claude-2';
const UPDATE_INTERVAL = 1000;


const config = {
    COOKIE: ''
}


async function loadSettings() {
    if (Object.keys(extension_settings.claude2Chu).length === 0) {
        Object.assign(extension_settings.claude2Chu, config);
    }

    $('#claude2ChuAuto_connect').prop('checked', extension_settings.claude2Chu.claude2ChuAuto_connect);
    $('#claude2ChuCOOKIE').val(extension_settings.claude2Chu.COOKIE).trigger('input');
    extension_settings.claude2Chu.claude2ChuAuto_connect
}

async function onclaude2ChuEnabledInput() {
    let isEnabled = $(this).prop('checked')
    if (extension_settings.claude2Chu.claude2ChuAuto_connect) {
        extension_settings.claude2Chu.claude2ChuAuto_connect = false
    } else {
        extension_settings.claude2Chu.claude2ChuAuto_connect = true
    }
    saveSettingsDebounced();
}


function onclaude2ChuLabelInput() {
    extension_settings.claude2Chu[`COOKIE`] = $(`#claude2ChuCOOKIE`).val();
    $(`#claude2ChuCOOKIE`).text($(`#claude2ChuCOOKIE`).val());
    saveSettingsDebounced();
}


async function testApiConnection() {
    // Check if the previous request is still in progress
    if (is_send_press) {
        toastr.info('请等待前一个请求完成.');
        return;
    }

    try {
        const reply = await sendOpenAIRequest('quiet', [{'role': 'user', 'content': 'Hi'}]);
        console.log(reply);
        toastr.success('API连接成功！'); //API connection successful!
    } catch (err) {
        toastr.error('无法从API获得回复.检查你的连接设置/API密钥，然后再重试.');
    }
}


async function moduleWorker() {
    if (extension_settings.claude2Chu.claude2ChuAuto_connect === true) {
        $('#claude2ChuBar').toggle(getContext().onlineStatus !== 'no_connection');
    }
}

jQuery(async () => {
    await moduleWorker();
    setInterval(moduleWorker, UPDATE_INTERVAL);
    const settingsHtml = `
    <div class="claude2ChuSettings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
            <b>网页claude-2_内置_初</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
            <small><i data-i18n="Customize your Quick Replies:">自定义您Claude2.0的cookie配置:</i></small><br>
          <label>COOKIE:</label>
          <div class="flex-container alignitemsflexstart">
            <input id="claude2ChuCOOKIE" placeholder="放置claude2.0 cookie内容" class="text_pole textarea_compact widthUnset flex1" >
          </div>
          <label class="checkbox_label">
                <input id="claude2ChuAuto_connect" type="checkbox" />
                <span>启动网页Claude2.0</span>
            </label>
            <div class="flex-container alignitemsflexstart">
            <input id="claude2ChutestApiConnection" class="menu_button" type="submit" value="测试目前连接是否成功" />
          </div>
          </div>
        </div>
    </div>`;

    $('#extensions_settings2').append(settingsHtml);

    $('#claude2ChuCOOKIE').on('input', function () {
        onclaude2ChuLabelInput();
    });

    $('#claude2ChuAuto_connect').on('input', onclaude2ChuEnabledInput)
    $('#claude2ChutestApiConnection').on('click', testApiConnection)

    await loadSettings();
});

