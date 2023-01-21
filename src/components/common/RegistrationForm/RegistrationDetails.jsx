import React, { useCallback, useState } from "react";
import _map from "lodash/map";
import _lower from "lodash/lowerCase";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Field } from "formik";
import Visible from "../Visible";
import { MESSAGES } from "../../../utils/constants";
import {
  TextField,
  SelectField,
  AddressSearchField,
  PasswordStrengthField,
} from "../FormField";

const RegistrationDetails = ({
  values,
  errors,
  countries,
  locations,
  setFieldValue,
  setFieldError,
  showMessage,
  sendOtp,
  verifyOtp,
  isEmailExist,
  isMobileExist,
}) => {
  const { accountId, email, socialId, billingCountry, mobile, otp } = values;
  const { email: emailError } = errors;
  let filteredLocation = locations.filter(
    (location) => location.name.toLowerCase() !== "national"
  );
  const locationOptions = _map(filteredLocation, (location) => ({
    key: location.name,
    label: location.name,
  }));

  const onVerifyEmail = useCallback(() => {
    if (email) {
      isEmailExist({ email })
        .then((res) => {
          if (res?.result?.isEmailExists) {
            setFieldError("email", "Email Already Exists");
          } else {
            setFieldError("email", null, false);
          }
        })
        .catch((err) => {
          showMessage({ message: err.message });
          setFieldError("email", "Email Verification Failed");
        });
    }
  }, [email]);

  const validateEmail = useCallback(
    async (value) => {
      if (!value) {
        return "Email is required";
      } else if (
        emailError === "Email Already Exists" ||
        emailError === "Email Verification Failed"
      ) {
        return emailError;
      } else {
        const emailRegex =
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return !emailRegex.test(value) ? "Invalid Email" : null;
      }
    },
    [emailError]
  );

  const onVerifyMobile = useCallback(() => {
    if (mobile) {
      isMobileExist({ mobile })
        .then((res) => {
          console.log(res);
          if (res?.result?.isSuspendedBuyer) {
            setIsMobileOk(0);
            setFieldError("mobile", MESSAGES.ACCOUNT_SUSPEND);
          } else {
            setIsMobileOk(1);
            setFieldError("mobile", null, false);
          }
        })
        .catch((err) => {
          showMessage({ message: err.message });
          setFieldError("mobile", "Mobile Verification Failed");
        });
    }
  }, [mobile]);

  const onSendOtp = useCallback(() => {
    setFieldValue("mobileVerified", false);
    if (mobile) {
      sendOtp({ mobile })
        .then((res) => {
          showMessage({ type: "success", message: res.message });
          setFieldValue("sentOtp", true);
        })
        .catch((err) => {
          showMessage({ type: "warning", message: err.message });
          setFieldValue("sentOtp", false);
        });
    }
  }, [mobile]);

  const onVerifyOtp = useCallback(() => {
    if (otp) {
      verifyOtp({ mobile, otp })
        .then((res) => {
          showMessage({ type: "success", message: res.message });
          setFieldValue("mobileVerified", true);
        })
        .catch((err) => {
          setFieldValue("mobileVerified", false);
          showMessage({ type: "warning", message: err.message });
        });
    }
  }, [mobile, otp]);

  const onChangeMobile = useCallback(() => {
    setFieldValue("mobileVerified", false);
    setFieldValue("otp", "");
    setFieldValue("sentOtp", false);
  }, []);

  const onChooseAddress = useCallback(
    async (addressObj) => {
      const { address, city, state, stateCode, country, postalCode } =
        addressObj;
      const stateObj = locationOptions.find(
        (item) =>
          _lower(item.key) === _lower(stateCode) ||
          _lower(item.label) === _lower(stateCode)
      );
      await setFieldValue("billingCity", city);
      await setFieldValue("billingState", stateObj?.key || state || "");
      await setFieldValue("billingStreet", address);
      await setFieldValue("billingCountry", country);
      await setFieldValue("billingPostalCode", postalCode);
    },
    [values]
  );

  const onCountryChange = (e) => {
    setFieldValue("billingCountry", e.target.value);
    setFieldValue("billingState", "");
  };

  const [isMobileOk, setIsMobileOk] = useState(0);

  const isDisabled = () => {
    return (!mobile || !isMobileOk) ? true : false;
  };

  return (
    <>
      <Card className="no-hover my-3">
        <Card.Header className="bg-white border-0 px-3">
          User Details
        </Card.Header>
        <Card.Body>
          <Row>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                placeholder="First Name"
                name="firstName"
                label="First Name"
                required
              />
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                placeholder="Last Name"
                name="lastName"
                label="Last Name"
                required
              />
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                placeholder="Company"
                name="company"
                label="Company"
              />
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                placeholder="Dealer License"
                name="dealerLicense"
                label="Dealer License"
              />
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                validate={validateEmail}
                disabled={!!socialId || !!accountId}
                placeholder="E-mail"
                name="email"
                label="E-mail"
                onBlur={onVerifyEmail}
                required
              />
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                disabled={!!socialId || !!accountId}
                placeholder="Confirm E-mail"
                name="confirmEmail"
                label="Confirm E-mail"
                required
              />
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={PasswordStrengthField}
                disabled={!!socialId}
                placeholder="Password"
                name="password"
                label="Password"
                type="password"
                helper="Minimum length of 8, must contain numbers, characters and special characters"
                required={!accountId && !socialId}
              />
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                disabled={!!socialId}
                placeholder="Confirm Password"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                required={!accountId && !socialId}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="no-hover my-3">
        <Card.Header className="bg-white border-0 px-3">
          Address Details
        </Card.Header>
        <Card.Body>
          <Row>
            <Col sm={6} xs={12}>
              <Field
                component={AddressSearchField}
                placeholder="Address"
                name="billingStreet"
                label="Address"
                country={billingCountry}
                countries={countries}
                onAddressSelect={onChooseAddress}
                required
              />
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                placeholder="Suburb/City"
                name="billingCity"
                label="Suburb/City"
                required
              />
            </Col>
            <Col sm={6} xs={12}>
              {values.billingCountry === "Australia" ? (
                <Field
                  component={SelectField}
                  options={locationOptions}
                  placeholder="State"
                  name="billingState"
                  label="State"
                  required
                />
              ) : (
                <Field
                  component={TextField}
                  placeholder="State"
                  name="billingState"
                  label="State"
                  required
                />
              )}
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                placeholder="Postcode"
                name="billingPostalCode"
                label="Postcode"
                required
              />
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={SelectField}
                options={countries}
                onChange={onCountryChange}
                placeholder="Select the country"
                name="billingCountry"
                label="Country"
                required
              />
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                placeholder="Drivers license"
                name="driversLicense"
                label="Drivers License"
                required
              />
            </Col>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                disabled={values.mobileVerified}
                placeholder="Mobile"
                name="mobile"
                label="Mobile"
                onBlur={onVerifyMobile}
                maxLength="40"
              />
            </Col>
            <Visible when={values.billingCountry === "Australia"}>
              <Col sm={6} xs={12} className="pt-md-4">
                <Button
                  variant="primary"
                  className="mb-2"
                  disabled={isDisabled()}
                  onClick={onSendOtp}
                  type="button"
                >
                  Send Verification Code
                </Button>
                {values.mobileVerified && (
                  <Button
                    variant="primary"
                    className="ml-md-3 mb-2 mx-0"
                    onClick={onChangeMobile}
                    type="button"
                  >
                    Change Mobile
                  </Button>
                )}
              </Col>
              <Col sm={6} xs={12}>
                <Field
                  component={TextField}
                  disabled={values.mobileVerified || !values.sentOtp}
                  placeholder="Verification Code"
                  name="otp"
                  label="Verification Code"
                  required
                  onBlur={onVerifyOtp}
                />
              </Col>
            </Visible>
            <Col sm={6} xs={12}>
              <Field
                component={TextField}
                placeholder="Phone"
                name="phone"
                label="Phone"
                maxLength="40"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default RegistrationDetails;
