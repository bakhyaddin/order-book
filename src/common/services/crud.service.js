import { AbstractEntity } from '../database/entity.abstract';
import { AbstractRepository } from '../database/repository.abstract';

export class CrudService {
  /**
   * @type {AbstractRepository}
   */
  repository = undefined;

  /**
   * @param {AbstractRepository} repository
   */
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Lists records
   * @returns {Promise<UserEntity[]>}
   */
  async list() {
    return this.repository.list();
  }

  /**
   * Fetches a record by id
   * @param {string} id
   * @returns {Promise<AbstractEntity>}
   */
  async getById(id) {
    return this.repository.getById(id);
  }

  /**
   * Deletes a record
   * @param {string} id
   * @returns {Promise<number>} - Number of items deleted
   */
  async delete(id) {
    return this.repository.delete(id);
  }
}
