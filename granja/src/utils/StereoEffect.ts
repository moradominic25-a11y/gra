import * as THREE from 'three';

/**
 * Stereo Effect for VR side-by-side rendering
 * Based on Three.js StereoEffect for VR headsets
 */
export class StereoEffect {
  private renderer: THREE.WebGLRenderer;
  private stereoCamera: THREE.StereoCamera;
  private eyeSeparation: number = 0.064; // 64mm average human IPD
  private focalLength: number = 15;

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    this.stereoCamera = new THREE.StereoCamera();
    this.stereoCamera.aspect = 0.5;
  }

  setEyeSeparation(separation: number): void {
    this.eyeSeparation = separation;
  }

  setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }

  render(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    if (!scene || !camera) return;

    scene.updateMatrixWorld(true);

    if (camera.parent === null) {
      camera.updateMatrixWorld(true);
    }

    this.stereoCamera.update(camera);

    const size = this.renderer.getSize(new THREE.Vector2());
    const width = size.width / 2;
    const height = size.height;

    this.renderer.setScissorTest(true);
    this.renderer.clear();

    // Left eye
    this.renderer.setScissor(0, 0, width, height);
    this.renderer.setViewport(0, 0, width, height);
    this.renderer.render(scene, this.stereoCamera.cameraL);

    // Right eye
    this.renderer.setScissor(width, 0, width, height);
    this.renderer.setViewport(width, 0, width, height);
    this.renderer.render(scene, this.stereoCamera.cameraR);

    this.renderer.setScissorTest(false);
  }
}
