<template>
    <div class="header">
        <caret-left-outlined/>
        <span class="header-title"> 地形下载</span>
    </div>
    <div class="content">
        <div class="content-view">
            <div class="option">
                <a-input class="option-item" addon-before="经度" v-model:value="longitude" />
                <a-input class="option-item" addon-before="纬度" v-model:value="latitude" />
                <a-input class="option-item" addon-before="半径(km)" v-model:value="radius" />
                <a-button class="option-item" @click="setView"><EnvironmentOutlined/>跳转</a-button>
                <a-button class="option-item" @click="downloadTerrain"><DownloadOutlined/>下载</a-button>
            </div>
            <div id="canvas"></div>
            <div id="view"></div>
            <div id="map"></div>
            <div id="dialog"></div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import {CaretLeftOutlined, DownloadOutlined, EnvironmentOutlined} from "@ant-design/icons-vue";
    import {getUriMapbox} from "../../mapbox";
    import {getImageAndTerrainPos} from "../../utils";
    import {generateTile} from "../../utils/three";
    import '../../utils/three/OrbitControls'
    import MapHelper from "../../utils/leafmap/map-helper";
    const THREE = require('three');
    export default {
        name: "index",
        data() {
            return {
                longitude: 7.9904,
                latitude: 46.5763,
                radius: 5,
                zoom: 12
            }
        },
        computed: {
            pos: function() {
                return getImageAndTerrainPos([this.longitude, this.latitude], this.radius, this.zoom);
            }
        },
        components: {
            CaretLeftOutlined, DownloadOutlined, EnvironmentOutlined
        },
        mounted() {
            this.initCesium();
            this.leafmap = new MapHelper({
                origin: [this.longitude, this.latitude],
                radius: this.radius,
                mapId: 'map',
                onBuildTerrain: (ll) => {
                    this.longitude = ll[1];
                    this.latitude = ll[0];
                    let { coordinates } = this.pos;
                    this.clean();
                    generateTile(this.group, this.pos, this.radius);
                    this.generateCesiumPolyan(coordinates);
                },
                onMapZoomEnd: () => {},
            });
            this.initThreeJsView();
        },
        methods: {
            setView() {
                let { coordinates } = this.pos;
                this.leafmap.clearTmpLayers();
                this.leafmap.setView([Number(this.longitude), Number(this.latitude)], getImageAndTerrainPos([this.longitude, this.latitude], this.radius).feature);
                this.clean();
                generateTile(this.group, this.pos, this.radius);
                this.generateCesiumPolyan(coordinates);
            },
            generateCesiumPolyan(coordinates) {
                // eslint-disable-next-line no-undef
                let stripeMaterial = new Cesium.StripeMaterialProperty({evenColor: Cesium.Color.BLUE.withAlpha(0.5), oddColor: Cesium.Color.BLUE.withAlpha(0.5),
                    repeat: 5.0,
                });
                this.viewer.entities.add({
                    polygon: {
                        // eslint-disable-next-line no-undef
                        hierarchy: new Cesium.PolygonHierarchy(
                            // eslint-disable-next-line no-undef
                            Cesium.Cartesian3.fromDegreesArray(coordinates)
                        ),
                        outline: true,
                        material: stripeMaterial,
                    }
                });
                // this.viewer.entities.add(entity);
                this.viewer.zoomTo(this.viewer.entities)
            },
            initCesium() {
                // eslint-disable-next-line no-undef
                this.viewer = new Cesium.Viewer("view", {
                    requestRenderMode: true,            // [ Bool, 启用请求渲染模式 ]
                    maximumRenderTimeChange : Infinity,
                    selectionIndicator: false,          // [ Bool, 是否启用选中 】
                    shadows: false,
                    animation: false,                   // [ Bool, 是否显示动画控件 ]
                    shouldAnimate: true,                // [ Bool, 是否开启动画 ]
                    homeButton: false,                  // [ Bool, 是否显示Home按钮 ]
                    vrButton: false,                    // [ Bool, 是否显示vr按钮 ]
                    fullscreenButton: false,            // [ Bool, 是否显示全屏按钮 ]
                    baseLayerPicker: false,             // [ Bool, 是否显示图层选择控件 ]
                    geocoder: false,                    // [ Bool, 是否显示地名查找控件 ]
                    timeline: false,                    // [ Bool, 是否显示时间线控件 ]
                    navigationHelpButton: false,        // [ Bool, 是否显示帮助信息控件 ]
                    scene3DOnly: false,                 // [ Bool, 每个几何实例将只能以3D渲染以节省GPU内存 ]
                    sceneModePicker: false,             // [ Bool, 是否显示场景切换控件 ]
                    sceneMode: 3,                       // [ Number,初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode ]
                    fullscreenElement: document.body,   // [ Object, 全屏时渲染的HTML元素 ]
                });
                this.viewer._cesiumWidget._creditContainer.style.display = "none"
            },
            initThreeJsView() {
                const scene = new THREE.Scene();
                // primary camera view
                const renderer = new THREE.WebGLRenderer({antialias: true});
                const canvas = document.querySelector('#canvas')
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(canvas.clientWidth, canvas.clientHeight);
                renderer.setClearColor(0x000000);
                renderer.shadowMap.enabled = true;
                canvas.appendChild(renderer.domElement);
                const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
                camera.position.set(0, 1, 2);
                camera.up.set(0, 1, 0);
                camera.lookAt(scene.position);

                const axesHelper = new THREE.AxesHelper(1);
                scene.add(axesHelper);

                const controls = new THREE.OrbitControls( camera, renderer.domElement );
                controls.screenSpacePanning = false;
                controls.minDistance = 1;
                controls.maxDistance = 2000;

                let spotLight = new THREE.SpotLight(0xffffff);
                spotLight.position.set(60, 60, 60);
                spotLight.castShadow = true;
                scene.add(spotLight);

                this.group = new THREE.Group();
                this.group.rotation.x = - Math.PI/2;
                scene.add(this.group);

                const render = () => {
                    requestAnimationFrame(render)
                    renderer.render(scene, camera);
                }
                render();
            },
            downloadTerrain() {
                const {imagePos, terrainPos} = this.pos;
                imagePos.forEach(pos => {
                    this.downloadFile(getUriMapbox('mapbox-satellite', pos), 'satellite' + pos.join('-'), 'image/jpeg');
                })
                terrainPos.forEach(pos => {
                    this.downloadFile(getUriMapbox('mapbox-terrain-rgb', pos), 'terrain' + pos.join('-'), 'image/png');
                })
            },
            downloadFile(url, name, type){
                axios.get(url, {
                    responseType: 'arraybuffer'
                }).then(res => {
                    const blob = new Blob([res.data], {type});
                    url = URL.createObjectURL(blob);
                    let a = document.createElement('a');
                    let e = document.createEvent('MouseEvents');
                    e.initEvent('click', false, false);
                    a.href = url;
                    a.download = name;
                    a.dispatchEvent(e);
                })
            },
            clean() {
                while (this.group.children.length ) {
                    let child = this.group.children.pop();
                    child.geometry.dispose();
                    child.material.dispose();
                    this.group.remove(child)
                }
                while (this. viewer.entities._entities._array.length ) {
                    let entity = this. viewer.entities._entities._array.pop();
                    this.viewer.entities.remove(entity);
                }
            }
        }
    }
</script>

<style scoped>
    .header {
        height: 60px;
        padding: 15px;
        font-size: 20px;
        font-weight: 400;
        display: flex;
        align-items: center;
    }
    .header-title {
        margin-left: 15px;
        text-align: center;
    }
    .content {
        flex: auto;
        padding: 10px;
        background: #f0f4f7;
    }
    .content-view {
        background: #fff;
        padding: 10px;
        height: calc(100vh - 80px);
        overflow: hidden;
    }

    .option {
        display: flex;
        align-items: center;
    }

    .option-item {
        margin-left: 20px;
    }

    #canvas {
        margin: 20px;
        width: 100%;
        height: calc(100vh - 150px);
    }

    #view {
        position: fixed;
        right: 50px;
        bottom: 50px;
        width: 320px;
        height: 320px;
    }

    #map {
        position: fixed;
        right: 50px;
        top: 150px;
        width: 320px;
        height: 240px;
    }
</style>