import * as electron from 'electron';
import fs from 'fs';
import * as projectActions from '../actions/project';
import * as projectTypes from '../reducers/projecttypes';


/**
 * HSV to RGB color conversion
 *
 * https://jsfiddle.net/aldass/9f0yadfy/
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 *
 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 */
function hsvToRgb(h, s, v) {
  var r, g, b;
  var i;
  var f, p, q, t;

  // Make sure our arguments stay in-range
  h = Math.max(0, Math.min(360, h));
  s = Math.max(0, Math.min(100, s));
  v = Math.max(0, Math.min(100, v));

  // We accept saturation and value arguments from 0 to 100 because that's
  // how Photoshop represents those values. Internally, however, the
  // saturation and value are calculated from a range of 0 to 1. We make
  // That conversion here.
  s /= 100;
  v /= 100;

  if (s == 0) {
    // Achromatic (grey)
    r = g = b = v;
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  h /= 60; // sector 0 to 5
  i = Math.floor(h);
  f = h - i; // factorial part of h
  p = v * (1 - s);
  q = v * (1 - s * f);
  t = v * (1 - s * (1 - f));

  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;

    case 1:
      r = q;
      g = v;
      b = p;
      break;

    case 2:
      r = p;
      g = v;
      b = t;
      break;

    case 3:
      r = p;
      g = q;
      b = v;
      break;

    case 4:
      r = t;
      g = p;
      b = v;
      break;

    default: // case 5:
      r = v;
      g = p;
      b = q;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

function randomColor () {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);

  return [r, g, b];
}

/**
 * Generate distinct RGB colors
 *
 * https://jsfiddle.net/aldass/9f0yadfy/
 *
 * t is the total number of colors
 * you want to generate.
 */
function rgbColors (t) {
  t = parseInt(t);
  if (t == 0) {
    return [];
  } else if (t == 1) {
    const randColor = randomColor();
    return [{color:randColor, complimentary:rgbToComplimentary(randColor)}];
  }

  // distribute the colors evenly on
  // the hue range (the 'H' in HSV)
  var i = 360 / (t - 1);

  // hold the generated colors
  var r = [];
  var sv = 70;
  for (var x = 0; x < t; x++) {
    // alternate the s, v for more
    // contrast between the colors.
    sv = sv > 90 ? 70 : sv+10;
    const color = hsvToRgb(i * x, sv, sv);
    r.push({color: color, complimentary: rgbToComplimentary(color)});
  }
  //shuffleArray(r)
  return r;
};

function toPaddedHexString(num, len) {
  const str = (+num).toString(16).toUpperCase();
  return "0".repeat(len - str.length) + str;
}

function d2h(d) {
  return toPaddedHexString(d, 2);
}

function colorFromRGB (rgb) {
  return `#${d2h(rgb[0])}${d2h(rgb[1])}${d2h(rgb[2])}`;
}


function rgbToComplimentary(rgb){

  var r = rgb[0], g = rgb[1], b = rgb[2];

  // Convert RGB to HSL
  // Adapted from answer by 0x000f http://stackoverflow.com/a/34946092/4939630
  r /= 255.0;
  g /= 255.0;
  b /= 255.0;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2.0;

  if(max == min) {
      h = s = 0;  //achromatic
  } else {
      var d = max - min;
      s = (l > 0.5 ? d / (2.0 - max - min) : d / (max + min));

      if(max == r && g >= b) {
          h = 1.0472 * (g - b) / d ;
      } else if(max == r && g < b) {
          h = 1.0472 * (g - b) / d + 6.2832;
      } else if(max == g) {
          h = 1.0472 * (b - r) / d + 2.0944;
      } else if(max == b) {
          h = 1.0472 * (r - g) / d + 4.1888;
      }
  }

  h = h / 6.2832 * 360.0 + 0;

  // Shift hue to opposite side of wheel and convert to [0-1] value
  h+= 180;
  if (h > 360) { h -= 360; }
  h /= 360;

  // Convert h s and l values into r g and b values
  // Adapted from answer by Mohsen http://stackoverflow.com/a/9493060/4939630
  if(s === 0){
      r = g = b = l; // achromatic
  } else {
      var hue2rgb = function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      };

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);

  return [r, g, b];
}

// #217 CALLSTATICJAVA @(tuple:, bci: 5 36, line: 36) -> [ 218 (Proj) ]; # Static uncommon_trap(reason='null_check' action='maybe_recompile' debug_id='0')  void ( int ) C=0.000100 LoopReferencesNotEs
//    L[ 216 (IfFalse) 137 (Phi) 212 (MergeMem) 8 (Parm) 9 (Parm) 165 (ConI) 1 (Con) 1 (Con) 1 (Con) 1 (Con) 1 (Con) 1 (Con) 1 (Con) 1 (Con) 1 (Con) 50 (ConP) ]
const JitLogDataFormat = 'JitLogDataFormat';

// 863	RangeCheck	===  853  862  [[ 864  867 ]] P=0.999999, C=-1.000000  Type:{0:control, 1:control} !jvms: java.lang.Integer::valueOf @ bci:21 LoopReferencesNotEscaping$Wrapper::<init> @ bci:11 LoopReferencesNotEscaping::doTest @ bci:6
const NodeDumpDataFormat = 'NodeDumpDataFormat';

function ConvertDataIfNeeded(source) {

  let dataFormat = 'unknown';
  let possibly = '';
  source.every(line => {
    const parts = line.trim().split(/[ \t]+/);
     if (parts.length > 2) {
      if ((possibly == JitLogDataFormat) &&
          (parts[0] == 'L['))
      {
        dataFormat = JitLogDataFormat;
      }
      else if (parts[0].startsWith('#') &&
               parts[2].startsWith('@(')) {
        possibly = JitLogDataFormat;
      }
      else if (parts[2] == '===') {
        dataFormat = NodeDumpDataFormat;
      }
      else {
        possibly = '';
      }
    }
    return dataFormat == 'unknown';
  });

  if (dataFormat == JitLogDataFormat) {

    const newData = [];
    let mainLineTypeAndInputNodes = '';
    let mainLineOutputNodes= '';
    let mainLineTypeStuff = '';
    source.forEach(line => {
      const parts = line.trim().split(/[ \t]+/);
      if (mainLineTypeAndInputNodes == '') {

        mainLineOutputNodes= '';
        mainLineTypeStuff = '';

        // expect output edges #id TYPE @(stuff) -> [ NNN (Type) .... ]; morestuff
        if (parts[0].startsWith('#') && parts[2].startsWith('@(')) {
          mainLineTypeAndInputNodes = `${parts[0].substring(1)} ${parts[1]} === `;
          let next = 2;
          while (next < parts.length && parts[next] !== '->') {
            mainLineTypeStuff += ` ${parts[next]}`;
            next += 1;
          }
          if (parts[next] !== '->') {
            mainLineTypeAndInputNodes = '';
            return;
          }
          next += 2; // skip -> and [
          while (next < parts.length && parts[next] !== '];') {
            mainLineOutputNodes += ` ${parts[next]}`;
            if (parts[next + 1].startsWith('(')) {
              next += 2; // skip the type
            } else {
              next += 1;
            }
          }
          if (parts[next] !== '];') {
            mainLineTypeAndInputNodes = '';
            return;
          }
          next += 1; // skip ]
          while (next < parts.length) {
            mainLineTypeStuff += ` ${parts[next]}`;
            next += 1;
          }
        }
      }
      else {

        if (mainLineTypeAndInputNodes != '' && parts[0] == 'L['){

          // expect input ediges L[ _ | NNN (Type) ... ]
          let next = 1;

          while (parts[next] !== ']') {
            mainLineTypeAndInputNodes += ` ${parts[next]}`;
            if (parts[next + 1].startsWith('(')) {
              next += 2; // skip the type
            } else {
              next += 1;
            }
          }

          newData.push(`${mainLineTypeAndInputNodes} [[ ${mainLineOutputNodes} ]] ${mainLineTypeStuff}`)
        }
        mainLineTypeAndInputNodes = '';
      }
    });
    return newData;
  }
  return source;
}

// eslint-disable-next-line import/prefer-default-export
export const projectMiddleware = store => next => async action => {
  // call the next function
  const result = next(action);

  if (action.type === projectActions.LOAD_PROJECT_DATA) {
    store.dispatch(projectActions.loadProjectLoading());
    fs.readFile(action.filename, 'utf8', (error, data) => {
      if (error != null) {
        store.dispatch(projectActions.loadProjectFailed());
      } else {
        const textByLine = data.split('\n');
        store.dispatch(projectActions.loadProjectSuccess(textByLine));
      }
    });
  }

  if (action.type === projectActions.LOAD_PROJECT_DATA_FROM_CLIPBOARD) {
    store.dispatch(projectActions.loadProjectLoading());
    const textByLine = electron.clipboard.readText().split('\n');
    if (textByLine.length < 1) {
      store.dispatch(projectActions.loadProjectFailed());
    } else {
      store.dispatch(projectActions.loadProjectSuccess(textByLine));
    }
  }

  if (action.type === projectActions.LOAD_PROJECT_DATA_SUCCESS) {
    store.dispatch(projectActions.processProject(action.rawlines));
  }

  if (action.type === projectActions.PROCESS_PROJECT_DATA) {
    store.dispatch(projectActions.processProjectProcessing());

    const rawLines = ConvertDataIfNeeded(action.rawlines);
    const nodes = [];
    let uniqueTypes = [];
    rawLines.forEach(line => {
      const parts = line.trim().split(/[ \t]+/);
      let next = 0;
      if (parts.length > 4 && !isNaN(parts[next])) {

        const id = parts[next];
        next += 1;

        // check for focus character >
        let focusNode = false;
        if (parts[next] === '>') {
          focusNode = true;
          next += 1;
        }

        if (parts[next + 1] != '===') {
          // skip the row
          console.log('some bad data - skipping the line: ' + parts[next + 1]);
          return;
        }

        const type = parts[next];
        if (!uniqueTypes.includes(type)) {
          uniqueTypes.push(type);
        }
        next += 1;

        next += 1; // skip ===

        const inEdges = [];
        while (next < parts.length && !parts[next].startsWith('[[') && !parts[next].startsWith('(')) {
          inEdges.push({ id: parts[next], type: 'unknown' });
          next += 1;
        }

        if (next == parts.length) return;

        const specialInEdges = [];
        if (parts[next] === '()') {
          next += 1; // skip ()
        }
        else if (parts[next].startsWith('(')) {
          next += 1; // skip ((
          while (next < parts.length && !parts[next].startsWith(')')) {
            specialInEdges.push({ id: parts[next], type: 'unknown' });
            next += 1;
          }
          next += 1; // skip )
        }

        if (next == parts.length) return;

        const outEdges = [];
        if (parts[next] === '[[]]') {
          next += 1; // skip [[]]
        } else {
          next += 1; // skip [[
          while (next < parts.length && !parts[next].startsWith(']]')) {
            outEdges.push({ id: parts[next], type: 'unknown' });
            next += 1;
          }
          next += 1; // skip ]]
        }

        const details = parts.slice(next, parts.length).join(' ')

        const node = {id, type, inEdges, specialInEdges, outEdges, details, focusNode}
        nodes.push(node);
      }
    });

    if(nodes.length > 0) {

      // setup colors for nodes
      const nodeColorSet = rgbColors(nodes.length);
      const uniqueNodeColoringMap = {};

      // add edge type names
      nodes.forEach((node, nodeIndex) => {

        uniqueNodeColoringMap[node.id] = {color: colorFromRGB(nodeColorSet[nodeIndex].color), complimentary: colorFromRGB(nodeColorSet[nodeIndex].complimentary)};
        node.inEdges.forEach((edge, edgeIndex, theArray) => {
          // special case _
          if (edge.id == '_') {
            edge.type = "null";
          } else {
            const referencedNode = nodes.find((refNode) => refNode.id == edge.id);
            if (referencedNode != null) {
              edge.type = referencedNode.type;
            }
          }
        });

        node.specialInEdges.forEach((edge, edgeIndex, theArray) => {
          // special case _
          if (edge.id == '_') {
            edge.type = "null";
          } else {
            const referencedNode = nodes.find((refNode) => refNode.id == edge.id);
            if (referencedNode != null) {
              edge.type = referencedNode.type;
            }
          }
        })

        node.outEdges.forEach((edge, edgeIndex, theArray) => {
          // special case _
          if (edge.id == '_') {
            edge.type = "null";
          } else {
            const referencedNode = nodes.find((refNode) => refNode.id == edge.id);
            if (referencedNode != null) {
              edge.type = referencedNode.type;
            }
          }
        })
      });

      // now setup up the type colors
      const uniqueTypeColoringMap = {};
      uniqueTypes.push("null");
      uniqueTypes.push("unknown");
      uniqueTypes.push("na");
      const typeColorSet = rgbColors(uniqueTypes.length);
      uniqueTypes.forEach((type, index) => {
        uniqueTypeColoringMap[type] = {color: colorFromRGB(typeColorSet[index].color), complimentary: colorFromRGB(typeColorSet[index].complimentary)};
      });
      uniqueTypeColoringMap["null"] = {color: "#FFFFFF", complimentary: "#000000"};
      uniqueTypeColoringMap["unknown"] = {color: "#FFFFFF", complimentary: "#000000"};
      uniqueTypeColoringMap["na"] = {color: "#FFFFFF", complimentary: "#000000"};

      store.dispatch(projectActions.processProjectSuccess(nodes, uniqueNodeColoringMap, uniqueTypeColoringMap));
    } else {
      store.dispatch(projectActions.processProjectFailed());
    }

  }

  return Promise.resolve(result);
};
