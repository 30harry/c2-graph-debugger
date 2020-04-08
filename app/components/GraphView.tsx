import React from 'react';
import { Link } from 'react-router-dom';
import styles from './GraphView.css';
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

const Line = props => {
  // we get the rendering context by comsuming the React context
  const renderingContext = React.useContext(SharingContext);
  if (renderingContext !== null) {
    renderingContext.moveTo(props.from.x, props.from.y);
    renderingContext.lineTo(props.to.x, props.to.y);
    renderingContext.strokeStyle = props.style;
    renderingContext.stroke();
  }
  return null;
};

const Background = props => {
  // we get the rendering context by comsuming the React context
  const renderingContext = React.useContext(SharingContext);
  if (renderingContext !== null) {

    //get DPI
    let dpi = window.devicePixelRatio;
    //get canvas
    let canvas = renderingContext.canvas;//document.getElementById('myCanvas');
    //get context
    let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2) * dpi;
    //get CSS width
    let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2) * dpi;
    //scale the canvas
    canvas.setAttribute('height', style_height);
    canvas.setAttribute('width', style_width);

    const { width, height} = renderingContext.canvas.getBoundingClientRect();
    renderingContext.beginPath();
    renderingContext.fillStyle = props.color;
    renderingContext.fillRect(0, 0, style_width, style_height);

    renderingContext.moveTo(0,0);
    renderingContext.lineTo(style_width, style_height);
    renderingContext.strokeStyle = 'red';
    renderingContext.stroke();
    renderingContext.moveTo(0,style_height);
    renderingContext.lineTo(style_width, 0);
    renderingContext.strokeStyle = 'blue';
    renderingContext.stroke();
  }
  return null;
};


const GraphNode = props => {
  // we get the rendering context by comsuming the React context
  const renderingContext = React.useContext(SharingContext);
  if (renderingContext !== null) {
    renderingContext.beginPath();
    renderingContext.fillStyle = props.boxColor;
    renderingContext.fillRect(props.x, props.y, props.width, props.height);
    renderingContext.font = '50px serif';
    renderingContext.fillStyle = props.textColor;
    renderingContext.fillText(props.name, props.x, props.y + props.height);
  }
  return null;
};


export default function GraphView(props: Props) {
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
      <Canvas>
        <Background color='white'/>
        {[
          {
            x: 100, y: 300,
            width: 100, height: 50,
            boxColor: 'red',
            textColor: 'white',
            name: 'test1'
          },

          {
            x: 60, y: 400,
            width: 100, height: 50,
            boxColor: 'green',
            textColor: 'yellow',
            name: 'test2'
          }
        ].map(graphNode => (
          <GraphNode {...graphNode}/>
        ))}
      </Canvas>
    </div>
  );
}
