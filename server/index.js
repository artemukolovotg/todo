let http = require('http');
let socket_io = require('socket.io');
let jsonfile = require('jsonfile')

let { Client } = require('pg');

let server = http.createServer();
let io = socket_io();

function DB() {
    let db_client = false;
    let mappers = {
        task: task => {
            let temp = Object.assign({}, task);
            temp.columnId = temp.column_id;
            delete temp.column_id;
            return temp;
        },
        comment: comment => {
            let temp = Object.assign({}, comment);
            temp.taskId = temp.task_id;
            delete temp.task_id;
            return temp;
        }
    };
    let queryConstructor = {
        getColumns: function (id = false) {
            return 'SELECT ' +
                'c.id, c.name, c.position ' +
                'FROM public.column c ' +
                (id !== false ? `WHERE c.id = ${id} ` : '') +
                'ORDER BY position';
        },
        getTasks: function (columnId = false, taskId = false) {
            return 'SELECT ' +
                't.id, t.name, t.position, t.column_id ' +
                'FROM public.task t WHERE 1 = 1 ' +
                (taskId !== false ? `AND t.id = ${taskId} ` : '') +
                (columnId !== false ? `AND t.column_id = ${columnId} ` : '') +
                'ORDER BY position';
        },
        getComments: function (taskId = false) {
            return 'SELECT ' +
                'c.id, c.text, c.task_id ' +
                'FROM public.comment c ' +
                (taskId !== false ? `WHERE c.task_id = ${taskId} ` : '') +
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
        changeTaskPosition: function (id, columnId, position) {
            return `UPDATE public.task SET position = ${
                position !== 0 ? position : `COALESCE((SELECT t.position+1 FROM public.task t WHERE column_id=${columnId} ORDER BY t.position DESC LIMIT 1), 1)`
                }, column_id=${columnId} WHERE id = ${id}`;
        },
        increaseTaskSequence: function (columnId, position) {
            return `UPDATE public.task SET position = position + 1 WHERE column_id = ${columnId} AND position >= ${position}`;
        },
        changeTaskName: function (id, name) {
            return `UPDATE public.task SET name = '${name}' WHERE id = ${id}`;
        },
        addTask: function (name, columnId) {
            return `INSERT INTO public.task (name, column_id) VALUES ('${name}', ${columnId}) RETURNING id;`;
        },
        commentTask: function (text, taskId) {
            return `INSERT INTO public.comment (text, task_id) VALUES ('${text}', ${taskId})`;
        },
    };
    let perform = function (query, mapper = rows => rows) {
        console.log(query);
        return new Promise((resolve, reject) => {
            db_client.query(query, (err, res) => {
                 if (err) {
                     reject(err);
                 } else {
                     resolve(res.rows.map(mapper));
                 }
            });
        });
    };

    let queryList = {
        COMMENT_TASK: function(data) {
            return new Promise((resolve, reject) => {
                perform(queryConstructor.commentTask(data.text, data.taskId))
                    .then(() => {
                        Promise.all([
                            perform(queryConstructor.getTasks(false, data.taskId), mappers.task),
                            perform(queryConstructor.getComments(data.taskId), mappers.comment),
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
                perform(queryConstructor.addTask(data.name, data.columnId))
                    .then(() =>
                        queryList.GET_COLUMNS(data.columnId)
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
                            perform(queryConstructor.getTasks(false, data.id), mappers.task),
                            perform(queryConstructor.getComments(data.id), mappers.comment),
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
        MOVE_TASK: function(data) {
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
                            queryList.GET_COLUMNS({columnId: data[0].id})
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
                        queryList.GET_COLUMNS({columnId: data.id})
                            .then(resolve)
                    )
                    .catch(() => reject('error to rename column'))
            });
        },
        MOVE_COLUMN: function(data) {
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
            let columnId = (data ? data.columnId : false) || false;
            return new Promise((resolve, reject) => {
                Promise.all([
                    perform(queryConstructor.getColumns(columnId)),
                    perform(queryConstructor.getTasks(columnId), mappers.task),
                    perform(queryConstructor.getComments(), mappers.comment),
                ]).then(([columns, tasks, comments]) => {
                    columns = columns.map(column =>
                        Object.assign(column, {
                            tasks: tasks.filter(task =>
                                task.columnId === column.id
                            ).map(task =>
                                Object.assign(task, {
                                    comments: comments.filter(comment =>
                                        comment.taskId === task.id
                                    )
                                })
                            )
                        })
                    );

                    resolve({
                        type: columnId === false ? 'COLUMNS' : 'COLUMN',
                        data: columnId === false ?
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