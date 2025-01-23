class DIContainer {
  constructor() {
    this.services = new Map();
  }

  /**
   * Registers class instance in the container
   * @param {Object} serviceClass
   */
  register(serviceClass) {
    const serviceName = serviceClass.name || serviceClass.constructor.name;
    if (this.services.has(serviceName)) {
      throw new Error(`Service ${serviceName} is already registered.`);
    }

    const instance =
      typeof serviceClass === 'function' && serviceClass.prototype
        ? new serviceClass()
        : serviceClass;

    this.services.set(serviceName, instance);
  }

  /**
   * Resolves saved class instance
   * @param {Object} serviceClass
   * @returns Object
   */
  resolve(serviceClass) {
    if (!this.services.has(serviceClass.name)) {
      throw new Error(`Service ${serviceClass.name} is not registered.`);
    }
    return this.services.get(serviceClass.name);
  }
}

export default new DIContainer();
