import { CreateCommentInputDto } from '../../api/input-dto/create-comment.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { PostRepository } from '../../../posts/infrastructure/postRepository';
import { CommentLikesDomainService } from '../../domain/services/comment-likes.domain-service';

export class CreateCommentCommand {
  constructor(
    public readonly dto: CreateCommentInputDto,
    public readonly postId: string,
    public readonly userId: string,
    public readonly userLogin: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, CommentViewDto>
{
  constructor(
    private commentRepository: CommentRepository,
    private postRepository: PostRepository,
    private commentLikesDomainService: CommentLikesDomainService,
  ) {}

  async execute(command: CreateCommentCommand): Promise<CommentViewDto> {
    // Проверяем, что пост существует
    await this.postRepository.findOrNotFoundFail({
      id: command.postId,
    });

    const comment = await this.commentRepository.createComment({
      content: command.dto.content,
      postId: command.postId,
      commentatorId: command.userId,
      commentatorLogin: command.userLogin,
    });

    // Создаем пустую информацию о лайках для нового комментария
    const likesInfo = this.commentLikesDomainService.createEmptyLikesInfo();

    return CommentViewDto.mapToView(comment, likesInfo);
  }
}
