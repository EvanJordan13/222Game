import { Vec, vecAdd, vecSub, vecScale, magnitudeClamp } from "./math";

const CAMERA_FRICTION = 0.95;
const MIN_VELOCITY = 0.05;
const VELOCITY_BUF_LEN = 6;

export default class Camera {
    private constructor(
        public position: Vec,
        private velocities: buffer<Vec>,
        public zoom: number,
    ) { }

    static new(): Camera {
        return new Camera({ x: 0, y: 0 }, new buffer<Vec>(VELOCITY_BUF_LEN), 1);
    }

    updatePosition(v: Vec): Camera {
        const vel = vecSub(v, this.position);
        this.velocities.push(vel);
        return new Camera(v, this.velocities, this.zoom);
    }

    translate(v: Vec): Camera {
        this.velocities.push(v);
        return new Camera(vecAdd(this.position, v), this.velocities, this.zoom);
    }

    resetInertia(): Camera {
        this.velocities.push({ x: 0, y: 0 });
        return new Camera(this.position, this.velocities, this.zoom);
    }

    updateInertia(): Camera {
        let tail = this.velocities.tail();
        if (tail === undefined) tail = { x: 0, y: 0 };
        let head = this.velocities.head();
        if (head === undefined) head = { x: 0, y: 0 };
        const newVel = {
            x: magnitudeClamp(tail.x * CAMERA_FRICTION, MIN_VELOCITY / this.zoom),
            y: magnitudeClamp(tail.y * CAMERA_FRICTION, MIN_VELOCITY / this.zoom),
        };
        this.velocities.push(newVel);
        return new Camera(vecAdd(this.position, head), this.velocities, this.zoom);
    }

    hasInertia(): boolean {
        let tail = this.velocities.tail();
        if (tail === undefined) tail = { x: 0, y: 0 };
        return tail.x != 0 || tail.y != 0;
    }


    zoomBy(scale: number, origin = this.position): Camera {
        return this.updateZoom(this.zoom * scale, origin);
    }

    updateZoom(zoom: number, origin = this.position): Camera {
        const originFromCenter = vecSub(origin, this.position);
        const newOrigin = vecScale(originFromCenter, zoom / this.zoom);
        const deltaPosition = vecSub(newOrigin, originFromCenter);
        const newPosition = vecAdd(this.position, deltaPosition);
        this.velocities.push({ x: 0, y: 0 });
        return new Camera(newPosition, this.velocities, zoom);
    }

    worldToScreen(dimensions: { width: number; height: number }): DOMMatrix {
        let ret = new DOMMatrix();
        ret.scaleSelf(1.0, -1.0);
        ret.translateSelf(dimensions.width * 0.5, -dimensions.height * 0.5);
        ret.translateSelf(-this.position.x, -this.position.y);
        ret.scaleSelf(this.zoom, this.zoom, 1.0, this.position.x, this.position.y, 0.0);
        return ret;
    }

    screenToWorld = (dimensions: { width: number; height: number }) =>
        this.worldToScreen(dimensions).inverse();
}

class buffer<T> {
    private buffer: (T | undefined)[];
    private head_: number = 0;
    private size: number = 0;
    private readonly capacity: number;

    constructor(capacity: number) {
        if (capacity <= 0) {
            throw new Error("Capacity must be greater than 0");
        }
        this.capacity = capacity;
        this.buffer = new Array(capacity);
    }

    push(item: T): void {
        const index = (this.head_ + this.size) % this.capacity;
        this.buffer[index] = item;

        if (this.size < this.capacity) {
            this.size++;
        } else {
            this.head_ = (this.head_ + 1) % this.capacity;
        }
    }

    head(): T | undefined {
        if (this.size === 0) return undefined;
        return this.buffer[this.head_];
    }

    tail(): T | undefined {
        if (this.size === 0) return undefined;
        const index = (this.head_ + this.size - 1) % this.capacity;
        return this.buffer[index];
    }

    get(index: number): T | undefined {
        if (index < 0 || index >= this.size) return undefined;
        return this.buffer[(this.head_ + index) % this.capacity];
    }

    length(): number {
        return this.size;
    }

    isFull(): boolean {
        return this.size === this.capacity;
    }

    clone(): buffer<T> {
        const clonedBuffer = new buffer<T>(this.capacity);
        clonedBuffer.buffer = [...this.buffer];
        clonedBuffer.head_ = this.head_;
        clonedBuffer.size = this.size;
        return clonedBuffer;
    }
}
