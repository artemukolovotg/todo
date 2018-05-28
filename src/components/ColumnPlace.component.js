import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import cn from 'classnames';

import {ItemTypes} from '../utils/constants'

import '../styles/columnPlace.scss';

const columnTarget = {
    drop(props) {
        return {
            columnId: props.columnId,
            columnPosition: props.columnPosition
        }
    }
};

function collectTarget(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
        itemType: monitor.getItemType(),
    };
}

class ColumnPlace extends React.PureComponent{

    static get propTypes() {
        return {
            canDrop: PropTypes.bool.isRequired,
            isOver: PropTypes.bool.isRequired,
            columnId: PropTypes.number.isRequired,
            columnPosition: PropTypes.number.isRequired
        }
    }

    render() {
        const { canDrop, isOver, connectDropTarget } = this.props
        const isActive = canDrop && isOver;

        return connectDropTarget(
            <div
                className={cn({
                    'column__place': true,
                    'column__place-hidden': !canDrop,
                    'column__place-drop': isActive
                })}
            />
        );
    }
}

export default DropTarget(ItemTypes.COLUMN, columnTarget, collectTarget)(ColumnPlace);