import * as THREE from 'three';

/**
 * Builds THREE.Shape objects (with holes) from projected [x, z] polygon rings.
 * Shapes are authored in (x, -z) so that after rotating the resulting mesh
 * +90° about X, world space ends up as (x, y=extrude depth, z) matching the
 * rest of the scene's ground-plane coordinate convention.
 */
export function buildShapes(polygons: [number, number][][][]): THREE.Shape[] {
  return polygons.map((rings) => {
    const [outer, ...holes] = rings;
    const shape = new THREE.Shape(outer.map(([x, z]) => new THREE.Vector2(x, -z)));
    for (const hole of holes) {
      shape.holes.push(new THREE.Path(hole.map(([x, z]) => new THREE.Vector2(x, -z))));
    }
    return shape;
  });
}
