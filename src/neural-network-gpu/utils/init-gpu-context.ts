import {initRenderContext} from '../../rendering/render-utils/render-context'

const initGpuContext = () => {
  const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
  initRenderContext(canvas)
}

export default initGpuContext
