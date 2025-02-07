import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class DaedalusEditor {
    constructor() {
        this.initScene();
        this.initControls();
        this.setupEventListeners();
    }

    initScene() {
        // Configuração do Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true,
            alpha: true
        });
        
        this.updateRendererSize();

        // Criar grade
        const size = 100;
        const divisions = 100;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x0088ff, 0x001830);
        this.scene.add(gridHelper);

        // Posicionar câmera
        this.camera.position.z = 30;
        this.camera.position.y = 20;
        this.camera.lookAt(0, 0, 0);
    }

    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    updateRendererSize() {
        const container = document.querySelector('.canvas-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.updateRendererSize(), false);

        // Adicionar listeners para botões e inputs
        document.getElementById('generate-text-3d')?.addEventListener('click', () => this.generateText3D());
        document.getElementById('generate-image-3d')?.addEventListener('click', () => this.generateImage3D());
    }

    generateText3D() {
        const text = document.getElementById('text-input').value;
        console.log('Gerando texto 3D:', text);
        // Implementar lógica de geração de texto 3D
    }

    generateImage3D() {
        const imageInput = document.getElementById('image-input');
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            console.log('Gerando imagem 3D:', file);
            // Implementar lógica de conversão de imagem para 3D
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    start() {
        this.animate();
    }
}

// Inicializar o editor quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    const editor = new DaedalusEditor();
    editor.start();
});