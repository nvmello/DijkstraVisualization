import './style.css'
import * as THREE from 'three';
import { GUI } from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';



/**
 ******************************* Scene setup *********************************
 */

const GRID_SIZE = 200;
const GRID_DIVISIONS = 50;

//color hex values
const RED = 0xff0000;
const GREEN = 0x00ff00;
const BLUE = 0x0000ff;
const YELLOW = 0xffff00;
const PINK = 0xff00ff;
const WHITE = 0xffffff;


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
const pointLight = new THREE.PointLight(WHITE);  //creates a new point of light and specifies the lights color
pointLight.position.set(20,20,20);                  //changes the position of the light from (0,0,0) to (20,20,20)
scene.add(pointLight);//adds the point of light to the scene
// const lightHelper = new THREE.PointLightHelper(pointLight); //adds a small frame at the position of the light source for assistance

const ambientLight = new THREE.AmbientLight(WHITE);   //makes the light ambient
scene.add(pointLight, ambientLight); //adds the point of light to the scene

/******** Grid ********/
const gridHelper = new THREE.GridHelper(GRID_SIZE,GRID_DIVISIONS);      //creates a grid in the scene GridHelper(size,divisions);

// scene.add(lightHelper, gridHelper);   //adds the grid and light helpers to the scene
scene.add(gridHelper);   //adds the grid and light helpers to the scene

const controls = new OrbitControls(camera, renderer.domElement);    //allows the user to to control screen with mouse
//***************************************************************************** */


const NUM_NODES = 5;    //NUMBER OF NODES IN THR GRAPH

//MAY END UP NOT USING GUI FOLDERS
// const gui = new GUI()     //create a new gui element
// var nodeFolder = gui.addFolder('Nodes'); 


/**
 * new custom Node class that provides the necessary variables to perform dijkstras
 */
class Node {
  constructor(color, nodeNum, nodeName) {
    const geometry = new THREE.SphereGeometry(2,24,24);      //creates a sphere geometry
    const material = new THREE.MeshStandardMaterial({color: color}); //sets the sphere material
    const node = new THREE.Mesh(geometry, material);    //creates a new 'node' onject with both the geometry and material specified
    this.x = THREE.MathUtils.randFloatSpread(GRID_SIZE/2) ;  //randomly generates a unique x,y,z value for each star
    this.y = THREE.MathUtils.randFloatSpread(GRID_SIZE/2) ;  //randomly generates a unique x,y,z value for each star
    this.z = THREE.MathUtils.randFloatSpread(GRID_SIZE/2) ;  //randomly generates a unique x,y,z value for each star
    // console.log(this.x);
    this.visited = 0;   //this variable will be used in dijkstras to tell if the nod has been visited yet
    this.distance = Infinity;     //property of dijkstras, begin will all nodes distance being set to infinity
    this.coord = new THREE.Vector3(this.x, this.y, this.z);
    this.nodeNum = nodeNum;
    this.nodeName = nodeName;
    // console.log(nodeName);  //test code for the console

     //MAY NOT END UP USING THE FOLDERS
    // nodeFolder = gui.addFolder(nodeName);   //adds folders to the gui window
    //I am hoping to be able to use this part of the code to allow the user to determine the weights of edges
      //may have to move this to the addEdge() function
    // nodeFolder.add(node.rotation, 'x', 0, 10); //adds a node folder for each node created, 

    node.position.set(this.x,this.y,this.z);   //sets each stars position to the randomly generated x,y,z position calculated previously
    scene.add(node);    //adds each star to the scene once it is created
  }
}

var nodeArray = []; //array to store the vector3 positions of each node


/**
 * addNode()
 * function will create a node every time called
 */
function addNode(){
  var color = YELLOW;
  for( var i = 0; i < NUM_NODES; i++){ //loop to fill nodeArray
    var nodeNum = (i+1);  // gives the node a unique number
    var nodeName = "Node " + nodeNum ;//Names each node for the gui
    
    
    // console.log("NODENAME: " + nodeName);
    const myNode = new Node(color, nodeNum, nodeName);
    // console.log("myNode.x");
    // console.log(myNode.x);
    // nodeArray[i] = new THREE.Vector3(myNode.x, myNode.y, myNode.z);
    nodeArray[i] = myNode;
  }
}

//call addNode() function
addNode();


//****************************** Adjacency List ************************************** */
/**
 * This creates an array for each node in the list
 * length+1 so each nodeNum can be a key, 
 * adjList[0] will be sert to null
 */
let adjList = new Array(nodeArray.length+1);

/**
 * initAdjacencyList initializes the adjacency list
 * the [0] position will always be null
 * [i] values will represent each node in the graph,
 * for every [i], there will be another array representing the nodes adjacent to node[i]
 */
function initAdjacencyList(){                                                  
  for (var i = 0; i < adjList.length; i++) {
    if(i == 0){         // adjList[0] will be null
      adjList[i] = new Array();
      adjList[i].push(null);
    }
    else{
      adjList[i] = new Array();     //every other node will be its own array, creating an adjancy list data structure
    }
  }
}

//call to initialize the adjacency list
initAdjacencyList();



/**
 * Function that adds an edge between two nodes to the scene
 * 
 * @param {*} node1 node object the edge is pointing from
 * @param {*} node2 node object the edge is pointing to
 *              node1 ----------> node2
 */
function addEdge(node1, node2){
  var color = PINK;
  var vecP1 = node1.coord;      //converts node obj to the vec3 coordinate of the node
  var vecP2 = node2.coord;
  // /**
  //  * .clone ( recursive : Boolean ) : Object3D
  //  *    recursive -- if true, descendants of the object are also cloned. Default is true.
  //  *    Returns a clone of this object and optionally all descendants.
  //  */
  var direction = vecP2.clone().sub(vecP1);     //subtracts vecP1 from vecP2
  var length = direction.length();  //calculates the distance between 2 nodes
  var arrowHelper = new THREE.ArrowHelper(direction.normalize(), vecP1, length, color );  //creates the arrowHelper

  // console.log("node: " + node1.nodeNum + " --------> " + "node: " + node2.nodeNum);
  adjList[node1.nodeNum].push(node2);
  scene.add( arrowHelper );   //adds arrowHelper to scene
}
//******************************************************************************************** */


/**
 * This function creates the edges of the graph
 * By using the adjancy list, this code assures that no edge will be repeated 
 * and that no edge will connect a node to itself
 * Also, every node is reachable from every other node, by hard coding a loop 
 * connecting node 1 to node 2 to node 3.... to node n and from node n to node 1
 * The remaining edges are randomly chosen
 */
function generateEdges(){
addEdge(nodeArray[nodeArray.length-1], nodeArray[0]);   //this connects node[n] to node[0] creating a loop
                                                            // assuring every node is reachable via any other node
  //loop to connect the rest of the nodes                                                          
  for(var i = 0; i < nodeArray.length-1; i++){
    // console.log("i = " + i);
      addEdge(nodeArray[i], nodeArray[i+1]);  //this connects node[0] to node[1] to node[2].... to node[n-1]
        for(var j = 0; j < Math.floor(Math.random()*nodeArray.length); j++){ //this loop creats a random number of connections for each node
          var randNode = nodeArray[Math.floor(Math.random()*nodeArray.length)];    //select a random node for the created edge to travel to
        
          //this conditional assures that no edge will be repeated
          //and that no edge will connect a node to itself
          if(!adjList[i].includes(randNode) && nodeArray[i].nodeNum != randNode.nodeNum){
            addEdge(nodeArray[i], randNode);    //add the randomly created edge to the scene
          } 
        }
  } 
}

// Call to generateEdges
generateEdges();


/**
 * consoleConnectionsLog is a function that prints all the nodes and their connections to the console
 */
function consoleConnectionsLog(){
  console.log("Adjancy List Length: " + adjList.length)
  for(let i = 1; i < adjList.length; i++){
    console.log("Node " + i +  ":");
    for(let j = 0; j < adjList[i].length; j++){
      console.log("      connects to  " + adjList[i][j].nodeName);
    }
  }
}


//Call to print all of the connections to the console
consoleConnectionsLog();


//***************************** Render Loop ************************************************ */
//Animate the scene with an infitite recursive loop that continually calls render
function animate(){       
  requestAnimationFrame(animate);     //tells the browser that you want to animate something
  controls.update();                  //allows the user to control the scene with the mouse
  renderer.render(scene, camera);     //call render on the scene and camera
}

animate();      //call our recursive animate function