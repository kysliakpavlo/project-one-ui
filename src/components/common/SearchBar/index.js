import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _get from 'lodash/get';

import { loadSubCategories, loadManufacturers, loadModels } from "../../../actions/app";
import { setSearchValues, setAdvancedSearchState } from "../../../actions/advanceSearch"

import SearchBar from './SearchBar';

const mapStateToProps = (state) => {
    const searchValues = _get(state, 'advanceSearch.searchValues')
    const isAdvSearchOpen = _get(state, 'advanceSearch.advanceSearchOpen');
    const categories = _get(state, "app.categories", []);
    const locations = _get(state, "app.locations", []);
    const auctionTypes = _get(state, "app.auctionTypes", []);

    return {
        locations,
        categories,
        auctionTypes,
        searchValues,
        isAdvSearchOpen
    };
};

const mapDispatachToProps = (dispatch) => bindActionCreators({
    loadSubCategories,
    loadManufacturers,
    loadModels,
    setSearchValues,
    setAdvancedSearchState
}, dispatch);


export default connect(mapStateToProps, mapDispatachToProps)(SearchBar);