import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { Post, PostModelType } from '../../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { sortDirectionToNumber } from '../../../../../core/dto/base.query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostLikeQueryRepository } from '../../../post-likes/infrastructure/query/post-like.query-repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postLikeQueryRepository: PostLikeQueryRepository,
  ) {}

  async getByIdNotFoundFail(id: string, userId?: string): Promise<PostViewDto> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        field: 'Post',
      });
    }

    // Получаем актуальную информацию о лайках
    const extendedLikesInfo =
      await this.postLikeQueryRepository.getExtendedLikesInfo(id, userId);

    return PostViewDto.mapToView(post, extendedLikesInfo);
  }

  async getAllPost(
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      deletedAt: null,
    };
    if (query.searchTitleTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        title: { $regex: query.searchTitleTerm, $options: 'i' },
      });
    }

    const posts = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: sortDirectionToNumber(query.sortDirection) })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    // Получаем информацию о лайках для всех постов
    const items = await Promise.all(
      posts.map(async (post) => {
        const extendedLikesInfo =
          await this.postLikeQueryRepository.getExtendedLikesInfo(
            post._id.toString(),
            userId,
          );
        return PostViewDto.mapToView(post, extendedLikesInfo);
      }),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getAllPostForBlog(
    blogId: string,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      deletedAt: null,
      blogId,
    };
    if (query.searchTitleTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        title: { $regex: query.searchTitleTerm, $options: 'i' },
      });
    }

    const posts = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: sortDirectionToNumber(query.sortDirection) })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    // Получаем информацию о лайках для всех постов
    const items = await Promise.all(
      posts.map(async (post) => {
        const extendedLikesInfo =
          await this.postLikeQueryRepository.getExtendedLikesInfo(
            post._id.toString(),
            userId,
          );
        return PostViewDto.mapToView(post, extendedLikesInfo);
      }),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
