export interface IColliderObject {
    /**获取碰撞盒数组 */
    getColliderList(): ReadonlyArray<IColliderInf>;
    /**获取世界坐标 */
    getNodeWorldPosition(): cc.Vec2;
    /**获取当前数据是否为脏数据 */
    getIsColliderDirty(): boolean;
    /**当前数据是否为脏数据 */
    setIsColliderDirty: (v: boolean) => void;
    /**获取当前对象uuid */
    getUUID();

    readonly isColliderValid: boolean;
    /**获取当前碰撞体是否合法 */
    getIsColliderValid: () => boolean;
    /**获取当前碰撞体是否合法 */
    setIsColliderValid: (v: boolean) => void;

    onCollisionEnter(self: IColliderObject, other: IColliderObject);
}

export interface IColliderInf {
    /**偏移值 x */
    readonly x: number;
    /**偏移值 y */
    readonly y: number;

    /**宽 */
    readonly width: number;
    /**高 */
    readonly height: number;
    /**碰撞规则id 不要乱改*/
    readonly maskID: number;
    /**碰撞盒id 不要乱改*/
    readonly groupID: number;

    getMaskID(): number;
    getGroupID(): number;

}

export function IColliderWatchProperty(target: any, propertyKey: string) {
    let value = target[propertyKey];

    const getter = function () {
        return value;
    };

    const setter = function (newVal: any) {
        console.log(`${propertyKey} 被修改为:`, newVal);
        value = newVal;
    };

    Object.defineProperty(target, propertyKey, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    });
}