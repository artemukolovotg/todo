import React from 'react';
import PropTypes from 'prop-types';
import './styles/App.scss';
import 'react-notifications/lib/notifications.css';
import {DragDropContextProvider} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import {Button} from 'antd';
import {NotificationContainer} from 'react-notifications';

import Column from './components/Column.component';
import Loading from './components/Loading.component';

import data from './utils/data'

class App extends React.Component {

    static get propTypes() {
        return {
            columns: PropTypes.array.isRequired,
            loading: PropTypes.bool.isRequired,
            moveColumn: PropTypes.func.isRequired,
            changeColumnName: PropTypes.func.isRequired,
            addTask: PropTypes.func.isRequired,
            moveTask: PropTypes.func.isRequired,
            changeTaskName: PropTypes.func.isRequired,
            commentTask: PropTypes.func.isRequired
        }
    }

    componentDidMount() {
        this.props.getData();
    }

    handleAddColumn = () => {
        const {addColumn} = this.props;
        data.prompt('Name of new column', false).then(addColumn);
    };

    render() {
        const {
            columns,
            loading,
            moveColumn,
            changeColumnName,
            addTask,
            moveTask,
            changeTaskName,
            commentTask
        } = this.props;
        return (
            <DragDropContextProvider backend={HTML5Backend}>
                <div className="app">
                    <Loading show={loading}/>
                    <NotificationContainer/>
                    <div>
                        <Button type="primary" onClick={this.handleAddColumn}>New column</Button>
                    </div>
                    {columns.map((column, indexColumn) => (
                        <Column
                            key={column.id}
                            column={column}
                            moveColumn={moveColumn}
                            changeColumnName={changeColumnName}
                            addTask={addTask}
                            moveTask={moveTask}
                            changeTaskName={changeTaskName}
                            commentTask={commentTask}
                        />
                    ))}
                    {columns.length === 0 && <p>No columns...</p>}
                </div>
            </DragDropContextProvider>
        );
    }
}

export default App;
