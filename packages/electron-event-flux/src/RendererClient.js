module.exports = window.process ? require('./ElectronRendererClient') : require('./BrowserRendererClient');
