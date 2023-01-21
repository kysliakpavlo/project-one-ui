import React, { useRef } from "react";
import _isEmpty from "lodash/isEmpty";
import _isFunction from "lodash/isFunction";
import Form from "react-bootstrap/Form";
import Overlay from "react-bootstrap/Overlay";
import Tooltip from "react-bootstrap/Tooltip";
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import Visible from "../Visible";

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
	const isInvalid = touched[name] && !_isEmpty(errors[name]);

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
		<Form.Group
			controlId={name}
			className={`floating-input ${className}`}
			ref={ref}
		>
			<Visible when={options.length}>
				<DropdownMultiselect
					name={name}
					selected={values[name]}
					options={options}
					buttonClass="form-control"
					placeholder={placeholder}
					handleOnChange={handleOnChange}
				/>
			</Visible>
			<Form.Label>{label}</Form.Label>
			<Overlay
				target={ref.current}
				show={isInvalid}
				placement="bottom"
			>
				{(props) => (
					<Tooltip
						className="validation-msg"
						{...props}
					>
						{errors[name]}
					</Tooltip>
				)}
			</Overlay>
		</Form.Group>
	);
};
