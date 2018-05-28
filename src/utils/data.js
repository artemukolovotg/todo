import {NotificationManager} from 'react-notifications';

export default {
    prompt: (text, canBeEmpty = true, defaultValue = '') => {
        return new Promise(resolve => {
            let result = prompt(text, defaultValue);
            if (result !== null) {
                if (result.trim() === '' && !canBeEmpty) {
                    NotificationManager.error("Value can't be empty");
                } else {
                    resolve(result);
                }
            }
        })
    }
};