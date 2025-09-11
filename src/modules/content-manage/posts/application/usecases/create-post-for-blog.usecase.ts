import { BlogIdDto } from '../../domain/dto/post.domain.dto';
import { CreatePostForBlogInputDto } from '../../api/input-dto/create-post-for-blog.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PostRepository } from '../../infrastructure/postRepository';
import { BlogRepository } from '../../../blogs/infrastructure/blog.repository';
import { PostLikeQueryRepository } from '../../../post-likes/infrastructure/query/post-like.query-repository';

export class CreatePostForBlogCommand {
  constructor(
    public readonly id: BlogIdDto,
    public readonly dto: CreatePostForBlogInputDto,
    public readonly userId?: string,
  ) {}
}

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase
  implements ICommandHandler<CreatePostForBlogCommand, PostViewDto>
{
  constructor(
    private blogRepository: BlogRepository,
    private postRepository: PostRepository,
    private postLikeQueryRepository: PostLikeQueryRepository,
  ) {}

  async execute(command: CreatePostForBlogCommand): Promise<PostViewDto> {
    const blog = await this.blogRepository.findOrNotFoundFail({
      id: command.id.blogId,
    });

    const post = await this.postRepository.createPost({
      title: command.dto.title,
      shortDescription: command.dto.shortDescription,
      content: command.dto.content,
      blogId: command.id.blogId,
      blogName: blog.name,
    });

    // Получаем информацию о лайках для нового поста (пустые лайки)
    const extendedLikesInfo =
      await this.postLikeQueryRepository.getExtendedLikesInfo(
        post._id.toString(),
        command.userId,
      );

    return PostViewDto.mapToView(post, extendedLikesInfo);
  }
}
