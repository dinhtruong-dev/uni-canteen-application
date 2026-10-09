import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'search_histories', timestamps: true, updatedAt: false, underscored: true })
export class SearchHistoryItem extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare query: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(50), defaultValue: 'user-guest', field: 'user_id' })
  declare userId: string;

  // Associations
  @BelongsTo(() => User)
  declare user: User;

  toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      query: values.query,
      userId: values.userId,
      createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}
