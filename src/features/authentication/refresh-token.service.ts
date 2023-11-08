import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { UserEntity } from 'src/features/users/entities/user.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    private configService: ConfigService,
  ) {}
  async upsertToken(refresh_token: string, user: UserEntity) {
    const expirationTime = new Date();
    const tokenExpirationTimeInSecodns = +this.configService.get(
      EnvironmentConstants.JWT_REFRESH_EXPIRES_IN,
    );
    expirationTime.setSeconds(
      expirationTime.getSeconds() + tokenExpirationTimeInSecodns,
    );

    const refreshTokenHash = await bcrypt.hash(refresh_token, 10);
    const tokenInstance = await this.refreshTokenRepository.upsert(
      {
        user,
        refreshTokenHash,
        expirationTime,
      },
      ['user'],
    );
    return tokenInstance;
  }
  remove(user: UserEntity) {
    return this.refreshTokenRepository.delete({ user: { id: user.id } });
  }

  async isRefreshTokenValid(userId: number, token: string): Promise<boolean> {
    const currentTime = new Date();
    const tokenFromDB = await this.refreshTokenRepository.findOne({
      where: {
        user: { id: userId },
        expirationTime: MoreThanOrEqual(currentTime),
      },
    });
    return tokenFromDB && tokenFromDB.isTokenMatch(token);
  }
}
