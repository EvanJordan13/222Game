/**
 * @jest-environment jsdom
 */


import Camera from './camera';
//import { Vec, vecAdd, vecSub } from './math';

const VELOCITY_BUF_LEN = 6;

// Test initialization
test('Camera initializes correctly', () => {
    const cam = Camera.new();
    expect(cam.position).toEqual({ x: 0, y: 0 });
    expect(cam.zoom).toBe(1);
});

// Test position update
test('Camera updates position', () => {
    const cam = Camera.new().updatePosition({ x: 10, y: 20 });
    expect(cam.position).toEqual({ x: 10, y: 20 });
});

// Test translation
test('Camera translates correctly', () => {
    const cam = Camera.new().translate({ x: 5, y: -5 });
    expect(cam.position).toEqual({ x: 5, y: -5 });
});

// Test inertia reset
test('Camera resets inertia', () => {
    const cam = Camera.new().resetInertia();
    expect(cam.hasInertia()).toBe(false);
});

// Test inertia update
test('Camera inertia update', () => {
    let cam = Camera.new().translate({ x: 5, y: 5 });
    cam = cam.updateInertia();
    expect(cam.hasInertia()).toBe(true);
});

// Test zoom functionality
test('Camera zooms correctly', () => {
    const cam = Camera.new().zoomBy(2);
    expect(cam.zoom).toBe(2);
});

// Test world to screen conversion
test('Camera converts world to screen coordinates', () => {
    const cam = Camera.new().updatePosition({ x: 10, y: 20 }).zoomBy(2);
    const matrix = cam.worldToScreen({ width: 800, height: 600 });
    expect(matrix).toBeInstanceOf(DOMMatrix);
});

// Test screen to world conversion
test('Camera converts screen to world coordinates', () => {
    const cam = Camera.new().updatePosition({ x: 10, y: 20 }).zoomBy(2);
    const matrix = cam.screenToWorld({ width: 800, height: 600 });
    expect(matrix).toBeInstanceOf(DOMMatrix);
});

