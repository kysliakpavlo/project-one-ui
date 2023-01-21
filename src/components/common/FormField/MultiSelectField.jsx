import React, { useRef } from "react";
import _isFunction from 'lodash/isFunction';
import Form from "react-bootstrap/Form";
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import Visible from '../Visible';

export const MultiSelectField = ({
    label,
    className,
    onChange,
    options = [],
    placeholder = "Select...",
    field: { name },
    form: { errors, touched, handleBlur, handleChange, values },
}) => {
    const ref = useRef(null);

    const handleOnChange = (selected) => {
        if (!touched[name]) {
            handleBlur({ target: { name } }); // set field as tocuhed
        }
        handleChange({ target: { name, value: selected } });
        if (_isFunction(onChange)) {
            onChange(name, selected);
        }
    };

    return (
        <Form.Group controlId={name} className={`form-input ${className}`} ref={ref}>
            <Form.Label>{label}</Form.Label>
            <Visible when={options.length}>
                <DropdownMultiselect name={name} selected={values[name]} options={options} buttonClass="form-control" placeholder={placeholder} handleOnChange={handleOnChange} />
            </Visible>
        </Form.Group>
    );
};
