const moment = require('moment');

function formatMessage(name, image, color, text) {
    return {
        name,
        image,
        color,
        text,
        time: moment().format('h:mm')
    }
}

module.exports = formatMessage;