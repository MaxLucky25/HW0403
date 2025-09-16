import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';

// Blog entities and schemas
import { Blog, BlogSchema } from './blogs/domain/blog.entity';

// Post entities and schemas
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostLike, PostLikeSchema } from './posts/domain/post-like.entity';

// Blog repositories
import { BlogRepository } from './blogs/infrastructure/blog.repository';
import { BlogQueryRepository } from './blogs/infrastructure/query/blog.query-repository';

// Post repositories
import { PostRepository } from './posts/infrastructure/postRepository';
import { PostQueryRepository } from './posts/infrastructure/query/post.query-repository';
import { PostLikeRepository } from './posts/infrastructure/post-like.repository';

// Domain services
import { PostLikesDomainService } from './posts/domain/services/post-likes.domain-service';

// Blog use cases
import { CreateBlogUseCase } from './blogs/application/usecase/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecase/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecase/delete-blog.usecase';
import { GetBlogByIdUseCase } from './blogs/application/query-usecase/get-blog.usecase';
import { GetAllBlogsQueryUseCase } from './blogs/application/query-usecase/get-all-blogs.usecase';

// Post use cases
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { CreatePostForBlogUseCase } from './posts/application/usecases/create-post-for-blog.usecase';
import { GetPostByIdUseCase } from './posts/application/query-usecases/get-post-by-id.usecase';
import { GetAllPostsQueryUseCase } from './posts/application/query-usecases/get-all-posts.usecase';
import { GetPostsForBlogUseCase } from './posts/application/query-usecases/get-all-posts-for-blog.usecase';
import { UpdatePostLikeUseCase } from './posts/application/usecases/likesPost/update-post-like.usecase';

// External modules
import { UserPersistenceModule } from '../auth-manage/user-accounts/persistence/user-persistence.module';

const BlogCommandHandlers = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
];

const BlogQueryHandlers = [GetBlogByIdUseCase, GetAllBlogsQueryUseCase];

const PostCommandHandlers = [
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreatePostForBlogUseCase,
  UpdatePostLikeUseCase,
];

const PostQueryHandlers = [
  GetPostByIdUseCase,
  GetAllPostsQueryUseCase,
  GetPostsForBlogUseCase,
];

const Repositories = [
  BlogRepository,
  BlogQueryRepository,
  PostRepository,
  PostQueryRepository,
  PostLikeRepository,
];

const DomainServices = [PostLikesDomainService];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
    UserPersistenceModule,
  ],
  providers: [
    ...BlogCommandHandlers,
    ...BlogQueryHandlers,
    ...PostCommandHandlers,
    ...PostQueryHandlers,
    ...Repositories,
    ...DomainServices,
  ],
  controllers: [BlogsController, PostsController],
  exports: [
    CreatePostForBlogUseCase,
    GetPostsForBlogUseCase,
    BlogRepository,
    BlogQueryRepository,
    PostRepository,
    PostQueryRepository,
  ],
})
export class ContentModule {}
