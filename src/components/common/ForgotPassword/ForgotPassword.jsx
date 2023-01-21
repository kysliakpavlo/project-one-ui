import React, { useEffect } from "react";
import * as Yup from "yup";
import Button from "react-bootstrap/Button";
import { Form as FormikForm, Field, withFormik } from "formik";
import { TextField } from "../FormField";
import { useHistory } from "react-router-dom";
import "./ForgotPassword.scss";

let history;
const ForgotPassword = ({ setLoading }) => {
  useEffect(() => {
    setLoading(false);
  }, []);
  history = useHistory();
  return (
    <FormikForm noValidate autoComplete="off" className="forgot-form">
      <Field component={TextField} name="email" placeholder="" label="Email" />
      <Button variant="primary" className="btn-block" type="submit">
        Reset
      </Button>
    </FormikForm>
  );
};
export default withFormik({
  mapPropsToValues: () => {
    return {
      email: "",
    };
  },
  validationSchema: Yup.object().shape({
    email: Yup.string().required("Email is required"),
  }),
  handleSubmit: (values, { props, ...formikProps }) => {
    props
      .getForgotPassword(values)
      .then((response) => {
        props.showMessage({ message: response.message, autohide: false });
        props.isModal && props.onCloseLogin();
        history.push("/");
      })
      .catch((err) => {
        props.showMessage({
          message: err.message,
          autohide: false,
          type: "error",
        });
      });
  },
})(ForgotPassword);
