import './style.css'
import * as THREE from 'three';
import { GUI } from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';



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


const NUM_NODES = 7;    //NUMBER OF NODES IN THR GRAPH
const MAX_EDGES_PER_NODE = 4;

//MAY END UP NOT USING GUI FOLDERS
// const gui = new GUI()     //create a new gui element
// var nodeFolder = gui.addFolder('Nodes'); 


/**
 * new custom Node class that provides the necessary variables to perform dijkstras
 */
class Node {
  constructor(nodeNum, nodeName, color) {
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
    // this.nodeFolder = gui.addFolder(nodeName);   //adds folders to the gui window

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
function addNode(numNodes){
  var color = BLUE;
  for( var i = 0; i < numNodes; i++){ //loop to fill nodeArray
    var nodeNum = (i+1);  // gives the node a unique number
    var nodeName = "Node " + nodeNum ;//Names each node for the gui
    
    
    // console.log("NODENAME: " + nodeName);
    
    const myNode = new Node(nodeNum, nodeName, color);
    // console.log("myNode.x");
    // console.log(myNode.x);
    // nodeArray[i] = new THREE.Vector3(myNode.x, myNode.y, myNode.z);
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
      // console.log("node: " + startNode.nodeNum + " --------> " + "node: " + endNode.nodeNum);
      
      // const newPair = new NodeEdgePair(endNode, edge);    //pair that contains the destination node and the edge that points to it

      // adjList[startNode.nodeNum].push(newPair);   //fills the adjacency list with the node and edge pair, 
      //                                             // this should make the code more lightweight when running dijstras 

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
  var color = GREEN
  const newEdge = new Edge(nodeArray[nodeArray.length-1], nodeArray[0], color);
  var newPair = new NodeEdgePair(nodeArray[0], newEdge);    //pair that contains the destination node and the edge that points to it

  // if(!adjList[nodeArray[nodeArray.length-1].nodeNum].includes(nodeArray[0]) && nodeArray[nodeArray.length-1].nodeNum != nodeArray[0].nodeNum){
    adjList[nodeArray[nodeArray.length-1].nodeNum].push(newPair);   //fills the adjacency list with the node and edge pair, 
  // }
                                                  // this should make the code more lightweight when running dijstras 
  // addEdge(nodeArray[nodeArray.length-1], nodeArray[0], color);   //this connects node[n] to node[0] creating a loop
                                                            // assuring every node is reachable via any other node
  //loop to connect the rest of the nodes                                                          
  for(var i = 0; i < nodeArray.length-1; i++){
    // console.log("i = " + i);
    const newEdge2 = new Edge(nodeArray[i], nodeArray[i+1], color);
    newPair = new NodeEdgePair(nodeArray[i+1], newEdge2);    //pair that contains the destination node and the edge that points to it

    // if(!adjList[nodeArray[i].nodeNum].includes(nodeArray[i+1]) && nodeArray[i].nodeNum != nodeArray[i+1].nodeNum){
          adjList[nodeArray[i].nodeNum].push(newPair);   //fills the adjacency list with the node and edge pair,         
    // }
      // addEdge(nodeArray[i], nodeArray[i+1], color);  //this connects node[0] to node[1] to node[2].... to node[n-1]


        for(var j = 0; j < Math.floor(Math.random()*MAX_EDGES_PER_NODE); j++){ //this loop creats a random number of connections for each node
          var flag = true;    //flag to control if a node edge is added to the adjacency list
          color = GREEN;
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
// var testEdge = new Edge(nodeArray[0], nodeArray[2], BLUE);
// testEdge = new Edge(nodeArray[0], nodeArray[2], WHITE);

// const testEdge2 = new Edge(nodeArray[0], nodeArray[2], WHITE);

/************************************************************************************************/

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
        let smallest = i; // Initialize smallest as root
        let leftChild = 2 * i; 
        let rightChild = 2 * i + 1; 
   
        // If left child is smaller than smallest so far
        if (leftChild < this.heap.length && this.heap[leftChild].distance <= this.heap[smallest].distance){
          smallest = leftChild;
          this.heapify(smallest);
        }
   
        // If right child is smaller than smallest so far
        if (rightChild < this.heap.length && this.heap[rightChild].distance < this.heap[smallest].distance){
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
    // console.log("Node Removed: " + smallest.nodeName + " with distance of: " + smallest.distance);
    
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
 function dijkstra_spt(startNodeNum){
  
  // initilaize_single_source
 
  nodeArray[startNodeNum-1].distance = 0;   //initializes the startNode distance to zero
  nodeArray[startNodeNum-1].visited = 1;    //initializes the startNode visited to 1
  
  // maintain a set finalSet of vertices whose final shortest-path weights from the source startNodeNum have already been determined.
  let finalSet = []
  let finalSet2 = [];
  // initialize min-priority queue Q of vertices, keyed by their d values.
  var minHeap = new MinHeap();

  //insert all nodes in the graph into the min heap
  for(let i = 0; i < nodeArray.length; i++){
    minHeap.insert(nodeArray[i]);
    let x = new Array();
    finalSet2[i] = x;
  }
  
  // console.log("minheap len: " + minHeap.heap.length)
    // while Q != null
  
  while(minHeap.heap.length > 1){
    // u = extract_min
   
    // minHeap.printHeap();
    //extract node 4
    let u = minHeap.remove();

    // S = S U {u} 
    //add node 4 to final set
    finalSet.push(u);

    // for each vertex v in adj[u] 
    // for each vertex adjacent to vertex 4
          // update its distance
    // relax(u,v,w)
    for(let i = 0; i < adjList[u.nodeNum].length; i++){ //loop through all adjacent nodes and update their distances
      if(adjList[u.nodeNum][i].node.distance > (u.distance + adjList[u.nodeNum][i].edge.weight)){
        adjList[u.nodeNum][i].node.distance = u.distance + adjList[u.nodeNum][i].edge.weight;
      }
    }

    minHeap.heapify(1);

  }

  console.log("\nDistance from Node " + startNodeNum + " to: ")
  for(let i = 0; i < finalSet.length;i++){
    console.log("Node " + finalSet[i].nodeNum + ": " + finalSet[i].distance);
  }
  
}

dijkstra_spt(1)

console.log("END")



//***************************** Render Loop ************************************************ */
//Animate the scene with an infitite recursive loop that continually calls render
function animate(){       
  requestAnimationFrame(animate);     //tells the browser that you want to animate something
  controls.update();                  //allows the user to control the scene with the mouse
  renderer.render(scene, camera);     //call render on the scene and camera
}

animate();      //call our recursive animate function




// var updatedEdge = new Edge(adjList[1][1].node, nodeArray[0], WHITE);
//   console.log("weight: " + updatedEdge.weight);


