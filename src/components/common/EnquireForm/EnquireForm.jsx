import React from "react";
import * as Yup from "yup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { Form as FormikForm, Field, withFormik } from "formik";
import { TextField } from "../FloatingField";
import { CheckBoxField } from "../FormField";
import validator from "../../../utils/validator";
import { SUBSCRIPTION_SOURCE, MESSAGE, MESSAGES } from "../../../utils/constants";
import "./EnquireForm.scss";

const EnquireForm = () => {
	return (
		<div className="enquiry-form">
			<FormikForm
				noValidate
				autoComplete="off"
			>
				<Row className="gx-1">
					{/* <Col sm={12}>
						<p className="desc">
							Contact your friendly Slattery Auctions team today.
						</p>
					</Col> */}
					<Col
						sm={12}
						md={6}
						lg={6}
					>
						<Field
							component={TextField}
							label="First Name"
							// placeholder="First Name"
							name="firstName"
							required
						/>
					</Col>
					<Col
						sm={12}
						md={6}
						lg={6}
					>
						<Field
							component={TextField}
							label="Last Name"
							// placeholder=" Last Name"
							name="lastName"
							required
						/>
					</Col>
				</Row>
				<Row className="gx-1">
					<Col
						sm={12}
						md={6}
						lg={6}
					>
						<Field
							component={TextField}
							label="Phone / Mobile"
							// placeholder="Phone"
							name="phone"
							required
						/>
					</Col>
					<Col
						sm={12}
						md={6}
						lg={6}
					>
						<Field
							component={TextField}
							label="Email"
							// placeholder="Email"
							name="email"
							required
						/>
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<Field
							component={TextField}
							name="comments"
							label="How can we help you?"
							// placeholder="How can we help you?"
							fieldAs="textarea"
							rows={6}
							required
						/>
					</Col>
					<Col sm={12}>
						<Field
							component={CheckBoxField}
							type="switch"
							className="txt-news"
							name="subscribeNewsLetter"
							label="Subscribe to our newsletter"
							required
						/>
					</Col>
				</Row>
				<Row>
					<Col
						sm={12}
						className="submit-btn"
					>
						<Button
							className="btn btn-primary btn-submit"
							type="submit"
						>
							Submit
						</Button>
					</Col>
				</Row>
			</FormikForm>
		</div>
	);
};

export default withFormik({
	mapPropsToValues: ({ loggedInUser, enquireLocation }) => {
		const { firstName = "", lastName = "", email = "", mobile: phone = "" } = loggedInUser || {};
		const recordType = "General";
		return {
			firstName,
			lastName,
			email,
			phone,
			comments: "",
			subscribeNewsLetter: true,
			recordType,
			type: enquireLocation,
			subscriptionSource: enquireLocation,
		};
	},
	validationSchema: Yup.object().shape({
		firstName: validator.name,
		lastName: validator.name,
		email: validator.email,
		phone: validator.phone,
		comments: validator.requiredString("Please provide information about query"),
	}),
	handleSubmit: (values, { props, ...formikProps }) => {
		console.log("trigger handle submit", values);

		props.submitEnquire(values).then(
			(res) => {
				console.log("submit contact us form", res);
				props?.showMessage({ message: MESSAGES.ENQUIRY_SUBMIT });
				formikProps.resetForm();
				props?.updateSuccesMessage();
			},
			(err) => {
				props.showMessage({ message: err.message, type: "error" });
			}
		);
	},
})(EnquireForm);
