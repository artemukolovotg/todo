import React from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import {Card, Button} from 'antd';

import ColumnPlace from './ColumnPlace.component';
import Task from './Task.component';
import TaskPlace from './TaskPlace.component';

import {ItemTypes} from '../utils/constants'
import data from '../utils/data'
import '../styles/column.scss';


const columnSource = {
    beginDrag(props) {
        return {
            columnId: props.column.id,
            columnPosition: props.column.position
        };
    },
    endDrag(props, monitor) {
        const item = monitor.getItem();
        const dropResult = monitor.getDropResult();
        if (dropResult) {
            if (item.columnId !== dropResult.columnId) {
                props.moveColumn(item.columnId, dropResult.columnPosition);
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
            isDragging: PropTypes.bool.isRequired,
            connectDragSource: PropTypes.func.isRequired,
            moveTask: PropTypes.func.isRequired,
            changeTaskName: PropTypes.func.isRequired,
            commentTask: PropTypes.func.isRequired,
            column: PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
                position: PropTypes.number.isRequired,
                tasks: PropTypes.array.isRequired,
            })
        }
    }

    handleChangeName = () => {
        data.prompt('New name of column', false, this.props.column.name)
            .then(name => this.props.changeColumnName(this.props.column.id, name))
    };

    handleAddTask = () => {
        data.prompt('Name of new task', false)
            .then(name => this.props.addTask(name, this.props.column.id))
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
            column,
            moveTask,
            changeTaskName,
            commentTask
        } = this.props;
        const {id, name, tasks, position} = column;
        return connectDragSource(
            <div style={{ opacity: isDragging ? 0.5 : 1 }} className="column">
                <ColumnPlace columnId={id} columnPosition={position}/>
                <Card
                    title={name}
                    bordered={false}
                    extra={this.renderMenu()}
                >

                    {tasks.map(task => (
                        <Task
                            key={task.id}
                            name={task.name}
                            taskId={task.id}
                            columnId={id}
                            comments={task.comments}
                            positionTask={task.position}
                            moveTask={moveTask}
                            changeTaskName={changeTaskName}
                            commentTask={commentTask}
                        />
                    ))}
                    <TaskPlace
                        empty={true}
                        taskId={false}
                        columnId={id}
                        positionTask={0}
                    />
                    {tasks.length === 0 && <p>No tasks...</p>}
                </Card>
            </div>
        );
    }
}

export default DragSource(ItemTypes.COLUMN, columnSource, collectSource)(Column);