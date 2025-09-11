import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { PostLike, PostLikeSchema } from './domain/post-like.entity';
import { PostLikeRepository } from './infrastructure/post-like.repository';
import { PostLikeQueryRepository } from './infrastructure/query/post-like.query-repository';
import { UpdatePostLikeUseCase } from './application/usecases/update-post-like.usecase';
import { UserPersistenceModule } from '../../auth-manage/user-accounts/persistence/user-persistence.module';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
    UserPersistenceModule,
  ],
  providers: [
    PostLikeRepository,
    PostLikeQueryRepository,

    UpdatePostLikeUseCase,
  ],
  exports: [PostLikeRepository, PostLikeQueryRepository, UpdatePostLikeUseCase],
})
export class PostLikesModule {}
