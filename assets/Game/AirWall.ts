import { Enum_ColliderType, Enum_ColliderMask } from "../Define/Enum";
import { IColliderInf, IColliderObject } from "../QuadTree/IColliderObject";
import GameObjectBase from "./GameObjectBase";


export default class AirWall extends GameObjectBase implements IColliderObject {
    protected colliderList: IColliderInf[] = [];

    public init(node: any): void {
        let collider: IColliderInf = {
            x: 0,
            y: 812,
            width: 750,
            height: 100,
            maskID: Enum_ColliderType.AirWall,
            groupID: Enum_ColliderMask.AirWall,
            getMaskID: function (): number {
                return this.maskID;
            },
            getGroupID: function (): number {
                return this.groupID;
            }
        }

        this.colliderList.push(collider);

        collider = {
            x: 0,
            y: -812,
            width: 750,
            height: 100,
            maskID: Enum_ColliderType.AirWall,
            groupID: Enum_ColliderMask.AirWall,
            getMaskID: function (): number {
                return this.maskID;
            },
            getGroupID: function (): number {
                return this.groupID;
            }
        }

        this.colliderList.push(collider);

        collider = {
            x: 375,
            y: 0,
            width: 100,
            height: 1624,
            maskID: Enum_ColliderType.AirWall,
            groupID: Enum_ColliderMask.AirWall,
            getMaskID: function (): number {
                return this.maskID;
            },
            getGroupID: function (): number {
                return this.groupID;
            }
        }

        this.colliderList.push(collider);
        collider = {
            x: -375,
            y: 0,
            width: 100,
            height: 1624,
            maskID: Enum_ColliderType.AirWall,
            groupID: Enum_ColliderMask.AirWall,
            getMaskID: function (): number {
                return this.maskID;
            },
            getGroupID: function (): number {
                return this.groupID;
            }
        }

        this.colliderList.push(collider);

        this.node = node;

        this.uuid = Date.now().toString();
    }

    getColliderList(): readonly IColliderInf[] {
        return this.colliderList;
    }

    protected isColliderDirty: boolean = false;
    getIsColliderDirty(): boolean {
        return this.isColliderDirty;
    }
    setIsColliderDirty(v: boolean) {
        this.isColliderDirty = v;
    };
    protected uuid: string;
    getUUID() {
        return this.node.uuid;
    }

    onCollisionEnter(self: IColliderObject, other: IColliderObject) {
        // console.log("self", self, "other", other);

    }

}
