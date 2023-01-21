import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import BidderHistories from "./BidderHistories";
import { secureApi } from "../../../actions/app";
import { getBidderHistory, deleteBid } from "../../../utils/api";
import { setLoading } from "../../../actions/app";
import { showMessage } from "../../../actions/toast";
const mapSTP = () => ({});

const mapDTP = (dispatch) =>
  bindActionCreators(
    {
      setLoading,
      showMessage,
      deleteBid: secureApi(deleteBid),
      getBidderHistory: secureApi(getBidderHistory),
    },
    dispatch
  );

export default connect(mapSTP, mapDTP)(BidderHistories);
