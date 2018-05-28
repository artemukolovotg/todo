let http = require('http');
let socket_io = require('socket.io');
let jsonfile = require('jsonfile')

let { Client } = require('pg');

let server = http.createServer();
let io = socket_io();

function DB() {
    let db_client = false;
    let queryConstructor = {
        getColumns: function (id = false) {
            return 'SELECT ' +
                'c.id, c.name, c.position ' +
                'FROM public.column c ' +
                (id !== false ? `WHERE c.id = ${id} ` : '') +
                'ORDER BY position';
        },
        getTasks: function (column_id = false, task_id = false) {
            return 'SELECT ' +
                't.id, t.name, t.position, t.column_id ' +
                'FROM public.task t WHERE 1 = 1 ' +
                (task_id !== false ? `AND t.id = ${task_id} ` : '') +
                (column_id !== false ? `AND t.column_id = ${column_id} ` : '') +
                'ORDER BY position';
        },
        getComments: function (task_id = false) {
            return 'SELECT ' +
                'c.id, c.text, c.task_id ' +
                'FROM public.comment c ' +
                (task_id !== false ? `WHERE c.task_id = ${task_id} ` : '') +
                'ORDER BY id';
        },
        changeColumnPosition: function (id, position) {
            return `UPDATE public.column SET position = ${position} WHERE id = ${id}`;
        },
        increaseColumnSequence: function (position) {
            return `UPDATE public.column SET position = position + 1 WHERE position >= ${position}`;
        },
        changeColumnName: function (id, name) {
            return `UPDATE public.column SET name = '${name}' WHERE id = ${id}`;
        },
        addColumn: function (name) {
            return `INSERT INTO public.column (name) VALUES ('${name}') RETURNING id;`;
        },
        changeTaskPosition: function (id, column_id, position) {
            return `UPDATE public.task SET position = ${
                position !== 0 ? position : `COALESCE((SELECT t.position+1 FROM public.task t WHERE column_id=${column_id} ORDER BY t.position DESC LIMIT 1), 1)`
                }, column_id=${column_id} WHERE id = ${id}`;
        },
        increaseTaskSequence: function (column_id, position) {
            return `UPDATE public.task SET position = position + 1 WHERE column_id = ${column_id} AND position >= ${position}`;
        },
        changeTaskName: function (id, name) {
            return `UPDATE public.task SET name = '${name}' WHERE id = ${id}`;
        },
        addTask: function (name, column_id) {
            return `INSERT INTO public.task (name, column_id) VALUES ('${name}', ${column_id}) RETURNING id;`;
        },
        commentTask: function (text, task_id) {
            return `INSERT INTO public.comment (text, task_id) VALUES ('${text}', ${task_id})`;
        },
    };
    let perform = function (query) {
        return new Promise((resolve, reject) => {
            db_client.query(query, (err, res) => {
                 if (err) {
                     reject(err);
                 } else {
                     resolve(res.rows);
                 }
            });
        });
    };

    let queryList = {
        COMMENT_TASK: function(data) {
            return new Promise((resolve, reject) => {
                perform(queryConstructor.commentTask(data.text, data.task_id))
                    .then(() => {
                        Promise.all([
                            perform(queryConstructor.getTasks(false, data.task_id)),
                            perform(queryConstructor.getComments(data.task_id)),
                        ]).then(([tasks, comments]) => {

                            let task = Object.assign(tasks[0], {comments});
                            resolve({
                                type: 'TASK',
                                data: {task}
                            })
                        })
                    })
                    .catch(() => reject('error to comment task'))
            });
        },
        ADD_TASK: function(data) {
            return new Promise((resolve, reject) => {
                perform(queryConstructor.addTask(data.name, data.column_id))
                    .then(() =>
                        queryList.GET_COLUMNS(data.column_id)
                            .then(resolve)
                    )
                    .catch(() => reject('error to add task'))
            });
        },
        CHANGE_TASK_NAME: function(data) {
            return new Promise((resolve, reject) => {
                perform(queryConstructor.changeTaskName(data.id, data.name))
                    .then(() =>
                        Promise.all([
                            perform(queryConstructor.getTasks(false, data.id)),
                            perform(queryConstructor.getComments(data.id)),
                        ]).then(([tasks, comments]) => {

                            let task = Object.assign(tasks[0], {comments});
                            resolve({
                                type: 'TASK',
                                data: {task}
                            })
                        })
                    )
                    .catch(() => reject('error to rename task'))
            });
        },
        REPLACE_TASK: function(data) {
            return new Promise((resolve, reject) => {
                const performUpdate = () => {
                    perform(queryConstructor.changeTaskPosition(data.idTaskFrom, data.taskColumnTo, data.positionTaskTo))
                        .then(() => {
                            queryList
                                .GET_COLUMNS(data.taskColumnTo === data.taskColumnFrom ? data.taskColumnFrom : false)
                                .then(resolve);
                        })
                        .catch(() => reject('error to switch tasks'))
                };
                if (data.positionTaskTo !== 0) {
                    perform(queryConstructor.increaseTaskSequence(data.taskColumnTo, data.positionTaskTo))
                        .then(performUpdate)
                } else{
                    performUpdate();
                }
            });
        },

        ADD_COLUMN: function(data) {
            return new Promise((resolve, reject) => {
                perform(queryConstructor.addColumn(data.name))
                    .then(data => {
                        if (data.length !== 0) {
                            queryList.GET_COLUMNS({column_id: data[0].id})
                                .then(resolve)
                        }
                    })
                    .catch(() => reject('error to add column'))
            });
        },
        CHANGE_COLUMN_NAME: function(data) {
            return new Promise((resolve, reject) => {
                perform(queryConstructor.changeColumnName(data.id, data.name))
                    .then(() =>
                        queryList.GET_COLUMNS({column_id: data.id})
                            .then(resolve)
                    )
                    .catch(() => reject('error to rename column'))
            });
        },
        REPLACE_COLUMN: function(data) {
            return new Promise((resolve, reject) => {
                perform(queryConstructor.increaseColumnSequence(data.positionColumnTo))
                    .then(() => {
                        perform(queryConstructor.changeColumnPosition(data.idColumnFrom, data.positionColumnTo))
                            .then(data => {
                                queryList.GET_COLUMNS().then(resolve);
                            })
                            .catch(() => reject('error to switch columns'))
                    })

            });
        },
        GET_COLUMNS: function (data = false) {
            let column_id = (data ? data.column_id : false) || false;
            return new Promise((resolve, reject) => {
                Promise.all([
                    perform(queryConstructor.getColumns(column_id)),
                    perform(queryConstructor.getTasks(column_id)),
                    perform(queryConstructor.getComments()),
                ]).then(([columns, tasks, comments]) => {
                    columns = columns.map(column =>
                        Object.assign(column, {
                            tasks: tasks.filter(task =>
                                task.column_id === column.id
                            ).map(task =>
                                Object.assign(task, {
                                    comments: comments.filter(comment =>
                                        comment.task_id === task.id
                                    )
                                })
                            )
                        })
                    );

                    resolve({
                        type: column_id === false ? 'COLUMNS' : 'COLUMN',
                        data: column_id === false ?
                            columns :
                            {column: columns[0]}
                    });

                })
                .catch(() => reject('Error to get columns'));
            });
        }
    };
    let query = function(func, data) {
        return queryList[func](data);
    };

    this.initDB = function(db) {
        db_client = db;
        db_client.connect();
    };

    this.do = function(func, data) {

        return new Promise((resolve, reject) => {
            if (db_client) {
                if (typeof (queryList[func]) == 'undefined') {
                    reject({message: 'unrecognized function: ' + func});

                } else {
                    query(func, data)
                        .then(resolve)
                        .catch(message => reject({message}));
                }

            } else {
                reject({message: 'DB connection error.'});
            }
        });
    };
}

let db = new DB();

jsonfile.readFile('./config/db.json', function(error, config) {
    if (!error) {
        db.initDB(new Client(config));
    } else {
        jsonfile.readFile('./config/db.json.default', function(error, config) {
            if (!error) {
                db.initDB(new Client(config));
            }
        });
    };
});

server.listen(3010);
io.attach(server);

io.on('connection', function(socket){
    console.log("Socket connected: " + socket.id);
    socket.on('action', function(action){
        let func = action.type.replace('server/', '');

        db.do(func, action)
            .then(response => {
                socket.emit('action', {type: 'server_response/' + response.type, data: response.data});
            })
            .catch(data => {
                socket.emit('action', {type: 'server_error', data});
            });
    });
});