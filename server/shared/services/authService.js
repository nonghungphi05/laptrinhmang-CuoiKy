const bcrypt = require('bcrypt');
const UserEntity = require('../entities/userEntity');

class AuthService {
  constructor({ userRepository, tokenService }) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async register({ phone, password, displayName }) {
    const existing = this.userRepository.findByPhone(phone);
    if (existing) {
      throw new Error('Số điện thoại đã được sử dụng');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const userEntity = UserEntity.create({ phone, passwordHash, displayName });
    const record = this.userRepository.create(userEntity);
    const accessToken = this.tokenService.sign({ id: record.id, phone: record.phone, displayName: record.display_name });
    return { user: this.toSafeUser(record), accessToken };
  }
}

module.exports = AuthService;
