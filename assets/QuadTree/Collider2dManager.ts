import GameObjectBase from "../Game/GameObjectBase";
import { IColliderInf, IColliderObject } from "./IColliderObject";
import { Rect, DynamicQuadTreeObject, DynamicQuadTree } from "./QuadTree";


export class Collider2dManagerInitParam {
    /**碰撞盒范围 */
    bounds: Rect;
    /**一层中最大个数 */
    maxObjects: number = 10;
    /**最大层数 */
    maxLevels: number = 1;
    /**当前从第几层开启，默认：0 */
    level: number = 0;

    /**碰撞盒更新检测间隔 */
    updateInterval: number = 1;
}

export type IsObjectColliderDirtyFunc = () => boolean;
export type GetObjectWorldPosFunc = () => cc.Vec2;

export type GetObjectColliderListFunc = () => cc.BoxCollider[];

/**碰撞体的数据 */
interface ICollider2DInf {
    obj: IColliderObject;
    /**四叉树对象 */
    objList: DynamicQuadTreeObject[];
    /**当前数据是否为脏数据 */
    isDirty: IsObjectColliderDirtyFunc;
    /**当前数据是否为脏数据 */
    setDirty: (v: boolean) => void;
    /**获取该碰撞体的全部碰撞盒 */
    getColliderListFunc: () => IColliderInf[];
    /**获取该碰撞体的世界坐标 */
    getPosFunc: () => cc.Vec2;

    isColliderValid: () => boolean;
}

export default class Collider2dManager {
    protected quadTree: DynamicQuadTree;
    protected colliderObjectMap: Map<string, ICollider2DInf>;

    protected timer: number;
    protected interval: number;

    public init(inf: Collider2dManagerInitParam): boolean {
        this.quadTree = new DynamicQuadTree(inf.bounds, inf.maxObjects, inf.maxLevels, inf.level);
        this.interval = inf.updateInterval;
        this.timer = 0;
        this.colliderObjectMap = new Map();
        return true;
    }

    public addColliderInf(obj: IColliderObject): boolean {
        let colliders = obj.getColliderList();
        if (colliders == null || colliders.length <= 0) {
            return false;
        }

        let objUUID: string = obj.getUUID();
        let hasAdd = this.colliderObjectMap.has(objUUID);
        if (hasAdd) {
            console.log("has add", hasAdd);

            return false;
        }

        let pos = obj.getNodeWorldPosition();
        let dynamicQuadTreeObject: DynamicQuadTreeObject[] = [];
        let inf: ICollider2DInf = {
            objList: dynamicQuadTreeObject,
            isDirty: obj.getIsColliderDirty.bind(obj),
            getColliderListFunc: obj.getColliderList.bind(obj),
            getPosFunc: obj.getNodeWorldPosition.bind(obj),
            setDirty: obj.setIsColliderDirty.bind(obj),
            isColliderValid: obj.getIsColliderValid.bind(obj),
            obj: obj
        }

        for (const collider of colliders) {
            let rect: Rect = new Rect(pos.x + collider.x, pos.y + collider.y, collider.width, collider.height);

            let treeObject: DynamicQuadTreeObject = {
                bounds: rect,
                data: obj,
                quadTreeNode: undefined,
                getCollisionMask: collider.getMaskID.bind(collider),
                getCollisionGroup: collider.getGroupID.bind(collider),
                getIsValid: obj.getIsColliderValid.bind(obj)
            }

            let isInsertSucc: boolean = this.quadTree.insert(treeObject);
            if (!isInsertSucc) {
                console.log("treeObject insert fail", obj.getUUID());

                // this.notInsertPool.push(treeObject);
            }


            dynamicQuadTreeObject.push(treeObject);
        }

        this.colliderObjectMap.set(objUUID, inf);

        return true;
    }

    /**标记碰撞体是否为合法 */
    public markColliderValid(obj: IColliderObject, isValid: boolean) {
        obj.setIsColliderValid(isValid);

        // console.log("valid", obj.getUUID(), isValid);
    }

    public removeColliderInf(obj: IColliderObject): boolean {
        let uid = obj.getUUID();
        let inf = this.colliderObjectMap.get(uid);
        if (inf) {

            for (const element of inf.objList) {
                let isRemoveSucc = this.quadTree.remove(element);
                if (!isRemoveSucc) {
                    return false;
                }
            }

            console.log("remove ", uid);

            return this.colliderObjectMap.delete(uid);
        }

        return false;
    }

    public onGameStart(info?: any): void {
        this.timer = 0;
    }
    public onGameUpdate(dt: number): void {
        this.timer += dt;
        if (this.timer >= this.interval) {
            this.timer -= this.interval;

            this.updateCollider();
            // console.log("==========================");

            let collisionInfList = this.quadTree.findCollisions();
            for (let i = 0; i < collisionInfList.length; i++) {
                const element = collisionInfList[i];
                let obj1 = element[0].data as IColliderObject;
                let obj2 = element[1].data as IColliderObject;

                // obj1.onCollisionEnter_new(obj1, obj2);
                // obj2.onCollisionEnter_new(obj2, obj1);


                obj1.onCollisionEnter(obj1, obj2);
                obj2.onCollisionEnter(obj2, obj1);
                // console.log("hit ", obj1.getUUID(), obj2.getUUID());

            }
            // console.log("===========end ===============");
            this.checkValidColliderObj();
        }

    }

    /**更新碰撞盒 */
    protected updateCollider() {
        const itor = this.colliderObjectMap.keys();
        let next = itor.next();
        while (!next.done) {
            let key: string = next.value;
            let inf: ICollider2DInf = this.colliderObjectMap.get(key);

            if (inf.isDirty() && inf.isColliderValid()) {
                let pos = inf.getPosFunc();
                let colliderList = inf.getColliderListFunc();

                for (let i = 0; i < colliderList.length; i++) {
                    const collider = colliderList[i];
                    const obj = inf.objList[i];
                    obj.bounds.x = pos.x + collider.x;
                    obj.bounds.y = pos.y + collider.y;
                    obj.bounds.width = collider.width;
                    obj.bounds.height = collider.height;

                    this.quadTree.update(obj);
                }

                inf.setDirty(false);
            }

            next = itor.next();
        }

    }

    protected checkValidColliderObj() {
        const itor = this.colliderObjectMap.keys();
        let next = itor.next();
        while (!next.done) {
            let key: string = next.value;
            let inf: ICollider2DInf = this.colliderObjectMap.get(key);
            if (!inf.isColliderValid()) {
                this.removeColliderInf(inf.obj);
            }

            next = itor.next();
        }

    }

    public onGamePause(info?: any): void {
        throw new Error("Method not implemented.");
    }
    public onGameResume(info?: any): void {
        throw new Error("Method not implemented.");
    }
    public onGameEnd(endInfo?: any): void {
        throw new Error("Method not implemented.");
    }
    public clear(): void {
        this.quadTree.clear();
        this.colliderObjectMap.clear();
        this.timer = 0;
    }

    public getTree() {
        return this.quadTree;
    }
}
