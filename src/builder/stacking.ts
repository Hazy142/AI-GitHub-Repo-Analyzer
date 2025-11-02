import { Vector3 } from 'three';
import { STUD_SIZE } from './lego-constants';
import { BoundingBox, PlacedBrick } from './lego-types';
import { PART_CATALOG } from './part-catalog';

export function snapToStud(value: number): number {
  return Math.round(value / STUD_SIZE) * STUD_SIZE;
}

export function getBrickBounds(brick: PlacedBrick): BoundingBox {
  const halfW = (brick.widthStuds * STUD_SIZE) / 2;
  const halfD = (brick.depthStuds * STUD_SIZE) / 2;
  const halfH = (brick.heightStuds * STUD_SIZE) / 2;

  return {
    minX: brick.position[0] - halfW,
    maxX: brick.position[0] + halfW,
    minZ: brick.position[2] - halfD,
    maxZ: brick.position[2] + halfD,
    minY: brick.position[1] - halfH,
    maxY: brick.position[1] + halfH,
  };
}

export function checkOverlap2D(a: BoundingBox, b: BoundingBox): boolean {
  const separated =
    a.maxX <= b.minX ||
    a.minX >= b.maxX ||
    a.maxZ <= b.minZ ||
    a.minZ >= b.maxZ;

  return !separated;
}

export function calculateBrickPosition(point: Vector3, partId: string, placed: PlacedBrick[]): [number, number, number] {
  const part = PART_CATALOG[partId];
  if (!part) {
    throw new Error(`Unknown part: ${partId}`);
  }

  const snappedX = snapToStud(point.x);
  const snappedZ = snapToStud(point.z);

  const tempBrick: PlacedBrick = {
    id: 'temp',
    partId,
    color: '#000000',
    position: [snappedX, 0, snappedZ],
    rotation: 0,
    widthStuds: part.widthStuds,
    depthStuds: part.depthStuds,
    heightStuds: part.heightStuds,
  };

  const tempBounds = getBrickBounds(tempBrick);

  let maxHeight = 0;

  for (const brick of placed) {
    const bounds = getBrickBounds(brick);
    if (checkOverlap2D(tempBounds, bounds)) {
      maxHeight = Math.max(maxHeight, bounds.maxY);
    }
  }

  const brickHeight = part.heightStuds * STUD_SIZE;
  const y = maxHeight + brickHeight / 2;

  return [snappedX, y, snappedZ];
}
