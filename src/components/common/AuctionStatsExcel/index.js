import AuctionStatsExcel from "./AuctionStatsExcel";
import { secureApi } from '../../../actions/app';
import { searchAssets } from '../../../utils/api';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const mapSTP = () => ({});

const mapDTP = (dispatch) => bindActionCreators({
    searchAssets: secureApi(searchAssets)
}, dispatch);

export default connect(mapSTP, mapDTP)(AuctionStatsExcel);
