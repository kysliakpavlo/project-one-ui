import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getTransportFee } from "../../../utils/api";
import { secureApi } from "../../../actions/app";
import { showMessage } from "../../../actions/toast";
import TransportCalculator from "./TransportCalculator";
import TransportCalculatorTableComponent from "./TransportCalculatorTable";

const mapSTP = () => ({});

const mapDTP = (dispatch) =>
  bindActionCreators(
    {
      showMessage,
      getTransportFee: secureApi(getTransportFee),
    },
    dispatch
  );

export const TransportCalculatorTable = connect(
  mapSTP,
  mapDTP
)(TransportCalculatorTableComponent);

export default TransportCalculator;
