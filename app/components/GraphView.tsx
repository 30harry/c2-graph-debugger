import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './GraphView.css';
import routes from '../constants/routes.json';

type Props = {
  loadProject: (filename: string) => void;
  loadProjectFromClipBoard: () => void;
  rawlines: string[];
  nodes: any[];
  filename: string;
  uniqueNodeColoringMap: any;
  uniqueTypeColoringMap: any;
  selectedNodeId: string;
};

const Canvas = props => {
  const canvasRef = React.useRef(null);
  const [renderingContext, setRenderingContext] = React.useState(null);
  // the canvas rendering context is not immediately avalaible
  // as the canvas node first needs to be added to the DOM by react
  React.useEffect(() => {
    const context2d = canvasRef.current.getContext('2d');
    setRenderingContext(context2d);
  }, []);
  return (
    <SharingContext.Provider value={renderingContext}>
      <canvas ref={canvasRef} />
      {/* the hexagons are passed through the `children` prop */}
      {props.children}
    </SharingContext.Provider>
  );
};

const SharingContext = React.createContext(null);

function renderLine(renderingContext, color, x0, y0, x1, y1, width = 10) {
  if (renderingContext != null) {
    renderingContext.moveTo(x0, y0);
    renderingContext.lineTo(x1, y1);
    renderingContext.strokeStyle = color;
    renderingContext.lineWidth = width;
    renderingContext.stroke();
  }
}

function drawArrowhead(ctx, x, y, radians, size = 20) {
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.rotate(radians);
  ctx.moveTo(0, 0);
  ctx.lineTo(size / 3, size);
  ctx.lineTo(-(size / 3), size);
  ctx.closePath();
  ctx.restore();
  ctx.fill();
}

function renderArrow(ctx, color, x1, y1, x2, y2, width = 3) {
  // draw the line
  ctx.fillStyle = color;
  renderLine(ctx, color, x1, y1, x2, y2, width);

  // draw the starting arrowhead
  // let startRadians = Math.atan((y2 - y1) / (x2 - x1));
  // startRadians += ((x2 >= x1 ? -90 : 90) * Math.PI) / 180;
  // drawArrowhead(ctx, x1, y1, startRadians);

  // draw the ending arrowhead
  let endRadians = Math.atan((y2 - y1) / (x2 - x1));
  endRadians += ((x2 >= x1 ? 90 : -90) * Math.PI) / 180;
  drawArrowhead(ctx, x2, y2, endRadians);
}

const Line = props => {
  // we get the rendering context by comsuming the React context
  const renderingContext = React.useContext(SharingContext);
  const { style, from, to } = props;
  renderLine(renderingContext, style, from.x, from.y, to.x, to.y);
  return null;
};

function renderBox(renderingContext, color, x, y, width = 100, height = 100) {
  if (renderingContext != null) {
    renderingContext.beginPath();
    renderingContext.fillStyle = color;
    renderingContext.fillRect(x, y, width, height);
  }
}

function renderTextBox(renderingContext, x, y, text, width = 100, height = 100, textColor = 'yellow', boxColor = 'blue', anchorX = 0, anchorY = 0) {
  if (renderingContext != null) {
    renderBox(renderingContext, boxColor, x, y, width, height);
    renderingContext.fillStyle = textColor;
    renderingContext.fillText(text, x + anchorX, y + anchorY);
  }
}

function renderPoint(renderingContext, x, y, style = 'red', radius = 40) {
  if (renderingContext != null) {
    renderingContext.moveTo(x - radius, y);
    renderingContext.lineTo(x + radius, y);
    renderingContext.strokeStyle = style;
    renderingContext.stroke();
    renderingContext.moveTo(x, y - radius);
    renderingContext.lineTo(x, y + radius);
    renderingContext.strokeStyle = style;
    renderingContext.stroke();
  }
}

function fixCanvasScaling(renderingContext) {
  if (renderingContext !== null) {
    // get DPI
    const dpi = window.devicePixelRatio;
    // get canvas
    const canvas = renderingContext.canvas;
    // get context
    const styleHeight = +getComputedStyle(canvas).getPropertyValue('height').slice(0, -2) * dpi;
    // get CSS width
    const styleWidth = +getComputedStyle(canvas).getPropertyValue('width').slice(0, -2) * dpi;
    // scale the canvas
    canvas.setAttribute('height', styleHeight);
    canvas.setAttribute('width', styleWidth);
  }
}

function estimateCanvasSize(renderingContext) {
  if (renderingContext !== null) {
    // get DPI
    const dpi = window.devicePixelRatio;
    // get canvas
    const { canvas } = renderingContext;
    if (canvas !== null) {
      // get context
      const styleHeight =
        +getComputedStyle(canvas)
          .getPropertyValue('height')
          .slice(0, -2) * dpi;
      // get CSS width
      const styleWidth =
        +getComputedStyle(canvas)
          .getPropertyValue('width')
          .slice(0, -2) * dpi;
      return { width: styleWidth, height: styleHeight };
    }
  }
  return { width: 0, height: 0 };
}

function getCanvasSize(renderingContext) {
  if (renderingContext !== null) {
    const { canvas } = renderingContext;
    if (canvas !== null) {
      const width = canvas.getAttribute('width');
      const height = canvas.getAttribute('height');
      return { width, height };
    }
  }
  return { width: 0, height: 0 };
}

const Background = props => {
  // we get the rendering context by comsuming the React context
  const renderingContext = React.useContext(SharingContext);
  fixCanvasScaling(renderingContext);
  const { width: canvasWidth, height: canvasHeight } = getCanvasSize(
    renderingContext
  );
  renderBox(renderingContext, 'white', 0, 0, canvasWidth, canvasHeight);
  return null;
};

function calcTextSize(renderingContext, text) {
  if (renderingContext !== null) {
    const {
      actualBoundingBoxAscent,
      actualBoundingBoxDescent,
      width
    } = renderingContext.measureText(text);
    return {
      baseline: actualBoundingBoxAscent,
      height: actualBoundingBoxAscent + actualBoundingBoxDescent,
      width
    };
  }
  return { baseline: 0, height: 0, width: 0 };
}

function setFont(renderingContext, font) {
  if (renderingContext !== null) {
    renderingContext.font = font;
  }
}

const GraphNode = props => {
  // we get the rendering context by comsuming the React context
  const renderingContext = React.useContext(SharingContext);
  const {
    font,
    id,
    type,
    nodePositions,
    uniqueNodeColoringMap,
    uniqueTypeColoringMap
  } = props;
  setFont(renderingContext, font);
  // renderPoint (renderingContext, props.x, props.y, 'red', 200)
  const { width: canvasWidth, height: canvasHeight } = getCanvasSize(
    renderingContext
  );
  const {
    baseline: idBaseline,
    height: idHeight,
    width: idWidth
  } = calcTextSize(renderingContext, id);
  const {
    baseline: nameBaseline,
    height: nameHeight,
    width: nameWidth
  } = calcTextSize(renderingContext, type);
  let height = idHeight > nameHeight ? idHeight : nameHeight;
  const padding = Math.floor(height * 0.3);
  height += padding * 2;
  const leftWidth = idWidth + padding * 2;
  const rightWidth = nameWidth + padding * 2;
  const position = nodePositions[id];
  const offsetX = position.x * canvasWidth - (leftWidth + rightWidth) / 2;
  const offsetY = position.y * canvasHeight - height / 2;
  const idAnchorX = padding;
  const idAnchorY = padding + idBaseline;
  const nameAnchorX = padding;
  const nameAnchorY = padding + nameBaseline;
  const anchorY = idAnchorY > nameAnchorY ? idAnchorY : nameAnchorY;
  const idColor = uniqueNodeColoringMap[id];
  const nameColor = uniqueTypeColoringMap[type];
  renderTextBox(
    renderingContext,
    offsetX,
    offsetY,
    id,
    leftWidth,
    height,
    idColor.complimentary,
    idColor.color,
    idAnchorX,
    anchorY
  );
  renderTextBox(
    renderingContext,
    offsetX + leftWidth,
    offsetY,
    type,
    rightWidth,
    height,
    nameColor.complimentary,
    nameColor.color,
    nameAnchorX,
    anchorY
  );

  return null;
};

const GraphNodeConnections = props => {
  // we get the rendering context by comsuming the React context
  const renderingContext = React.useContext(SharingContext);
  const { id, nodePositions, inEdges, outEdges } = props;
  // renderPoint (renderingContext, props.x, props.y, 'red', 200)
  const { width: canvasWidth, height: canvasHeight } = getCanvasSize(
    renderingContext
  );
  const position = nodePositions[id];

  if (true) {
    // draw input edges
    inEdges.forEach(edge => {
      if (edge.id !== id && edge.id in nodePositions) {
        const otherNodePosition = props.nodePositions[edge.id];
        renderArrow(renderingContext, 'black',
          otherNodePosition.x * canvasWidth,
          otherNodePosition.y * canvasHeight,
          position.x * canvasWidth,
          position.y * canvasHeight
        );
      }
    });
  }

  return null;
};

function random(low,high) {
  return low + (Math.random() * (high - low))
}

function layoutNodes(nodes, method = 'random') {

  console.log(`layout mode is ${method}`)
  const layout = {};
  if (method === 'random') {
    nodes.forEach(node => {
      layout[node.id] = {x: random(0.05, 0.95), y: random(0.05, 0.95)}
    });
  } else if (method == 'grid') {
    const numNodes = nodes.length;
    let numColumns = Math.round(Math.sqrt(numNodes)) + 1;
    const delta = 1 / numColumns;
    numColumns -= 1;
    nodes.forEach((node, index) => {
      const row = (Math.floor(index / numColumns)) + 1;
      const col = (index % numColumns) + 1;
      layout[node.id] = {x: col * delta, y: row * delta}
    });
  } else if (method == 'proto_1') {

    // display 3 groups (ignore self-references)
    //    nodes with only outputs
    //    nodes with both
    //    nodes with only inputs
    const nodesWithOnlyOut = [];
    const nodesWithBoth = [];
    const nodesWithOnlyIn = [];
    const nodesWithNeither = [];

    const nodeIds = nodes.map(node => node.id);

    nodes.forEach(node => {
      const inputs = node.inEdges.filter(edge => {
        return edge.id !== node.id && nodeIds.includes(edge.id);
      });
      const outputs = node.outEdges.filter(edge => {
        return edge.id !== node.id && nodeIds.includes(edge.id);
      });
      if (inputs.length > 0) {
        if (outputs.length > 0) {
          nodesWithBoth.push(node);
        } else {
          nodesWithOnlyIn.push(node);
        }
      } else if (outputs.length > 0) {
        nodesWithOnlyOut.push(node);
      } else {
        nodesWithNeither.push(node);
      }
    });

    nodesWithOnlyOut.forEach(node => {
      layout[node.id] = {x: random(0.05, 0.95), y: random(0.05, 0.25)}
    });

    nodesWithBoth.forEach(node => {
      layout[node.id] = {x: random(0.05, 0.95), y: random(0.45, 0.65)}
    });

    nodesWithOnlyIn.forEach(node => {
      layout[node.id] = {x: random(0.05, 0.95), y: random(0.75, 0.95)}
    });

  } else if (method == 'proto_2') {

    nodes.forEach(node => {
      layout[node.id] = {x: random(0.05, 0.95), y: random(0.05, 0.95)}
    });

    // quick lookup to see if node is known
    const nodeIds = nodes.map(node => node.id);

    // remove references to nodes we dont know about, self-references and
    nodes = nodes.map(node => {

      const validInputs = node.inEdges.filter((edge, index) => {
        return node.inEdges.indexOf(edge) === index
      }).filter(edge => {
        return edge.id !== node.id && nodeIds.includes(edge.id);
      });

      const validOutputs = node.outEdges.filter((edge, index) => {
        return node.outEdges.indexOf(edge) === index
      }).filter(edge => {
        return edge.id !== node.id && nodeIds.includes(edge.id);
      });
      return {...node, inEdges:validInputs, outEdges:validOutputs};
    });

    const nodeMap = {};
    nodes.forEach(node => nodeMap[node.id] = node );

    // determine number of graphs
    let graphs = [];
    nodes.forEach(node => {
      // find a graph that contains either one of our input edges or output edges
      const ourGraphs = graphs.filter(graph => {
          return (node.inEdges.filter(edge => graph.includes(edge.id)).length > 0) ||
                 (node.outEdges.filter(edge => graph.includes(edge.id)).length > 0)
        })

      // new graph
      let newGraph = [node.id];
      // combine with graphs we are referenced by
      ourGraphs.forEach(graph => {
        newGraph = newGraph.concat(graph);
      });
      // remove those referenced graphs
      graphs = graphs.filter(graph => !ourGraphs.includes(graph));
      // push the new graph
      graphs.push(newGraph);
    });

    // order graphs into columns
    const graphWidth = 0.9 / graphs.length;
    graphs.forEach((graph, column) => {

      const depths = {};
      graph.forEach(id => {
        calculateDepth(nodeMap[id], depths, nodeMap)
      });

      // group by depth
      let maxColumns = 0;
      const depthGroups = {};
      for (const id in depths) {
        const depth = depths[id];
        if (depth in depthGroups) {
          depthGroups[depth].push(id);
        } else {
          depthGroups [depth] = [id];
        }
        if (depthGroups[depth].length > maxColumns)
        {
          maxColumns = depthGroups[depth].length;
        }
      }

      // create depth array
      let depthGroupArray = Object.keys(depthGroups);
      depthGroupArray = depthGroupArray.sort((a, b) => a < b);

      //const subColumnWidth = graphWidth / maxColumns;
      depthGroupArray.forEach((depth, row) => {
        const depthGroup = depthGroups[depth];

        const subColumnWidth = graphWidth / depthGroup.length;
        depthGroup.forEach((id, subColumn) => {
          const x = 0.05 + (graphWidth * column) + (subColumnWidth * subColumn);
          const y = 0.05 + ((0.9 / depthGroupArray.length) * row);
          layout[id] = {x: x, y: y}
        })
      });
    });
  }

  return layout;
}

function calculateDepth(node, depths, nodeMap) {
  if (node.id in depths) {
    return depths[node.id];
  }
  let inEdgeDepth = -1;
  node.inEdges.forEach(edge => {
    const edgeDepth = calculateDepth(nodeMap[edge.id], depths, nodeMap);
    if (edgeDepth > inEdgeDepth) {
      inEdgeDepth = edgeDepth;
    }
  });
  const depth = inEdgeDepth + 1;
  depths[node.id] = depth;
  return depth;
}

export default function GraphView(props: Props) {
  const {
    loadProject,
    loadProjectFromClipBoard,
    nodes,
    filename,
    uniqueNodeColoringMap,
    uniqueTypeColoringMap
  } = props;

  const [layoutMethod, setLayoutMethod] = useState('grid');
  const handleChange = event => {
    setLayoutMethod(event.target.value);
  };

  const nodePositions = layoutNodes(nodes, layoutMethod);

  const layoutMethods = ['random', 'grid', 'proto_1', 'proto_2'];

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
        {
          layoutMethods.map(method => (
            <div className={styles.radio}>
            <label>
              <input type="radio" value={method} checked={layoutMethod === method} onChange={handleChange} />
                {method}
            </label>
          </div>
          ))}
      </div>
      <Canvas id="myCanvas">
        <Background color="white" />
        {nodes.map(node => (
          <GraphNode
            key={node.id}
            font="34px Courier"
            {...node}
            uniqueNodeColoringMap={uniqueNodeColoringMap}
            uniqueTypeColoringMap={uniqueTypeColoringMap}
            nodePositions={nodePositions}
          />
        ))}
        {nodes.map(node => (
          <GraphNodeConnections
            key={node.id}
            {...node}
            nodePositions={nodePositions}
          />
        ))}
      </Canvas>
    </div>
  );
}
