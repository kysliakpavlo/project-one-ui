import React, { useRef } from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import Form from "react-bootstrap/Form";
import Overlay from "react-bootstrap/Overlay";
import Tooltip from "react-bootstrap/Tooltip";
import SvgComponent from "../SvgComponent";

import "./SelectField.scss";
import Visible from "../Visible";

export const SelectField = ({ label, disabled, onChange, className, placeholder, options = [], field: { name }, form: { errors, touched, handleChange, handleBlur, values } }) => {
	const ref = useRef(null);
	const isInvalid = touched[name] && !_isEmpty(errors[name]);
	const value = _get(values, name, "");

	return (
		<Form.Group controlId={name} className={`floating-input ${className}`}>
			<Form.Control as="select" name={name} isInvalid={isInvalid} onChange={onChange || handleChange} onBlur={handleBlur} disabled={disabled} ref={ref} value={value}>
				<Visible when={placeholder}>
					<option value="">{placeholder}</option>
				</Visible>
				{options.map((opt) => (
					<option key={opt.key} value={opt.key} disabled={opt.disabled}>
						{opt.label}
					</option>
				))}
			</Form.Control>
			<Form.Label>{label}</Form.Label>
			<SvgComponent className="select-icon" path="angle-down-solid" />
			<Overlay target={ref.current} show={isInvalid} placement="bottom">
				{(props) => (
					<Tooltip className="validation-msg" {...props}>
						{errors[name]}
					</Tooltip>
				)}
			</Overlay>
		</Form.Group>
	);
};
