import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { PostLike, PostLikeSchema } from '../posts/domain/post-like.entity';
import { PostLikeRepository } from '../posts/infrastructure/post-like.repository';
import { UpdatePostLikeUseCase } from '../posts/application/usecases/likesPost/update-post-like.usecase';
import { UserPersistenceModule } from '../../auth-manage/user-accounts/persistence/user-persistence.module';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
    UserPersistenceModule,
  ],
  providers: [PostLikeRepository, UpdatePostLikeUseCase],
  exports: [PostLikeRepository, UpdatePostLikeUseCase],
})
export class PostLikesModule {}
