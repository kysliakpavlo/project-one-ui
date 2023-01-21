import BuyerCard from "./BuyerCard";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { toggleLogin } from '../../../actions/auth';
import { secureApi } from "../../../actions/app";
import { getAccount, getAuctionDetails } from "../../../utils/api";

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    getAccount: secureApi(getAccount),
    getAuctionDetails: secureApi(getAuctionDetails)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(BuyerCard);
