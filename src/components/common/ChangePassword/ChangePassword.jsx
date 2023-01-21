import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import { Form as FormikForm, Field, withFormik } from "formik";
import Button from "react-bootstrap/Button";
import { TextField } from "../FormField";
import { PasswordStrengthField } from "../FormField";

import "./ChangePassword.scss";

let changeDisplay;

const ChangePassword = ({ match, setLoading, validateChangePasswordToken }) => {
  const [display, setDisplay] = useState(true);
  const [invalidToken, setInvalidToken] = useState("Verifing Token...");
  changeDisplay = setDisplay;
  const { resetToken } = match.params;

  useEffect(() => {
    if (resetToken) {
      validateChangePasswordToken({
        token: resetToken,
      })
        .then((res) => {
          if (res.statusCode === 200) {
            setInvalidToken(null);
          } else {
            setInvalidToken(res.message);
          }
        })
        .catch((err) => {
          setInvalidToken(err.message);
        });
    }
    setLoading(false);
  }, [resetToken]);

  return (
    <div className="container-reset">
      <Container>
        <h3 className="h1-pswd">Set New Password</h3>
        {display && !invalidToken ? (
          <FormikForm noValidate autoComplete="off">
            <Row>
              <Col>
                <Field
                  component={PasswordStrengthField}
                  name="password"
                  placeholder="Password"
                  label="New Password"
                  type="password"
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Field
                  component={TextField}
                  name="confirmPassword"
                  placeholder="Re-Enter New Password"
                  label="Re-Enter New Password"
                  type="password"
                />
              </Col>
            </Row>
            <Row>
              <Button
                variant="primary"
                type="submit"
                className="resetPswrd-btn"
              >
                Set New Password
              </Button>
            </Row>
          </FormikForm>
        ) : invalidToken ? (
          invalidToken
        ) : (
          <div className="redirect-login">
            Password changed Successfully
            <Link to="/my-account"> Click here </Link> continue.
          </div>
        )}
      </Container>
    </div>
  );
};

export default withFormik({
  mapPropsToValues: () => {
    return {
      password: "",
      confirmPassword: "",
    };
  },
  validationSchema: Yup.object().shape({
    password: Yup.string()
      .required("Password Required")
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[-!$%^&*()_+|~=`{}\\[\]:(\/);<>?,.@#'"])[A-Za-z\d-!$%^&*()_+|~=`{}\\[\]:(\/);<>?,.@#'"]{8,}$/,
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
      ),
    confirmPassword: Yup.string().when("password", {
      is: (val) => (val && val.length > 0 ? true : false),
      then: Yup.string().oneOf(
        [Yup.ref("password")],
        "Both password need to be the same"
      ),
    }),
  }),
  handleSubmit: (values, { props, ...formikProps }) => {
    const { resetToken } = props.match.params;
    const headers = { resettoken: resetToken };
    props.resetPassword({ ...values, token: resetToken }, headers).then(
      (response) => {
        props.showMessage({ message: response.message });
        props.saveUserToken(response);
        changeDisplay(false);
      },
      (err) => {
        props.showMessage({ message: err.message });
      }
    );
  },
})(ChangePassword);
