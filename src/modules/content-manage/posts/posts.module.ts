import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { BlogPersistenceModule } from '../blogs/blog-persistence.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './application/usecases/update-post.usecase';
import { DeletePostUseCase } from './application/usecases/delete-post.usecase';
import { GetPostByIdUseCase } from './application/query-usecases/get-post-by-id.usecase';
import { GetAllPostsQueryUseCase } from './application/query-usecases/get-all-posts.usecase';
import { PostPersistenceModule } from './post-persistence.module';
import { CreatePostForBlogUseCase } from './application/usecases/create-post-for-blog.usecase';
import { GetPostsForBlogUseCase } from './application/query-usecases/get-all-posts-for-blog.usecase';
import { PostLikesModule } from '../post-likes/post-likes.module';

const CommandHandler = [
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreatePostForBlogUseCase,
];

const QueryHandler = [
  GetPostsForBlogUseCase,
  GetPostByIdUseCase,
  GetAllPostsQueryUseCase,
];

@Module({
  imports: [
    CqrsModule,
    BlogPersistenceModule,
    PostPersistenceModule,
    PostLikesModule, // PostLikeQueryRepository будет доступен через этот модуль
  ],
  providers: [...CommandHandler, ...QueryHandler],
  controllers: [PostsController],
  exports: [CreatePostForBlogUseCase, GetPostsForBlogUseCase],
})
export class PostsModule {}
