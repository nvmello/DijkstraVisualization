import './style.css'
import * as THREE from 'three';
import { GUI } from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


/**
 ******************************* Scene setup *********************************
 */
const scene = new THREE.Scene();    //Creates the container to hold all objects, cameras, lights
// PerspectiveCamera(FOV, ASPECT RATIO, view frustrum, view frustrum)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGL1Renderer({   //Actually renders the graphics to the screen
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);    //Sets device pixel ratio.

renderer.setSize(window.innerWidth, window.innerHeight);  //Resizes the output canvas to (width, height) with 
                                                          //device pixel ratio taken into account
camera.position.setX(150);
camera.position.setY(90);
camera.position.setZ(150);

/******** Lighting ********/
const pointLight = new THREE.PointLight(0xffffff);  //creates a new point of light and specifies the lights color
pointLight.position.set(20,20,20);                  //changes the position of the light from (0,0,0) to (20,20,20)
scene.add(pointLight);//adds the point of light to the scene
// const lightHelper = new THREE.PointLightHelper(pointLight); //adds a small frame at the position of the light source for assistance

const ambientLight = new THREE.AmbientLight(0xffffff);   //makes the light ambient
scene.add(pointLight, ambientLight); //adds the point of light to the scene

/******** Grid ********/
const gridHelper = new THREE.GridHelper(200,50);      //creates a grid in the scene GridHelper(size,divisions);

// scene.add(lightHelper, gridHelper);   //adds the grid and light helpers to the scene
scene.add(gridHelper);   //adds the grid and light helpers to the scene

const controls = new OrbitControls(camera, renderer.domElement);    //allows the user to to control screen with mouse
//***************************************************************************** */


var nodeNum = 1   //keeps track of the node number for naming
const gui = new GUI()     //create a new gui element
var nodeFolder = gui.addFolder('Nodes'); 

/**
 * addNode()
 * function will create a node every time called
 */
 function addNode(){
   const geometry = new THREE.SphereGeometry(2,24,24);      //creates a sphere geometry
   const material = new THREE.MeshStandardMaterial({color: 0xffff00}); //sets the sphere material

   const node = new THREE.Mesh(geometry, material);    //creates a new 'node' onject with both the geometry and material specified

  const [ x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100) );  //randomly generates a unique x,y,z value for each star
  node.position.set(x,y,z);   //sets each stars position to the randomly generated x,y,z position calculated previously

  
  var nodeName = "Node " + nodeNum  //Names each node for the gui
  console.log(nodeName);  //test code for the console
  nodeFolder = gui.addFolder(nodeName);   //adds folders to the gui window

  //I am hoping to be able to use this part of the code to allow the user to determine the weights of edges
    //may have to move this to the addEdge() function
    nodeFolder.add(node.rotation, 'x', 0, 10); //adds a node folder for each node created, 

    nodeNum+=1;   //increment node name before creating a new node
    scene.add(node);    //adds each star to the scene once it is created 
    return new THREE.Vector3(node.position.x,node.position.y,node.position.z);    //return vec3 of positions in order to create edges later
}


var nodeArray = []; //array to store the vector3 positions of each node

for( var i = 0; i < 5; i++){ //loop to fill nodeArray
  nodeArray[i] = addNode();
}

/**
 * addEdge()
 * function will create one edge between two nodes each time called
 */
//  function addEdge(vecP1, vecP2, color){
//   const material = new THREE.LineBasicMaterial( { color: color, linewidth: 6 } );  //creates line material, linewidth will not work because of opengl
//   const points = [];  //create an array of points the edge will travel
//   points.push( vecP1 );   //vector of endpoints from nodeA
//   points.push( vecP2 );   //vector of endpoints to nodeB
//   const geometry = new THREE.BufferGeometry().setFromPoints( points );  //geometry of a line defined based on the points given
//   const line = new THREE.Line( geometry, material );  //creates a line based on the material and geometry defined
//   scene.add(line);    //adds each star to the scene once it is created 
// }


//******************************PRACTICE ARROW EDGE************************************** */
function addEdge(vecP1, vecP2, color){

/**
 * .clone ( recursive : Boolean ) : Object3D
 *    recursive -- if true, descendants of the object are also cloned. Default is true.
 *    Returns a clone of this object and optionally all descendants.
 */
  var direction = vecP2.clone().sub(vecP1);     //subtracts vecP1 from vecP2
  var length = direction.length();  //calculates the distance between 2 nodes
  var arrowHelper = new THREE.ArrowHelper(direction.normalize(), vecP1, length, color );  //creates the arrowHelper
  scene.add( arrowHelper );   //adds arrowHelper to scene
}
//******************************************************************************************** */


// Test code to connect each node
// addEdge(nodeArray[0], nodeArray[1]);
for(var i = 0; i<nodeArray.length; i++){
  for(var j = 0; j<nodeArray.length; j++){
    if(i != j){
      if(j %2 == 0){
        addEdge(nodeArray[i], nodeArray[j], 0xff00ff);
      } else{
        addEdge(nodeArray[i], nodeArray[j], 0x0000ff);
      }
      
    }
  }
}


// addEdge(nodeArray[0], nodeArray[1]);  //code to connect node 1 with node 2







//***************************** Render Loop ************************************************ */
//Animate the scene with an infitite recursive loop that continually calls render
function animate(){       
  requestAnimationFrame(animate);     //tells the browser that you want to animate something
  controls.update();                  //allows the user to control the scene with the mouse
  renderer.render(scene, camera);     //call render on the scene and camera
}

animate();      //call our recursive animate function