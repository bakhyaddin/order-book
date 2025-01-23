import { randomUUID } from 'crypto';

export class AbstractEntity {
  id = randomUUID();
  createdAt = Date.now();

  /**
   * @param {AbstractEntity} entity
   */
  constructor(entity) {
    Object.assign(this, entity);
  }
}
