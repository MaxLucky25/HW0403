import { Module } from '@nestjs/common';
import { BlogsModule } from './blogs/blogs.module';
import { PostsModule } from './posts/posts.module';
import { PostLikesModule } from './post-likes/post-likes.module';

@Module({
  imports: [BlogsModule, PostsModule, PostLikesModule],
})
export class ContentModule {}
