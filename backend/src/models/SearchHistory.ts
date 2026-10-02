export class SearchHistoryItem {
  constructor(
    public id: string,
    public query: string,
    public userId: string = 'user-guest',
    public createdAt: string = new Date().toISOString()
  ) {}

  public toJSON() {
    return {
      id: this.id,
      query: this.query,
      userId: this.userId,
      createdAt: this.createdAt,
    };
  }
}
