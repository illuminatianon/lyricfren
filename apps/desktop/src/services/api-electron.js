/**
 * API service for making requests to the Electron main process
 */
class ApiElectronService {
  constructor () {
    if (!window.api) {
      throw new Error('Electron API not found. This service should only be used in an Electron environment.')
    }
  }

  async get (endpoint) {
    if (endpoint === '/config') {
      return window.api.getConfig()
    }
    if (endpoint === '/styles') {
      return window.api.getAllStyles()
    }
    if (endpoint.startsWith('/styles/')) {
      const id = endpoint.split('/')[2]
      return window.api.getStyleById(id)
    }
    throw new Error(`Unknown GET endpoint: ${endpoint}`)
  }

  async post (endpoint, data) {
    if (endpoint === '/meter/count') {
      return window.api.processText(data.text)
    }
    if (endpoint === '/meter/count-line') {
      return window.api.countLine(data.line)
    }
    if (endpoint === '/styles') {
      return window.api.createStyle(data)
    }
    throw new Error(`Unknown POST endpoint: ${endpoint}`)
  }

  async put (endpoint, data) {
    if (endpoint === '/config') {
      const result = await window.api.saveConfig(data)
      return { success: result, message: result ? 'Configuration updated successfully' : 'Failed to save configuration' }
    }
    if (endpoint.startsWith('/styles/')) {
      const id = endpoint.split('/')[2]
      return window.api.updateStyle(id, data)
    }
    throw new Error(`Unknown PUT endpoint: ${endpoint}`)
  }

  async delete (endpoint) {
    if (endpoint.startsWith('/styles/')) {
      const id = endpoint.split('/')[2]
      const result = await window.api.deleteStyle(id)
      return { success: result, message: result ? 'Style deleted successfully' : 'Style not found' }
    }
    throw new Error(`Unknown DELETE endpoint: ${endpoint}`)
  }
}

const apiElectron = new ApiElectronService()

export default apiElectron
