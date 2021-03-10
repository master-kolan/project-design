import {getUriMapbox} from "../../mapbox";
import {getBufferData, str} from "../index";
const THREE = require('three');
import SphericalMercator from '@mapbox/sphericalmercator';
const constTilePixels = new SphericalMercator({size: 128});

// 获得线框边上的顶点索引 0: north  1: west 2: south 3:east
const computeSeamRows = (row, col) => {
   const totalCount = 3 * row * col;
    let rows = [[],[],[],[]];
    for (let c = 0; c < row; c ++) {
        rows[1].push(c * col * 3);
        rows[3].push((c + 1) * col * 3 - 3);
    }
    for (let c = 0; c < col; c ++) {
        rows[0].push(3 * c);
        rows[2].push(3 * c + totalCount - col * 3);
    }
    return rows;
};

export function generateTile(group, pos, radius) {
    const uintMeter = 1 / (radius * Math.pow(2, 0.5) * 1000);
    const vertexMap = {};
    let zoomposMap = {};
    const {imagePos, terrainPos, box } = pos;
    imagePos.forEach(zoompos => {
        const terrainStr = str([zoompos[0]-2 , Math.floor(zoompos[1]/4), Math.floor(zoompos[2]/4)]);
        const row = zoompos[1] - Math.floor(zoompos[1]/4) * 4;
        const col = zoompos[2] - Math.floor(zoompos[2]/4) * 4;
        zoomposMap[str(zoompos)] = {
            terrainStr,
            row,
            col
        }
    });
    Promise.all(terrainPos.map(terrain => {
        const url = getUriMapbox('mapbox-terrain-rgb', terrain);
        return getBufferData(url);
    })).then(bufferArray => {
        bufferArray.forEach((buffer, i) => {
            if (buffer) {
                let elevations = Array();
                for (let i = 0; i < buffer.data.length; i += 4) {
                    const R = buffer.data[i];
                    const G = buffer.data[i + 1];
                    const B = buffer.data[i + 2];
                    elevations.push(-10000 + ((R * 256 * 256 + G * 256 + B) * 0.1));
                }
                imagePos.forEach(zoompos => {
                    let {terrainStr} = zoomposMap[str(zoompos)];
                    if (terrainStr === str(terrainPos[i])) {
                        clipping(elevations, zoompos, box, zoomposMap, vertexMap, uintMeter);
                    }
                })
            }
        });
        imagePos.sort((a, b ) => str(a) > str(b)).forEach(zoompos => {
            const clip = vertexMap[str(zoompos)].clippingConfig;
            const imgUrl = getUriMapbox('mapbox-satellite', zoompos);
            const cSegments = resolveNeighbor(zoompos, vertexMap);
            getBufferData(imgUrl, clip).then( buffer => {
                const texture= new THREE.DataTexture(createDataFlipY(buffer.data, buffer.shape),
                    buffer.shape[0], buffer.shape[1], THREE.RGBAFormat);
                group.add(_generateTile(vertexMap[str(zoompos)].vertex, texture, cSegments));
            });
        });
    });
}

function clipping(elevations, zoompos, box, zoomposMap, vertexMap, uintMeter) {
    let {col, row} = zoomposMap[str(zoompos)];
    let vertex = [];
    const clippingConfig = {
        x: [128, 0],
        y: [128, 0]
    };
    for (let i = 0; i < 128; i++)
        for (let j = 0; j < 128; j++) {
            let [longitude, latitude] = constTilePixels.ll(
                [zoompos[1] * 128 + j, zoompos[2] * 128 + i], zoompos[0]);
            const x = -0.5 + (longitude - box.w) / (box.e - box.w);
            const y = -0.5 - (latitude - box.s) / (box.s - box.n);
            if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) {
                clippingConfig.x[0] = Math.min(clippingConfig.x[0], j);
                clippingConfig.x[1] = Math.max(clippingConfig.x[1], j);
                clippingConfig.y[0] = Math.min(clippingConfig.y[0], i);
                clippingConfig.y[1] = Math.max(clippingConfig.y[1], i);
                vertex.push(x, y, elevations[(i + col * 128) * 512 + j + row * 128] * uintMeter);
            }
        }
    vertexMap[str(zoompos)] = {
        vertex,
        clippingConfig
    };
}

function  _generateTile(vertex, texture, cSegments) {
    let geom = new THREE.PlaneBufferGeometry(
        1, 1, cSegments[0], cSegments[1]);
    geom.setAttribute( 'position', new THREE.BufferAttribute(new Float32Array(vertex), 3 ) );
    return new THREE.Mesh(geom,
        new THREE.MeshBasicMaterial({
            wireframe: true,
            side: THREE.FrontSide,
            map: texture,
            color: 0xcccccc,
        })
    );
}

function createDataFlipY(data, shape) {
    const [w, h, size] = shape;
    const out = new Uint8Array(data.length);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * size; x += size) {
            for (let i = 0; i < size; i++) {
                out[(h-1-y) * w * size + x + i] = data[y * w * size + x + i];
            }
        }
    }
    return out;
}

function  resolveNeighbor(zoompos, vertexMap) {
    let clip = vertexMap[str(zoompos)].clippingConfig;
    let [row, col] = [clip.y[1] - clip.y[0] + 1, clip.x[1] - clip.x[0] + 1];
    let vertex = vertexMap[str(zoompos)].vertex;
    let cSegments = [col - 1, row - 1];
    let originSeamRows = computeSeamRows(row, col);
    const neighbors = getNeighbors(zoompos).map(neighbor => {
        if (!vertexMap[str(neighbor)]) return;
        let neighborClip = vertexMap[str(neighbor)].clippingConfig;
        let [neighborRow, neighborCol] = [neighborClip.y[1] - neighborClip.y[0] + 1, neighborClip.x[1] - neighborClip.x[0] + 1];
        return {
            vertex: vertexMap[str(neighbor)].vertex,
            neighborSeamRows: computeSeamRows(neighborRow, neighborCol)
        }
    });
    if( neighbors[2]) {
        _stitchWithNei2(vertex, neighbors[2].vertex, originSeamRows, neighbors[2].neighborSeamRows, col);
        cSegments[1]++;
    }
    if (neighbors[3]) {
        _stitchWithNei3(vertex, neighbors[3].vertex, originSeamRows, neighbors[3].neighborSeamRows, row);
        cSegments[0]++;
    }
    if (neighbors[6]) {
        vertex.push(neighbors[6].vertex[0], neighbors[6].vertex[1], neighbors[6].vertex[2]);
    }
    return cSegments;
}

function getNeighbors(zoompos) {
    // 8-neighbors:
    // 4 0 7
    // 1 + 3
    // 5 2 6
    //--------
    // 0, 1, 2, 3: north, west, south, east; +y, -x, -y, +x
    // 4, 5, 6, 7: diagonal neighbors
    const zoomposNeighborsDiff = [
        [0, 0, -1], [0, -1, 0], [0, 0, 1], [0, 1, 0],
        [0, -1, -1], [0, -1, 1], [0, 1, 1], [0, 1, -1],
    ];
    const neighbors = [];
    zoomposNeighborsDiff.forEach(zoomposDiff => {
        const zoomposNei = zoomposDiff.map(
            (coord, index) => coord + zoompos[index]);
        neighbors.push(zoomposNei);
    });
    return neighbors;
}
function _stitchWithNei2(array, arrayNei, originSeamRows, neighborSeamRows, constVertices) {
    // add a new south row
    for (let i = 0; i < constVertices; i++) {
        let indexZ = originSeamRows[2][i] + constVertices*3; // new south row
        let indexZNei = neighborSeamRows[0][i]; // north row to copy
        array[indexZ] = arrayNei[indexZNei]; // a new x
        array[indexZ+1] = arrayNei[indexZNei+1]; // a new y
        array[indexZ+2] = arrayNei[indexZNei+2]; // a new z
    }
}
function _stitchWithNei3(array, arrayNei, originSeamRows, neighborSeamRows, constVertices) {
    // add a new east col
    for (let i = 0; i < constVertices; i++) {
        let indexZ = originSeamRows[3][i] + (i + 1) * 3; // new east col
        let indexZNei = neighborSeamRows[1][i]; // west col to copy
        array.splice(indexZ, 0, arrayNei[indexZNei], arrayNei[indexZNei+1], arrayNei[indexZNei+2]);
    }
}