export enum Enum_ColliderType {
    None = 1 << 0,
    Bullet = 1 << 1,
    Enemy = 1 << 2,
    AirWall = 1 << 3,
}

export enum Enum_ColliderMask {
    None,
    Bullet = Enum_ColliderType.Enemy | Enum_ColliderType.AirWall,
    AirWall = Enum_ColliderType.Enemy,
}