import GameObjectBase from "../Game/GameObjectBase";
import { IColliderInf, IColliderObject } from "./IColliderObject";
import { Rect, DynamicQuadTreeObject, DynamicQuadTree } from "./QuadTree";


export class Collider2dManagerInitParam {
    bounds: Rect;
    maxObjects: number = 10;
    maxLevels: number = 5;
    level: number = 0;

    updateInterval: number = 1;
}

export type IsObjectColliderDirtyFunc = () => boolean;
export type GetObjectWorldPosFunc = () => cc.Vec2;

export type GetObjectColliderListFunc = () => cc.BoxCollider[];

interface ICollider2DInf {
    objList: DynamicQuadTreeObject[];
    isDirty: IsObjectColliderDirtyFunc;
    getColliderListFunc: () => IColliderInf[];
    getPosFunc: () => cc.Vec2;
}

export default class Collider2dManager {
    protected quadTree: DynamicQuadTree;
    protected colliderObjectMap: Map<string, ICollider2DInf>;

    protected timer: number;
    protected interval: number;

    protected notInsertPool: DynamicQuadTreeObject[];

    public init(inf: Collider2dManagerInitParam): boolean {
        this.quadTree = new DynamicQuadTree(inf.bounds, inf.maxObjects, inf.maxLevels, inf.level);
        this.interval = inf.updateInterval;
        this.timer = 0;
        this.colliderObjectMap = new Map();
        this.notInsertPool = [];
        return true;
    }

    public addColliderInf(obj: IColliderObject): boolean {
        let colliders = obj.getColliderList();
        if (colliders == null || colliders.length <= 0) {
            return false;
        }

        let pos = obj.getNodeWorldPosition();
        let dynamicQuadTreeObject: DynamicQuadTreeObject[] = [];
        let inf: ICollider2DInf = {
            objList: dynamicQuadTreeObject,
            isDirty: obj.getIsColliderDirty.bind(obj),
            getColliderListFunc: obj.getColliderList.bind(obj),
            getPosFunc: obj.getNodeWorldPosition.bind(obj),
        }

        for (const collider of colliders) {
            let rect: Rect = new Rect(pos.x, pos.y, collider.width, collider.height);

            let treeObject: DynamicQuadTreeObject = {
                bounds: rect,
                data: obj,
                quadTreeNode: undefined,
                getCollisionMask: collider.getMaskID.bind(collider),
                getCollisionGroup: collider.getGroupID.bind(collider),
            }

            let isInsertSucc: boolean = this.quadTree.insert(treeObject);
            if (!isInsertSucc) {
                console.log("treeObject insert fail");

                this.notInsertPool.push(treeObject);
            }


            dynamicQuadTreeObject.push(treeObject);
        }

        let objUUID: string = obj.getUUID();
        this.colliderObjectMap.set(objUUID, inf);

        return true;
    }

    public removeColliderInf(obj: IColliderObject): boolean {
        let uid = obj.getUUID();
        let inf = this.colliderObjectMap.get(uid);
        if (inf) {
            for (const obj of inf.objList) {
                this.quadTree.remove(obj);
            }

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
            this.checkInsertPool();

            let collisionInfList = this.quadTree.findCollisions();
            for (let i = 0; i < collisionInfList.length; i++) {
                const element = collisionInfList[i];
                let obj1 = element[0].data as GameObjectBase;
                let obj2 = element[1].data as GameObjectBase;

                // obj1.onCollisionEnter_new(obj1, obj2);
                // obj2.onCollisionEnter_new(obj2, obj1);

                console.log("hit ", obj1.node.name, obj2.node.name);

            }

        }

    }

    protected updateCollider() {
        const itor = this.colliderObjectMap.keys();
        let next = itor.next();
        while (!next.done) {
            let key: string = next.value;
            let inf: ICollider2DInf = this.colliderObjectMap.get(key);

            if (inf.isDirty()) {
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
            }

            next = itor.next();
        }

    }

    protected checkInsertPool() {
        let insertIdx: number[] = [];

        for (let i = 0; i < this.notInsertPool.length; i++) {
            const element = this.notInsertPool[i];

            let isInsertSucc = this.quadTree.insert(element);
            if (isInsertSucc) {
                insertIdx.push(i);
            }
            else {
                break;
            }
        }

        for (let i = 0; i < insertIdx.length; i++) {
            const element = insertIdx[i];
            this.notInsertPool.splice(element);
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
