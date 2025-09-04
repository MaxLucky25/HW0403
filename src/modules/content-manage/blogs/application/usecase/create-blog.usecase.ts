import { CreateBlogInputDto } from '../../api/input-dto/create-blog.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class CreateBlogCommand {
  constructor(public readonly dto: CreateBlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, BlogViewDto>
{
  constructor(private blogRepository: BlogRepository) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewDto> {
    const existing = await this.blogRepository.findByName({
      name: command.dto.name,
    });
    if (existing) {
      throw new DomainException({
        code: DomainExceptionCode.AlreadyExists,
        message: 'Blog with this name already exists',
        field: 'Name',
      });
    }
    const blog = await this.blogRepository.createBlog({
      name: command.dto.name,
      description: command.dto.description,
      websiteUrl: command.dto.websiteUrl,
    });
    return BlogViewDto.mapToView(blog);
  }
}
