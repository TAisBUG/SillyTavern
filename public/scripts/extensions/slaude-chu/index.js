import {callPopup, is_send_press, saveSettingsDebounced} from "../../../script.js";
import {getContext, extension_settings} from "../../extensions.js";
import {sendOpenAIRequest} from "../../openai.js";

export {MODULE_NAME};
const MODULE_NAME = 'slaude-chu';
const UPDATE_INTERVAL = 1000;


const config = {
    TOKEN: '',
    COOKIE: '',
    TEAM_ID: '',
    CHANNEL: '',
    CLAUDE_USER: '',
    MAINPROMPT_LAST: false,
    MAINPROMPT_AS_PING: false,
    USE_BLOCKS: true,
    STREAMING_TIMEOUT: 240000,
    PING_MESSAGE: "Assistant:",
    slaudeChuAuto_connect: false
}


async function loadSettings() {
    if (Object.keys(extension_settings.slaudeChu).length === 0) {
        Object.assign(extension_settings.slaudeChu, config);
    }

    $('#slaudeChuAuto_connect').prop('checked', extension_settings.slaudeChu.slaudeChuAuto_connect);
    $('#slaudeChu1TOKEN').val(extension_settings.slaudeChu.TOKEN).trigger('input');
    $('#slaudeChu2COOKIE').val(extension_settings.slaudeChu.COOKIE).trigger('input');
    $('#slaudeChu3TEAM_ID').val(extension_settings.slaudeChu.TEAM_ID).trigger('input');
    $('#slaudeChu4CHANNEL').val(extension_settings.slaudeChu.CHANNEL).trigger('input');
    $('#slaudeChu5CLAUDE_USER').val(extension_settings.slaudeChu.CLAUDE_USER).trigger('input');
    extension_settings.slaudeChu.slaudeChuAuto_connect
}

async function onslaudeChuEnabledInput() {
    let isEnabled = $(this).prop('checked')
    if (extension_settings.slaudeChu.slaudeChuAuto_connect) {
        extension_settings.slaudeChu.slaudeChuAuto_connect = false
    } else {
        extension_settings.slaudeChu.slaudeChuAuto_connect = true
    }
    saveSettingsDebounced();
}


async function sendslaudeChu(id) {
    let chu_set;

    if (id === 1) {
        chu_set = "TOKEN";
    } else if (id === 2) {
        chu_set = "COOKIE";
    } else if (id === 3) {
        chu_set = "TEAM_ID";
    } else if (id === 4) {
        chu_set = "CHANNEL";
    } else if (id === 5) {
        chu_set = "CLAUDE_USER";
    }
    var prompt = extension_settings.slaudeChu[`${chu_set}`];
    $("#send_textarea").val(prompt);
    $("#send_but").trigger('click');
}

function onslaudeChuLabelInput(id) {
    let chu_set;

    if (id === 1) {
        chu_set = "TOKEN";
    } else if (id === 2) {
        chu_set = "COOKIE";
    } else if (id === 3) {
        chu_set = "TEAM_ID";
    } else if (id === 4) {
        chu_set = "CHANNEL";
    } else if (id === 5) {
        chu_set = "CLAUDE_USER";
    }
    extension_settings.slaudeChu[`${chu_set}`] = $(`#slaudeChu${id}${chu_set}`).val();
    $(`#slaudeChu${id}`).text($(`#slaudeChu${id}${chu_set}`).val());
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
    if (extension_settings.slaudeChu.slaudeChuAuto_connect === true) {
        $('#slaudeChuBar').toggle(getContext().onlineStatus !== 'no_connection');
    }
}

jQuery(async () => {
    await moduleWorker();
    setInterval(moduleWorker, UPDATE_INTERVAL);
    const settingsHtml = `
    <div class="slaudeChuSettings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
            <b>slaude内置_初</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
            <small><i data-i18n="Customize your Quick Replies:">自定义您Claude的配置:</i></small><br>
          <label>TOKEN:</label>
          <div class="flex-container alignitemsflexstart">
            <input id="slaudeChu1TOKEN" placeholder="放置xoxc内容" class="text_pole textarea_compact widthUnset flex1" >
          </div>
          <label>COOKIE:</label>
          <div class="flex-container alignitemsflexstart">
            <input id="slaudeChu2COOKIE" placeholder="放置xoxd内容" class="text_pole textarea_compact widthUnset flex1" >
          </div>
          <label>TEAM_ID:</label>
          <div class="flex-container alignitemsflexstart">
            <input id="slaudeChu3TEAM_ID" placeholder="放置工作区网址前缀ID内容" class="text_pole textarea_compact widthUnset flex1" >
          </div>
          <label>CHANNEL:</label>
          <div class="flex-container alignitemsflexstart">
            <input id="slaudeChu4CHANNEL" placeholder="放置使用频道ID内容" class="text_pole textarea_compact widthUnset flex1" >
          </div>
          <label>CLAUDE_USER:</label>
          <div class="flex-container alignitemsflexstart">
            <input id="slaudeChu5CLAUDE_USER" placeholder="放置工作区ClaudeID内容" class="text_pole textarea_compact widthUnset flex1" >
          </div>
          <label class="checkbox_label">
                <input id="slaudeChuAuto_connect" type="checkbox" />
                <span>启动slaude</span>
            </label>
            <div class="flex-container alignitemsflexstart">
            <input id="slaudeChutestApiConnection" class="menu_button" type="submit" value="测试目前连接是否成功" />
          </div>
          </div>
        </div>
    </div>`;

    $('#extensions_settings2').append(settingsHtml);

    $('#slaudeChu1TOKEN').on('input', function () {
        onslaudeChuLabelInput(1);
    });
    $('#slaudeChu2COOKIE').on('input', function () {
        onslaudeChuLabelInput(2);
    });
    $('#slaudeChu3TEAM_ID').on('input', function () {
        onslaudeChuLabelInput(3);
    });
    $('#slaudeChu4CHANNEL').on('input', function () {
        onslaudeChuLabelInput(4);
    });
    $('#slaudeChu5CLAUDE_USER').on('input', function () {
        onslaudeChuLabelInput(5);
    });

    $('#slaudeChuAuto_connect').on('input', onslaudeChuEnabledInput)
    $('#slaudeChutestApiConnection').on('click', testApiConnection)

    await loadSettings();
});

