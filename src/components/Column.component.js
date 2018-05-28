import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { Card, Button } from 'antd';

import ColumnPlace from './ColumnPlace.component';
import Task from './Task.component';
import TaskPlace from './TaskPlace.component';

import {ItemTypes} from '../utils/constants'
import data from '../utils/data'
import '../styles/column.scss';


const columnSource = {
    beginDrag(props) {
        return {
            columnId: props.columnId,
            columnPosition: props.columnPosition
        };
    },
    endDrag(props, monitor) {
        const item = monitor.getItem();
        const dropResult = monitor.getDropResult();
        if (dropResult) {
            if (item.columnId !== dropResult.columnId) {
                props.replaceColumn(item.columnId, dropResult.columnPosition);
            }
        }
    },
};

function collectSource(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

class Column extends React.Component {

    static get propTypes() {
        return {
            name: PropTypes.string.isRequired,
            isDragging: PropTypes.bool.isRequired,
            connectDragSource: PropTypes.func.isRequired,
            columnId: PropTypes.number.isRequired,
            columnPosition: PropTypes.number.isRequired,
            tasks: PropTypes.array.isRequired,
            replaceTask: PropTypes.func.isRequired,
            changeTaskName: PropTypes.func.isRequired,
            commentTask: PropTypes.func.isRequired
        }
    }

    handleChangeName = () => {
        data.prompt('New name of column', false, this.props.name)
            .then(name => this.props.changeColumnName(this.props.columnId, name))
    };

    handleAddTask = () => {
        data.prompt('Name of new task', false)
            .then(name => this.props.addTask(name, this.props.columnId))
    };

    renderMenu = () => {
        return (
            <div>
                <Button className="round-button" shape="circle" icon="edit" onClick={this.handleChangeName}/>
                <Button className="round-button" shape="circle" icon="plus"  onClick={this.handleAddTask}/>
            </div>
        );
    };

    render() {
        const {
            isDragging,
            connectDragSource,
            name,
            columnId,
            columnPosition,
            tasks,
            replaceTask,
            changeTaskName,
            commentTask
        } = this.props;

        return connectDragSource(
            <div style={{ opacity: isDragging ? 0.5 : 1 }} className="column">
                <ColumnPlace columnId={columnId} columnPosition={columnPosition}/>
                <Card
                    title={name}
                    bordered={false}
                    extra={this.renderMenu()}
                >

                    {tasks.map((task, indexTask) => (
                        <Task
                            key={indexTask}
                            name={task.name}
                            taskId={task.id}
                            columnId={task.column_id}
                            comments={task.comments}
                            positionTask={task.position}
                            replaceTask={replaceTask}
                            changeTaskName={changeTaskName}
                            commentTask={commentTask}
                        />
                    ))}
                    <TaskPlace
                        empty={true}
                        taskId={false}
                        columnId={columnId}
                        positionTask={0}
                    />
                    {tasks.length === 0 && <p>No tasks...</p>}
                </Card>
            </div>
        );
    }
}

export default DragSource(ItemTypes.COLUMN, columnSource, collectSource)(Column);