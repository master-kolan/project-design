import cover from "@mapbox/tile-cover";
import turfDestination from "@turf/destination";
import * as turfHelpers from "@turf/helpers";

const ndarray = require('ndarray');
export function getBufferData(url, clip = null) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "Anonymous"
        img.onload = function () {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const context = canvas.getContext('2d')
            context.drawImage(img, 0, 0)
            if (clip) {
                let { x, y } = clip;
                const width = (x[1] - x[0]) * 4, height = (y[1] - y[0]) * 4;
                const pixels = context.getImageData(x[0] * 4, y[0] * 4, width, height);
                resolve(ndarray(new Uint8Array(pixels.data), [width, height, 4], [4, 4 * width, 1], 0));
            } else {
                const pixels = context.getImageData(0, 0, img.width, img.height)
                resolve(ndarray(new Uint8Array(pixels.data), [img.width, img.height, 4], [4, 4 * img.width, 1], 0));
            }
        }
        img.onerror = function (err) {
            reject(err)
        }
        img.src = url
    });
}

export function getImageAndTerrainPos(origin, radius, zoom = 12) {
    const [w, s, e, n] = originRadiusToBbox(origin, radius);
    const coordinate = [[w, n], [e, n], [e, s], [w, s], [w, n]];
    const geometry = {
        type: 'Polygon',
        coordinates: [coordinate]
    }
    const limits = {
        min_zoom: zoom,
        max_zoom: zoom
    };
    const imagePos =  cover.tiles(geometry, limits)
        .map(([x, y, z]) => [z, x, y]);
    const terrainPos = getTerrianPos(imagePos);
    return {
        imagePos,
        terrainPos,
        coordinates: [w, n, e, n, e, s, w, s, w, n],
        center: [(w + e)/2, (n + s)/2],
        box: { w, s, e, n },
        feature: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "Polygon",
                coordinates: [coordinate]
            },
            northWest: [w, n],
            southEast: [e, s]
        }
    };
}

function getTerrianPos(pos) {
    let elevations = {};
    pos.forEach(zoompos => {
        let grandparent = [
            zoompos[0]-2,
            Math.floor(zoompos[1]/4),
            Math.floor(zoompos[2]/4)];
        if (elevations[grandparent]) {
            elevations[grandparent].push(zoompos);
        } else {
            elevations[grandparent] = [zoompos];
        }
    });
    return Object.keys(elevations)
        .map(triplet => triplet.split(',').map(num => parseFloat(num)));
}

function originRadiusToBbox(origin, radius) {
    const [w, n] = turfDestination(turfHelpers.point(origin),
        radius, -45, {units: 'kilometers'}).geometry.coordinates;
    const [e, s] = turfDestination(turfHelpers.point(origin),
        radius, 135, {units: 'kilometers'}).geometry.coordinates;
    return [w, s, e, n];
}

export function str(arr) {
    return arr.join('/');
}
