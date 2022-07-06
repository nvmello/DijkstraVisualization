import * as THREE from '/node_modules/three';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';


/**
 ******************************* Scene setup *********************************
 */

const GRID_SIZE = 400;
const GRID_DIVISIONS = 50;

//color hex values
const RED = 0xff0000;
const GREEN = 0x00ff00;
const BLUE = 0x0000ff;
const YELLOW = 0xffff00;
const PINK = 0xff00ff;
const WHITE = 0xffffff;
const PURPLE = 0x9004bf;
const TEAL = 0x53c9b2;
const GRAY = 0xa2a0a3;


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


const NUM_NODES = 15;    //NUMBER OF NODES IN THR GRAPH
const MAX_EDGES_PER_NODE = 4;

//MAY END UP NOT USING GUI FOLDERS
// const gui = new GUI()     //create a new gui element
// var nodeFolder = gui.addFolder('Nodes'); 


/**
 * new custom Node class that provides the necessary variables to perform dijkstras
 */
class Node {
  constructor(nodeNum, nodeName, color) {
  
    this.geometry = new THREE.SphereGeometry(2,24,24);      //creates a sphere geometry
    this.material = new THREE.MeshStandardMaterial({color: color}); //sets the sphere material
    this.node = new THREE.Mesh(this.geometry, this.material);    //creates a new 'node' onject with both the geometry and material specified
    this.x = THREE.MathUtils.randFloatSpread(GRID_SIZE/2) ;  //randomly generates a unique x,y,z value for each star
    this.y = THREE.MathUtils.randFloatSpread(GRID_SIZE/2) ;  //randomly generates a unique x,y,z value for each star
    this.z = THREE.MathUtils.randFloatSpread(GRID_SIZE/2) ;  //randomly generates a unique x,y,z value for each star
    // console.log(this.x);

    this.visited = 0;   //this variable will be used in dijkstras to tell if the nod has been visited yet
    this.distance = Infinity;     //property of dijkstras, begin will all nodes distance being set to infinity

    this.parent = null;   //added a parent variable that keeps track of this nodes most recent parent node in the shortest path tree

    this.coord = new THREE.Vector3(this.x, this.y, this.z);
    this.nodeNum = nodeNum;
    this.nodeName = nodeName;

    this.node.position.set(this.x,this.y,this.z);   //sets each stars position to the randomly generated x,y,z position calculated previously
    scene.add(this.node);    //adds each star to the scene once it is created
  }
}

var nodeArray = []; //array to store the vector3 positions of each node

/**
 * addNode()
 * function will create a node every time called
 */
function addNode(numNodes){
  var color = WHITE;
  for( var i = 0; i < numNodes; i++){ //loop to fill nodeArray
    var nodeNum = (i+1);  // gives the node a unique number
    var nodeName = "Node " + nodeNum ;//Names each node for the gui
    
    const myNode = new Node(nodeNum, nodeName, color);

    nodeArray[i] = myNode;
  }
}

/**
 * initAdjacencyList initializes the adjacency list
 * the [0] position will always be null
 * [i] values will represent each node in the graph,
 * for every [i], there will be another array representing the nodes adjacent to node[i]
 */
function initAdjacencyList(){                                                  
  for (var i = 0; i < adjList.length; i++) {
    if(i === 0){         // adjList[0] will be null
      adjList[i] = new Array();
      adjList[i].push(null);
    }
    else{
      adjList[i] = new Array();     //every other node will be its own array, creating an adjancy list data structure
    }
  }
}

/************************************************************************************************/

/**
 * Function that adds an edge between two nodes to the scene
 * 
 * @param {*} startNode node object the edge is pointing from
 * @param {*} endNode node object the edge is pointing to
 *              startNode ----------> endNode
 */

class Edge{
  constructor(startNode, endNode, color) {
    this.startNode = startNode;
    this.endNode = endNode;
    this.color = color;
  /**
   * .clone ( recursive : Boolean ) : Object3D
   *    recursive -- if true, descendants of the object are also cloned. Default is true.
   *    Returns a clone of this object and optionally all descendants.
   */
    var direction = (endNode.coord).clone().sub(startNode.coord);     //calculates the direction between the two nodes

    var length = direction.length();  //calculates the distance between 2 nodes
    this.weight = length;
  
    // ArrowHelper(dir : Vector3, origin : Vector3, length : Number, hex : Number, headLength : Number, headWidth : Number )
    const edge = new THREE.ArrowHelper(direction.normalize(), startNode.coord, length, color, 10,5 );  //creates the edge using arrowHelper   
    
    if(!adjList[startNode.nodeNum].includes(endNode) && startNode.nodeNum != endNode.nodeNum){

      scene.add( edge );   //adds arrowHelper to scene
    }
    return this.edge;
  }
  
}

/************************************************************************************************/
/**
 * Class that packages a node and edge together to store in the adjacency list
 *    this allows 
 */
class NodeEdgePair{
  constructor(node, edge) {
    this.node = node;
    this.edge = edge;
  }
}

/************************************************************************************************/

/**
 * This function creates the edges of the graph
 * By using the adjancy list, this code assures that no edge will be repeated 
 * and that no edge will connect a node to itself
 * Also, every node is reachable from every other node, by hard coding a loop 
 * connecting node 1 to node 2 to node 3.... to node n and from node n to node 1
 * The remaining edges are randomly chosen
 */
function generateEdges(){
  var color = PURPLE;
  const newEdge = new Edge(nodeArray[nodeArray.length-1], nodeArray[0], color);
  var newPair = new NodeEdgePair(nodeArray[0], newEdge);    //pair that contains the destination node and the edge that points to it

  adjList[nodeArray[nodeArray.length-1].nodeNum].push(newPair);   //fills the adjacency list with the node and edge pair, 

  //loop to connect the rest of the nodes                                                          
  for(var i = 0; i < nodeArray.length-1; i++){

    const newEdge2 = new Edge(nodeArray[i], nodeArray[i+1], color);
    newPair = new NodeEdgePair(nodeArray[i+1], newEdge2);    //pair that contains the destination node and the edge that points to it

    adjList[nodeArray[i].nodeNum].push(newPair);   //fills the adjacency list with the node and edge pair,         

    for(var j = 0; j < Math.floor(Math.random()*MAX_EDGES_PER_NODE); j++){ //this loop creats a random number of connections for each node
      var flag = true;    //flag to control if a node edge is added to the adjacency list
      
      var randNode = nodeArray[Math.floor(Math.random()*nodeArray.length)];    //select a random node for the created edge to travel to

      //Loop to keep track of if a node is already connected to the randomly selected node, if it is, 
      //  dont add it to the adjacency list again
      for(let k = 0; k < adjList[nodeArray[i].nodeNum].length;k++){
        if(adjList[nodeArray[i].nodeNum][k].node.nodeNum == randNode.nodeNum){
          flag = false;     //deny node from being added
          break;
        }
      }
      
      const newEdge3 = new Edge(nodeArray[i], randNode, color);
      newPair = new NodeEdgePair(randNode, newEdge3);    //pair that contains the destination node and the edge that points to it

      if(flag && nodeArray[i].nodeNum != randNode.nodeNum){
        adjList[nodeArray[i].nodeNum].push(newPair);   //fills the adjacency list with the node and edge pair,   
      }

    }
  }
  
  for(var j = 0; j < Math.floor(Math.random()*MAX_EDGES_PER_NODE); j++){ //this loop creats a random number of connections for each node
    var randNode = nodeArray[Math.floor(Math.random()*nodeArray.length)];    //select a random node for the created edge to travel to
  
    const newEdge4 = new Edge(nodeArray[nodeArray.length-1], randNode, color);
      // addEdge(nodeArray[nodeArray.length-1], randNode, color);    //add the randomly created edge to the scene
  }
}



/**
 * consoleConnectionsLog is a function that prints all the nodes and their connections to the console
 */
function consoleConnectionsLog(){
  console.log("Adjancy List Length: " + adjList.length)
  for(let i = 1; i < adjList.length; i++){
    console.log("Node " + i +  ":");
    for(let j = 0; j < adjList[i].length; j++){
      console.log("      connects to  " + adjList[i][j].node.nodeName + " with length " + adjList[i][j].edge.weight);
    }
  }
}



/************************************************************************************************/

//This will create a specified number of unique nodes in the scene
addNode(NUM_NODES);


//****************************** Adjacency List ************************************** */
/**
 * This creates an array for each node in the list
 * length+1 so each nodeNum can be a key, 
 * adjList[0] will be sert to null
 */
let adjList = new Array(nodeArray.length+1);

/************************************************************************************************/

//call to initialize the adjacency list with the nodes and edges from the graph
initAdjacencyList();

/************************************************************************************************/

// Call to generateEdges
generateEdges();


//Call to print all of the connections to the console
consoleConnectionsLog();


/**
 * Class that will maintain a min heap structure to keep track of shortest paths
 */
class MinHeap{

  /**
   * initializes a new heap, an array with positioin [0] set as null
   */
  constructor () {

    this.heap = [null];

  }

  /**
   * returns smallest item in the heap
   * @returns the heapNode located at position [1] in the heap, this should always be the smallest item
   */
  getMin() {
      return this.heap[1]
  }

  /**
   * inserts a new item into the heap, should maintain the min heap property of every parent being smaller than their children
   * @param {*} heapNode 
   */
  insert(heapNode){
   
    this.heap.push(heapNode);   //inserts a node at the end of the heap;

    if (this.heap.length > 1) {   //if the length of the heap is greater than 1
      
      let currentNodePos = (this.heap.length - 1);
      
      //while the heapNodes distance is less than its parent node, move up
      while(currentNodePos > 1 && this.heap[Math.floor(currentNodePos/2)].distance > this.heap[currentNodePos].distance ){
        
        /* Swapping the two nodes by using the ES6 destructuring syntax*/
        [this.heap[Math.floor(currentNodePos/2)], this.heap[currentNodePos]] = [this.heap[currentNodePos], this.heap[Math.floor(currentNodePos/2)]];

        currentNodePos = Math.floor(currentNodePos/2);    //resets current to the new position

      }
    }
  }


  /**
   * Prints all items in the heap array
   */
  printHeap() {
    if(this.heap.length == 1){
      console.log("Empty Heap");
    } 
    else{
      for (let i = 1; i < this.heap.length; i++) {
        console.log("Heap " + this.heap[i].nodeName + "  -->  Node Distance " + this.heap[i].distance);
        }
    }
	}

  heapify(i)
    {
        
        let leftChild = 2 * i; 
        let rightChild = 2 * i + 1; 
        let smallest = i; // Initialize smallest as root
        
        if (leftChild < this.heap.length && this.heap[leftChild].distance <= this.heap[smallest].distance){
          smallest = leftChild;
          this.heapify(smallest);
        }

        if (rightChild < this.heap.length && this.heap[rightChild].distance <= this.heap[smallest].distance){
          smallest = rightChild;
          this.heapify(smallest);
        }
   
        // If smallest is not root
        if (smallest != i)
        {
            [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
  
            // Recursively heapify the affected sub-tree
            this.heapify(smallest);
        }
      
    }

  remove(){
    console.log("\n");

    let smallest = this.heap[1];      //save the smallest value
    
    //When there are more than 2 elements in the array, the rightmost element takes the first elements place
    if(this.heap.length > 2){

      this.heap[1] = this.heap[this.heap.length-1];   //rightmost item in heap replaces the root

      this.heap.splice(this.heap.length-1);   //remove the last position in the heap completely
    }
    //if there is only 1 item left in the heap
    else if( this.heap.length === 2){
      this.heap.splice(1,1);    //remove it from the heap
    } 
    else{
      return null;    //return null if attempted to remove a node when there are none in the heap
    }

    return smallest;  // return the smallest node that was removed from the heap
  }
}


/**
 * dijkstra_spt, shortest path algorithm given a start and end node
 * @param {*} startNode pass in a start node to calculate dijkstra spt on
 * @param {*} endNode   pass in an end node that the algorithm will terminate on once reached
 */
 function dijkstra_spt(startNodeNum, endNodeNum){
  
  // initilaize_single_source
  nodeArray[startNodeNum-1].material.color.setHex( GREEN ); //colors start node Green
  nodeArray[endNodeNum-1].material.color.setHex( RED );   //colors end node Red
  nodeArray[startNodeNum-1].distance = 0;   //initializes the startNode distance to zero
  nodeArray[startNodeNum-1].visited = 1;    //initializes the startNode visited to 1
  
  // maintain a set finalSet of vertices whose final shortest-path weights from the source startNodeNum have already been determined.
  let finalSet = []

  // initialize min-priority queue Q of vertices, keyed by their d values.
  var minHeap = new MinHeap();

  //insert all nodes in the graph into the min heap
  for(let i = 0; i < nodeArray.length; i++){
    minHeap.insert(nodeArray[i]);
    let x = new Array();

  }
  
  // while Q != null
  while(minHeap.heap.length > 1){
    // u = extract_min
   
    let u = minHeap.remove();

    // S = S U {u} 
    finalSet.push(u);

    // relax(u,v,w)
    for(let i = 0; i < adjList[u.nodeNum].length; i++){ //loop through all adjacent nodes and update their distances
      // if the previous distance is larger than the new distance, update the previous distance to the updated shorter value
      if(adjList[u.nodeNum][i].node.distance > (u.distance + adjList[u.nodeNum][i].edge.weight)){
        adjList[u.nodeNum][i].node.parent = nodeArray[u.nodeNum-1];
        adjList[u.nodeNum][i].node.distance = u.distance + adjList[u.nodeNum][i].edge.weight;
      }
    }

    // Call heapify after updating distances in the minheap.
    minHeap.heapify(1);

  }

  //Loop to show the distances to every node in the graph
  console.log("\nDistance from Node " + startNodeNum + " to: ")
  for(let i = 0; i < finalSet.length;i++){
    console.log("\tNode " + finalSet[i].nodeNum + ": " + finalSet[i].distance);
  }


  //Array to keep track of the nodes traversed to the endNode
  let finalPath = [];
  let temp = nodeArray[endNodeNum-1];   //temp var for end node
  
  /**
   * While loop for overwriting the edges with a different color to highlight the path taken
   */
  while( temp.parent != null && temp.nodeNum != startNodeNum){
    finalPath.push(temp);
    let colorPath = new Edge(temp.parent, temp, YELLOW);
    temp = temp.parent;
  } 
  finalPath.push(nodeArray[startNodeNum-1]);

  //xonsole output of the path taken
  console.log("\nShortest path taken from " + finalPath[finalPath.length-1].nodeName + " to " + finalPath[0].nodeName + ": ");
  console.log("START");
  // Reduce right calls the specified callback function for all the elements in an array, in descending order.
  finalPath.reduceRight((_, item) => console.log("\t" + item.nodeName), null);
  console.log("END");
}

dijkstra_spt(4, 3)

//***************************** Render Loop ************************************************ */
//Animate the scene with an infitite recursive loop that continually calls render
function animate(){       
  requestAnimationFrame(animate);     //tells the browser that you want to animate something
  controls.update();                  //allows the user to control the scene with the mouse
  renderer.render(scene, camera);     //call render on the scene and camera
}

animate();      //call our recursive animate function