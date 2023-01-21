import React from 'react';
import _map from 'lodash/map';
import Toast from 'react-bootstrap/Toast';
import SvgComponent from '../SvgComponent';

import './ToastMessages.scss';

const iconPath = {
    'success': 'check_circle_black',
    'warning': 'warning',
    'info': 'info',
    'general': 'info',
    'error': 'report'
}

const ToastMessages = ({ messages, onClose }) => (
    <div className='toast-messages'>
        {_map(messages, (message => (
            <Toast className={`toast-message toast-${message.type}`} key={message.messageId} onClose={() => onClose(message.messageId)} delay={message.duration} autohide={message.autohide}>
                <Toast.Header key={Math.random()}>
                    <SvgComponent className='type-indicator' path={iconPath[message.type]} />
                    <strong className="message">{message.message}</strong>
                </Toast.Header>
            </Toast>
        )))}
    </div>
);

export default ToastMessages;
