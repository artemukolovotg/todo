import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import cn from 'classnames';

import '../styles/loading.scss';

export default class Loading extends React.Component {

    static get propTypes() {
        return {
            show: PropTypes.bool.isRequired
        }
    }

    render() {
        return (
            <div
                className={cn({
                    'loading': true,
                    'loading-hidden': !this.props.show
                })}
            >
                <Icon type="loading"  style={{ fontSize: 94, color: '#08c' }} />
            </div>
        );
    }
}