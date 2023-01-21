import React, { useRef, useState } from "react";
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import Form from "react-bootstrap/Form";
import SvgComponent from "../../SvgComponent";
import PasswordValidation from './PasswordValidation';

import './PasswordStrengthField.scss';

export const PasswordStrengthField = ({
    label,
    helper,
    disable,
    required,
    className = '',
    field: { name },
    fieldAs = "input",
    form: { errors, touched, handleChange, handleBlur, setFieldError, values },
    ...others
}) => {
    const value = _get(values, name, '');
    const ref = useRef(null);
    const isInvalid = touched[name] && !_isEmpty(errors[name]);
    const error = _get(errors, name, null);
    const [type, setType] = useState('password');

    // booleans for password validations
    const [containsUL, setContainsUL] = useState(false) // uppercase letter
    const [containsLL, setContainsLL] = useState(false) // lowercase letter
    const [containsN, setContainsN] = useState(false) // number
    const [containsSC, setContainsSC] = useState(false) // special character
    const [contains8C, setContains8C] = useState(false) // min 8 characters

    // labels and state boolean corresponding to each validation
    const mustContainData = [
        ["An uppercase letter (A-Z)", containsUL],
        ["A lowercase letter (a-z)", containsLL],
        ["A number (0-9)", containsN],
        ["A special character (!@#$)", containsSC],
        ["At least 8 characters", contains8C]
    ]

    const validatePassword = () => {
        // has uppercase letter
        if (value.toLowerCase() !== value) setContainsUL(true)
        else setContainsUL(false)

        // has lowercase letter
        if (value.toUpperCase() !== value) setContainsLL(true)
        else setContainsLL(false)

        // has number
        if (/\d/.test(value)) setContainsN(true)
        else setContainsN(false)

        // has special character
        if (/[~`@!#$%\^&*()._+=\-\[\]\\';,/{}|\\":<>\?]/g.test(value)) setContainsSC(true)
        else setContainsSC(false)

        // has 8 characters
        if (value.length >= 8) setContains8C(true)
        else setContains8C(false)

        // all validations passed
        if (containsUL && containsLL && containsN && containsSC && contains8C) setFieldError(name, null)
        else setFieldError(name, 'Password criteria mismatch')
    }

    const onLabelClick = (e) => {
        ref.current.focus();
    };

    const onToggleView = () => {
        setType(type => type === 'password' ? 'text' : 'password');
        ref.current.focus();
    };

    return (
        <Form.Group controlId={name} className={`form-input password-strength-field password-field ${className}`}>
            <Form.Label onClick={onLabelClick}>{label} {required && '*'}</Form.Label>
            <Form.Control as={fieldAs} isInvalid={isInvalid} onChange={handleChange} onBlur={handleBlur} ref={ref} value={value} {...others} type={type} onFocus={validatePassword} onKeyUp={validatePassword} />
            <span className="password-eye" onClick={onToggleView}><SvgComponent path={type === 'password' ? 'eye_off' : 'eye_on'} /></span>
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
            <Form.Text className="text-muted">{helper}</Form.Text>
            <div className="password-patterns">
                {mustContainData.map(data => <PasswordValidation key={data[0]} data={data} />)}
            </div>
        </Form.Group>
    );
};
