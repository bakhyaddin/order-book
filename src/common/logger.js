export class Logger {
  /**
   * Logs an info message
   * @param {string} message
   */
  static info(message) {
    console.log(`[INFO]: ${message}`);
  }

  /**
   * Logs a warning message
   * @param {string} message
   */
  static warn(message) {
    console.warn(`[WARN]: ${message}`);
  }

  /**
   * Logs an error message
   * @param {Error} error
   */
  static error(error) {
    console.error(`[ERROR]: ${error.message}`);
    console.error(error.stack);
  }
}
