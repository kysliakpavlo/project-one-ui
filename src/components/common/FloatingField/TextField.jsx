import React, { useRef } from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import Form from "react-bootstrap/Form";
import Overlay from "react-bootstrap/Overlay";
import Tooltip from "react-bootstrap/Tooltip";
export const TextField = ({
	fieldAs = "input",
	rows,
	label,
	className,
	type = "text",
	placeholder = " ",
	field: { name },
	form: { errors, touched, handleChange, handleBlur, values },
	...others
}) => {
	const value = _get(values, name, "");
	const ref = useRef(null);
	const isInvalid = touched[name] && !_isEmpty(errors[name]);
	const onLabelClick = (e) => {
		ref.current.focus();
	};
	return (
		<Form.Group
			controlId={name}
			className={`floating-input ${className}`}
		>
			<Form.Control
				as={fieldAs}
				type={type}
				placeholder={placeholder}
				isInvalid={isInvalid}
				onChange={handleChange}
				onBlur={handleBlur}
				ref={ref}
				rows={rows}
				value={value}
				{...others}
			/>
			<Form.Label onClick={onLabelClick}>{label}</Form.Label>
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
