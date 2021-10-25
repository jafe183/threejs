import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import tubesVertexShader from './shaders/test/tubesvertex.glsl'
import tubesFragmentShader from './shaders/test/tubesfragment.glsl'
import VertexShader from './shaders/test/planevertex.glsl'
import FragmentShader from './shaders/test/planefragment.glsl'
import { Uniform } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const scene1 = new THREE.Scene()

// Size
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Noise
var SimplexNoise = require('simplex-noise'),
simplex = new SimplexNoise(Math.random);

function computeCurl(x, y, z){
    var eps = 0.0001;
  
    var curl = new THREE.Vector3();
  
    //Find rate of change in YZ plane
    var n1 = simplex.noise3D(x, y + eps, z); 
    var n2 = simplex.noise3D(x, y - eps, z); 
    //Average to find approximate derivative
    var a = (n1 - n2)/(2 * eps);
    var n1 = simplex.noise3D(x, y, z + eps); 
    var n2 = simplex.noise3D(x, y, z - eps); 
    //Average to find approximate derivative
    var b = (n1 - n2)/(2 * eps);
    curl.x = a - b;
  
    //Find rate of change in XZ plane
    n1 = simplex.noise3D(x, y, z + eps); 
    n2 = simplex.noise3D(x, y, z - eps); 
    a = (n1 - n2)/(2 * eps);
    n1 = simplex.noise3D(x + eps, y, z); 
    n2 = simplex.noise3D(x - eps, y, z); 
    b = (n1 - n2)/(2 * eps);
    curl.y = a - b;
  
    //Find rate of change in XY plane
    n1 = simplex.noise3D(x + eps, y, z); 
    n2 = simplex.noise3D(x - eps, y, z); 
    a = (n1 - n2)/(2 * eps);
    n1 = simplex.noise3D(x, y + eps, z); 
    n2 = simplex.noise3D(x, y - eps, z); 
    b = (n1 - n2)/(2 * eps);
    curl.z = a - b;
  
    return curl;
}
// console.log(computeCurl(0, 0, 0))

/**
 * Test mesh
 */
// Curve
function curvephysic(start){    
    let scale = 1
    let points = []

    points.push(start)
    let currentPoint = start.clone()


    for (let i = 0; i < 600; i++) {
        let velocity = computeCurl(currentPoint.x/scale, currentPoint.y/scale, currentPoint.z/scale)
        currentPoint.addScaledVector(velocity, 0.001)
        // console.log(currentPoint, velocity)

        points.push(currentPoint.clone());
        // points.push(
        //     new THREE.Vector3(i/10, 0, 0)
        // )
    }
    return points
}

// Material
const materialTubes = new THREE.ShaderMaterial({
    vertexShader: tubesVertexShader,
    fragmentShader: tubesFragmentShader,
    // side: THREE.DoubleSide,
    uniforms: {
        uTime : { value: 0 },
        uLight: { value: new THREE.Vector3(0, 0, 0) }
    }
})

// Geometry
// const geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32)
for (let i = 0; i < 300; i++) {
    let path = new THREE.CatmullRomCurve3(curvephysic(
        new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        )
    ))
    let geometry = new THREE.TubeBufferGeometry(path,600, 0.005, 8, false)
    
    let curve = new THREE.Mesh(geometry, materialTubes)

    scene.add(curve)
    
}

// Mesh
// const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0.25, - 0.25, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Raycaster
const material = new THREE.ShaderMaterial({
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        uTime : { value: 0 },
        uLight: { value: new THREE.Vector3(0, 0, 0) }
    },
    transparent: true, 
    opacity: 0.2
})
const raycasterplane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    material
)

const light = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.05, 20, 20),
    new THREE.MeshBasicMaterial({color: 0xa8e6cf})
)

scene1.add(raycasterplane)
scene.add(light)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const eMouse = new THREE.Vector2()
const elasticMouse = new THREE.Vector2(0, 0)
const elasticMouseVel = new THREE.Vector2(0 ,0)
const temp = new THREE.Vector2(0, 0)
window.addEventListener('mousemove', (event)=>{
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
    mouse.y = - (event.clientY / window.innerHeight ) * 2 + 1
    raycaster.setFromCamera(mouse, camera) 
    const intersects = raycaster.intersectObjects( [raycasterplane])
    if ( intersects.length > 0) {
        eMouse.x = intersects[0].point.x
        eMouse.y = intersects[0].point.y
    }
})

/**
 * Sizes
 */

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.autoClear = false

/**
 * Animate
 */

const clock = new THREE.Clock()
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    materialTubes.uniforms.uTime.value = elapsedTime
    material.uniforms.uTime.value = elapsedTime

    temp.copy(eMouse).sub(elasticMouse).multiplyScalar(.15)
    elasticMouseVel.add(temp)
    elasticMouseVel.multiplyScalar(.8)
    elasticMouse.add(elasticMouseVel)
    light.position.x = elasticMouse.x
    light.position.y = elasticMouse.y

    material.uniforms.uLight.value = light.position
    materialTubes.uniforms.uLight.value = light.position

    // Update controls
    controls.update()

    // Render
    renderer.clear()
    renderer.render(scene1, camera)
    renderer.clearDepth()
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()