export type PartCategory = 'bricks' | 'plates' | 'tiles' | 'slopes' | 'rounds' | 'specials';

export type PartShape = 'box' | 'cylinder' | 'slope' | 'hinge' | 'clip';

export interface PartDefinition {
  id: string;
  name: string;
  category: PartCategory;
  widthStuds: number;
  depthStuds: number;
  heightStuds: number;
  hasStuds: boolean;
  shape: PartShape;
}

export interface PlacedBrick {
  id: string;
  partId: string;
  color: string;
  position: [number, number, number];
  rotation: number;
  widthStuds: number;
  depthStuds: number;
  heightStuds: number;
}

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}
