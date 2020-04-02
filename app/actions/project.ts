import { GetState, Dispatch } from '../reducers/types';
import { ProjectActionTypes } from '../reducers/projecttypes';

export const LOAD_PROJECT_DATA = 'LOAD_PROJECT_DATA';
export const LOAD_PROJECT_DATA_FROM_CLIPBOARD = 'LOAD_PROJECT_DATA_FROM_CLIPBOARD';
export const LOAD_PROJECT_DATA_LOADING = 'LOAD_PROJECT_DATA_LOADING';
export const LOAD_PROJECT_DATA_SUCCESS = 'LOAD_PROJECT_DATA_SUCCESS';
export const LOAD_PROJECT_DATA_FAILED = 'LOAD_PROJECT_DATA_FAILED';
export const PROCESS_PROJECT_DATA = 'PROCESS_PROJECT_DATA';
export const PROCESS_PROJECT_DATA_PROCESSING = 'PROCESS_PROJECT_DATA_PROCESSING';
export const PROCESS_PROJECT_DATA_SUCCESS = 'PROCESS_PROJECT_DATA_SUCCESS';
export const PROCESS_PROJECT_DATA_FAILED = 'PROCESS_PROJECT_DATA_FAILED';

export function loadProjectFromClipBoard(): ProjectActionTypes {
  return {
    type: LOAD_PROJECT_DATA_FROM_CLIPBOARD
  };
}

export function loadProject(filename: string): ProjectActionTypes {
  return {
    type: LOAD_PROJECT_DATA,
    filename
  };
}

export function loadProjectLoading(): ProjectActionTypes {
  return {
    type: LOAD_PROJECT_DATA_LOADING
  };
}

export function loadProjectSuccess(rawlines: string[]): ProjectActionTypes {
  return {
    type: LOAD_PROJECT_DATA_SUCCESS,
    rawlines
  };
}

export function loadProjectFailed(): ProjectActionTypes {
  return {
    type: LOAD_PROJECT_DATA_FAILED
  };
}
export function processProject(rawlines: string[]): ProjectActionTypes {
  return {
    type: PROCESS_PROJECT_DATA,
    rawlines
  };
}

export function processProjectProcessing(): ProjectActionTypes {
  return {
    type: PROCESS_PROJECT_DATA_PROCESSING
  };
}

export function processProjectSuccess(nodes: GraphNode[], uniqueNodeColoringMap: any, uniqueTypeColoringMap: any): ProjectActionTypes {
  return {
    type: PROCESS_PROJECT_DATA_SUCCESS,
    nodes,
    uniqueNodeColoringMap,
    uniqueTypeColoringMap
  };
}

export function processProjectFailed(): ProjectActionTypes {
  return {
    type: PROCESS_PROJECT_DATA_FAILED
  };
}
