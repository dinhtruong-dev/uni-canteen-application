export class Category {
  public id: string;
  public name: string;
  public icon: string;
  public image: string;
  public description?: string;
  public displayOrder: number;
  public isActive: boolean;

  constructor(
    id: string,
    name: string,
    icon: string,
    image: string,
    displayOrder: number = 0,
    description?: string,
    isActive: boolean = true
  ) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.image = image;
    this.displayOrder = displayOrder;
    this.description = description;
    this.isActive = isActive;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      image: this.image,
      description: this.description,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
    };
  }
}
