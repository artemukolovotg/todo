import {connect} from 'react-redux'
import App from '../App';
import {
    server_moveColumn,
    server_changeColumnName,
    server_addColumn,
    server_moveTask,
    server_changeTaskName,
    server_addTask,
    server_commentTask,
    startRequest,
    server_getData
} from '../redux/App.actions';

const mapStateToProps = state => {
    return {
        columns: state.columns,
        loading: state.loading
    }
};

const mapDispatchToProps = dispatch => ({
    moveColumn: (...parameters) => {
        dispatch(server_moveColumn(...parameters));
    },
    changeColumnName: (indexColumn, name) => {
        dispatch(server_changeColumnName(indexColumn, name));
    },
    addColumn: (name) => {
        dispatch(server_addColumn(name));
    },
    addTask: (name, columnId) => {
        dispatch(server_addTask(name, columnId));
    },
    moveTask: (
        taskColumnFrom,
        idTaskFrom,
        taskColumnTo,
        positionTaskTo
    ) => {
        dispatch(server_moveTask(
            taskColumnFrom,
            idTaskFrom,
            taskColumnTo,
            positionTaskTo
        ));
    },
    changeTaskName: (taskId, name) => {
        dispatch(server_changeTaskName(taskId, name));
    },
    commentTask: (taskId, text) => {
        dispatch(server_commentTask(taskId, text));
    },
    getData: () => {
        dispatch(startRequest());
        dispatch(server_getData());
    },
});


export default connect(mapStateToProps, mapDispatchToProps)(App);