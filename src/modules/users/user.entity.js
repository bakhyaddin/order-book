import { AbstractEntity } from '../../common/database/entity.abstract';

export class UserEntity extends AbstractEntity {
  BTC = null;
  ETH = null;
  LTC = null;
  XRP = null;
  BCH = null;
  USD = null;

  /**
   * User entity constructor
   * @param {User} user
   */
  constructor(user) {
    super();
    Object.assign(this, user);
  }
}
