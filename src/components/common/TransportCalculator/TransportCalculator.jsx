import React, { useEffect, useState } from "react";
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction'
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import { Form as FormikForm, Field, withFormik } from "formik";
import Button from "react-bootstrap/Button";

import { removeNumber } from "../../../utils/helpers";
import NoResults from '../../common/NoResults';

import { SelectField } from "../../common/FloatingField";
import Visible from "../../common/Visible";
import "./TransportCalculator.scss";

const Component = ({ cities, assetTypeList, values, onCalculate, transportFee }) => {

    const [toCitiesOptions, setToCitiesOptions] = useState([]);
    const [fromCitiesOptions, setFromCitiesOptions] = useState([]);

    useEffect(() => {
        if (cities && cities.length) {
            setFromCitiesOptions(_map(cities, (item => ({ key: item.cityId, label: item.name }))))
            setToCitiesOptions(_map(cities, (item => ({ key: item.cityId, label: item.name }))))
        }
    }, [cities]);

    const onSubmit = () => {
        if (_isFunction(onCalculate)) {
            onCalculate(values);
        }
    };

    const onChange = (e) => {
        values.fromLocation = e.target.value;
        values.toLocation = "";
        const index = e.nativeEvent.target.selectedIndex;
        const label = e.nativeEvent.target[index].text;
        let toCities = _filter(fromCitiesOptions, item => item.key !== e.target.value)
        if (label !== 'All') {
            const distanceArr = [{ key: `Metro ${label} < 25Km`, label: `Metro ${label} < 25Km` }, { key: `Metro ${label} > 25Km`, label: `Metro ${label} > 25Km` }];
            toCities = distanceArr.concat(toCities);
        }
        setToCitiesOptions(toCities);
    }

    const assetTypeOptions = _map(assetTypeList, (item => ({ key: item.recordTypeId, label: item.name })));

    return (
        <div className="transport-calc">
            <Card className="p-3">
                <h2>Transport Calculator</h2>
                <FormikForm noValidate autoComplete="off" className="row">
                    <Field component={SelectField} name="assetType" label="AssetType" placeholder="All" options={assetTypeOptions} className="dropdown col-md-3" />
                    <Field component={SelectField} name="fromLocation" label="From Location" placeholder="All" onChange={onChange} options={fromCitiesOptions} className="dropdown col-md-3" />
                    <Field component={SelectField} name="toLocation" label="To Location" placeholder="All" options={toCitiesOptions} className="dropdown col-md-3" />
                    <div className="col-md-2">
                        <Button variant="primary" type="submit" onClick={onSubmit} className="pull-right mt-3">Submit</Button>
                    </div>
                </FormikForm>
            </Card >

            <div className="row my-3 mx-0">
                <Card className="col-12 overflow-auto">
                    {(transportFee && transportFee.length === 0 &&
                        <NoResults />
                    )}
                    <Visible when={transportFee && transportFee.length}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Asset Type</th>
                                    <th>From Location</th>
                                    <th>To Location</th>
                                    <th>Approx. Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transportFee && transportFee.map((transport) => {
                                    return (<tr key={transport.transportFeeId}>
                                        <td>{removeNumber(transport.assetCategory.name)}</td>
                                        <td> {transport.fromCity.name}</td>
                                        <td> {_get(transport.toCity, 'name') || transport.distance}</td>
                                        <td>{transport.approximatePrice}</td>
                                    </tr>)
                                })}
                            </tbody>
                        </Table>
                        <div className="disclaimer">
                            <strong>Disclaimer:</strong>
                            <p className="disclaimer-text">Slattery Auctions transport calculator applies only to the transportation of standard passenger sedans, wagons and light commercial vehicles, with no modifications, that have been purchased from Slattery Auctions. Truck prices are a guide price only and will depend on size weight and final dimensions.</p>
                            <strong>* Please note: All distances are calculated from the Slattery Auction location at which the vehicle is purchased.</strong>
                        </div>
                    </Visible>
                </Card>
            </div>
        </div>
    );
};

const TransportCalculator = withFormik({
    mapPropsToValues: ({
        assetType = '', fromLocation = '', toLocation = '' }) => {
        return {
            assetType,
            fromLocation,
            toLocation
        };
    }
})(Component);

export default TransportCalculator;
