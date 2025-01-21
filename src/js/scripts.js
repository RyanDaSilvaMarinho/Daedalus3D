import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Configuração inicial
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

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

// Malha plana e grade
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

// Variáveis e objetos globais
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;
let selectedObjectType = "cube";
const objects = []; // Lista de objetos na cena
let selectedObject = null; // Objeto atualmente selecionado para arrastar
let isDragging = false; // Indica se o arrasto está em andamento

// Função para criar objetos com contorno
function createObject(type, color) {
    let object, offsetY;
    const material = new THREE.MeshBasicMaterial({ color });

    const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.BackSide,
    });

    const edgesMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 1,
    });

    switch (type) {
        case "cube":
            object = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
            offsetY = 0.5;

            const cubeOutline = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 1.1, 1.1),
                outlineMaterial
            );
            object.add(cubeOutline);

            const cubeEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
            const cubeEdgesMesh = new THREE.LineSegments(cubeEdges, edgesMaterial);
            object.add(cubeEdgesMesh);
            break;

        case "sphere":
            object = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
            offsetY = 0.5;

            const sphereOutline = new THREE.Mesh(
                new THREE.SphereGeometry(0.55, 32, 32),
                outlineMaterial
            );
            object.add(sphereOutline);
            break;

        case "cylinder":
            object = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), material);
            offsetY = 0.5;

            const cylinderOutline = new THREE.Mesh(
                new THREE.CylinderGeometry(0.55, 0.55, 1.1, 32),
                outlineMaterial
            );
            object.add(cylinderOutline);
            break;

        default:
            return null;
    }

    object.userData.offsetY = offsetY;
    object.scale.set(0.1, 0.1, 0.1); // Define escala inicial para a animação
    return object;
}

// Função para animar a escala de surgimento
function animateScale(object) {
    const scaleSpeed = 0.05; // Velocidade da animação
    const targetScale = 1; // Escala final

    function scaleUp() {
        if (object.scale.x < targetScale) {
            object.scale.x += scaleSpeed;
            object.scale.y += scaleSpeed;
            object.scale.z += scaleSpeed;
            requestAnimationFrame(scaleUp);
        } else {
            object.scale.set(targetScale, targetScale, targetScale);
        }
    }
    scaleUp();
}

// Função para criar e adicionar botões
function createButton(type, parent) {
    const button = document.createElement("button");
    button.classList.add(type);
    button.onclick = () => {
        selectedObjectType = type;
        document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected"));
        button.classList.add("selected");
    };
    parent.appendChild(button);
}

window.addEventListener("mousedown", (e) => {
    raycaster.setFromCamera(mousePosition, camera);
    const intersectedObjects = raycaster.intersectObjects(objects);

    if (intersectedObjects.length > 0) {
        selectedObject = intersectedObjects[0].object;
        isDragging = true;
    } else if (intersects?.length > 0) {
        const objectExist = objects.find(
            (object) =>
                object.position.x === highlightMesh.position.x &&
                object.position.z === highlightMesh.position.z
        );

        if (!objectExist) {
            // Captura a cor selecionada no colorPicker
            const colorPicker = document.getElementById("colorPicker"); // Certifique-se de que o ID está correto
            const selectedColor = colorPicker ? colorPicker.value : "#ff0000"; // Fallback para vermelho, caso o colorPicker não exista

            const newObject = createObject(selectedObjectType, selectedColor);

            if (newObject) {
                newObject.position.copy(highlightMesh.position);
                newObject.position.y += newObject.userData.offsetY;
                scene.add(newObject);
                objects.push(newObject);

                // Animação de escala
                animateScale(newObject);
            }
        }
    }
});

// Evento para movimentar objetos
window.addEventListener("mousemove", (e) => {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObject(planeMesh);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
        highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

        if (isDragging && selectedObject) {
            selectedObject.position.set(
                highlightPos.x,
                selectedObject.userData.offsetY,
                highlightPos.z
            );
        }
    }
});

// Soltar objetos ao soltar o botão do mouse
window.addEventListener("mouseup", () => {
    isDragging = false;
    selectedObject = null;
});

// Configuração inicial dos botões
const controlsContainer = document.getElementById("controls");
createButton("cube", controlsContainer);
createButton("sphere", controlsContainer);
createButton("cylinder", controlsContainer);

// Função de animação
function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Redimensionar janela
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
