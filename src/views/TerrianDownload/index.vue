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
                <a-button class="option-item" @click="showModal = true"><EnvironmentOutlined/>加载高程</a-button>
                <a-button class="option-item" @click="showIsoLine"><EnvironmentOutlined/>显示等高线</a-button>
                <a-button class="option-item" @click="downloadTerrain"><DownloadOutlined/>下载</a-button>
            </div>
            <div id="canvas"></div>
            <div id="view"></div>
            <div id="map"></div>
            <div id="dialog"></div>
        </div>
    </div>
    <a-modal
            v-model:visible="showModal"
            title="加载高程文件"
            @ok="loadTerrain">
        <a-form>
            <a-upload
                    name="avatar"
                    list-type="picture-card"
                    class="avatar-uploader"
                    :show-upload-list="false"
                    @change="handleChange"
            >
                <img v-if="imageUrl" :src="imageUrl" alt="dem" />
                <div v-else>
                    <div class="ant-upload-text">select</div>
                </div>
            </a-upload>
        </a-form>
    </a-modal>
</template>

<script>
    const tex = require('/src/assets/images/color.png');
    import axios from 'axios';
    import {CaretLeftOutlined, DownloadOutlined, EnvironmentOutlined} from "@ant-design/icons-vue";
    import {getUriMapbox} from "../../mapbox";
    import {getImageAndTerrainPos} from "../../utils";
    import {generateTile, generateTileByFile} from "../../utils/three";
    import '../../utils/three/OrbitControls'
    import MapHelper from "../../utils/leafmap/map-helper";
    import icon from '../../assets/images/marker-icon.png';
    const THREE = require('three');
    const shader = {
        uniforms: {
            radius : {
                type: 'f',
                value: 5.0
            },
            colorTex:  {
                type: 't',
                value: new THREE.TextureLoader().load(tex)
            }
        },
        extensions: {
            derivatives: true,
        },
        vertexShader: /* glsl */`
        uniform float radius;
        varying vec2 vUv;
		varying vec3 wPosition;
		void main() {
			#include <begin_vertex>
			#include <project_vertex>
			vUv = uv;
			wPosition = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
			wPosition.y *= 4000.;
		}
	`,
        fragmentShader: /* glsl */`
        varying vec2 vUv;
		varying vec3 wPosition;
		uniform sampler2D colorTex;
		uniform sampler2D heightTex;
		vec4 powers(float x) { return vec4(x*x*x, x*x, x, 1.); }
        vec4 spline(float x, vec4 c0, vec4 c1, vec4 c2, vec4 c3) {
            vec4 BS_A = vec4(3., -6., 0., 4.) / 6.;
            vec4 BS_B = vec4(-1., 6., -12., 8.) / 6.;
            return c0 * dot(BS_B, powers(x + 1.)) + c1 * dot(BS_A, powers(x)) + c2 * dot(BS_A, powers(1. - x)) + c3 * dot(BS_B, powers(2. - x));
        }
        #define SAM(a,b)  texture2D(tex, (i+vec2(a,b)+0.5)/res, -99.0)
            vec4 texture_Bicubic(sampler2D tex, vec2 t) {
            vec2 res = vec2(256, 256);
            vec2 p = res * t - .5, f = fract(p), i = floor(p);
            return spline(f.y, spline(f.x, SAM(-1, -1), SAM(0, -1), SAM(1, -1), SAM(2, -1)), spline(f.x, SAM(-1, 0), SAM(0, 0), SAM(1, 0), SAM(2, 0)),spline(f.x, SAM(-1, 1), SAM(0, 1), SAM(1, 1), SAM(2, 1)),spline(f.x, SAM(-1, 2), SAM(0, 2), SAM(1, 2), SAM(2, 2)));
        }
		void main() {
		    if (wPosition.y < 1.) {discard;}
            vec3 rgb = texture_Bicubic(heightTex, vUv).rgb * 255.;
            float height = -10000. + ((rgb.r * 256. * 256. + rgb.g * 256. + rgb.b) * .01);
			float dist = abs(mod(height, 12.) - .5);
			vec4 linesColor = vec4(1, 0.196, 0.219, 1.0 );
			float dz = fwidth(height) * 4.;
			// float lines = smoothstep(dz, 0, abs(dist - .5));
            float lines = max(min((3. - 2. * dist) * dist * dist, dz), 0.);
            gl_FragColor = mix(texture2D(colorTex,vUv),linesColor, lines);
		}
	`,

    };
    export default {
        name: "index",
        data() {
            return {
                showModal: false,
                imageUrl: '',
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
            getBase64(img, callback) {
                const reader = new FileReader();
                reader.addEventListener('load', () => callback(reader.result));
                reader.readAsDataURL(img);
            },
            handleChange(info) {
                this.getBase64(info.file.originFileObj, (base64Url) => {
                    this.imageUrl = base64Url;
                });
            },
            setView() {
                let { coordinates, center } = this.pos;
                this.leafmap.clearTmpLayers();
                this.leafmap.setView([Number(this.longitude), Number(this.latitude)], getImageAndTerrainPos([this.longitude, this.latitude], this.radius).feature);
                this.clean();
                generateTile(this.group, this.pos, this.radius);
                this.generateCesiumPolyan(coordinates, center);
            },
            loadTerrain() {
                this.clean();
                generateTileByFile(this.imageUrl, this.group);
                this.showModal = false;
            },
            showIsoLine() {
                this.group.traverse( c => {
                    if (c.isMesh) {
                        shader.uniforms.heightTex = {
                            type: 't',
                            value: new THREE.TextureLoader().load(this.imageUrl)
                        };
                        c.material = new THREE.ShaderMaterial(shader);
                        // c.material =  new THREE.MeshBasicMaterial({
                        //     wireframe: false,
                        //     map: THREE.ImageUtils.loadTexture(tex)
                        // })
                        c.material.side = 2;
                        c.receiveShadow = false;
                        c.castShadow = false;
                    }
                });
            },
            generateCesiumPolyan(coordinates, center) {
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
                this.viewer.entities.add({
                    // eslint-disable-next-line no-undef
                    position : Cesium.Cartesian3.fromDegrees(center[0], center[1]),
                    billboard : {
                        image : icon,
                        width : 25,
                        height : 41
                    }
                });
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
                this.viewer._cesiumWidget._creditContainer.style.display = "none";
                this.viewer.imageryLayers.remove(this.viewer.imageryLayers.get(0));
                let img = this.viewer.imageryLayers.addImageryProvider(
                    // eslint-disable-next-line no-undef
                    new Cesium.ArcGisMapServerImageryProvider({
                        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
                        baseLayerPicker: false
                    })
                );
                img.brightness = 0.8;
            },
            initThreeJsView() {
                const scene = new THREE.Scene();
                const renderer = new THREE.WebGLRenderer({antialias: true});
                const canvas = document.querySelector('#canvas')
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(canvas.clientWidth, canvas.clientHeight);
                renderer.setClearColor(0x000000);
                renderer.shadowMap.enabled = true;
                let aspect = [canvas.clientWidth / window.innerWidth, canvas.clientHeight / window.innerHeight]
                canvas.appendChild(renderer.domElement);
                const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 1000);
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

                function onWindowResize() {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    renderer.setPixelRatio( window.devicePixelRatio );
                    renderer.setSize( window.innerWidth * aspect[0], window.innerHeight * aspect[1]);
                    camera.updateProjectionMatrix();
                }
                window.addEventListener( 'resize', onWindowResize, false );

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