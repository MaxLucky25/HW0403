import { CreatePostInputDto } from '../../api/input-dto/create-post.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/postRepository';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { BlogRepository } from '../../../blogs/infrastructure/blog.repository';
import { PostLikeQueryRepository } from '../../../post-likes/infrastructure/query/post-like.query-repository';

export class CreatePostCommand {
  constructor(
    public readonly dto: CreatePostInputDto,
    public readonly userId?: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, PostViewDto>
{
  constructor(
    private postRepository: PostRepository,
    private blogRepository: BlogRepository,
    private postLikeQueryRepository: PostLikeQueryRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostViewDto> {
    const blog = await this.blogRepository.findOrNotFoundFail({
      id: command.dto.blogId,
    });

    const post = await this.postRepository.createPost({
      title: command.dto.title,
      shortDescription: command.dto.shortDescription,
      content: command.dto.content,
      blogId: command.dto.blogId,
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
