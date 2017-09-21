
const sigmoid = (x: number) => {
  return 1.0 / (1.0 + Math.exp(-1.0 * x - 0.5))
}

export default sigmoid
