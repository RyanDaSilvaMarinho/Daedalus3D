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
        visible: false,
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
        transparent: true,
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
function createObject(type, color) {
    let object, offsetY;
    const material = new THREE.MeshBasicMaterial({ color }); // Usa a cor escolhida
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

    object.userData.offsetY = offsetY; // Armazenar o deslocamento no objeto
    return object;
}

// Eventos de movimento do mouse
window.addEventListener("mousemove", function (e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObject(planeMesh);
    if (intersects.length > 0) {
        const intersect = intersects[0];
        const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
        highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

        const objectExist = objects.find(function (object) {
            return (
                object.position.x === highlightMesh.position.x &&
                object.position.z === highlightMesh.position.z
            );
        });

        if (!objectExist) highlightMesh.material.color.setHex(0xffffff);
        else highlightMesh.material.color.setHex(0xff0000);
    }
});

// Lista de objetos na cena
const objects = [];

// Obter o seletor de cor
const colorPicker = document.getElementById("colorPicker");

// Evento de clique para adicionar objetos
window.addEventListener("mousedown", function () {
    const objectExist = objects.find(function (object) {
        return (
            object.position.x === highlightMesh.position.x &&
            object.position.z === highlightMesh.position.z
        );
    });

    if (!objectExist) {
        if (intersects.length > 0) {
            const selectedColor = colorPicker.value; // Obter a cor escolhida
            const newObject = createObject(selectedObjectType, selectedColor);
            if (newObject) {
                newObject.position.copy(highlightMesh.position);
                newObject.position.y += newObject.userData.offsetY; // Aplicar o deslocamento
                scene.add(newObject);
                objects.push(newObject);
                highlightMesh.material.color.setHex(0xff0000);
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
window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Criar e estilizar os botões com imagens
const controlsContainer = document.getElementById("controls");

// Função para criar um botão
function createButton(type, imagePath) {
    const button = document.createElement("button");
    button.classList.add(type); // Adiciona a classe correspondente
    button.style.backgroundImage = `url('${imagePath}')`; // Define a imagem como fundo
    button.style.backgroundSize = "contain"; // Ajusta o tamanho da imagem
    button.style.backgroundRepeat = "no-repeat"; // Evita repetição
    button.style.backgroundPosition = "center"; // Centraliza a imagem
    button.style.width = "60px"; // Largura do botão
    button.style.height = "60px"; // Altura do botão
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.margin = "5px";

    button.onclick = () => {
        selectedObjectType = type;
        document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected"));
        button.classList.add("selected");
    };

    return button;
}

// Adicionar os botões com imagens
controlsContainer.appendChild(createButton("cube", "https://www.pngfind.com/pngs/m/179-1790052_570-x-599-10-white-3d-cube-png.png"));
controlsContainer.appendChild(createButton("sphere", "https://p7.hiclipart.com/preview/645/904/905/sphere-three-dimensional-space-drawing-grey-wallpaper.jpg"));
controlsContainer.appendChild(createButton("cylinder", "https://www.nicepng.com/png/detail/23-238447_3d-cylinder-png.png"));
