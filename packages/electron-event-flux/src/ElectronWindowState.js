'use strict';

var electron = require('electron');
var deepEqual = require('deep-equal');

const eventHandlingDelay = 100;
module.exports = class ElectronWindowState {
  constructor(config, state, onSave) {
    this.onSave = onSave;
    this.stateChangeHandler = this.stateChangeHandler.bind(this);
    this.closeHandler = this.closeHandler.bind(this);
    this.closedHandler = this.closedHandler.bind(this);
    this.loadState(state, config || {});
  }

  loadState(state, config) {
    this.state = this.normState(state);
    // Check state validity
    this.validateState();
    // Set state fallback values
    this.state = Object.assign({
      width: config.defaultWidth || 800,
      height: config.defaultHeight || 600,
      useContentSize: config.useContentSize || false,
    }, this.state);
  }

  normState(state) {
    state.x = Math.floor(state.x);
    state.y = Math.floor(state.y);
    state.width = Math.floor(state.width);
    state.height = Math.floor(state.height);
    return state;
  }

  isNormal(win) {
    return !win.isMaximized() && !win.isMinimized() && !win.isFullScreen();
  }

  hasBounds() {
    let state = this.state;
    return state &&
      Number.isInteger(state.x) &&
      Number.isInteger(state.y) &&
      Number.isInteger(state.width) && state.width > 0 &&
      Number.isInteger(state.height) && state.height > 0;
  }

  validateState() {
    let state = this.state;
    var isValid = state && (this.hasBounds() || state.isMaximized || state.isFullScreen);
    if (!isValid) {
      return;
    }

    if (this.hasBounds() && state.displayBounds) {
      // Check if the display where the window was last open is still available
      var displayBounds = electron.screen.getDisplayMatching(state).bounds;
      var sameBounds = deepEqual(state.displayBounds, displayBounds, {strict: true});
      if (!sameBounds) {
        if (displayBounds.width < state.displayBounds.width) {
          if (state.x > displayBounds.width) {
            state.x = 0;
          }

          if (state.width > displayBounds.width) {
            state.width = displayBounds.width;
          }
        }

        if (displayBounds.height < state.displayBounds.height) {
          if (state.y > displayBounds.height) {
            state.y = 0;
          }

          if (state.height > displayBounds.height) {
            state.height = displayBounds.height;
          }
        }
      }
    }
  }

  updateState() {
    let state = this.state;
    let win = this.winRef;
    if (!win) {
      return;
    }
    // don't throw an error when window was closed
    try {
      var winBounds = state.useContentSize ? win.getContentBounds() : win.getBounds();
      if (this.isNormal(win)) {
        state.x = winBounds.x;
        state.y = winBounds.y;
        state.width = winBounds.width;
        state.height = winBounds.height;
      }
      state.isMaximized = win.isMaximized();
      state.isFullScreen = win.isFullScreen();
      state.displayBounds = electron.screen.getDisplayMatching(winBounds).bounds;
    } catch (err) {
      console.error(err);
    }
  }

  stateChangeHandler() {
    // Handles both 'resize' and 'move'
    clearTimeout(this.stateChangeTimer);
    this.stateChangeTimer = setTimeout(() => this.updateState(), eventHandlingDelay);
  }

  closeHandler() {
    this.updateState();
  }

  closedHandler() {
    // Unregister listeners and save state
    this.unmanage();
    this.updateState();
    this.onSave(this.state);
  }

  manage(win) {
    let state = this.state;
    if (state.isMaximized) {
      win.maximize();
    }
    if (state.isFullScreen) {
      win.setFullScreen(true);
    }
    win.on('resize', this.stateChangeHandler);
    win.on('move', this.stateChangeHandler);
    win.on('close', this.closeHandler);
    win.on('closed', this.closedHandler);
    this.winRef = win;
  }

  unmanage() {
    let winRef = this.winRef;
    if (winRef) {
      winRef.removeListener('resize', this.stateChangeHandler);
      winRef.removeListener('move', this.stateChangeHandler);
      clearTimeout(this.stateChangeTimer);
      winRef.removeListener('close', this.closeHandler);
      winRef.removeListener('closed', this.closedHandler);
      this.winRef = null;
    }
  }
}
 
