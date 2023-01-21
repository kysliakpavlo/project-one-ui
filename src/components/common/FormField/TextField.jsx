import React, { useRef, useState } from 'react';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import Form from 'react-bootstrap/Form';
import SvgComponent from '../SvgComponent';

export const TextField = ({
    label,
    helper,
    disable,
    required,
    type = "text",
    className = '',
    field: { name },
    fieldAs = "input",
    form: { errors, touched, handleChange, handleBlur, values },
    ...others
}) => {
    const value = _get(values, name, '');
    const ref = useRef(null);
    const isInvalid = touched[name] && !_isEmpty(errors[name]);
    const error = _get(errors, name, null);
    const onLabelClick = (e) => {
        ref.current.focus();
    };

    const onBlur = (e) => {
        handleBlur(e);
        others.onBlur && others.onBlur(e);
    }

    if (type === 'password') {
        return (
            <PasswordField
                ref={ref}
                name={name}
                label={label}
                value={value}
                error={error}
                helper={helper}
                onBlur={onBlur}
                others={others}
                fieldAs={fieldAs}
                required={required}
                className={className}
                isInvalid={isInvalid}
                onLabelClick={onLabelClick}
                handleChange={handleChange}
            />
        );
    }
    return (
        <Form.Group controlId={name} className={`form-input ${className}`}>
            <Form.Label onClick={onLabelClick}>{label} {required && '*'}</Form.Label>
            <Form.Control as={fieldAs} type={type} isInvalid={isInvalid} ref={ref} value={value} autoComplete="off" {...others} onChange={handleChange} onBlur={onBlur} />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
            <Form.Text className="text-muted">{helper}</Form.Text>
        </Form.Group>
    );
};


const PasswordField = ({ name, className, onLabelClick, label, required, fieldAs, isInvalid, ref, value, others, handleChange, onBlur, error, helper }) => {
    const [type, setType] = useState('password');

    const onToggleView = () => {
        setType(type => type === 'password' ? 'text' : 'password');
        ref?.current.focus();
    };

    return (
        <Form.Group controlId={name} className={`form-input password-field ${className}`}>
            <Form.Label onClick={onLabelClick}>{label} {required && '*'}</Form.Label>
            <Form.Control as={fieldAs} type={type} isInvalid={isInvalid} ref={ref} value={value} autoComplete="off" {...others} onChange={handleChange} onBlur={onBlur} />
            <span className="password-eye" onClick={onToggleView}><SvgComponent path={type === 'password' ? 'eye_off' : 'eye_on'} /></span>
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
            <Form.Text className="text-muted">{helper}</Form.Text>
        </Form.Group >
    );
}
