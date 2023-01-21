import AssetWatchers from './AssetWatchers';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi, setLoading } from '../../../actions/app';
import { getAssetWatchers } from '../../../utils/api';

const mapStateToProps = (state) => {
    return {}
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    setLoading,
    getAssetWatchers: secureApi(getAssetWatchers, true)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AssetWatchers);