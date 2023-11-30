function add(a: number, b: number): number {
    return a + b
}

function subtract(a: number, b: number): number {
    return a - b
}

function doNothing(a: number, b: number): number {
    return add(b, subtract(a, b))
}

export { doNothing }