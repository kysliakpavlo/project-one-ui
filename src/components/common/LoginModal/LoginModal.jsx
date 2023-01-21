import React, { useState, useCallback, useRef } from "react";
import * as Yup from "yup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { Link, useHistory } from "react-router-dom";
import { Form as FormikForm, Field, withFormik } from "formik";
import SocialButton from "./SocialButton";
import { CheckBoxField, TextField } from "../FormField";
import ForgotPassword from "../ForgotPassword";
// import useOutsideClick from '../../../hooks/useOutsideClick';
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID, MESSAGES } from "../../../utils/constants";
import "./LoginModal.scss";
import SvgComponent from "../SvgComponent";
import RegisterVia from "../RegisterVia";
import { toUrlString } from "../../../utils/helpers";

let history;

const LoginModal = ({ show, vendor, onClose, values, showMessage, setValues, handleSubmit, hideLogin, isEmailExist }) => {
	history = useHistory();
	const loginModal = useRef(null);
	const [selectedView, setSelectedView] = useState("login");
	// useOutsideClick(loginModal, onClose);
	const handleSocialLogin = useCallback(
		async (res) => {
			switch (res.provider) {
				case "facebook":
					await setValues({
						...values,
						profilePicURL: res.profile.profilePicURL,
						email: res.profile.email,
						socialId: res.profile.id,
						socialAccount: "FACEBOOK",
					});
					handleSubmit();
					break;
				case "google":
					await setValues({
						...values,
						profilePicURL: res.profile.profilePicURL,
						email: res.profile.email,
						socialId: res.profile.id,
						socialAccount: "GOOGLE",
					});
					handleSubmit();
					break;
				default:
			}
		},
		[values, setValues, handleSubmit]
	);

	const handleSocialLoginFailure = useCallback((a, b, c) => {}, []);

	const onInputFocus = useCallback(() => {
		setValues({
			...values,
			socialAccount: null,
			socialId: null,
		});
	}, [values, setValues]);

	const onChangeView = (e) => {
		setSelectedView(e.target.value);
	};
	const navigateToReg = () => {
		setSelectedView("social");
	};
	const navigateToPassword = () => {
		setSelectedView("forgot");
	};
	const onChoose = useCallback((provider, data) => {
		if (provider !== "EMAIL") {
			isEmailExist({ email: data.email })
				.then(() => {
					const obj = toUrlString({ data: data, provider: provider });
					history.push(`/redirect/registration?${obj}`);
					onClose();
				})
				.catch((err) => {
					showMessage({ message: err.message, type: "warning" });
				});
		} else {
			onClose();
			const obj = toUrlString({
				data: data === null && {},
				provider: provider,
			});
			history.push(`/redirect/registration?${obj}`);
		}
	}, []);

	const mountedStyle = { animation: "inAnimation 300ms ease-in" };
	const unmountedStyle = {
		animation: "outAnimation 300ms ease-out",
		animationFillMode: "forwards",
	};

	return (
		<div
			className="login-wrap"
			ref={loginModal}
		>
			<input
				id="tab-1"
				type="radio"
				name="tab"
				className="sign-in"
				value="login"
				checked={selectedView === "login"}
				onChange={onChangeView}
				hidden
			/>
			<input
				id="tab-2"
				type="radio"
				name="tab"
				className="sign-up"
				value="forgot"
				checked={selectedView === "forgot"}
				onChange={onChangeView}
				hidden
			/>
			<input
				id="tab-3"
				type="radio"
				name="tab"
				className="social"
				value="social"
				checked={selectedView === "social"}
				onChange={onChangeView}
				hidden
			/>
			<div className="login-header">
				{selectedView !== "login" && (
					<span
						className="arrow-back-white"
						onClick={() => setSelectedView("login")}
					>
						<SvgComponent path="arrow_back_white_24dp" />
					</span>
				)}
				<label
					htmlFor="tab-1"
					className="in-tab"
				>
					{selectedView === "login" ? <>Sign In</> : selectedView === "forgot" ? <>Forgot password </> : <> Registration </>}
				</label>
				<Button
					onClick={hideLogin}
					className="close"
					variant="link"
					size="lg"
				>
					<SvgComponent path="close_black_24dp" />
				</Button>
			</div>
			<div className="login-form">
				<div
					className="signin-htm transitionDiv"
					style={show ? mountedStyle : unmountedStyle}
				>
					<div className="group">
						<FormikForm
							noValidate
							autoComplete="off"
						>
							<div className="login-fields">
								<Row>
									<Col sm={12}>
										<Field
											component={TextField}
											onFocus={onInputFocus}
											label="Username / Email"
											placeholder=""
											name="email"
											required
										/>
									</Col>
									<Col sm={12}>
										<Field
											component={TextField}
											onFocus={onInputFocus}
											label="Password"
											placeholder=""
											type="password"
											name="password"
											required
										/>
									</Col>
									<Col xs={6}>
										<Field
											component={CheckBoxField}
											className="switch-button"
											type="switch"
											label="Keep me signed in."
											name="rememberMe"
										/>
									</Col>
									<Col
										xs={6}
										className="text-center forget-password"
										onClick={() => navigateToPassword()}
									>
										<label
											htmlFor="tab-2"
											className="tab"
										>
											Forgot Password?
										</label>
									</Col>
								</Row>
							</div>
							<div className="row">
								<div className="col-12 mb-2">
									<Button
										variant="primary"
										className="btn-block btn-sign-in"
										type="submit"
									>
										Sign in
									</Button>
								</div>
							</div>
							<SocialButton
								block
								size="sm"
								provider="facebook"
								appId={FACEBOOK_APP_ID}
								variant="outline-primary"
								className="social-btn-facebook mx-0 mb-1"
								onLoginSuccess={handleSocialLogin}
								onLoginFailure={handleSocialLoginFailure}
							>
								<SvgComponent path="facebook" />
								<span>Sign in with Facebook</span>
							</SocialButton>
							<SocialButton
								block
								size="sm"
								provider="google"
								appId={GOOGLE_CLIENT_ID}
								variant="outline-primary"
								className="social-btn-google mx-0 mb-1"
								onLoginSuccess={handleSocialLogin}
								onLoginFailure={handleSocialLoginFailure}
							>
								<SvgComponent path="google-logo" />
								<span>Sign in with Google</span>
							</SocialButton>
						</FormikForm>
						<Row>
							<div className="col-12 text-center">
								<label
									htmlFor="tab-2"
									className="label-header no-account-label"
								>
									Don't have an account?
								</label>
							</div>

							<div className="col-12 mb-2">
								<Button
									variant="secondary"
									onClick={() => navigateToReg()}
									className="btn-block sign-up-button"
									type="button"
								>
									Join
								</Button>
							</div>
						</Row>

						<Row>
							<div className="col-12 mb-2">
								<a
									href={vendor.vendorLogin}
									target="_blank"
									className="vendor-login-button"
								>
									Vendor Sign in
								</a>
							</div>
						</Row>
					</div>
				</div>
				<div
					className="reset-htm transitionDiv"
					style={show ? mountedStyle : unmountedStyle}
				>
					<ForgotPassword
						showMessage={showMessage}
						onCloseLogin={onClose}
						isModal={true}
					/>
					<Row>
						<div className="col-12 text-center">
							<label
								htmlFor="tab-2"
								className="label-header no-account-label"
							>
								Don't have an account?
							</label>
						</div>
						<div className="col-12 mb-2">
							<Button
								variant="primary"
								className="btn-block sign-up-button"
								type="submit"
								onClick={() => setSelectedView("login")}
							>
								Join
							</Button>
						</div>
					</Row>
					<Row>
						<div className="col-12 text-center">
							<label
								htmlFor="tab-2"
								className="label-header"
							>
								Vendors
							</label>
						</div>

						<div className="col-12 mb-2">
							<a
								href={vendor.vendorLogin}
								target="_blank"
								className="btn-block btn btn-primary"
							>
								Sign in
							</a>
						</div>
					</Row>
				</div>
				<div
					className="registration transitionDiv"
					style={show ? mountedStyle : unmountedStyle}
				>
					<RegisterVia onChoose={onChoose} />
				</div>
			</div>
		</div>
	);
};

export default withFormik({
	mapPropsToValues: () => {
		return {
			email: "",
			password: "",
			socialId: "",
			rememberMe: true,
			socialAccount: "",
		};
	},
	validationSchema: Yup.object().shape({
		email: Yup.string().when("socialAccount", {
			is: (val) => !!val,
			then: Yup.string(),
			otherwise: Yup.string().required("Email is required"),
		}),
		password: Yup.string().when("socialAccount", {
			is: (val) => !!val,
			then: Yup.string(),
			otherwise: Yup.string().required("Password is required"),
		}),
	}),
	handleSubmit: (values, { props, ...formikProps }) => {
		const messageId = "emailerification";
		const reSendEmail = () => {
			props.removeMessage(messageId);
			props
				.reSendEmail({ email: values?.email })
				.then((res) => {
					props.showMessage({ message: res.message });
				})
				.catch((err) => {
					props.showMessage({ message: err.message, type: "error" });
				});
		};

		const urlLocation = history.location.pathname.split("/").includes("simulcast-auction");
		props
			.submitLogin(values)
			.then((response) => {
				props.hideLogin();
				props.getNotifications();
				if (response.result.role === "Admin" && response.result.isAlreadyLoggedIn) {
					props.showAlert();
				}
				if (response.result.role === "Admin" && urlLocation) {
					history.push("/");
				}
			})
			.catch((err) => {
				if (err?.socialAccount) {
					props.showMessage({
						message: `${err.message}: ${err.socialAccount}. Please Sign in with ${err.socialAccount}`,
						type: "error",
					});
				} else if (/reset password/i.test(err.message)) {
					const link = (
						<label
							htmlFor="tab-2"
							className="skipOutsideClick"
						>
							<span>click here</span>
						</label>
					);
					const message = err.message.split(/click here/i);
					message.splice(1, 0, link);
					props.showMessage({ message, type: "error" });
				} else {
					if (err.message === "You are not registered. Please register.") {
						props.showMessage({
							message: err.message,
							type: "error",
						});
						props.hideLogin();
						let social = {};
						social.email = values.email;
						social.id = values.socialId;
						const obj = toUrlString({
							data: social,
							provider: values.socialAccount,
						});
						history.push(`/redirect/registration?${obj}`);
					} else if (/Email verification is pending/i.test(err.message)) {
						const link = (
							<label
								onClick={reSendEmail}
								className="skipOutsideClick"
							>
								<span>click here</span> to resend email verification
							</label>
						);
						const message = err.message.split(/click here/i);
						message.splice(1, 0, link);
						props.showMessage({
							message,
							type: "error",
							autohide: false,
							messageId: messageId,
						});
					} else if (err.message.includes("suspended")) {
						props.showMessage({
							message: (
								<div>
									{MESSAGES.ACCOUNT_SUSPEND}{" "}
									<Link
										onClick={() => props.hideLogin()}
										className="clickable-text"
										to="/contact-us"
									>
										here
									</Link>
								</div>
							),
							type: "error",
							autohide: false,
						});
					} else {
						props.showMessage({
							message: err.message,
							type: "error",
							autohide: false,
						});
					}
				}
			});
	},
})(LoginModal);
