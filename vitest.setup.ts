// Setup file to initialize signal-polyfill global for testing
// The signal-polyfill doesn't automatically set global.Signal, so we need to do it manually
import { Signal } from 'signal-polyfill'

// In Node.js test environment, we need to set the global Signal
const globalScope = global as typeof globalThis & { Signal?: typeof Signal }
if (!globalScope.Signal) {
  globalScope.Signal = Signal
}
