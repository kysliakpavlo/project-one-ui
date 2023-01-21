import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { GOOGLE_API_KEY } from '../../../utils/constants';
import _get from 'lodash/get';
import _each from 'lodash/each';
import _reduce from 'lodash/reduce';
import _isEmpty from 'lodash/isEmpty';
import _isFunction from 'lodash/isFunction';
import Form from "react-bootstrap/Form";

let autoComplete;

const loadScript = (url, callback) => {
    if (window.google?.maps?.places?.Autocomplete) {
        callback();
    } else {
        let script = document.createElement("script");
        script.type = "text/javascript";

        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {
            script.onload = () => callback();
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }
};

function handleScriptLoad(updateQuery, autoCompleteRef) {
    autoComplete = new window.google.maps.places.Autocomplete(autoCompleteRef.current);
    autoComplete.setFields(["address_components", "formatted_address"]);
    autoComplete.addListener("place_changed", () =>
        handlePlaceSelect(updateQuery)
    );
}

async function handlePlaceSelect(updateQuery) {
    const addressObject = autoComplete.getPlace();
    updateQuery(addressObject);
}

function addressComponentsToAddress({ address_components: components = [], formatted_address: addStr = '' }) {
    const resObj = _reduce(components, (res, item) => {
        _each(item.types, (type) => {
            if (type === 'country' || type === 'administrative_area_level_1') {
                res[type] = item;
            } else {
                res[type] = item.long_name;
            }
        });
        return res;
    }, {});

    const { street_number = '', route = '', locality = '', administrative_area_level_1, country, postal_code = '' } = resObj;

    return {
        address: `${street_number} ${route}`.trim() || addStr || '',
        city: locality || '',
        state: administrative_area_level_1?.long_name || '',
        stateCode: administrative_area_level_1?.short_name || '',
        country: country?.long_name || '',
        countryCode: country?.short_name || '',
        postalCode: postal_code || ''
    };
}

export const AddressSearchField = ({
    label,
    helper,
    disable,
    required,
    country,
    countries,
    type = "text",
    className = '',
    field: { name },
    fieldAs = "input",
    onAddressSelect,
    form: { errors, touched, setFieldValue, handleChange, handleBlur, values },
    ...others
}) => {
    const value = _get(values, name, '');
    const ref = useRef(null);
    const isInvalid = touched[name] && !_isEmpty(errors[name]);
    const error = _get(errors, name, null);
    const onLabelClick = (e) => {
        ref.current.focus();
    };

    const onChangeAddress = useCallback((addressObject) => {
        if (_isFunction(onAddressSelect)) {
            onAddressSelect(addressComponentsToAddress(addressObject));
        } else {
            setFieldValue(name, addressObject.formatted_address);
        }
    }, [name, setFieldValue]);

    useEffect(() => {
        loadScript(
            `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`,
            () => handleScriptLoad(onChangeAddress, ref)
        );
    }, [onChangeAddress]);

    const countryCode = useMemo(() => {
        if (country && countries?.length) {
            return countries.find(item => item.key === country)?.item;
        }
        return null;
    }, [country, countries]);

    useEffect(() => {
        autoComplete && autoComplete.setComponentRestrictions({ country: countryCode });
    }, [countryCode, autoComplete]);

    return (
        <Form.Group controlId={name} className={`form-input ${className}`}>
            <Form.Label onClick={onLabelClick}>{label} {required && '*'}</Form.Label>
            <Form.Control
                ref={ref}
                type={type}
                as={fieldAs}
                value={value}
                onBlur={handleBlur}
                isInvalid={isInvalid}
                onChange={handleChange}
                {...others}
            />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
            <Form.Text className="text-muted">{helper}</Form.Text>
        </Form.Group>
    );
};
