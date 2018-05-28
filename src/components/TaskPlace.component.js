import { DropTarget } from 'react-dnd';
import React from 'react';
import cn from 'classnames';

import {ItemTypes} from '../utils/constants'

import '../styles/taskPlace.scss';
import PropTypes from "prop-types";

const taskTarget = {
    hover(props, monitor, component) {
    },

    drop(props) {
        return {
            taskId: props.taskId,
            columnId: props.columnId,
            positionTask: props.positionTask
        }
    }
};

function collectTarget(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
        itemType: monitor.getItemType()
    };
}

class TaskPlace extends React.PureComponent {

    static get propTypes() {
        return {
            canDrop: PropTypes.bool.isRequired,
            isOver: PropTypes.bool.isRequired,
            empty: PropTypes.bool.isRequired,
            taskId: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]).isRequired,
            columnId: PropTypes.number.isRequired,
            positionTask: PropTypes.number.isRequired
        }
    }

    static get defaultProps() {
        return {
            empty: false
        }
    }

    render() {
        const { canDrop, isOver, connectDropTarget, empty } = this.props;
        const isActive = canDrop && isOver;

        return connectDropTarget(
            <div
                className={cn({
                    'task__place': true,
                    'task__place-hidden': !canDrop,
                    'task__place-drop': isActive,
                    'task__place-empty': empty
                })}
            />
        );
    }
}

export default DropTarget(ItemTypes.TASK, taskTarget, collectTarget)(TaskPlace);