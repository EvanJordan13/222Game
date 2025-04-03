export type Vec = { x: number, y: number };


export function vecAdd(
    a: Vec,
    b: Vec,
): Vec {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function vecSub(
    a: Vec,
    b: Vec,
): Vec {
    return { x: a.x - b.x, y: a.y - b.y };
}

export function vecScale(
    v: Vec,
    c: number
): Vec {
    return { x: v.x * c, y: v.y * c };
}

export function magnitudeClamp(a: number, b: number): number {
    if (Math.abs(a) > Math.abs(b))
        return a;
    return 0;
}
