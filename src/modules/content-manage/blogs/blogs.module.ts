import { Module } from '@nestjs/common';
import { BlogsController } from './api/blogs.controller';
import { BlogPersistenceModule } from './blog-persistence.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateBlogUseCase } from './application/usecase/create-blog.usecase';
import { UpdateBlogUseCase } from './application/usecase/update-blog.usecase';
import { DeleteBlogUseCase } from './application/usecase/delete-blog.usecase';
import { GetBlogByIdUseCase } from './application/query-usecase/get-blog.usecase';
import { GetAllBlogsQueryUseCase } from './application/query-usecase/get-all-blogs.usecase';
import { PostsModule } from '../posts/posts.module';

const CommandHandlers = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
];

const QueryHandlers = [GetBlogByIdUseCase, GetAllBlogsQueryUseCase];

@Module({
  imports: [CqrsModule, BlogPersistenceModule, PostsModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  controllers: [BlogsController],
})
export class BlogsModule {}
