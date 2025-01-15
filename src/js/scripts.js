import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Configuração inicial do renderer e fundo branco
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xFFFFFF); // Define o fundo branco
document.body.appendChild(renderer.domElement);

// Cena, câmera e controle
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
        visible: false
    })
);
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);

// Grade com cor preta
const grid = new THREE.GridHelper(20, 20, 0x000000, 0x000000); // Linhas e divisões pretas
scene.add(grid);

const highlightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true
    })
);
highlightMesh.rotateX(-Math.PI / 2);
highlightMesh.position.set(0.5, 0, 0.5);
scene.add(highlightMesh);

// Variáveis para o raycaster e os objetos
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

// Tipo de objeto selecionado (padrão: cubo)
let selectedObjectType = "cube";

// Função para criar diferentes tipos de objeto
function createObject(type) {
    let object, offsetY;
    switch (type) {
        case "cube":
            object = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ color: 0x00FF00 })
            );
            offsetY = 0.5; // Metade da altura do cubo
            break;
        case "sphere":
            object = new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 32, 32),
                new THREE.MeshBasicMaterial({ color: 0x0000FF })
            );
            offsetY = 0.5; // Raio da esfera
            break;
        case "cylinder":
            object = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
                new THREE.MeshBasicMaterial({ color: 0xFF0000 })
            );
            offsetY = 0.5; // Metade da altura do cilindro
            break;
        default:
            return null;
    }

    object.userData.offsetY = offsetY; // Armazenar o deslocamento no objeto
    return object;
}

// Eventos de movimento do mouse
window.addEventListener('mousemove', function (e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObject(planeMesh);
    if (intersects.length > 0) {
        const intersect = intersects[0];
        const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
        highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

        const objectExist = objects.find(function (object) {
            return (object.position.x === highlightMesh.position.x)
                && (object.position.z === highlightMesh.position.z);
        });

        if (!objectExist)
            highlightMesh.material.color.setHex(0xFFFFFF);
        else
            highlightMesh.material.color.setHex(0xFF0000);
    }
});

// Lista de objetos na cena
const objects = [];

// Evento de clique para adicionar objetos
window.addEventListener('mousedown', function () {
    const objectExist = objects.find(function (object) {
        return (object.position.x === highlightMesh.position.x)
            && (object.position.z === highlightMesh.position.z);
    });

    if (!objectExist) {
        if (intersects.length > 0) {
            const newObject = createObject(selectedObjectType);
            if (newObject) {
                newObject.position.copy(highlightMesh.position);
                newObject.position.y += newObject.userData.offsetY; // Aplicar o deslocamento
                scene.add(newObject);
                objects.push(newObject);
                highlightMesh.material.color.setHex(0xFF0000);
            }
        }
    }
    console.log(scene.children.length);
});

// Função de animação
function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Ajuste da câmera ao redimensionar a janela
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Adicionar botões HTML para escolher o tipo de objeto
const controlsContainer = document.createElement('div');
controlsContainer.style.position = 'absolute';
controlsContainer.style.top = '10px';
controlsContainer.style.left = '10px';
controlsContainer.style.zIndex = '100';
controlsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
controlsContainer.style.padding = '10px';
controlsContainer.style.borderRadius = '5px';
controlsContainer.style.display = 'flex';
controlsContainer.style.gap = '10px';

const cubeButton = document.createElement('button');
cubeButton.innerText = 'Cubo';
cubeButton.onclick = () => { selectedObjectType = 'cube'; };

const sphereButton = document.createElement('button');
sphereButton.innerText = 'Esfera';
sphereButton.onclick = () => { selectedObjectType = 'sphere'; };

const cylinderButton = document.createElement('button');
cylinderButton.innerText = 'Cilindro';
cylinderButton.onclick = () => { selectedObjectType = 'cylinder'; };

controlsContainer.appendChild(cubeButton);
controlsContainer.appendChild(sphereButton);
controlsContainer.appendChild(cylinderButton);
document.body.appendChild(controlsContainer);
