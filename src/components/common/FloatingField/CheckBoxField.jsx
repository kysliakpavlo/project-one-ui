import React from "react";
import Form from "react-bootstrap/Form";
import _isFunction from 'lodash/isFunction';

export const CheckBoxField = ({
    label,
    type = "switch",
    id,
    value,
    className,
    checked,
    onChange,
    disabled,
    field: { name },
    form: { errors, touched, handleChange, handleBlur },
}) => {
    const handleOnChange = (selected) => {
        if (!touched[name]) {
            handleBlur({ target: { name } }); // set field as tocuhed
        }
        handleChange({ target: { name, value: selected.target.checked } });
        if (_isFunction(onChange)) {
            onChange(name, selected.target.checked);
        }
    };
    return (
        <Form>
            <Form.Check
                type={type}
                label={label}
                id={id}
                className={className}
                disabled={disabled}
                field={name}
                onChange={handleOnChange}
                value={value}
                checked={checked}
            />
        </Form>
    );
}