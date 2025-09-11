import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../domain/post-like.entity';
import {
  CreatePostLikeDomainDto,
  FindPostLikeDto,
  UpdatePostLikeStatusDto,
} from '../domain/dto/post-like.domain.dto';
import { LikeStatus } from '../domain/dto/like-status.enum';

@Injectable()
export class PostLikeRepository {
  constructor(
    @InjectModel(PostLike.name) private postLikeModel: PostLikeModelType,
  ) {}

  async createReaction(
    dto: CreatePostLikeDomainDto,
  ): Promise<PostLikeDocument> {
    const postLike = PostLike.createPostLike(dto);
    return await this.postLikeModel.create(postLike);
  }

  async findUserReaction(
    dto: FindPostLikeDto,
  ): Promise<PostLikeDocument | null> {
    return this.postLikeModel.findOne({
      userId: dto.userId,
      postId: dto.postId,
    });
  }

  async updateReactionStatus(
    dto: UpdatePostLikeStatusDto,
  ): Promise<PostLikeDocument | null> {
    const postLike = await this.findUserReaction({
      userId: dto.userId,
      postId: dto.postId,
    });

    if (!postLike) {
      return null;
    }

    postLike.updateStatus(dto.newStatus);
    return await postLike.save();
  }

  async removeReaction(dto: FindPostLikeDto): Promise<boolean> {
    const result = await this.postLikeModel.deleteOne({
      userId: dto.userId,
      postId: dto.postId,
    });
    return result.deletedCount > 0;
  }

  async countReactionsByPostAndStatus(
    postId: string,
    status: LikeStatus,
  ): Promise<number> {
    return this.postLikeModel.countDocuments({
      postId,
      status,
    });
  }

  async getNewestLikesByPostAndStatus(
    postId: string,
    status: LikeStatus,
    limit: number = 3,
  ): Promise<PostLikeDocument[]> {
    return await this.postLikeModel
      .find({ postId, status })
      .sort({ addedAt: -1 })
      .limit(limit)
      .exec();
  }
}
