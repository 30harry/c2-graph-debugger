import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TextView.css';
import routes from '../constants/routes.json';

type Props = {
  loadProject: (filename: string) => void;
  loadProjectFromClipBoard: () => void;
  rawlines: string[];
  filename: string;
  uniqueNodeColoringMap: any;
  uniqueTypeColoringMap: any;
  selectedNodeId: string;
};

function createButton(node, nodeColor, typeColor) {
  if (node.type == "null") {
    const typeDivStyle = { backgroundColor: typeColor.color, width: "100%", float: 'left',  paddingTop: "3px", paddingBottom: "3px"};
    const typeFontColor = typeColor.complimentary;
    return <button className={styles.nodeUnkBtn}><div style={typeDivStyle}><font color={typeFontColor}>{node.type}</font></div></button>;
  }
  if (node.type == "unknown") {
    const nodeDivStyle = { backgroundColor: nodeColor.color, width: "100%", float: 'left',  paddingTop: "3px", paddingBottom: "3px"};
    const nodeFontColor = nodeColor.complimentary;
    return <button className={styles.nodeUnkBtn}><div style={nodeDivStyle}><font color={nodeFontColor}>{node.id}</font></div></button>;
  }
  const nodeDivStyle = { backgroundColor: nodeColor.color, width: "30%", float: 'left', paddingTop: "3px", paddingBottom: "3px"};
  const nodeFontColor = nodeColor.complimentary;
  const typeDivStyle = { backgroundColor: typeColor.color, width: "70%", float: 'right', paddingTop: "3px", paddingBottom: "3px"};
  const typeFontColor = typeColor.complimentary;
  return <button className={styles.nodeBtn}><div style={nodeDivStyle}><font color={nodeFontColor}>{node.id}</font></div><div style={typeDivStyle}><font color={typeFontColor}>{node.type}</font></div></button>;
}

export default function TextView(props: Props) {
  const { loadProject, loadProjectFromClipBoard, rawlines, nodes, filename, uniqueNodeColoringMap, uniqueTypeColoringMap, selectedNodeId } = props;
  return (
    <div className={styles.appPage}>
      <div className={styles.btnGroup}>
        <div className={styles.backButton} data-tid="backButton">
          <Link to={routes.HOME}>
            <i className="fa fa-arrow-left fa-3x" />
          </Link>
        </div>
        <button
          className={styles.btn}
          onClick={() => loadProject(filename)}
          data-tclass="btn"
          type="button"
        >
          Load Test Data
        </button>
        <button
          className={styles.btn}
          onClick={() => loadProjectFromClipBoard()}
          data-tclass="btn"
          type="button"
        >
          Load Data From Clipboard
        </button>
      </div>
      <div className={styles.tableFixHead}>
        <table>
          <col width="100px"/>
          <col width="50%"/>
          <col width="50%"/>
          <thead>
            <tr>
              <th>Id</th>
              {/*<th>Type</th>*/}
              <th>InEdges</th>
              {/*<th>SpecialInEdges</th>*/}
              <th>OutEdges</th>
              {/*<th>Details</th>*/}
            </tr>
          </thead>
          <tbody>
            {nodes.map((node, index) => {
              const focusIdentifier = (node.focusNode) ? ">" : "";
              const typeColor = uniqueTypeColoringMap[node.type];
              const nodeColor = uniqueNodeColoringMap[node.id];
              return <tr>
                <td>{focusIdentifier}{createButton(node, nodeColor, typeColor)}</td>
                {/*<td bgcolor={typeColor.color}><font color={typeColor.complimentary}>{node.type}</font></td>*/}
                <td>{node.inEdges.map((edge, index) => {
                  const edgeColor = edge.id in uniqueNodeColoringMap ? uniqueNodeColoringMap[edge.id] : {color: '#FFFFFF', complimentary: '#000000'};
                  return createButton(edge, edgeColor, uniqueTypeColoringMap[edge.type])
                })}</td>
                {/*<td>{node.specialInEdges.map((edge, index) => {
                  const edgeColor = edge.id in uniqueNodeColoringMap  ? uniqueNodeColoringMap[edge.id] : {color: '#FFFFFF', complimentary: '#000000'};
                  return createButton(edge, edgeColor, uniqueTypeColoringMap[edge.type])
                })}</td>*/}
                <td>{node.outEdges.map((edge, index) => {
                  const edgeColor = edge.id in uniqueNodeColoringMap  ? uniqueNodeColoringMap[edge.id] : {color: '#FFFFFF', complimentary: '#000000'};
                  return createButton(edge, edgeColor, uniqueTypeColoringMap[edge.type])
                })}</td>
                {/*<td>{node.details}</td>*/}
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
