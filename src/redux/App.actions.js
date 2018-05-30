// start of server request
export const START_REQUEST = 'START_REQUEST';
export const startRequest = () => ({type: START_REQUEST});

// server request
export const SERVER_GET_COLUMNS = 'server/GET_COLUMNS';
export const SERVER_MOVE_COLUMN = 'server/MOVE_COLUMN';
export const SERVER_CHANGE_COLUMN_NAME = 'server/CHANGE_COLUMN_NAME';
export const SERVER_ADD_COLUMN = 'server/ADD_COLUMN';
export const SERVER_MOVE_TASK = 'server/MOVE_TASK';
export const SERVER_CHANGE_TASK_NAME = 'server/CHANGE_TASK_NAME';
export const SERVER_ADD_TASK = 'server/ADD_TASK';
export const SERVER_COMMENT_TASK = 'server/COMMENT_TASK';

export const server_getData = () => ({
    type: SERVER_GET_COLUMNS
});

export const server_moveColumn = (
    idColumnFrom,
    positionColumnTo
) => ({
    type: SERVER_MOVE_COLUMN,
    idColumnFrom,
    positionColumnTo
});

export const server_changeColumnName = (id, name) => ({
    type: SERVER_CHANGE_COLUMN_NAME,
    id,
    name
});

export const server_addColumn = name => ({
    type: SERVER_ADD_COLUMN,
    name
});

export const server_moveTask = (
    taskColumnFrom,
    idTaskFrom,
    taskColumnTo,
    positionTaskTo
) => ({
    type: SERVER_MOVE_TASK,
    taskColumnFrom,
    idTaskFrom,
    taskColumnTo,
    positionTaskTo
});

export const server_changeTaskName = (id, name)=> ({
    type: SERVER_CHANGE_TASK_NAME,
    id,
    name
});

export const server_addTask = (name, columnId) => ({
    type: SERVER_ADD_TASK,
    name,
    columnId
});


export const server_commentTask = (taskId, text) => ({
    type: SERVER_COMMENT_TASK,
    text,
    taskId
});

// server response
// SERVER SIDE
export const SERVER_RESPONSE_COLUMNS = 'server_response/COLUMNS';
export const SERVER_RESPONSE_COLUMN = 'server_response/COLUMN';
export const SERVER_RESPONSE_TASK = 'server_response/TASK';

// server error
// SERVER SIDE
export const SERVER_ERROR = 'server_error';