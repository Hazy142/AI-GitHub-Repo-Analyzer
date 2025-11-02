import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  BufferGeometry,
} from 'three';
import { STUD_SIZE, STUD_PROTRUSION_UNITS, STUD_DIAMETER_UNITS } from './lego-constants';
import { PART_CATALOG } from './part-catalog';
import { PlacedBrick } from './lego-types';

const geometryCache = new Map<string, BufferGeometry>();

function createSlopeGeometry(width: number, height: number, depth: number): BufferGeometry {
  // For now model slopes as simple boxes to keep performance predictable.
  return new BoxGeometry(width, height, depth);
}

function createGeometry(partId: string): BufferGeometry {
  if (geometryCache.has(partId)) {
    return geometryCache.get(partId)!.clone();
  }

  const part = PART_CATALOG[partId];
  if (!part) {
    throw new Error(`Unknown part: ${partId}`);
  }

  const width = part.widthStuds * STUD_SIZE;
  const depth = part.depthStuds * STUD_SIZE;
  const height = part.heightStuds * STUD_SIZE;

  let geometry: BufferGeometry;

  if (part.shape === 'cylinder') {
    const radius = width / 2;
    geometry = new CylinderGeometry(radius, radius, height, 32);
  } else if (part.shape === 'slope') {
    geometry = createSlopeGeometry(width, height, depth);
  } else {
    geometry = new BoxGeometry(width, height, depth);
  }

  geometryCache.set(partId, geometry.clone());
  return geometry;
}

export function createBrickMesh(brick: PlacedBrick): Group {
  const part = PART_CATALOG[brick.partId];
  if (!part) {
    throw new Error(`Unknown part definition for ${brick.partId}`);
  }

  const group = new Group();
  const material = new MeshStandardMaterial({
    color: brick.color,
    roughness: 0.35,
    metalness: 0.1,
  });

  const bodyGeometry = createGeometry(brick.partId);
  const body = new Mesh(bodyGeometry, material);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  if (part.hasStuds) {
    const studGeometry = new CylinderGeometry(STUD_DIAMETER_UNITS / 2, STUD_DIAMETER_UNITS / 2, STUD_PROTRUSION_UNITS, 16);

    for (let x = 0; x < part.widthStuds; x += 1) {
      for (let z = 0; z < part.depthStuds; z += 1) {
        const stud = new Mesh(studGeometry, material);
        stud.castShadow = true;
        stud.receiveShadow = true;

        const offsetX = (x - (part.widthStuds - 1) / 2) * STUD_SIZE;
        const offsetZ = (z - (part.depthStuds - 1) / 2) * STUD_SIZE;
        const offsetY = (part.heightStuds * STUD_SIZE) / 2 + STUD_PROTRUSION_UNITS / 2;

        stud.position.set(offsetX, offsetY, offsetZ);
        group.add(stud);
      }
    }
  }

  group.position.set(...brick.position);
  group.rotation.y = brick.rotation;

  return group;
}
