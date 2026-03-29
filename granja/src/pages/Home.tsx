import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { XRButton } from 'three/examples/jsm/webxr/XRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { createAnimal, Animal } from '@/utils/AnimalModels';

type XRControllerWithLine = THREE.Group & {
  userData: {
    line?: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    [key: string]: unknown;
  };
};

const PLAYER_HEIGHT = 1.6;
const MAX_LOOK_UP = Math.PI / 3;
const MAX_LOOK_DOWN = -Math.PI / 4;

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);
  const vrButtonHostRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState(0);
  const [fedCount, setFedCount] = useState(0);
  const [animalCount, setAnimalCount] = useState(0);
  const [instructions, setInstructions] = useState(true);
  const [xrSupported, setXrSupported] = useState(false);
  const [isPresentingXR, setIsPresentingXR] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    'Carga la granja en Meta Quest Browser y pulsa "Enter VR".'
  );

  const animalsRef = useRef<Animal[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const rotationRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const previousPointerRef = useRef({ x: 0, y: 0 });
  const xrButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!mountRef.current || !vrButtonHostRef.current) {
      return;
    }

    const mountNode = mountRef.current;
    const vrButtonHost = vrButtonHostRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8ecae6);
    scene.fog = new THREE.Fog(0x8ecae6, 15, 55);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      72,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, PLAYER_HEIGHT, 6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');
    mountNode.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const xrEvents = renderer.xr as unknown as THREE.EventDispatcher;

    const onSessionStart = () => {
      setIsPresentingXR(true);
      setInstructions(true);
      setStatusMessage('VR activa. Usa el gatillo del mando para dar comida.');
    };

    const onSessionEnd = () => {
      setIsPresentingXR(false);
      setStatusMessage('Modo pantalla activo. En Quest 2 puedes volver a entrar con "Enter VR".');
    };

    xrEvents.addEventListener('sessionstart', onSessionStart);
    xrEvents.addEventListener('sessionend', onSessionEnd);

    const ambientLight = new THREE.HemisphereLight(0xfff6d6, 0x3b6b35, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff4d6, 1.7);
    sunLight.position.set(12, 18, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 22;
    sunLight.shadow.camera.bottom = -22;
    scene.add(sunLight);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(30, 96),
      new THREE.MeshStandardMaterial({
        color: 0x4a8f43,
        roughness: 1,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const path = new THREE.Mesh(
      new THREE.RingGeometry(8, 10.5, 48),
      new THREE.MeshStandardMaterial({
        color: 0xc9b37f,
        roughness: 1,
        side: THREE.DoubleSide,
      })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.01;
    scene.add(path);

    const grassGeometry = new THREE.ConeGeometry(0.03, 0.2, 5);
    for (let i = 0; i < 260; i += 1) {
      const grass = new THREE.Mesh(
        grassGeometry,
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0x3a7d44 : 0x2f6f3a,
          roughness: 1,
        })
      );
      grass.position.set(
        (Math.random() - 0.5) * 45,
        0.1,
        (Math.random() - 0.5) * 45
      );
      grass.rotation.z = (Math.random() - 0.5) * 0.25;
      grass.castShadow = false;
      scene.add(grass);
    }

    const fenceMaterial = new THREE.MeshStandardMaterial({
      color: 0x84522c,
      roughness: 0.95,
    });

    const createFencePost = (x: number, z: number) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 2, 8),
        fenceMaterial
      );
      post.position.set(x, 1, z);
      post.castShadow = true;
      scene.add(post);
    };

    const createFenceRail = (
      x1: number,
      z1: number,
      x2: number,
      z2: number,
      y: number
    ) => {
      const length = Math.hypot(x2 - x1, z2 - z1);
      const rail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, length, 8),
        fenceMaterial
      );
      const angle = Math.atan2(z2 - z1, x2 - x1);
      rail.rotation.z = Math.PI / 2;
      rail.rotation.y = -angle;
      rail.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      rail.castShadow = true;
      scene.add(rail);
    };

    const fencePoints = [
      [-12, -12],
      [12, -12],
      [12, 12],
      [-12, 12],
    ] as const;

    fencePoints.forEach(([x1, z1], index) => {
      const [x2, z2] = fencePoints[(index + 1) % fencePoints.length];
      const steps = Math.ceil(Math.hypot(x2 - x1, z2 - z1) / 3);

      for (let step = 0; step <= steps; step += 1) {
        const t = step / steps;
        createFencePost(x1 + (x2 - x1) * t, z1 + (z2 - z1) * t);
      }

      createFenceRail(x1, z1, x2, z2, 0.65);
      createFenceRail(x1, z1, x2, z2, 1.35);
    });

    const barnGroup = new THREE.Group();
    const barnWalls = new THREE.Mesh(
      new THREE.BoxGeometry(7, 4.2, 5.5),
      new THREE.MeshStandardMaterial({
        color: 0x9b2d20,
        roughness: 0.95,
      })
    );
    barnWalls.position.y = 2.1;
    barnWalls.castShadow = true;
    barnWalls.receiveShadow = true;
    barnGroup.add(barnWalls);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(4.7, 2.6, 4),
      new THREE.MeshStandardMaterial({
        color: 0x4a4c55,
        roughness: 1,
      })
    );
    roof.position.y = 5.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    barnGroup.add(roof);

    const barnDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.7, 0.12),
      new THREE.MeshStandardMaterial({
        color: 0x4e2b12,
        roughness: 1,
      })
    );
    barnDoor.position.set(0, 1.35, 2.82);
    barnGroup.add(barnDoor);
    barnGroup.position.set(-8.5, 0, -8.5);
    scene.add(barnGroup);

    const hayBaleMaterial = new THREE.MeshStandardMaterial({
      color: 0xd9b84f,
      roughness: 1,
    });

    for (let i = 0; i < 4; i += 1) {
      const bale = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 1.2, 18),
        hayBaleMaterial
      );
      bale.rotation.z = Math.PI / 2;
      bale.position.set(-4 + i * 1.3, 0.65, 9.5);
      bale.castShadow = true;
      bale.receiveShadow = true;
      scene.add(bale);
    }

    const animalTypes: Animal['type'][] = [
      'sheep',
      'sheep',
      'chicken',
      'chicken',
      'chicken',
      'cow',
      'cow',
      'pig',
      'pig',
    ];

    const animals: Animal[] = [];

    animalTypes.forEach((type, index) => {
      const animalMesh = createAnimal(type);
      const angle = (index / animalTypes.length) * Math.PI * 2;
      const radius = 5 + Math.random() * 3.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      animalMesh.position.set(x, 0, z);
      animalMesh.rotation.y = Math.random() * Math.PI * 2;
      animalMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      animalMesh.userData.animalIndex = index;
      scene.add(animalMesh);

      animals.push({
        mesh: animalMesh,
        type,
        position: new THREE.Vector3(x, 0, z),
        isFed: false,
      });
    });

    animalsRef.current = animals;
    setAnimalCount(animals.length);

    const resolveAnimalFromObject = (object: THREE.Object3D | null) => {
      let current = object;

      while (current) {
        const animalIndex = current.userData.animalIndex;

        if (typeof animalIndex === 'number') {
          return animalsRef.current[animalIndex] ?? null;
        }

        current = current.parent;
      }

      return null;
    };

    const feedAnimal = (animal: Animal | null) => {
      if (!animal || animal.isFed) {
        return;
      }

      animal.isFed = true;
      setScore((current) => current + 10);
      setFedCount((current) => current + 1);

      const originalY = animal.mesh.position.y;
      let elapsed = 0;

      const bounce = () => {
        elapsed += 0.14;
        animal.mesh.position.y = originalY + Math.sin(elapsed) * 0.28;

        if (elapsed < Math.PI) {
          window.requestAnimationFrame(bounce);
        } else {
          animal.mesh.position.y = originalY;
        }
      };

      bounce();

      animal.mesh.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }

        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          return;
        }

        const originalColor = child.material.color.clone();
        child.material.color.lerp(new THREE.Color(0xfff07a), 0.35);

        window.setTimeout(() => {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.color.copy(originalColor);
          }
        }, 900);
      });
    };

    const intersectAnimals = (originObject: THREE.Object3D | null) => {
      if (!originObject) {
        return null;
      }

      raycasterRef.current.setFromXRController(originObject);
      const hits = raycasterRef.current.intersectObjects(
        animalsRef.current.map((animal) => animal.mesh),
        true
      );

      return resolveAnimalFromObject(hits[0]?.object ?? null);
    };

    const createControllerRay = () => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1.5),
      ]);
      const material = new THREE.LineBasicMaterial({ color: 0xffe082 });
      const line = new THREE.Line(geometry, material);
      line.name = 'controller-ray';
      line.scale.z = 4;
      return line;
    };

    const controllerModelFactory = new XRControllerModelFactory();
    const controllers: XRControllerWithLine[] = [];

    for (let i = 0; i < 2; i += 1) {
      const controller = renderer.xr.getController(i) as XRControllerWithLine;
      const line = createControllerRay();
      controller.add(line);
      controller.userData.line = line;
      controller.addEventListener('selectstart', () => {
        feedAnimal(intersectAnimals(controller));
      });
      scene.add(controller);
      controllers.push(controller);

      const controllerGrip = renderer.xr.getControllerGrip(i);
      controllerGrip.add(
        controllerModelFactory.createControllerModel(controllerGrip)
      );
      scene.add(controllerGrip);
    }

    const updateControllerRays = () => {
      controllers.forEach((controller) => {
        const line = controller.userData.line;
        if (!line) {
          return;
        }

        const animal = intersectAnimals(controller);
        line.material.color.set(animal && !animal.isFed ? 0x8df28f : 0xffe082);
        line.scale.z = animal ? 2.6 : 4;
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (renderer.xr.isPresenting) {
        return;
      }

      const rotationStep = 0.08;

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          targetRotationRef.current.y += rotationStep;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          targetRotationRef.current.y -= rotationStep;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          targetRotationRef.current.x = Math.min(
            targetRotationRef.current.x + rotationStep,
            MAX_LOOK_UP
          );
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          targetRotationRef.current.x = Math.max(
            targetRotationRef.current.x - rotationStep,
            MAX_LOOK_DOWN
          );
          break;
        default:
          break;
      }
    };

    const startDrag = (clientX: number, clientY: number) => {
      if (renderer.xr.isPresenting) {
        return;
      }

      isDraggingRef.current = true;
      previousPointerRef.current = { x: clientX, y: clientY };
    };

    const updatePointer = (clientX: number, clientY: number) => {
      pointerRef.current.x = (clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(clientY / window.innerHeight) * 2 + 1;
    };

    const moveDrag = (clientX: number, clientY: number) => {
      updatePointer(clientX, clientY);

      if (!isDraggingRef.current || renderer.xr.isPresenting) {
        return;
      }

      const deltaX = clientX - previousPointerRef.current.x;
      const deltaY = clientY - previousPointerRef.current.y;

      targetRotationRef.current.y -= deltaX * 0.0032;
      targetRotationRef.current.x = THREE.MathUtils.clamp(
        targetRotationRef.current.x - deltaY * 0.0032,
        MAX_LOOK_DOWN,
        MAX_LOOK_UP
      );

      previousPointerRef.current = { x: clientX, y: clientY };
    };

    const endDrag = () => {
      isDraggingRef.current = false;
    };

    const feedAnimalFromPointer = () => {
      if (!cameraRef.current || renderer.xr.isPresenting) {
        return;
      }

      raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
      const hits = raycasterRef.current.intersectObjects(
        animalsRef.current.map((animal) => animal.mesh),
        true
      );
      feedAnimal(resolveAnimalFromObject(hits[0]?.object ?? null));
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        updatePointer(event.clientX, event.clientY);
        startDrag(event.clientX, event.clientY);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      moveDrag(event.clientX, event.clientY);
    };

    const handleMouseUp = () => {
      endDrag();
    };

    const handleClick = () => {
      feedAnimalFromPointer();
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      updatePointer(touch.clientX, touch.clientY);
      startDrag(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      moveDrag(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      endDrag();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const xrNavigator = navigator as Navigator & {
      xr?: {
        isSessionSupported(mode: 'immersive-vr'): Promise<boolean>;
      };
    };

    if (xrNavigator.xr) {
      xrNavigator.xr
        .isSessionSupported('immersive-vr')
        .then((supported) => {
          setXrSupported(supported);

          if (!supported) {
            setStatusMessage(
              'Este navegador no soporta immersive-vr. En Quest 2 usa Meta Quest Browser.'
            );
            return;
          }

          const button = XRButton.createButton(renderer, {
            optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
          }) as HTMLButtonElement;

          button.textContent = 'Enter VR';
          button.style.position = 'static';
          button.style.width = '100%';
          button.style.height = '100%';
          button.style.border = '0';
          button.style.borderRadius = '999px';
          button.style.background =
            'linear-gradient(135deg, rgba(247, 202, 24, 0.95), rgba(248, 116, 34, 0.95))';
          button.style.color = '#1a1200';
          button.style.fontSize = '15px';
          button.style.fontWeight = '700';
          button.style.letterSpacing = '0.02em';
          button.style.boxShadow = '0 18px 50px rgba(0, 0, 0, 0.28)';
          button.style.cursor = 'pointer';
          button.style.opacity = '1';

          xrButtonRef.current = button;
          vrButtonHost.appendChild(button);
          setStatusMessage('Quest 2 detectado. Pulsa "Enter VR" para entrar al corral.');
        })
        .catch(() => {
          setStatusMessage(
            'No se pudo inicializar WebXR. Prueba desde Meta Quest Browser con HTTPS.'
          );
        });
    } else {
      setStatusMessage(
        'WebXR no esta disponible aqui. La granja sigue funcionando en pantalla normal.'
      );
    }

    const clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      const elapsed = clock.getElapsedTime();

      if (!renderer.xr.isPresenting) {
        rotationRef.current.x +=
          (targetRotationRef.current.x - rotationRef.current.x) * 0.12;
        rotationRef.current.y +=
          (targetRotationRef.current.y - rotationRef.current.y) * 0.12;

        camera.rotation.x = rotationRef.current.x;
        camera.rotation.y = rotationRef.current.y;
      }

      animalsRef.current.forEach((animal, index) => {
        const sway = elapsed * 0.8 + index * 0.65;
        const idleOffset = animal.isFed ? 0.02 : 0.05;
        animal.mesh.position.y = Math.sin(sway) * idleOffset;

        if (!animal.isFed) {
          animal.mesh.rotation.y += animal.type === 'chicken' ? 0.006 : 0.002;
        }
      });

      updateControllerRays();
      renderer.render(scene, camera);
    });

    const instructionsTimeout = window.setTimeout(() => {
      setInstructions(false);
    }, 7000);

    return () => {
      window.clearTimeout(instructionsTimeout);
      renderer.setAnimationLoop(null);
      xrEvents.removeEventListener('sessionstart', onSessionStart);
      xrEvents.removeEventListener('sessionend', onSessionEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (xrButtonRef.current && vrButtonHost.contains(xrButtonRef.current)) {
        vrButtonHost.removeChild(xrButtonRef.current);
      }

      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }

      renderer.dispose();
      animalsRef.current = [];
      rendererRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  const allAnimalsFed = animalCount > 0 && fedCount === animalCount;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#cfefff]">
      <div ref={mountRef} className="h-full w-full" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 md:p-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-4">
          <div className="pointer-events-auto rounded-[28px] border border-white/30 bg-[#113123]/75 px-5 py-4 text-white backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#bce6c3]">
              Quest 2 VR Farm
            </p>
            <h1 className="mt-1 text-2xl font-black text-[#fff3db] md:text-3xl">
              Corral inmersivo
            </h1>
            <p className="mt-2 text-sm text-white/80 md:text-base">
              Alimenta a todos los animales desde VR o en pantalla normal.
            </p>
          </div>

          <div className="pointer-events-auto flex min-w-[240px] flex-col gap-3 rounded-[28px] border border-white/25 bg-black/45 px-5 py-4 text-white backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm uppercase tracking-[0.22em] text-white/60">
                Puntuacion
              </span>
              <span className="text-3xl font-black text-[#ffd166]">{score}</span>
            </div>
            <div className="text-sm text-white/75">
              {fedCount} / {animalCount} animales alimentados
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/80">
              {statusMessage}
            </div>
            <div
              ref={vrButtonHostRef}
              className={`h-12 overflow-hidden rounded-full ${
                xrSupported ? 'border border-white/20 bg-white/10' : 'hidden'
              }`}
            />
          </div>
        </div>
      </div>

      {instructions && (
        <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 w-[min(92vw,780px)] -translate-x-1/2 rounded-[30px] border border-white/30 bg-[#1f1711]/80 px-5 py-5 text-white backdrop-blur-xl md:px-8">
          <h2 className="text-center text-xl font-black text-[#ffe9b5] md:text-2xl">
            Instrucciones para Quest 2
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-white/85 md:grid-cols-2 md:text-base">
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              En Quest 2 abre la app en Meta Quest Browser y pulsa `Enter VR`.
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              Apunta con el rayo del mando y aprieta el gatillo para alimentar.
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              Si estas en PC o movil, puedes arrastrar la camara y tocar animales.
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              Cuando todos esten alimentados, ganas la ronda completa.
            </div>
          </div>
        </div>
      )}

      {!isPresentingXR && (
        <div className="pointer-events-auto absolute bottom-4 left-4 z-10 md:hidden">
          <div className="grid grid-cols-3 gap-2 rounded-[24px] border border-white/20 bg-black/35 p-2 backdrop-blur-md">
            <div />
            <button
              onTouchStart={() => {
                targetRotationRef.current.x = Math.min(
                  targetRotationRef.current.x + 0.12,
                  MAX_LOOK_UP
                );
              }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl text-white active:bg-white/20"
              >
              ^
            </button>
            <div />
            <button
              onTouchStart={() => {
                targetRotationRef.current.y += 0.12;
              }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl text-white active:bg-white/20"
              >
              {'<'}
            </button>
            <div />
            <button
              onTouchStart={() => {
                targetRotationRef.current.y -= 0.12;
              }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl text-white active:bg-white/20"
              >
              {'>'}
            </button>
            <div />
            <button
              onTouchStart={() => {
                targetRotationRef.current.x = Math.max(
                  targetRotationRef.current.x - 0.12,
                  MAX_LOOK_DOWN
                );
              }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl text-white active:bg-white/20"
              >
              v
            </button>
            <div />
          </div>
        </div>
      )}

      {allAnimalsFed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0d1117]/72 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-[36px] border border-white/25 bg-gradient-to-br from-[#2f9341] via-[#5f9f33] to-[#d97904] px-8 py-10 text-center text-white shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/75">
              Victoria
            </p>
            <h2 className="mt-3 text-4xl font-black">Todos comieron</h2>
            <p className="mt-3 text-lg text-white/90">
              Puntuacion final: {score}
            </p>
            <p className="mt-2 text-sm text-white/80">
              El corral ya esta listo para volver a jugar desde Quest 2.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
