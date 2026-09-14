import * as THREE from "three";
import type { Vec3 } from "@/lib/zones.config";

const PLANE_DEFAULT_NORMAL = new THREE.Vector3(0, 0, 1);

/** Quaternion alignant la face avant d'un plan (0,0,1) sur la direction `normal`. */
export function quaternionFromNormal(normal: Vec3): THREE.Quaternion {
  const target = new THREE.Vector3(...normal).normalize();
  return new THREE.Quaternion().setFromUnitVectors(PLANE_DEFAULT_NORMAL, target);
}
