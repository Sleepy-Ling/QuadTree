export class Rect {
    /**宽*/
    width: number;
    /**高 */
    height: number;

    /**中心点x */
    x: number;
    /**中心点y */
    y: number;

    toString() {
        return `width: ${this.width},height: ${this.height},x: ${this.x},y: ${this.y}`
    }

    constructor(x: number, y: number, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }


}

/**四叉树节点对象 */
export interface QuadTreeObject {
    bounds: Rect;
    data: any;
}

export class QuadTree {
    /**最大对象数 */
    private maxObjects: number;
    /**最大层数 */
    private maxLevels: number;
    /**当前层数 */
    private level: number;
    /**包围盒 */
    private bounds: Rect;
    /**该树下的对象 */
    private objects: Set<QuadTreeObject>;
    /**该树下的四个象限 */
    private nodes: QuadTree[];

    constructor(bounds: Rect, maxObjects: number = 10, maxLevels: number = 5, level: number = 0) {
        this.bounds = bounds;
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;
        this.objects = new Set<QuadTreeObject>();
        this.nodes = [];
    }

    clear(): void {
        this.objects.clear();

        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i]) {
                this.nodes[i].clear();
            }
        }

        this.nodes = [];
    }

    split(): void {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;

        this.nodes[0] = new QuadTree(new Rect(x + subWidth, y + subHeight, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1);
        this.nodes[1] = new QuadTree(new Rect(x - subWidth, y + subHeight, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1);
        this.nodes[2] = new QuadTree(new Rect(x - subWidth, y - subHeight, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1);
        this.nodes[3] = new QuadTree(new Rect(x + subWidth, y - subHeight, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1);
    }

    getIndex(pRect: Rect): number {
        const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
        const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

        const topQuadrant = (pRect.y < horizontalMidpoint && pRect.y + pRect.height < horizontalMidpoint);
        const bottomQuadrant = (pRect.y > horizontalMidpoint);

        if (pRect.x < verticalMidpoint && pRect.x + pRect.width < verticalMidpoint) {
            if (topQuadrant) {
                return 1;
            } else if (bottomQuadrant) {
                return 2;
            }
        } else if (pRect.x > verticalMidpoint) {
            if (topQuadrant) {
                return 0;
            } else if (bottomQuadrant) {
                return 3;
            }
        }

        return -1;
    }

    insert(obj: QuadTreeObject): boolean {
        if (this.nodes.length) {
            const index = this.getIndex(obj.bounds);

            if (index !== -1) {
                return this.nodes[index].insert(obj);
            }
        }

        if (this.level < this.maxLevels) {
            if (this.objects.size < this.maxObjects) {
                this.objects.add(obj);
                return true;
            }
            else {
                //当前层数存储的对象过多，要分裂成4个象限
                this.split();
                //重新分布该层对象
                const itor = this.objects.values();
                let next = itor.next();

                while (!next.done) {
                    let obj = next.value as QuadTreeObject;
                    let idx = this.getIndex(obj.bounds);
                    if (idx != -1) {
                        this.nodes[idx].insert(obj);
                    }

                    next = itor.next();
                }

                const index = this.getIndex(obj.bounds);

                if (index !== -1) {
                    return this.nodes[index].insert(obj);
                }

            }
        }
        else if (this.objects.size < this.maxObjects) {
            this.objects.add(obj);
            return true;
        }

        return false;
    }

    /**获得指定范围对象 */
    retrieve(pRect: Rect): QuadTreeObject[] {
        const index = this.getIndex(pRect);
        let returnObjects = Array.from(this.objects.values());

        if (this.nodes.length) {
            if (index !== -1) {
                returnObjects = returnObjects.concat(this.nodes[index].retrieve(pRect));
            } else {
                for (let i = 0; i < this.nodes.length; i++) {
                    returnObjects = returnObjects.concat(this.nodes[i].retrieve(pRect));
                }
            }
        }

        return returnObjects;
    }

    /**移除对象 */
    remove(obj: QuadTreeObject): boolean {
        if (this.nodes.length) {
            const index = this.getIndex(obj.bounds);
            if (index !== -1) {
                return this.nodes[index].remove(obj);
            }
        }

        return this.objects.delete(obj);
    }

    update(obj: QuadTreeObject, newBounds: Rect): void {
        if (this.remove(obj)) {
            obj.bounds = newBounds;
            obj.bounds.x = newBounds.x;
            obj.bounds.y = newBounds.y;
            obj.bounds.width = newBounds.width;
            obj.bounds.height = newBounds.height;

            this.insert(obj);
        }
    }

    queryRange(range: Rect): QuadTreeObject[] {
        let returnObjects: QuadTreeObject[] = [];

        // if (!this.bounds.intersects(range)) {
        //     return returnObjects;
        // }

        const itor = this.objects.values();
        let next = itor.next();
        while (!next.done) {
            let obj = next.value as QuadTreeObject;
            // if (range.intersects(obj.bounds)) {
            //     returnObjects.push(obj);
            // }
            returnObjects.push(obj);
            next = itor.next();
        }


        if (this.nodes.length) {
            for (let node of this.nodes) {
                returnObjects = returnObjects.concat(node.queryRange(range));
            }
        }

        return returnObjects;
    }

    findCollisions(): [QuadTreeObject, QuadTreeObject][] {
        let collisions: [QuadTreeObject, QuadTreeObject][] = [];

        let objectList: Array<QuadTreeObject> = Array.from(this.objects.values());
        for (let i = 0; i < objectList.length; i++) {
            for (let j = i + 1; j < objectList.length; j++) {
                // if (objectList[i].bounds.intersects(objectList[j].bounds)) {
                //     collisions.push([objectList[i], objectList[j]]);
                // }
            }
        }


        if (this.nodes.length) {
            for (let node of this.nodes) {
                collisions = collisions.concat(node.findCollisions());
            }
        }

        return collisions;
    }
}

export interface DynamicQuadTreeObject {
    bounds: Rect;
    data: any;
    quadTreeNode: DynamicQuadTree | null;

    getCollisionMask: () => number;
    getCollisionGroup: () => number;
}

export class DynamicQuadTree {
    private maxObjects: number;
    private maxLevels: number;
    private level: number;
    bounds: Rect;
    private objects: Set<DynamicQuadTreeObject>;
    private nodes: DynamicQuadTree[];
    parent: DynamicQuadTree | null;

    constructor(bounds: Rect, maxObjects: number = 10, maxLevels: number = 5, level: number = 0, parent: DynamicQuadTree | null = null) {
        this.bounds = bounds;
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;
        this.objects = new Set();
        this.nodes = [];
        this.parent = parent;
    }

    clear(): void {
        this.objects.clear();
        for (let node of this.nodes) {
            node.clear();
        }
        this.nodes = [];
    }

    split(): void {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;

        this.nodes[0] = new DynamicQuadTree(new Rect(x + subWidth, y + subHeight, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1, this);
        this.nodes[1] = new DynamicQuadTree(new Rect(x - subWidth, y + subHeight, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1, this);
        this.nodes[2] = new DynamicQuadTree(new Rect(x - subWidth, y - subHeight, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1, this);
        this.nodes[3] = new DynamicQuadTree(new Rect(x + subWidth, y - subHeight, subWidth, subHeight), this.maxObjects, this.maxLevels, this.level + 1, this);
    }

    getIndex(bounds: Rect): number {
        const verticalMidpoint = this.bounds.x;
        const horizontalMidpoint = this.bounds.y;

        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;

        const topQuadrant = (bounds.y > horizontalMidpoint && bounds.y - subHeight >= horizontalMidpoint);
        const bottomQuadrant = (bounds.y < horizontalMidpoint);

        if (bounds.x < verticalMidpoint && bounds.x + subWidth < verticalMidpoint) {//位置在左边
            if (topQuadrant) {
                return 1;
            } else if (bottomQuadrant) {
                return 2;
            }
        } else if (bounds.x > verticalMidpoint) {//位置在右边
            if (topQuadrant) {
                return 0;
            } else if (bottomQuadrant) {
                return 3;
            }
        }

        return -1;
    }

    insert(obj: DynamicQuadTreeObject): boolean {
        if (this.nodes.length) {
            const index = this.getIndex(obj.bounds);
            if (index !== -1) {
                return this.nodes[index].insert(obj);
            }
        }

        if (this.level < this.maxLevels) {
            if (this.objects.size < this.maxObjects) {
                this.objects.add(obj);
                obj.quadTreeNode = this;
                return true;
            }
            else {
                //当前层数存储的对象过多，要分裂成4个象限
                this.split();
                //重新分布该层对象
                const itor = this.objects.values();
                let next = itor.next();

                while (!next.done) {
                    let obj = next.value as DynamicQuadTreeObject;
                    let idx = this.getIndex(obj.bounds);
                    if (idx != -1) {
                        this.nodes[idx].insert(obj);
                    }

                    next = itor.next();
                }

                const index = this.getIndex(obj.bounds);

                if (index !== -1) {
                    return this.nodes[index].insert(obj);
                }

            }
        }
        else if (this.objects.size < this.maxObjects) {
            this.objects.add(obj);
            obj.quadTreeNode = this;
            return true;
        }

        return false;
    }

    remove(obj: DynamicQuadTreeObject): boolean {
        if (this.objects.has(obj)) {
            this.objects.delete(obj);
            obj.quadTreeNode = null;
            return true;
        }

        if (this.nodes.length) {
            const index = this.getIndex(obj.bounds);
            if (index !== -1) {
                return this.nodes[index].remove(obj);
            }
        }

        return false;
    }

    update(obj: DynamicQuadTreeObject): void {
        const currentNode = obj.quadTreeNode;
        if (!currentNode) {
            this.insert(obj);
            return;
        }

        if (!containsRect(currentNode.bounds, obj.bounds)) {
            currentNode.remove(obj);
            let node: DynamicQuadTree | null = currentNode;
            while (node.parent) {
                if (containsRect(node.parent.bounds, obj.bounds)) {
                    node.parent.insert(obj);
                    return;
                }
                node = node.parent;
            }
            this.insert(obj);
        }
    }

    retrieve(bounds: Rect): DynamicQuadTreeObject[] {
        const index = this.getIndex(bounds);
        let returnObjects = Array.from(this.objects);

        if (this.nodes.length) {
            if (index !== -1) {
                returnObjects = returnObjects.concat(this.nodes[index].retrieve(bounds));
            } else {
                for (let node of this.nodes) {
                    returnObjects = returnObjects.concat(node.retrieve(bounds));
                }
            }
        }

        return returnObjects;
    }

    findCollisions(): [DynamicQuadTreeObject, DynamicQuadTreeObject][] {
        let collisions: [DynamicQuadTreeObject, DynamicQuadTreeObject][] = [];

        const objects = Array.from(this.objects);
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                if (canMakeCollide(objects[i], objects[j]) && intersects(objects[i].bounds, objects[j].bounds)) {
                    collisions.push([objects[i], objects[j]]);
                }
            }
        }

        if (this.nodes.length) {
            for (let obj of objects) {
                for (let node of this.nodes) {
                    if (intersects(node.bounds, obj.bounds)) {
                        const nodeObjects = node.retrieve(obj.bounds);
                        for (let nodeObj of nodeObjects) {
                            if (obj !== nodeObj && canMakeCollide(obj, nodeObj) && intersects(obj.bounds, nodeObj.bounds)) {
                                collisions.push([obj, nodeObj]);
                            }
                        }
                    }
                }
            }

            for (let node of this.nodes) {
                collisions = collisions.concat(node.findCollisions());
            }
        }

        return collisions;
    }

    queryRange(range: Rect): QuadTreeObject[] {
        let returnObjects: QuadTreeObject[] = [];

        const itor = this.objects.values();
        let next = itor.next();
        while (!next.done) {
            let obj = next.value as QuadTreeObject;
            // if (range.intersects(obj.bounds)) {
            //     returnObjects.push(obj);
            // }
            returnObjects.push(obj);
            next = itor.next();
        }


        if (this.nodes.length) {
            for (let node of this.nodes) {
                returnObjects = returnObjects.concat(node.queryRange(range));
            }
        }

        return returnObjects;
    }

}

/**
 * rect1 是否包含 rect2
 * @param rect1 
 * @param rect2 
 * @returns 
 */
function containsRect(rect1: Rect, rect2: Rect): boolean {

    const subWidth_1: number = rect1.width / 2;
    const subHeight_1: number = rect1.height / 2;

    const subWidth_2: number = rect2.width / 2;
    const subHeight_2: number = rect2.height / 2;

    return rect2.x - subWidth_2 >= rect1.x - subWidth_1 && rect2.x + subWidth_2 <= rect1.x + subWidth_1 &&
        rect2.y - subHeight_2 >= rect1.y - subHeight_1 && rect2.y + subWidth_2 <= rect1.y + subHeight_1;

}

/**
 * 两个矩形是否相交
 * @param rect1 
 * @param rect2 
 * @returns 
 */
function intersects(rect1: Rect, rect2: Rect): boolean {
    let diff_x: number = Math.abs(rect1.x - rect2.x);
    let diff_y: number = Math.abs(rect1.y - rect2.y);

    const subWidth_1: number = rect1.width / 2;
    const subHeight_1: number = rect1.height / 2;

    const subWidth_2: number = rect2.width / 2;
    const subHeight_2: number = rect2.height / 2;

    return diff_x <= subWidth_1 + subWidth_2 && diff_y <= subHeight_1 + subHeight_2;
}

/**是否能发生碰撞 */
function canMakeCollide(obj_1: DynamicQuadTreeObject, obj_2: DynamicQuadTreeObject) {
    const group_1 = obj_1.getCollisionGroup();
    const group_2 = obj_2.getCollisionGroup();

    const mask_1 = obj_1.getCollisionMask();
    const mask_2 = obj_2.getCollisionMask();

    return (group_1 & mask_2) > 0 || (group_2 & mask_1) > 0;
}