import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Show } from '../shows/show.entity';

@Entity({ name: 'show_reviews' })
export class ShowReview {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  // 유저 엔티티 외래키 설정
  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  // 공연 엔티티 외래키 설정
  @Column({ name: 'show_id', type: 'int', unsigned: true })
  showId: number;

  /**
   * 공연 평점
   * @example 5
   */
  @Column({ type: 'int', unsigned: true })
  totalRate: number;

  @Column({ type: 'varchar' })
  nickname: string;

  /**
   * 공연 후기
   * @example "즐거운 시간을 보내고 왔습니다"
   */
  @Column({ type: 'text' })
  postscript: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Relation - [show_reviews] N : 1 [users]
  @ManyToOne((type) => User, (user) => user.showReviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  // Relation - [show_reviews] N : 1 [shows]
  @ManyToOne(() => Show, (show) => show.showReviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id', referencedColumnName: 'id' })
  show: Show;
}
