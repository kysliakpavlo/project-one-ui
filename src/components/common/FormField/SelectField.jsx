import React, { useRef } from "react";
import _get from 'lodash/get';
import _isEmpty from "lodash/isEmpty";
import Form from "react-bootstrap/Form";

import Visible from "../Visible";

export const SelectField = ({
  label,
  disabled,
  onChange,
  required,
  className,
  placeholder,
  options = [],
  field: { name },
  form: { errors, touched, handleChange, handleBlur, values },
}) => {
  const ref = useRef(null);
  const isInvalid = touched[name] && !_isEmpty(errors[name]);
  const value = _get(values, name, '');

  return (
    <Form.Group controlId={name} className={`form-input ${className}`}>
      <Form.Label>{label} {required && '*'}</Form.Label>
      <Form.Control
        as="select"
        name={name}
        isInvalid={isInvalid}
        onChange={onChange || handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        ref={ref}
        value={value}
      >
        <Visible when={placeholder}>
          <option value="">{placeholder}</option>
        </Visible>
        {options.map((opt) => (
          <option key={opt.key} value={opt.key} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </Form.Control>
      {isInvalid ? (
        <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
      ) : null}
    </Form.Group>
  );
};