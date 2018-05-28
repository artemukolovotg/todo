import {NotificationManager} from 'react-notifications';

import {
    SERVER_RESPONSE_COLUMNS,
    SERVER_RESPONSE_COLUMN,
    SERVER_RESPONSE_TASK,
    START_REQUEST,
    SERVER_ERROR
} from './App.actions';

const initialState = {
    columns: [],
    loading: false
};

export default function (incomingState = initialState, action) {

    let state = Object.assign({}, incomingState);

    if (action.type.substr(0, 16) === 'server_response/' || action.type === SERVER_ERROR) {
        state.loading = false;
    }

    switch (action.type) {

        case START_REQUEST: {
            return Object.assign({}, state, {loading: true});
        }

        case SERVER_ERROR: {
            NotificationManager.error(action.data.message);
            return state;
        }

        case SERVER_RESPONSE_COLUMNS: {
            return Object.assign({}, state, {columns: action.data});
        }

        case SERVER_RESPONSE_COLUMN: {
            let indexColumn = state.columns.findIndex(column => column.id === action.data.column.id);
            return Object.assign({}, state, {columns: [].concat(
                indexColumn === -1 ? [...state.columns] : [...state.columns.slice(0, indexColumn)],
                indexColumn === -1 ? [] : action.data.column,
                indexColumn === -1 ? [] : [...state.columns.slice(indexColumn + 1, state.columns.length)],
                indexColumn !== -1 ? [] : action.data.column,
            )});
        }

        case SERVER_RESPONSE_TASK: {
            let indexColumn = state.columns.findIndex(column => column.id === action.data.task.column_id);
            let indexTask = state.columns[indexColumn].tasks.findIndex(task => task.id === action.data.task.id);

            return Object.assign({}, state, {columns: [
                    ...state.columns.slice(0, indexColumn),
                    Object.assign({}, state.columns[indexColumn], {tasks: [].concat(
                        ...state.columns[indexColumn].tasks.slice(0, indexTask),
                        indexTask === -1 ? [] : action.data.task,
                        ...state.columns[indexColumn].tasks.slice(indexTask + 1, state.columns[indexColumn].tasks.length),
                        indexTask !== -1 ? [] : action.data.task,
                    )}),
                    ...state.columns.slice(indexColumn + 1, state.columns.length)
                ]});
        }

        default:
            return state;
    }
}