import * as THREE from 'three';

export interface Animal {
  mesh: THREE.Group;
  type: 'sheep' | 'chicken' | 'cow' | 'pig';
  position: THREE.Vector3;
  isFed: boolean;
  animationMixer?: THREE.AnimationMixer;
}

/**
 * Create a simplified 3D sheep model
 */
export function createSheep(): THREE.Group {
  const group = new THREE.Group();

  // Body (woolly texture)
  const bodyGeometry = new THREE.SphereGeometry(0.6, 16, 16);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,
    roughness: 0.9,
    metalness: 0.1,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.scale.set(1, 0.8, 1.2);
  body.position.y = 0.5;
  group.add(body);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xd0d0d0,
    roughness: 0.8,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 0.6, 0.8);
  group.add(head);

  // Ears
  const earGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
  const earMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });

  const leftEar = new THREE.Mesh(earGeometry, earMaterial);
  leftEar.position.set(-0.2, 0.8, 0.8);
  leftEar.rotation.z = -Math.PI / 6;
  group.add(leftEar);

  const rightEar = new THREE.Mesh(earGeometry, earMaterial);
  rightEar.position.set(0.2, 0.8, 0.8);
  rightEar.rotation.z = Math.PI / 6;
  group.add(rightEar);

  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x404040 });

  const legPositions = [
    [-0.3, 0.25, 0.4],
    [0.3, 0.25, 0.4],
    [-0.3, 0.25, -0.4],
    [0.3, 0.25, -0.4],
  ];

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    group.add(leg);
  });

  return group;
}

/**
 * Create a simplified 3D chicken model
 */
export function createChicken(): THREE.Group {
  const group = new THREE.Group();

  // Body
  const bodyGeometry = new THREE.SphereGeometry(0.4, 16, 16);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.scale.set(1, 1.2, 0.8);
  body.position.y = 0.4;
  group.add(body);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffe4e1 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 0.7, 0.3);
  group.add(head);

  // Beak
  const beakGeometry = new THREE.ConeGeometry(0.08, 0.15, 8);
  const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xff8c00 });
  const beak = new THREE.Mesh(beakGeometry, beakMaterial);
  beak.position.set(0, 0.7, 0.45);
  beak.rotation.x = Math.PI / 2;
  group.add(beak);

  // Crest
  const crestGeometry = new THREE.ConeGeometry(0.1, 0.2, 4);
  const crestMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const crest = new THREE.Mesh(crestGeometry, crestMaterial);
  crest.position.set(0, 0.85, 0.25);
  group.add(crest);

  // Wings
  const wingGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });

  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing.scale.set(0.5, 1, 1.5);
  leftWing.position.set(-0.35, 0.4, 0);
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing.scale.set(0.5, 1, 1.5);
  rightWing.position.set(0.35, 0.4, 0);
  group.add(rightWing);

  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0xff8c00 });

  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.15, 0.15, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.15, 0.15, 0);
  group.add(rightLeg);

  group.scale.set(0.8, 0.8, 0.8);

  return group;
}

/**
 * Create a simplified 3D cow model
 */
export function createCow(): THREE.Group {
  const group = new THREE.Group();

  // Body
  const bodyGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.6);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.7;
  group.add(body);

  // Black spots
  const spotGeometry = new THREE.SphereGeometry(0.15, 8, 8);
  const spotMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

  const spotPositions = [
    [-0.3, 0.8, 0.2],
    [0.4, 0.7, -0.1],
    [-0.2, 0.6, -0.2],
  ];

  spotPositions.forEach((pos) => {
    const spot = new THREE.Mesh(spotGeometry, spotMaterial);
    spot.scale.set(1.5, 1, 1);
    spot.position.set(pos[0], pos[1], pos[2]);
    group.add(spot);
  });

  // Head
  const headGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.4);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 0.8, 0.7);
  group.add(head);

  // Snout
  const snoutGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
  const snoutMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, 0.7, 0.95);
  group.add(snout);

  // Horns
  const hornGeometry = new THREE.ConeGeometry(0.08, 0.3, 8);
  const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

  const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
  leftHorn.position.set(-0.15, 1.05, 0.7);
  leftHorn.rotation.z = -Math.PI / 6;
  group.add(leftHorn);

  const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
  rightHorn.position.set(0.15, 1.05, 0.7);
  rightHorn.rotation.z = Math.PI / 6;
  group.add(rightHorn);

  // Ears
  const earGeometry = new THREE.SphereGeometry(0.12, 8, 8);
  const earMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });

  const leftEar = new THREE.Mesh(earGeometry, earMaterial);
  leftEar.scale.set(0.5, 1.5, 0.3);
  leftEar.position.set(-0.25, 1.0, 0.6);
  group.add(leftEar);

  const rightEar = new THREE.Mesh(earGeometry, earMaterial);
  rightEar.scale.set(0.5, 1.5, 0.3);
  rightEar.position.set(0.25, 1.0, 0.6);
  group.add(rightEar);

  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

  const legPositions = [
    [-0.4, 0.3, 0.2],
    [0.4, 0.3, 0.2],
    [-0.4, 0.3, -0.2],
    [0.4, 0.3, -0.2],
  ];

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    group.add(leg);
  });

  // Tail
  const tailGeometry = new THREE.CylinderGeometry(0.05, 0.02, 0.8, 8);
  const tailMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.rotation.x = -Math.PI / 3;
  tail.position.set(0, 0.8, -0.5);
  group.add(tail);

  return group;
}

/**
 * Create a simplified 3D pig model
 */
export function createPig(): THREE.Group {
  const group = new THREE.Group();

  // Body
  const bodyGeometry = new THREE.SphereGeometry(0.6, 16, 16);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffc0cb,
    roughness: 0.8,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.scale.set(1.3, 0.9, 1);
  body.position.y = 0.5;
  group.add(body);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 0.6, 0.7);
  group.add(head);

  // Snout
  const snoutGeometry = new THREE.CylinderGeometry(0.2, 0.18, 0.25, 16);
  const snoutMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, 0.55, 0.95);
  group.add(snout);

  // Nostrils
  const nostrilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const nostrilMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

  const leftNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
  leftNostril.position.set(-0.08, 0.55, 1.05);
  group.add(leftNostril);

  const rightNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
  rightNostril.position.set(0.08, 0.55, 1.05);
  group.add(rightNostril);

  // Ears
  const earGeometry = new THREE.ConeGeometry(0.15, 0.25, 8);
  const earMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb });

  const leftEar = new THREE.Mesh(earGeometry, earMaterial);
  leftEar.position.set(-0.2, 0.85, 0.65);
  leftEar.rotation.z = -Math.PI / 4;
  group.add(leftEar);

  const rightEar = new THREE.Mesh(earGeometry, earMaterial);
  rightEar.position.set(0.2, 0.85, 0.65);
  rightEar.rotation.z = Math.PI / 4;
  group.add(rightEar);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.12, 0.68, 0.85);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.12, 0.68, 0.85);
  group.add(rightEye);

  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });

  const legPositions = [
    [-0.35, 0.25, 0.3],
    [0.35, 0.25, 0.3],
    [-0.35, 0.25, -0.3],
    [0.35, 0.25, -0.3],
  ];

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    group.add(leg);
  });

  // Tail (curly)
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.7, -0.6),
    new THREE.Vector3(0.1, 0.8, -0.7),
    new THREE.Vector3(0.05, 0.9, -0.75),
    new THREE.Vector3(0, 0.85, -0.8),
  ]);

  const tailGeometry = new THREE.TubeGeometry(tailCurve, 20, 0.03, 8, false);
  const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  group.add(tail);

  return group;
}

/**
 * Create animal by type
 */
export function createAnimal(type: 'sheep' | 'chicken' | 'cow' | 'pig'): THREE.Group {
  switch (type) {
    case 'sheep':
      return createSheep();
    case 'chicken':
      return createChicken();
    case 'cow':
      return createCow();
    case 'pig':
      return createPig();
    default:
      return createSheep();
  }
}
