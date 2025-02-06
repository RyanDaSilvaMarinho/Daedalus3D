import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);

const drawingArea = document.getElementById("drawing-area");
drawingArea.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 15, -22);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const planeMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    visible: false,
  })
);
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);

const grid = new THREE.GridHelper(20, 20, 0x000000, 0x000000);
scene.add(grid);

const highlightMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true,
  })
);
highlightMesh.rotateX(-Math.PI / 2);
highlightMesh.position.set(0.5, 0, 0.5);
scene.add(highlightMesh);

const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

let selectedObjectType = "cube";

function createObject(type, color) {
  let object, offsetY;
  const material = new THREE.MeshBasicMaterial({ color });
  switch (type) {
    case "cube":
      object = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
      offsetY = 0.5;
      break;
    case "sphere":
      object = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
      offsetY = 0.5;
      break;
    case "cylinder":
      object = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), material);
      offsetY = 0.5;
      break;
    default:
      return null;
  }
  object.userData.offsetY = offsetY;
  return object;
}

const objects = [];

window.addEventListener("mousemove", (e) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mousePosition.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mousePosition.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mousePosition, camera);
  intersects = raycaster.intersectObject(planeMesh);
  
  if (intersects.length > 0) {
    const intersect = intersects[0];
    const highlightX = Math.floor(intersect.point.x) + 0.5;
    const highlightZ = Math.floor(intersect.point.z) + 0.5;
    highlightMesh.position.set(highlightX, 0, highlightZ);
    
    const objectExist = objects.find((object) =>
      object.position.x === highlightMesh.position.x &&
      object.position.z === highlightMesh.position.z
    );
    if (!objectExist) {
      highlightMesh.material.color.setHex(0xffffff);
    } else {
      highlightMesh.material.color.setHex(0xff0000);
    }
  }
});

window.addEventListener("mousedown", () => {
  const objectExist = objects.find((object) =>
    object.position.x === highlightMesh.position.x &&
    object.position.z === highlightMesh.position.z
  );

  if (!objectExist && intersects.length > 0) {
    const colorPicker = document.getElementById("colorPicker");
    const selectedColor = colorPicker.value;
    const newObject = createObject(selectedObjectType, selectedColor);
    if (newObject) {
      newObject.position.copy(highlightMesh.position);
      newObject.position.y += newObject.userData.offsetY;
      scene.add(newObject);
      objects.push(newObject);
      highlightMesh.material.color.setHex(0xff0000);
    }
  }
  console.log("Objetos na cena:", objects.length);
});

function animate() {
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const buttons = document.querySelectorAll("#object-buttons button");
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedObjectType = button.getAttribute("data-type");
    buttons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
  });
});

const chatContainer = document.getElementById("chat-container");
const chatHeader = document.getElementById("chat-header");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

chatHeader.addEventListener("mousedown", (e) => {
  isDragging = true;
  const rect = chatContainer.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const newLeft = e.clientX - offsetX;
    const newTop = e.clientY - offsetY;
    chatContainer.style.left = newLeft + "px";
    chatContainer.style.top = newTop + "px";
    chatContainer.style.transform = "none";
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  document.body.style.userSelect = "auto";
});

const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");

sendButton.addEventListener("click", () => {
  const message = chatInput.value.trim();

  if (message !== "") {
    console.log("Mensagem enviada:", message);
  }

  chatInput.value = "";
});