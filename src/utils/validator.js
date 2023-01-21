import * as Yup from "yup";
import { toAmount } from "./helpers";
const regEx = {
  phone: /^(\+?\(61\)|\(\+?61\)|\+?61|\(0[1-9]\)|0[1-9])?( ?-?[0-9]){7,9}$/,
  nonLocalPhone: /^(\+)?[0-9]+/,
};

export const nameValidator = Yup.string().required("Name is required");

export const emailValidator = Yup.string()
  .required("Email is required")
  .email("Enter valid email");

export const phoneValidaor = Yup.string()
  .required("Phone is required")
  .matches(regEx.phone, "Enter valid phone");

export const requiredString = (message) =>
  Yup.string().required(message || "Required");

export const selectValidator = Yup.string().required("State is Required");

export const requiredNumber = (message) => Yup.number().required(message);

export const number = Yup.number();

export const requiredMinNumber = (min, requiredMsg, minMsg) =>
  Yup.number()
    .required(requiredMsg || "Required")
    .min(min, minMsg || `Should be greater than ${toAmount(min)}`);

export const requiredCurrency = (requiredMsg) =>
  Yup.string().required(requiredMsg || "Required");

export const requiredCaptcha = Yup.bool().oneOf(
  [true],
  "Please verify captcha"
);

const validator = {
  name: nameValidator,
  email: emailValidator,
  phone: phoneValidaor,
  location: selectValidator,
  requiredString,
  requiredNumber,
  requiredMinNumber,
  requiredCurrency,
  requiredCaptcha,
  number,
  regEx,
};

export default validator;
