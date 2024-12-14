interface ThreeAppConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  antialias?: boolean;
}

interface SceneObject {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  visible: boolean;
}

interface AnimationLoop {
  start: () => void;
  stop: () => void;
  onFrame: (deltaTime: number) => void;
}

interface ThreeAppState {
  isInitialized: boolean;
  isPlaying: boolean;
  currentScene: string;
  fps: number;
}
