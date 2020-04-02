import { Action } from 'redux';
import * as projectTypes from './projecttypes';
import * as projectActions from '../actions/project';

const initialState: projectTypes.ProjectState = {
  rawlines: [],
  filename: 'data/test',
  nodes: [],
  uniqueTypeColoringMap: {},
  selectedNodeId: ''
};

export default function project(
  state = initialState,
  action: projectTypes.ProjectActionTypes
) {
  switch (action.type) {
    case projectActions.LOAD_PROJECT_DATA_SUCCESS:
      return { ...state, rawlines: action.rawlines, nodes: [] };
    case projectActions.PROCESS_PROJECT_DATA_SUCCESS:
        return { ...state, nodes: action.nodes, uniqueNodeColoringMap: action.uniqueNodeColoringMap, uniqueTypeColoringMap: action.uniqueTypeColoringMap };
    default:
      return state;
  }
}
