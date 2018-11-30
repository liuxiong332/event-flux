export default window['process'] ? 
  require('./ElectronRendererClient').default : 
  require('./BrowserRendererClient').default;
