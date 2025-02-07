script.js;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    alpha: true
});
renderer.setSize(window.innerWidth - 300, window.innerHeight - 100);
document.getElementById('drawing-area').appendChild(renderer.domElement);
camera.position.set(0, 5, 10);
const gridHelper = new THREE.GridHelper(20, 20, 0x30363d, 0x30363d);
scene.add(gridHelper);
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
window.addEventListener('resize', ()=>{
    camera.aspect = (window.innerWidth - 300) / (window.innerHeight - 100);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth - 300, window.innerHeight - 100);
});

//# sourceMappingURL=index.c6e193e7.js.map
