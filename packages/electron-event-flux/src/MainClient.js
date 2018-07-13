module.exports = typeof window !== 'object' ? require('./ElectronMainClient') : require('./BrowserMainClient');
