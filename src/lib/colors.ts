export function generateColor(str: string): string {
    // Simple consistent hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // 7 main hues representing the rainbow
    const rainbowHues = [0, 30, 60, 120, 200, 260, 300]; // red to violet
    const hue = rainbowHues[Math.abs(hash) % rainbowHues.length];

    // Choose between normal and dark variant
    const isDark = Math.abs(hash) % 2 === 0;
    const saturation = 70;
    const lightness = isDark ? 35 : 55;

    return hslToHex(hue, saturation, lightness);
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    const toHex = (x: number) =>
        Math.round(x * 255)
            .toString(16)
            .padStart(2, "0");

    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
  