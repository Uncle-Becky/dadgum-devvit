import * as THREE from 'three';

export class ThreeHelper {
  static createBasicScene(): THREE.Scene {
    const scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(ambientLight);
    scene.add(directionalLight);
    return scene;
  }

  static createPerspectiveCamera(fov = 75): THREE.PerspectiveCamera {
    const aspect = window.innerWidth / window.innerHeight;
    return new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
  }

  static createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    return renderer;
  }

  static disposeObject(obj: THREE.Object3D): void {
    while (obj.children.length > 0) {
      ThreeHelper.disposeObject(obj.children[0]);
      obj.remove(obj.children[0]);
    }
    if (obj instanceof THREE.Mesh) {
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(material => material.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
  }
}
