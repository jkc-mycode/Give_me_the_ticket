import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Show } from './show.entity';

@Entity({ name: 'show_rankings' })
export class ShowRanking {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  //공연 엔티티 외래키 설정
  @Column({ type: 'int', name: 'show_id', unsigned: true })
  showId: number;

  @Column({ type: 'date', nullable: false })
  date: string;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  bookings: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relation - [ranking] N : 1 [shows]
  @ManyToOne((type) => Show, (show) => show.showranking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id', referencedColumnName: 'id' })
  show: Show;
}
