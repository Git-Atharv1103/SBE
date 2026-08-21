/**
 * Shree Balaji Enterprises — 3D Dimension Lines & Arrow Callout Labels
 * Engineering dimension annotations for Length, Width, and Height.
 */

import * as THREE from 'three';

/**
 * Creates high-resolution canvas text sprite for 3D billboard dimension callouts
 */
export function createDimensionSprite(label, { color = '#0284c7', bgColor = '#0f172a', textColor = '#ffffff' } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const x = 16;
    const y = 16;
    const w = canvas.width - 32;
    const h = canvas.height - 32;
    const radius = 20;

    // Background Badge
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Text Label
    ctx.fillStyle = textColor;
    ctx.font = 'bold 50px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(11, 3.0, 1);
  return sprite;
}

/**
 * Builds 3D engineering dimension lines with tick arrows and callout labels
 * @param {number} length - Length along X in inches
 * @param {number} width - Width/Depth along Z in inches
 * @param {number} height - Height along Y in inches
 * @param {THREE.Material} dimMaterial
 */
export function buildDimensionLabels(length, width, height, dimMaterial) {
  const group = new THREE.Group();
  group.name = 'dimension_labels_group';

  const offset = 4.0;
  const tickSize = 1.5;
  const halfL = length / 2;
  const halfW = width / 2;

  const lineMat = dimMaterial || new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 2 });

  // -------------------------------------------------------------
  // 1. LENGTH (X-Axis: Front Base)
  // -------------------------------------------------------------
  const lenY = -0.5;
  const lenZ = halfW + offset;

  const lenPoints = [
    new THREE.Vector3(-halfL, 0, halfW),
    new THREE.Vector3(-halfL, lenY, lenZ + tickSize),
    new THREE.Vector3(halfL, 0, halfW),
    new THREE.Vector3(halfL, lenY, lenZ + tickSize),
    new THREE.Vector3(-halfL, lenY, lenZ),
    new THREE.Vector3(halfL, lenY, lenZ),
    new THREE.Vector3(-halfL, lenY, lenZ - tickSize),
    new THREE.Vector3(-halfL, lenY, lenZ + tickSize),
    new THREE.Vector3(halfL, lenY, lenZ - tickSize),
    new THREE.Vector3(halfL, lenY, lenZ + tickSize),
  ];

  const lenGeo = new THREE.BufferGeometry().setFromPoints(lenPoints);
  const lenLine = new THREE.LineSegments(lenGeo, lineMat);
  group.add(lenLine);

  const lenSprite = createDimensionSprite(`Length: ${length} in`, { color: '#0284c7', bgColor: 'rgba(15, 23, 42, 0.95)' });
  lenSprite.position.set(0, lenY + 2.5, lenZ + 1.5);
  group.add(lenSprite);

  // -------------------------------------------------------------
  // 2. WIDTH / DEPTH (Z-Axis: Right Base)
  // -------------------------------------------------------------
  const widX = halfL + offset;
  const widY = -0.5;

  const widPoints = [
    new THREE.Vector3(halfL, 0, -halfW),
    new THREE.Vector3(widX + tickSize, widY, -halfW),
    new THREE.Vector3(halfL, 0, halfW),
    new THREE.Vector3(widX + tickSize, widY, halfW),
    new THREE.Vector3(widX, widY, -halfW),
    new THREE.Vector3(widX, widY, halfW),
    new THREE.Vector3(widX - tickSize, widY, halfW),
    new THREE.Vector3(widX + tickSize, widY, halfW),
    new THREE.Vector3(widX - tickSize, widY, -halfW),
    new THREE.Vector3(widX + tickSize, widY, -halfW),
  ];

  const widGeo = new THREE.BufferGeometry().setFromPoints(widPoints);
  const widLine = new THREE.LineSegments(widGeo, lineMat);
  group.add(widLine);

  const widSprite = createDimensionSprite(`Width: ${width} in`, { color: '#0284c7', bgColor: 'rgba(15, 23, 42, 0.95)' });
  widSprite.position.set(widX + 2.5, widY + 2.5, 0);
  group.add(widSprite);

  // -------------------------------------------------------------
  // 3. HEIGHT (Y-Axis: Left Front Vertical)
  // -------------------------------------------------------------
  const hX = -halfL - offset;
  const hZ = halfW + 1.5;

  const hPoints = [
    new THREE.Vector3(-halfL, 0, halfW),
    new THREE.Vector3(hX - tickSize, 0, hZ),
    new THREE.Vector3(-halfL, height, halfW),
    new THREE.Vector3(hX - tickSize, height, hZ),
    new THREE.Vector3(hX, 0, hZ),
    new THREE.Vector3(hX, height, hZ),
    new THREE.Vector3(hX - tickSize, 0, hZ),
    new THREE.Vector3(hX + tickSize, 0, hZ),
    new THREE.Vector3(hX - tickSize, height, hZ),
    new THREE.Vector3(hX + tickSize, height, hZ),
  ];

  const hGeo = new THREE.BufferGeometry().setFromPoints(hPoints);
  const hLine = new THREE.LineSegments(hGeo, lineMat);
  group.add(hLine);

  const hSprite = createDimensionSprite(`Height: ${height} in`, { color: '#0284c7', bgColor: 'rgba(15, 23, 42, 0.95)' });
  hSprite.position.set(hX - 3.2, height / 2, hZ);
  group.add(hSprite);

  return group;
}
