import React from "react";
import Form from "react-bootstrap/Form";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import _isFunction from "lodash/isFunction";

export const CheckBoxField = ({
  label,
  inline,
  helper,
  onChange,
  required,
  className,
  value = true,
  field: { name },
  type = "checkbox",
  form: { handleChange, values, touched, handleBlur, errors },
}) => {
  const isInvalid = touched[name] && !_isEmpty(errors[name]);
  const error = _get(errors, name, null);
  let props = {};
  if (_get(values, name) === value) {
    props = { checked: true };
  }
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
    <Form.Group controlId={`${name}_${value}`} className={className}>
      <Form.Check
        value={value}
        type={type}
        inline={inline}
        label={label}
        name={name}
        error={error}
        helper={helper}
        isInvalid={isInvalid}
        onChange={handleOnChange}
        {...props}
        required
      />
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  );
};
