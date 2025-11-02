import { PartDefinition, PartCategory } from './lego-types';

export const PART_CATALOG: Record<string, PartDefinition> = {
  // Bricks (height = 1.2 studs)
  brick_1x1: { id: 'brick_1x1', name: 'Brick 1x1', category: 'bricks', widthStuds: 1, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_1x2: { id: 'brick_1x2', name: 'Brick 1x2', category: 'bricks', widthStuds: 2, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_1x3: { id: 'brick_1x3', name: 'Brick 1x3', category: 'bricks', widthStuds: 3, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_1x4: { id: 'brick_1x4', name: 'Brick 1x4', category: 'bricks', widthStuds: 4, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_1x6: { id: 'brick_1x6', name: 'Brick 1x6', category: 'bricks', widthStuds: 6, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_1x8: { id: 'brick_1x8', name: 'Brick 1x8', category: 'bricks', widthStuds: 8, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_2x2: { id: 'brick_2x2', name: 'Brick 2x2', category: 'bricks', widthStuds: 2, depthStuds: 2, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_2x3: { id: 'brick_2x3', name: 'Brick 2x3', category: 'bricks', widthStuds: 3, depthStuds: 2, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_2x4: { id: 'brick_2x4', name: 'Brick 2x4', category: 'bricks', widthStuds: 4, depthStuds: 2, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_2x6: { id: 'brick_2x6', name: 'Brick 2x6', category: 'bricks', widthStuds: 6, depthStuds: 2, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_2x8: { id: 'brick_2x8', name: 'Brick 2x8', category: 'bricks', widthStuds: 8, depthStuds: 2, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_2x10: { id: 'brick_2x10', name: 'Brick 2x10', category: 'bricks', widthStuds: 10, depthStuds: 2, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_3x3: { id: 'brick_3x3', name: 'Brick 3x3', category: 'bricks', widthStuds: 3, depthStuds: 3, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_4x4: { id: 'brick_4x4', name: 'Brick 4x4', category: 'bricks', widthStuds: 4, depthStuds: 4, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_4x6: { id: 'brick_4x6', name: 'Brick 4x6', category: 'bricks', widthStuds: 6, depthStuds: 4, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  brick_6x6: { id: 'brick_6x6', name: 'Brick 6x6', category: 'bricks', widthStuds: 6, depthStuds: 6, heightStuds: 1.2, hasStuds: true, shape: 'box' },

  // Plates (height = 0.4 studs)
  plate_1x1: { id: 'plate_1x1', name: 'Plate 1x1', category: 'plates', widthStuds: 1, depthStuds: 1, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_1x2: { id: 'plate_1x2', name: 'Plate 1x2', category: 'plates', widthStuds: 2, depthStuds: 1, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_1x3: { id: 'plate_1x3', name: 'Plate 1x3', category: 'plates', widthStuds: 3, depthStuds: 1, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_1x4: { id: 'plate_1x4', name: 'Plate 1x4', category: 'plates', widthStuds: 4, depthStuds: 1, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_1x6: { id: 'plate_1x6', name: 'Plate 1x6', category: 'plates', widthStuds: 6, depthStuds: 1, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_1x8: { id: 'plate_1x8', name: 'Plate 1x8', category: 'plates', widthStuds: 8, depthStuds: 1, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_2x2: { id: 'plate_2x2', name: 'Plate 2x2', category: 'plates', widthStuds: 2, depthStuds: 2, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_2x3: { id: 'plate_2x3', name: 'Plate 2x3', category: 'plates', widthStuds: 3, depthStuds: 2, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_2x4: { id: 'plate_2x4', name: 'Plate 2x4', category: 'plates', widthStuds: 4, depthStuds: 2, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_2x6: { id: 'plate_2x6', name: 'Plate 2x6', category: 'plates', widthStuds: 6, depthStuds: 2, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_2x8: { id: 'plate_2x8', name: 'Plate 2x8', category: 'plates', widthStuds: 8, depthStuds: 2, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_4x4: { id: 'plate_4x4', name: 'Plate 4x4', category: 'plates', widthStuds: 4, depthStuds: 4, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_4x6: { id: 'plate_4x6', name: 'Plate 4x6', category: 'plates', widthStuds: 6, depthStuds: 4, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_6x6: { id: 'plate_6x6', name: 'Plate 6x6', category: 'plates', widthStuds: 6, depthStuds: 6, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_6x8: { id: 'plate_6x8', name: 'Plate 6x8', category: 'plates', widthStuds: 8, depthStuds: 6, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  plate_8x8: { id: 'plate_8x8', name: 'Plate 8x8', category: 'plates', widthStuds: 8, depthStuds: 8, heightStuds: 0.4, hasStuds: true, shape: 'box' },

  // Tiles (no studs)
  tile_1x1: { id: 'tile_1x1', name: 'Tile 1x1', category: 'tiles', widthStuds: 1, depthStuds: 1, heightStuds: 0.4, hasStuds: false, shape: 'box' },
  tile_1x2: { id: 'tile_1x2', name: 'Tile 1x2', category: 'tiles', widthStuds: 2, depthStuds: 1, heightStuds: 0.4, hasStuds: false, shape: 'box' },
  tile_1x3: { id: 'tile_1x3', name: 'Tile 1x3', category: 'tiles', widthStuds: 3, depthStuds: 1, heightStuds: 0.4, hasStuds: false, shape: 'box' },
  tile_1x4: { id: 'tile_1x4', name: 'Tile 1x4', category: 'tiles', widthStuds: 4, depthStuds: 1, heightStuds: 0.4, hasStuds: false, shape: 'box' },
  tile_2x2: { id: 'tile_2x2', name: 'Tile 2x2', category: 'tiles', widthStuds: 2, depthStuds: 2, heightStuds: 0.4, hasStuds: false, shape: 'box' },
  tile_2x3: { id: 'tile_2x3', name: 'Tile 2x3', category: 'tiles', widthStuds: 3, depthStuds: 2, heightStuds: 0.4, hasStuds: false, shape: 'box' },
  tile_2x4: { id: 'tile_2x4', name: 'Tile 2x4', category: 'tiles', widthStuds: 4, depthStuds: 2, heightStuds: 0.4, hasStuds: false, shape: 'box' },
  tile_2x6: { id: 'tile_2x6', name: 'Tile 2x6', category: 'tiles', widthStuds: 6, depthStuds: 2, heightStuds: 0.4, hasStuds: false, shape: 'box' },
  tile_4x4: { id: 'tile_4x4', name: 'Tile 4x4', category: 'tiles', widthStuds: 4, depthStuds: 4, heightStuds: 0.4, hasStuds: false, shape: 'box' },

  // Slopes
  slope_45_2x1: { id: 'slope_45_2x1', name: 'Slope 45 2x1', category: 'slopes', widthStuds: 2, depthStuds: 1, heightStuds: 1.2, hasStuds: false, shape: 'slope' },
  slope_45_2x2: { id: 'slope_45_2x2', name: 'Slope 45 2x2', category: 'slopes', widthStuds: 2, depthStuds: 2, heightStuds: 1.2, hasStuds: false, shape: 'slope' },
  slope_33_2x2: { id: 'slope_33_2x2', name: 'Slope 33 2x2', category: 'slopes', widthStuds: 2, depthStuds: 2, heightStuds: 1.2, hasStuds: true, shape: 'slope' },
  slope_33_3x2: { id: 'slope_33_3x2', name: 'Slope 33 3x2', category: 'slopes', widthStuds: 3, depthStuds: 2, heightStuds: 1.2, hasStuds: true, shape: 'slope' },
  slope_inverted_2x1: { id: 'slope_inverted_2x1', name: 'Slope Inverted 2x1', category: 'slopes', widthStuds: 2, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'slope' },
  slope_curved_2x2: { id: 'slope_curved_2x2', name: 'Slope Curved 2x2', category: 'slopes', widthStuds: 2, depthStuds: 2, heightStuds: 1.2, hasStuds: false, shape: 'slope' },
  slope_cheese_1x1: { id: 'slope_cheese_1x1', name: 'Slope Cheese 1x1', category: 'slopes', widthStuds: 1, depthStuds: 1, heightStuds: 0.6, hasStuds: true, shape: 'slope' },

  // Rounds
  round_1x1: { id: 'round_1x1', name: 'Round Brick 1x1', category: 'rounds', widthStuds: 1, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'cylinder' },
  round_1x1_open: { id: 'round_1x1_open', name: 'Round Brick 1x1 Open', category: 'rounds', widthStuds: 1, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'cylinder' },
  round_2x2: { id: 'round_2x2', name: 'Round Brick 2x2', category: 'rounds', widthStuds: 2, depthStuds: 2, heightStuds: 1.2, hasStuds: true, shape: 'cylinder' },
  round_2x4: { id: 'round_2x4', name: 'Round Brick 2x4', category: 'rounds', widthStuds: 4, depthStuds: 2, heightStuds: 1.2, hasStuds: true, shape: 'cylinder' },
  round_brick_4x4: { id: 'round_brick_4x4', name: 'Round Brick 4x4', category: 'rounds', widthStuds: 4, depthStuds: 4, heightStuds: 1.2, hasStuds: true, shape: 'cylinder' },
  round_plate_2x2: { id: 'round_plate_2x2', name: 'Round Plate 2x2', category: 'rounds', widthStuds: 2, depthStuds: 2, heightStuds: 0.4, hasStuds: true, shape: 'cylinder' },

  // Specials
  hinge_plate_1x2: { id: 'hinge_plate_1x2', name: 'Hinge Plate 1x2', category: 'specials', widthStuds: 2, depthStuds: 1, heightStuds: 0.4, hasStuds: true, shape: 'hinge' },
  hinge_brick_2x2: { id: 'hinge_brick_2x2', name: 'Hinge Brick 2x2', category: 'specials', widthStuds: 2, depthStuds: 2, heightStuds: 1.2, hasStuds: true, shape: 'hinge' },
  hinge_curved_2x2: { id: 'hinge_curved_2x2', name: 'Hinge Curved 2x2', category: 'specials', widthStuds: 2, depthStuds: 2, heightStuds: 1.2, hasStuds: false, shape: 'hinge' },
  clip_plate_1x1: { id: 'clip_plate_1x1', name: 'Clip Plate 1x1', category: 'specials', widthStuds: 1, depthStuds: 1, heightStuds: 0.4, hasStuds: true, shape: 'clip' },
  clip_plate_1x2: { id: 'clip_plate_1x2', name: 'Clip Plate 1x2', category: 'specials', widthStuds: 2, depthStuds: 1, heightStuds: 0.4, hasStuds: true, shape: 'clip' },
  clip_tile_1x1: { id: 'clip_tile_1x1', name: 'Clip Tile 1x1', category: 'specials', widthStuds: 1, depthStuds: 1, heightStuds: 0.4, hasStuds: false, shape: 'clip' },
  technic_brick_1x2: { id: 'technic_brick_1x2', name: 'Technic Brick 1x2', category: 'specials', widthStuds: 2, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  technic_brick_1x4: { id: 'technic_brick_1x4', name: 'Technic Brick 1x4', category: 'specials', widthStuds: 4, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  technic_brick_1x6: { id: 'technic_brick_1x6', name: 'Technic Brick 1x6', category: 'specials', widthStuds: 6, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  turntable_4x4: { id: 'turntable_4x4', name: 'Turntable 4x4', category: 'specials', widthStuds: 4, depthStuds: 4, heightStuds: 1.2, hasStuds: true, shape: 'cylinder' },
  jumper_plate_1x3: { id: 'jumper_plate_1x3', name: 'Jumper Plate 1x3', category: 'specials', widthStuds: 3, depthStuds: 1, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  jumper_plate_1x2: { id: 'jumper_plate_1x2', name: 'Jumper Plate 1x2', category: 'specials', widthStuds: 2, depthStuds: 1, heightStuds: 0.4, hasStuds: true, shape: 'box' },
  bracket_1x2x2: { id: 'bracket_1x2x2', name: 'Bracket 1x2x2', category: 'specials', widthStuds: 2, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  bracket_1x2x1: { id: 'bracket_1x2x1', name: 'Bracket 1x2x1', category: 'specials', widthStuds: 2, depthStuds: 1, heightStuds: 1.2, hasStuds: true, shape: 'box' },
  bar_1x4: { id: 'bar_1x4', name: 'Bar 1x4', category: 'specials', widthStuds: 4, depthStuds: 0.5, heightStuds: 0.4, hasStuds: false, shape: 'clip' },
  arch_1x5x4: { id: 'arch_1x5x4', name: 'Arch 1x5x4', category: 'specials', widthStuds: 5, depthStuds: 1, heightStuds: 3.2, hasStuds: true, shape: 'slope' },
  window_frame_1x4x3: { id: 'window_frame_1x4x3', name: 'Window Frame 1x4x3', category: 'specials', widthStuds: 4, depthStuds: 1, heightStuds: 3.6, hasStuds: true, shape: 'box' },
  door_frame_1x4x5: { id: 'door_frame_1x4x5', name: 'Door Frame 1x4x5', category: 'specials', widthStuds: 4, depthStuds: 1, heightStuds: 4.8, hasStuds: true, shape: 'box' },
  wheel_hub_2x2: { id: 'wheel_hub_2x2', name: 'Wheel Hub 2x2', category: 'specials', widthStuds: 2, depthStuds: 2, heightStuds: 1.2, hasStuds: false, shape: 'cylinder' },
  cone_2x2: { id: 'cone_2x2', name: 'Cone 2x2', category: 'specials', widthStuds: 2, depthStuds: 2, heightStuds: 1.6, hasStuds: false, shape: 'cylinder' },
  antenna_1x4: { id: 'antenna_1x4', name: 'Antenna 1x4', category: 'specials', widthStuds: 1, depthStuds: 1, heightStuds: 4, hasStuds: true, shape: 'clip' },
  dish_4x4: { id: 'dish_4x4', name: 'Dish 4x4', category: 'specials', widthStuds: 4, depthStuds: 4, heightStuds: 0.6, hasStuds: false, shape: 'cylinder' },
  tile_round_1x1: { id: 'tile_round_1x1', name: 'Tile Round 1x1', category: 'specials', widthStuds: 1, depthStuds: 1, heightStuds: 0.4, hasStuds: false, shape: 'cylinder' },
  tile_round_2x2: { id: 'tile_round_2x2', name: 'Tile Round 2x2', category: 'specials', widthStuds: 2, depthStuds: 2, heightStuds: 0.4, hasStuds: false, shape: 'cylinder' }
};

export const PART_IDS = Object.keys(PART_CATALOG);

export const PARTS_BY_CATEGORY: Record<PartCategory, PartDefinition[]> = {
  bricks: [],
  plates: [],
  tiles: [],
  slopes: [],
  rounds: [],
  specials: []
};

for (const part of Object.values(PART_CATALOG)) {
  PARTS_BY_CATEGORY[part.category].push(part);
}

for (const partList of Object.values(PARTS_BY_CATEGORY)) {
  partList.sort((a, b) => a.widthStuds * a.depthStuds - b.widthStuds * b.depthStuds);
}
