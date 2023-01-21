import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _get from 'lodash/get';
import { setSearchValues, setAdvancedSearchState } from "../../../actions/advanceSearch";

import SearchBox from './SearchBox';

const mapStateToProps = (state) => {
    const isAdvSearchOpen = _get(state, 'advanceSearch.advanceSearchOpen');
    const searchValues = _get(state, 'advanceSearch.searchValues') || { searchQuery: '' };
    return {
        searchValues,
        isAdvSearchOpen
    };
};

const mapDispatachToProps = (dispatch) => bindActionCreators({
    setSearchValues,
    setAdvancedSearchState
}, dispatch);


export default connect(mapStateToProps, mapDispatachToProps)(SearchBox);