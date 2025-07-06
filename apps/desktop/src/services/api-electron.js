/**
 * API service for making requests to the Electron main process
 */
class ApiElectronService {
  constructor () {
    if (!window.api) {
      throw new Error('Electron API not found. This service should only be used in an Electron environment.')
    }
  }

  async post (endpoint, data) {
    if (endpoint === '/meter/count') {
      return window.api.processText(data.text)
    }
    if (endpoint === '/meter/count-line') {
      return window.api.countLine(data.line)
    }
    throw new Error(`Unknown endpoint: ${endpoint}`)
  }

  // Implement other methods as needed, or throw errors for unsupported methods
  async get (endpoint) {
    throw new Error('GET requests are not supported in Electron mode')
  }

  async put (endpoint, data) {
    throw new Error('PUT requests are not supported in Electron mode')
  }

  async delete (endpoint) {
    throw new Error('DELETE requests are not supported in Electron mode')
  }
}

const apiElectron = new ApiElectronService()

export default apiElectron
