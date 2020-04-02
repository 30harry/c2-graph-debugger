import { ActionBase } from './types';

export type GraphNode = {
  id: string;
  type: string;
  inEdges: GraphEdge[];
  specialInEdges: GraphEdge[];
  outEdges: GraphEdge[];
  details: string;
  focusNode: boolean;
}

export type GraphEdge = {
  id: string;
  type: string;
}

export interface ProjectState {
  rawlines: string[];
  filename: string;
  nodes: GraphNode[];
  uniqueTypeColoringMap: any;
  string: selectedNodeId;
}

interface LoadProjectAction {
  type: string;
  filename: string;
}

interface LoadProjectFromClipboardAction {
  type: string;
}

interface LoadProjectLoadingAction {
  type: string;
}

interface LoadProjectSuccessAction {
  type: string;
  rawlines: string[];
}

interface LoadProjectFailedAction {
  type: string;
}

interface ProcessProjectAction {
  type: string;
  rawlines: string[];
}

interface ProcessProjectProcessingAction {
  type: string;
}

interface ProcessProjectSuccessAction {
  type: string;
  nodes: GraphNode[];
  uniqueTypeColoringMap: any;
}

interface ProcessProjectFailedAction {
  type: string;
}

export type ProjectActionTypes =
  | ProcessProjectAction
  | ProcessProjectProcessingAction
  | ProcessProjectSuccessAction
  | ProcessProjectFailedAction
  | LoadProjectFromClipboardAction
  | LoadProjectAction
  | LoadProjectLoadingAction
  | LoadProjectSuccessAction
  | LoadProjectFailedAction;
