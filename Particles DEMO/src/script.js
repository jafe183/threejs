import './style.css'
import * as glMatrix from './gl-matrix.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SphereBufferGeometry, SphereGeometry, SpotLight, Raycaster, AdditiveBlending } from 'three'
import VertexShader from './shaders/test/vertex.glsl'
import FragmentShader from './shaders/test/fragment.glsl'
import BGVertexShader from './BGShaders/test/vertex.glsl'
import BGFragmentShader from './BGShaders/test/fragment.glsl'
import gsap from 'gsap'


//console.log(OrbitControls)

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


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

window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }
})

// Texture
//const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load(
    '/img/lusion.png', 
    () => { console.log('loading finsihed')},
    () => { console.log('loading progressing')},
    () => { console.log('loading error')}
)
const map = textureLoader.load('/img/map.jpg')
const mask = textureLoader.load('/mask/particle_mask.jpeg')
//texture.magFilter = THREE.NearestFilter

// Raycaster
const raycaster = new THREE.Raycaster()

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color( 0xffffff );

/**
 * Retrieve Data from SVG 
 */

 const svg = [...document.querySelectorAll('.cls-1')]
 const lines = []
 svg.forEach((path, index)=>{
     let lengthOfPath = path.getTotalLength()
     let numberOfPoints = Math.floor(lengthOfPath/3)
 
     let points = []
 
     for (let i = 0; i < numberOfPoints; i++) {
         let pointAt = lengthOfPath * i/numberOfPoints
         let pointCoord = path.getPointAtLength(pointAt)
         points.push(new THREE.Vector3((pointCoord.x - 1024)/10, (pointCoord.y - 512)/10, 0))
     }
 
     lines.push({
         index: index,
         path: path,
         length: lengthOfPath,
         number: numberOfPoints,
         pointsCoord: points,
         currentPos: 0,
         speed: 1
     })
 })
 console.log(lines)

/**
 * Light 
*/
const ambientLight = new THREE.AmbientLight(0xffffff, 0.05)
scene.add(ambientLight)

const spotLight = new THREE.SpotLight(0xffffff, 20, 100, Math.PI * 0.3, 0.1, 1)
spotLight.position.set(20, 20, 20)
scene.add(spotLight)
scene.add(spotLight.target)



spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 2
spotLight.shadow.camera.fov = 30
spotLight.shadow.radius = 2

spotLight.castShadow = true

// Helpers
const spotLightHelper = new THREE.CameraHelper(spotLight.shadow.camera)
scene.add(spotLightHelper)


/**
 * Mesh
 */

// Object
const group = new THREE.Group()
scene.add(group)

// const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
//const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })

// Vertices
const cubevertices = 
[ // X, Y, Z           
    // Top
    -0.5, 0.5, -0.5,     // index for this vertex: 0
    -0.5, 0.5, 0.5,      // 1
    0.5, 0.5, 0.5,       // 2
    0.5, 0.5, -0.5,      // ...

    // Left
    -0.5, 0.5, 0.5,   
    -0.5, -0.5, 0.5,  
    -0.5, -0.5, -0.5, 
    -0.5, 0.5, -0.5,  

    // Right
    0.5, 0.5, 0.5,   
    0.5, -0.5, 0.5,  
    0.5, -0.5, -0.5, 
    0.5, 0.5, -0.5,  

    // Front
    0.5, 0.5, 0.5,    
    0.5, -0.5, 0.5,    
    -0.5, -0.5, 0.5,    
    -0.5, 0.5, 0.5,    

    // Back
    0.5, 0.5, -0.5,    
    0.5, -0.5, -0.5,    
    -0.5, -0.5, -0.5,    
    -0.5, 0.5, -0.5,    

    // Bottom
    -0.5, -0.5, -0.5,   
    -0.5, -0.5, 0.5,    
    0.5, -0.5, 0.5,     
    0.5, -0.5, -0.5,    
]
const cubeVertices = new Float32Array(glMatrix.vec3.scale(glMatrix.vec3.create(), cubevertices, 1))

const cubeIndices = new Uint16Array (
    [// indicate which vertices to be used to form the triangles that form the faces of the cube 
		// Top Face
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	])

const textureUV = new Float32Array (
    [ // U, V
        // Right (S)
        0.5, 1,
        0.75, 1,
        0.5, 0.5,
        0.75, 0.5,
        
        
        // Left (O)
        0.5, 0,     // index for this vertex: 0
        0.25, 0,    // 1
        0.5, 0.5,  // 2
        0.25, 0.5,     // ...

        // Top (U)
        0.25, 1, 
        0.5, 1, 
        0.25, 0.5, 
        0.5, 0.5, 

        // Bottom (I)
        0.25, 0,
        0, 0, 
        0.25, 0.5, 
        0, 0.5,
        
        // Front (L)
        0, 1,
        0.25, 1,
        0, 0.5,
        0.25, 0.5,

        // Back (N)
        0.75, 0,
        0.5, 0,
        0.75, 0.5,
        0.5, 0.5,
        0.5, 1,
        0.75, 1,
        0.5, 0.5,
        0.75, 0.5,
    ])

const pointcount = 20000
function spherePointCloud(pointCount) {
    const points = [];
    for (let i = 0; i < pointCount; i++) {
        const r = () => (Math.random() - 0.5); // -.5 < x < 0.5
        const inputPoint = [r(), r(), r()];
        
        glMatrix.vec3.normalize(inputPoint, inputPoint);
        const outputPoint = glMatrix.vec3.scale(glMatrix.vec3.create(), inputPoint, 20)

        points.push(...outputPoint);
        
    }
    return new Float32Array(points);
}
const sphereVertices = spherePointCloud(pointcount)

function sphereColor(pointCount) {
    const color = []
}


const SpeedAttribute = new THREE.BufferAttribute(new Float32Array(pointcount), 1)
const OffsetAttribute = new THREE.BufferAttribute(new Float32Array(pointcount), 1)
const DirectionAttribute = new THREE.BufferAttribute(new Float32Array(pointcount), 1)
const OpacityAttribute = new THREE.BufferAttribute(new Float32Array(pointcount), 1)

function rand(a, b) { // Function to return a random between a and b.
    return a + (b-a)*Math.random();
}

let index = 0
for(let i=0; i < pointcount ; i++) { 
    OffsetAttribute.setX(index, rand(-800, 800))
    SpeedAttribute.setX(index, rand(0.4, 1))
    DirectionAttribute.setX(index, Math.random()>0.4?1:-1)
    OpacityAttribute.setX(index, Math.random())
    index++;
}

// Create Attribution
const positionVerticesAttribution = new THREE.BufferAttribute(cubeVertices, 3)
const positionIndicesAttribution = new THREE.BufferAttribute(cubeIndices, 1)
const textureUVAttribution = new THREE.BufferAttribute(textureUV, 2)
const sphereVerticesAttribution = new THREE.BufferAttribute(sphereVertices, 3)

const PointCloudGeometry = new THREE.BufferGeometry()
PointCloudGeometry.setAttribute('position', sphereVerticesAttribution)
PointCloudGeometry.setAttribute('aSpeed', SpeedAttribute)
PointCloudGeometry.setAttribute('aOffset', OffsetAttribute)
PointCloudGeometry.setAttribute('aDirection', DirectionAttribute)
PointCloudGeometry.setAttribute('aOpacity', OpacityAttribute)

//PointCloudGeometry.setAttribute('color', )
console.log(PointCloudGeometry.attributes)

const cubeGeometry = new THREE.BoxBufferGeometry(10, 10, 10)
// cubeGeometry.setAttribute('position', positionVerticesAttribution)
// cubeGeometry.setIndex(positionIndicesAttribution)
cubeGeometry.setAttribute('uv', textureUVAttribution)

const sphereGeometry = new THREE.SphereBufferGeometry(6, 64, 64)
const sphereGeometry1 = new THREE.SphereBufferGeometry(5.5, 64, 64)

const cloudGeometry = new THREE.SphereBufferGeometry(1.5, 128, 128) 
cloudGeometry.setAttribute('position', sphereVerticesAttribution)
console.log(cloudGeometry.attributes)

const PointCloudMaterial = new THREE.ShaderMaterial({
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    side: THREE.DoubleSide,
    uniforms:{
        mask: { value: mask },
        uMove: { value: 0 },
        uTime: { value: 0 },
        uCursor: { value: 0 },
        uPress: { value: 0},
        uRelease: { value: 0},
        // uTexture: { value: texture}
    },
    transparent: true,
    // depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending
})



const planeGeometry = new THREE.PlaneBufferGeometry(6, 6)
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
    side: THREE.DoubleSide,
    map: map
})


const BGgeometry = new THREE.BufferGeometry()

const max = lines.length * 100
const BGopacityAttribute = new THREE.BufferAttribute(new Float32Array(max), 1)
const BGpositionAttribute = new THREE.BufferAttribute(new Float32Array(max*3), 3)
for (let i = 0; i < max; i++) {
    BGopacityAttribute.setX(i, Math.random())
    BGpositionAttribute.setXYZ(i, Math.random(), Math.random(), 0)
}

// lines.forEach(element=>{
//     element.pointsCoord.forEach(element=>{
//         positionVertices.push(element.x, element.y, element.z)
//         opacity.push(Math.random())
//     })
// })
BGgeometry.setAttribute('position', BGpositionAttribute)
BGgeometry.setAttribute('opacity', BGopacityAttribute)


// Material
const BGmaterial = new THREE.ShaderMaterial({
    vertexShader: BGVertexShader,
    fragmentShader: BGFragmentShader,
    uniforms:
    {
        uFrequency: { value: new THREE.Vector2(10, 10) },
        uTime: { value: 0 }
    },
    transparent: true,
    // depthTest: false,
    depthWrite: false,
    Blending: AdditiveBlending
})

// Mesh
const BG = new THREE.Points(BGgeometry, BGmaterial)
BG.position.z = -20
scene.add(BG)


const plane = new THREE.Mesh(planeGeometry, planeMaterial)

const sphere = new THREE.Mesh(sphereGeometry,
    planeMaterial
    )
sphere.receiveShadow = true

const sphere1 = new THREE.Points(sphereGeometry1,
    new THREE.PointsMaterial({
        size: 0.01,
        color: 'white'
    })
)

const cube1 = new THREE.Mesh(cubeGeometry,
    new THREE.MeshStandardMaterial({
        map : texture,
    })
)
cube1.castShadow = true

const cube2 = new THREE.Points(
    PointCloudGeometry, PointCloudMaterial    
)

cube2.castShadow = true;
cube1.position.x = 0
cube2.position.x = 0
// group.add(plane)
group.add(cube1)
group.add(cube2)
// group.add(sphere)
// group.add(sphere1)

// Mouse Control
const cursor = new THREE.Vector3()
const mouse = new THREE.Vector2()

window.addEventListener('mousewheel', (e)=>{
    // console.log(e.wheelDeltaY)
    cursor.z += e.wheelDeltaY/100
})

window.addEventListener('mousemove', (event)=>{
    cursor.x = (event.clientX / sizes.width) * 2 - 1;
    cursor.y = -(event.clientY / sizes.height) * 2 + 1;
    raycaster.setFromCamera(cursor, camera)

    var intersects = raycaster.intersectObjects([cube2])
    // console.log(intersects[0].point)

    mouse.x = intersects[0].point.x
    mouse.y = intersects[0].point.y

})

window.addEventListener('mousedown', (event)=>{
    gsap.to(PointCloudMaterial.uniforms.uRelease, {
        duration: 1,
        value: 1,
        ease: "elastic.out(1, 0.3)"
    })
})

window.addEventListener('mouseup', (event)=>{
    gsap.to(PointCloudMaterial.uniforms.uRelease,{
        duration: 1,
        value: 0,
        ease: "elastic.out(1, 0.3)"
    })
    
})


// console.log(cursor)


// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 2, 100000)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 60
camera.lookAt(cube1.position)
scene.add(camera)




// // Controls
// const controls = new OrbitControls(camera, canvas)
// // controls.maxDistance = 6
// controls.minDistance = 2
// controls.enableDamping = true
// controls.update()




// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))

renderer.shadowMap.enabled = true




// Animate
const clock = new THREE.Clock()

const count = cloudGeometry.attributes.position.count

const position_clone = new Float32Array(cloudGeometry.attributes.position.array)
const normals_clone = new Float32Array(cloudGeometry.attributes.normal.array)
// console.log(normals_clone)
const damping = 0.1

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const now = Date.now() /200

    // Update Geometry
    let j = 0
    lines.forEach(element=>
        {
            element.currentPos += element.speed;
            element.currentPos = element.currentPos%element.number
            for (let i = 0; i < 250; i++) {
                let index = (element.currentPos + i)%element.number;
                // console.log(index)
                let points = element.pointsCoord[index]
                BGgeometry.attributes.position.setXYZ(j, points.x, points.y, 0)
                BGgeometry.attributes.opacity.setX(j, Math.random()*i/600)
                // console.log(j, i/10)
                j++
            }
        })

    BGgeometry.attributes.position.needsUpdate = true

    // Update material
    BGmaterial.uniforms.uTime.value = elapsedTime

    PointCloudMaterial.uniforms.uTime.value = elapsedTime
    PointCloudMaterial.uniforms.uMove.value = cursor.z
    PointCloudMaterial.uniforms.uCursor.value = mouse

    // Update objects
    cube1.rotation.y += 0.01;
    cube1.rotation.x += 0.01;
    // cube1.rotation.z += 0.01;
    cube2.rotation.y = Math.sin(elapsedTime)*0.1;
    cube2.rotation.x = Math.cos(elapsedTime)*0.1;
    sphere1.rotation.y = elapsedTime * 0.5
    // cube2.rotation.z = elapsedTime * -0.1;

    // for (let i = 0; i < count; i++) {
    //     // indices
    //     const ix = i * 3
    //     const iy = i * 3 + 1
    //     const iz = i * 3 + 2

    //     // use uvs to calculate wave
    //     const uX = cloudGeometry.attributes.uv.getX(i) * Math.PI * 16
    //     const uY = cloudGeometry.attributes.uv.getY(i) * Math.PI * 16

    //     const x = - cursor.x*10 * cloudGeometry.attributes.position.getX(i)
    //     const y = - cursor.y*10 * cloudGeometry.attributes.position.getY(i) 

    //     // calculate current vertex wave height
    //     const xangle = (uX + now)
    //     const xsin = Math.sin(xangle) * damping * x
    //     const yangle = (uY + now)
    //     const ycos = Math.cos(yangle) * damping * y

    //     // set new position
    //     cloudGeometry.attributes.position.setX(i, position_clone[ix] + normals_clone[ix] * (xsin + ycos))
    //     cloudGeometry.attributes.position.setY(i, position_clone[iy] + normals_clone[iy] * (xsin + ycos))
    //     cloudGeometry.attributes.position.setZ(i, position_clone[iz] + normals_clone[iz] * (xsin + ycos))
    // }
    // cloudGeometry.computeVertexNormals();
    // cloudGeometry.attributes.position.needsUpdate = true;



    //Update Light

    // spotLight.position.x = Math.sin(-elapsedTime * 0.5 * Math.PI) * 2
    // spotLight.position.z = Math.sin(elapsedTime * 0.1 * Math.PI) * 2
    // spotLight.position.y = Math.cos(-elapsedTime * 1 * Math.PI) * 2
    // spotLight.lookAt(0,0,0)


    //camera.position.x = Math.sin(cursor.x * 4 * Math.PI) * 3
    //camera.position.z = Math.cos(cursor.x * 4 * Math.PI) * 3
    //camera.position.y = cursor.y * 3
    //camera.lookAt(mesh.position)
    //console.log(camera.position)

    // Controls Update
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()