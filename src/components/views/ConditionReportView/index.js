import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ConditionReportView from './ConditionReportView';
import { generateConditionReport } from '../../../utils/api'
import { secureApi } from "../../../actions/app";

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    generateConditionReport: secureApi(generateConditionReport)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ConditionReportView);
