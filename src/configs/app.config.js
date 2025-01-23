export class AppConfig {
  /**
   * @returns {string}
   */
  static get nodeEnvironment() {
    return process.env.NODE_ENV;
  }

  /**
   * @returns {string}
   */
  static get appPort() {
    return process.env.APP_PORT || '8080';
  }

  /**,
   * @returns {string[]}
   */
  static get corsAllowedOrigins() {
    process.env.CORS_ALLOWED_ORIGINS;
  }
}
