function mul(a: number, b: number): number {
    return a * b
}

function div(a: number, b: number): number {
    return a / b
}

function doNothing2(a: number, b: number): number {
    return mul(b, div(a, b))
}

export { doNothing2 }