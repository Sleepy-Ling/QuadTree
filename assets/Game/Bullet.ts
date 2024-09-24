import { Enum_ColliderMask, Enum_ColliderType } from "../Define/Enum";
import { IColliderInf, IColliderObject } from "../QuadTree/IColliderObject";
import { Rect } from "../QuadTree/QuadTree";
import GameObjectBase from "./GameObjectBase";

export class Bullet extends GameObjectBase implements IColliderObject {
    protected colliderList: ReadonlyArray<IColliderInf>;
    protected dir: cc.Vec2 = cc.v2(0, 1);
    protected speed: number = 100;

    public init(node: cc.Node): void {
        let collider: IColliderInf = {
            x: 0,
            y: 0,
            width: 10,
            height: 20,
            maskID: Enum_ColliderType.Bullet,
            groupID: Enum_ColliderMask.Bullet,
            getMaskID: function (): number {
                return this.maskID;
            },
            getGroupID: function (): number {
                return this.groupID;
            }
        }
        this.colliderList = [collider];

        this.dir = cc.v2(0, 1);

        this.node = node;


        this.uuid = Date.now().toString();
    }

    public setMoveDir(dir: cc.Vec2) {
        this.dir = dir;
    }

    protected func: Function;
    public setDestroyCall(func: Function) {
        this.func = func;
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

        this.func && this.func(this);

    }

    public onGameUpdate(dt: number) {
        let x = this.dir.x * this.speed * dt;
        let y = this.dir.y * this.speed * dt;

        this.node.x += x;
        this.node.y += y;

        this.setIsColliderDirty(true);

    }
}