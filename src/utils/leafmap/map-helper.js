import L from 'leaflet';
import icon from '../../assets/images/marker-icon.png';
import * as turfHelpers from '@turf/helpers';
import turfDistance from '@turf/distance';
import turfTransformRotate from '@turf/transform-rotate';
import turfTransformTranslate from '@turf/transform-translate';
import {getImageAndTerrainPos} from "../index";
import {tokenMapbox} from "../../config";
// import turfCircle from '@turf/circle/index';
const THREE = require('three');


class MapHelper {
    constructor(options={}) {
        const defaults = {
            mapId: 'map',
            onBuildTerrain: null,
            onMapZoomEnd: null,
        };
        let actual = Object.assign({}, defaults, options);
        if (!actual.origin || !actual.radius) {
            throw "Invalid origin, radius";
        }
        this.origin = actual.origin;
        this.radius = actual.radius;
        this.onBuildTerrain = actual.onBuildTerrain;
        this.onMapZoomEnd = actual.onMapZoomEnd;

        const _origin = actual.origin;
        const _radius = actual.radius;
        const _mapId = actual.mapId;

        this.map = L.map(_mapId).setView([_origin[1], _origin[0]], 12);
        L.Marker.prototype.options.icon = L.icon({
            iconUrl: icon
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?access_token=' + tokenMapbox, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            // crossOrigin: true,
        }).addTo(this.map);

        this._bboxLayers = [];

        const {feature: box} = getImageAndTerrainPos(_origin, _radius);
        this.updateBboxLayers(_origin, box); // first time

        this.markerTmp = null;
        this.bbTmp = null;
        this.map.on('click', e => {
            this.showDialog([e.latlng.lat, e.latlng.lng]);
        });

        this.map.on('zoomend', () => {
            if (this.onMapZoomEnd) {
                this.onMapZoomEnd();
            }
        });

        // this.camMarker = null;
        // this.orbitMarker = null;
        // this.orbitCircle = null;
    }

    static swap(ll) {
        return [ll[1], ll[0]];
    }

    static llToString(ll) {
        return `${ll[0].toFixed(4)} ${ll[1].toFixed(4)}`;
    }

    static mkBuildMarker(ll, onBuild, onCancel) {
        // https://stackoverflow.com/questions/13698975/click-link-inside-leaflet-popup-and-do-javascript
        let container = document.createElement('div');
        container.innerHTML =`<div style="display: flex">lng lat: ${MapHelper.llToString(MapHelper.swap(ll))}</div>`;
        let buildButton = document.createElement('div');
        buildButton.innerHTML =`<a style="float: left"  href='#' id='buildLink'>Build Terrain</a>`;
        let cancelButton = document.createElement('div');
        cancelButton.innerHTML =`<a style="margin-left: 40px" href='#' id='cancelLink'>[x]</a></div>`;
        container.append(buildButton, cancelButton);
        // container.append($('<span class="bold">').text("abc..."))
        container.children[1].addEventListener('click', onBuild);
        container.children[2].addEventListener('click',  onCancel);
        let pp = L.popup({
            closeButton: false,
        }).setContent(container);
        return L.marker(ll).bindPopup(pp);
    }

    static mkGeoJsonPoint(ll) {
        return {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": ll, // lnglat
            },
        };
    }

    static mkOpts(color) {
        return {
            style: () => {
                // let mag = feature.properties.mag; // e.g.
                return {
                    color: color,
                };
            },
        };
    }
    static mkBboxLayers(origin, box) {
        let ttStr = `lng lat: ${MapHelper.llToString(origin)}`;
        let llSw =  box.geometry.coordinates[0][3];
        let line = turfHelpers.lineString([origin, llSw]);

        // let dist = turfLineDistance(line, {units: 'kilometers'}); // ?? runtime error about 'distance()'
        //========
        let dist = turfDistance(
            turfHelpers.point(origin),
            turfHelpers.point(llSw),
            {units: 'kilometers'});

        // console.log('dist:', dist.toFixed(3));

        let right = box.geometry.coordinates[0][1][0];
        let lineX = turfHelpers.lineString([origin,
            [origin[0] + 2*(right - origin[0]), origin[1]]
        ]);

        let top =  box.geometry.coordinates[0][1][1];
        let lineY = turfHelpers.lineString([origin,
            [origin[0], origin[1] + 2 * (top - origin[1])]
        ]);
        return [
            L.marker([origin[1], origin[0]]),
            L.geoJson(this.mkGeoJsonPoint(origin)).bindTooltip(ttStr, {
                permanent: true,
                direction: 'right',
            }),
            L.geoJson(box, this.mkOpts('white')),
            L.geoJson(lineX, this.mkOpts('red')),
            L.geoJson(lineY, this.mkOpts('green')),
            L.geoJson(line, this.mkOpts('white')).bindTooltip(`${dist.toFixed(1)} km`, {
                permanent: true,
                direction: 'right',
            })
        ];
    }

    static mkLineCam(cam, origin, unitsPerMeter, zoomMap) {
        // resolve cam's z-rotation w.r.t. the world
        // https://stackoverflow.com/questions/21557341/three-js-get-world-rotation-from-matrixworld
        // https://stackoverflow.com/questions/12784807/get-euler-rotation-from-quaternion
        // https://threejs.org/docs/#api/math/Euler
        // https://github.com/mrdoob/three.js/issues/11767
        const qn = new THREE.Quaternion();
        const rot = new THREE.Euler().setFromQuaternion(
            cam.getWorldQuaternion(qn), 'ZYX');
        const deg = - rot.z / Math.PI * 180;

        // https://github.com/mrdoob/three.js/issues/1239
        const fovRad = cam.fov * Math.PI / 180;
        const hfov = 2 * Math.atan(Math.tan(fovRad / 2) * cam.aspect);
        const dist = 0.004 * (2**(12 - zoomMap)); // "dist" of the pinhole to the screen
        const lineCam = turfTransformRotate(
            turfHelpers.lineString([
                [origin[0] - dist * Math.tan(hfov / 2), origin[1] + dist],
                [origin[0], origin[1]],
                [origin[0] + dist * Math.tan(hfov / 2), origin[1] + dist],
            ]), deg, { pivot: origin.reverse(), mutate: true});

        const vec = new THREE.Vector2(cam.position.dx, cam.position.dy).divideScalar(unitsPerMeter);
        const theta = 90.0 - vec.angle() * 180.0 / Math.PI;
        return turfTransformTranslate(lineCam, vec.length(), theta, {
            units: 'meters',
            zTranslation: cam.position.dz / unitsPerMeter,
            mutate: true  // "significant performance increase if true" per doc
        });
    }

    // update stuff --------
    setView(ll) {
        this.clearTmpLayers();
        this.updateBboxLayers(ll, getImageAndTerrainPos(ll, this.radius).feature);
        this.map.setView(MapHelper.swap(ll));
    }
    clearBboxLayers() {
        while (this._bboxLayers.length) {
            this.map.removeLayer(this._bboxLayers.pop());
        }
    }
    updateBboxLayers(origin, box) {
        this.clearBboxLayers();
        this._bboxLayers = MapHelper.mkBboxLayers(origin, box);
        this._bboxLayers.forEach(layer => { layer.addTo(this.map); });
    }

    clearTmpLayers() {
        if (this.markerTmp) this.map.removeLayer(this.markerTmp);
        if (this.bbTmp) this.map.removeLayer(this.bbTmp);
    }
    buildTerrain(ll) {
        this.clearTmpLayers();
        this.updateBboxLayers(MapHelper.swap(ll), getImageAndTerrainPos(MapHelper.swap(ll), this.radius).feature);
        if (this.onBuildTerrain) {
            this.onBuildTerrain(ll);
        }
    }
    showDialog(ll) {
        this.map.panTo(ll);
        //-------- update temporary marker/bbox
        this.clearTmpLayers();
        let onBuild = () => {
            this.buildTerrain(ll);
        };
        let onCancel = () => {
            this.clearTmpLayers();
        };
        this.markerTmp = MapHelper.mkBuildMarker(ll, onBuild, onCancel)
            .addTo(this.map).openPopup();
        this.bbTmp = L.geoJson(getImageAndTerrainPos(MapHelper.swap(ll), this.radius).feature, {
            style: () => { return {dashArray: '3, 5'}; },
        }).addTo(this.map);
    }

}

export default MapHelper;
