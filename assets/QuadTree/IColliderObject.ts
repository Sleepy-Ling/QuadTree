export abstract class IColliderObject {
    /**获取碰撞盒数组 */
    abstract getColliderList(): IColliderInf[];
    /**获取世界坐标 */
    abstract getNodeWorldPosition(): cc.Vec2;
    /**获取当前数据是否为脏数据 */
    abstract getIsColliderDirty(): boolean;
    /**获取当前对象uuid */
    abstract getUUID();
}

export class IColliderInf {
    /**偏移值 x */
    x: number;
    /**偏移值 y */
    y: number;

    /**宽 */
    width: number;
    /**高 */
    height: number;
    /**碰撞规则id 不要乱改*/
    maskID: number;
    /**碰撞盒id 不要乱改*/
    groupID: number;

    getMaskID() {
        return this.maskID;
    }

    getGroupID() {
        return this.groupID;
    }
}