import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { Button, Row, Col, Popover, List, Avatar, Badge } from 'antd';

import TaskPlace from './TaskPlace.component';
import {ItemTypes} from '../utils/constants'
import data from '../utils/data'

import '../styles/task.scss';
import user from '../assets/user.png';

const taskSource = {
    beginDrag(props) {
        return {
            columnId: props.columnId,
            positionTask: props.positionTask,
            taskId: props.taskId
        };
    },
    endDrag(props, monitor) {
        const item = monitor.getItem();
        const dropResult = monitor.getDropResult();
        if (dropResult) {
            if (item.taskId !== dropResult.taskId) {
                props.replaceTask(
                    item.columnId,
                    item.taskId,
                    dropResult.columnId,
                    dropResult.positionTask
                );
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

class Task extends React.PureComponent {

    static get propTypes() {
        return {
            isDragging: PropTypes.bool.isRequired,
            connectDragSource: PropTypes.func.isRequired,
            name: PropTypes.string.isRequired,
            taskId: PropTypes.number.isRequired,
            columnId: PropTypes.number.isRequired,
            positionTask: PropTypes.number.isRequired,
            comments: PropTypes.array.isRequired,
            commentTask: PropTypes.func.isRequired,
            changeTaskName: PropTypes.func.isRequired,
        }
    }

    handleCommentTask = () => {
        const {taskId, commentTask} = this.props;
        data.prompt('New comment', false)
            .then(text => commentTask(taskId, text))
            .catch(() => {

            });
    };

    handleRenameTask = () => {
        const {taskId, name, changeTaskName} = this.props;
        data.prompt('New name of task', false, name)
            .then(text => changeTaskName(taskId, text));
    };

    getComments = comments => (
        comments.length === 0 ?
            <i>No comments...</i>
            :
            <List
                itemLayout="horizontal"
                dataSource={comments}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={user}/>}
                            description={item.text}
                        />
                    </List.Item>
                )}
            />
    );

    render() {
        const {
            columnId,
            taskId,
            positionTask,
            connectDragSource,
            comments,
            name
        } = this.props;

        return connectDragSource(
            <div className="task">
                <TaskPlace
                    columnId={columnId}
                    taskId={taskId}
                    positionTask={positionTask}
                />
                <div className="task-text ">
                    <Row type="flex" justify="space-between">
                        <Col span={14}>{name}</Col>
                        <Col span={8}>
                            <div className="task__actions">
                                <Row type="flex">
                                    <Col span={8}>
                                        <Button
                                            type="dashed"
                                            shape="circle"
                                            icon="edit"
                                            onClick={this.handleRenameTask}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Button
                                            type="dashed"
                                            shape="circle"
                                            icon="plus"
                                            onClick={this.handleCommentTask}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Popover
                                            placement="bottom"
                                            title="Comments"
                                            content={this.getComments(comments)}
                                            trigger="click"
                                        >
                                            <Badge count={comments.length} style={{
                                                top: -5,
                                                right: -15,
                                                backgroundColor: '#d2c5ff',
                                                color: '#999',
                                                boxShadow: '0 0 0 1px #d9d9d9 inset'
                                            }}>
                                                <Button type="dashed" shape="circle" icon="message" />
                                            </Badge>
                                        </Popover>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

export default DragSource(ItemTypes.TASK, taskSource, collectSource)(Task);