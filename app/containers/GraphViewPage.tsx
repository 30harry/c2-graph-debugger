import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import GraphView from '../components/GraphView';

import { loadProject, loadProjectFromClipBoard } from '../actions/project';
import { ProjectState } from '../reducers/projecttypes';
import { stat } from 'fs';

function mapStateToProps(state) {
  return {
    rawlines: state.project.rawlines,
    filename: state.project.filename,
    nodes: state.project.nodes,
    uniqueTypeColoringMap: state.project.uniqueTypeColoringMap,
    uniqueNodeColoringMap: state.project.uniqueNodeColoringMap,
    selectedNodeId: state.project.selectedNodeId
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      loadProject,
      loadProjectFromClipBoard
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(GraphView);
