import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import isObject from 'lodash/isObject';
import { useFormikContext } from 'formik';

const getFirstErrorKey = (object, keys = []) => {
    const firstErrorKey = Object.keys(object)[0];
    if (isObject(object[firstErrorKey])) {
        return getFirstErrorKey(object[firstErrorKey], [...keys, firstErrorKey]);
    }
    return [...keys, firstErrorKey].join('.');
};

const ScrollToError = () => {
    const formik = useFormikContext();
    const [submitCount, setSubmitCount] = useState(formik.submitCount)

    useEffect(() => {
        if (!formik.isValid && formik.submitCount > submitCount) {
            const firstErrorKey = getFirstErrorKey(formik.errors);
            const element = global.window.document.querySelector(`#${firstErrorKey}`);
            if (element) {
                ReactDOM.findDOMNode(element).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
                setTimeout(() => element.focus(), 1000);
            }
            setSubmitCount(formik.submitCount)
        }
    }, [formik.submitCount, formik.isValid, formik.errors]);
    return null;
};

export default ScrollToError;
