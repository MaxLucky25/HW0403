import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostLike, PostLikeModelType } from '../../domain/post-like.entity';
import { LikeStatus } from '../../domain/dto/like-status.enum';
import { ExtendedLikesInfoViewDto } from '../../api/view-dto/extended-likes-info.view-dto';

@Injectable()
export class PostLikeQueryRepository {
  constructor(
    @InjectModel(PostLike.name) private postLikeModel: PostLikeModelType,
  ) {}

  async getExtendedLikesInfo(
    postId: string,
    userId?: string,
  ): Promise<ExtendedLikesInfoViewDto> {
    // Получаем все данные одним запросом
    const [likesCount, dislikesCount, userReaction, newestLikes] =
      await Promise.all([
        this.postLikeModel.countDocuments({ postId, status: LikeStatus.Like }),
        this.postLikeModel.countDocuments({
          postId,
          status: LikeStatus.Dislike,
        }),
        userId ? this.postLikeModel.findOne({ userId, postId }) : null,
        this.postLikeModel
          .find({ postId, status: LikeStatus.Like })
          .sort({ addedAt: -1 })
          .limit(3)
          .exec(),
      ]);

    // Определяем статус пользователя
    const myStatus = userReaction ? userReaction.status : LikeStatus.None;

    // Формируем последние лайки
    const newestLikesDetails = newestLikes.map((like) => ({
      addedAt: like.addedAt.toISOString(),
      userId: like.userId,
      login: like.userLogin,
    }));

    return {
      likesCount,
      dislikesCount,
      myStatus,
      newestLikes: newestLikesDetails.length > 0 ? newestLikesDetails : null,
    };
  }
}
