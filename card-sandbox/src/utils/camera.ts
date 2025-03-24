import { magnitudeClamp } from "./math";

const CAMERA_FRICTION = 0.95;
const MIN_VELOCITY = 0.05;

export default class Camera {
    constructor(
        public x: number,
        public y: number,
        public vx: number,
        public vy: number,
        public zoom: number,
    ) { }

    updatePosition(v: { x: number, y: number }): Camera {
        return new Camera(v.x, v.y, v.x - this.x, v.y - this.y, this.zoom);
    }
    
    translate(v: { x: number, y: number }): Camera {
        return new Camera(this.x + v.x, this.y + v.y, v.x, v.y, this.zoom);
    }

    resetInertia(): Camera {
        return new Camera(this.x + this.vx, this.y + this.vy, 0, 0, this.zoom);
    }

    updateInertia(): Camera {
        return new Camera(
            this.x + this.vx,
            this.y + this.vy,
            magnitudeClamp(this.vx * CAMERA_FRICTION, MIN_VELOCITY / this.zoom),
            magnitudeClamp(this.vy * CAMERA_FRICTION, MIN_VELOCITY / this.zoom),
            this.zoom,
        );
    }

    zoomBy(scale: number): Camera {
        return new Camera(this.x, this.y, this.vx, this.vy, this.zoom * scale);
    }

    updateZoom(zoom: number): Camera {
        return new Camera(this.x, this.y, this.vx, this.vy, zoom);
    }


    worldToScreen(dimensions: { width: number; height: number }): DOMMatrix {
        let ret = new DOMMatrix();
        ret.scaleSelf(1.0, -1.0);
        ret.translateSelf(dimensions.width * 0.5, -dimensions.height * 0.5);
        ret.translateSelf(-this.x, -this.y);
        ret.scaleSelf(this.zoom, this.zoom, 1.0, this.x, this.y, 0.0);
        return ret;
    }

    screenToWorld = (dimensions: { width: number; height: number }) =>
        this.worldToScreen(dimensions).inverse();
}
