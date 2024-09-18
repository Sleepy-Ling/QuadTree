// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import Collider2dManager, { Collider2dManagerInitParam } from "./Collider2dManager";
import { QuadTree, Rect } from "./QuadTree";


const { ccclass, property } = cc._decorator;

@ccclass
export default class QuadTreeExample extends cc.Component {
    @property(cc.Graphics)
    graphics: cc.Graphics = null;


    protected quadTree: QuadTree;

    protected worldRect: Rect;

    protected collider2dManager: Collider2dManager;

    start() {
        this.firstInitView();
        this.onViewOpen();
    }

    public async firstInitView(): Promise<boolean> {
        //层级初始化
        let main = cc.find("main", this.node);

        return Promise.resolve(true);
    }



    onViewOpen(): void {


        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onClickKeyBoard, this);

        let worldZero = this.node.convertToWorldSpaceAR(cc.v2());
        console.log("worldZero", worldZero.toString());

        let rect: Rect = new Rect(375, 812, 750, 1624);
        this.worldRect = rect;

        this.quadTree = new QuadTree(rect, 10, 10);

        //碰撞盒管理者
        let manager = new Collider2dManager();
        let p: Collider2dManagerInitParam = {
            bounds: new Rect(375, 812, 750, 1624),
            maxObjects: 20,
            maxLevels: 10,
            level: 0,
            updateInterval: 0.1
        }
        manager.init(p);
        this.collider2dManager = manager;
    }


    protected update(dt: number): void {

        // if (PlayerData.touch) {
        //     let nowTouchPos = PlayerData.touch.getLocation();
        //     let lastTouchPos = PlayerData.touchWorldPos;
        //     let toVec = nowTouchPos.sub(lastTouchPos);
        //     console.log("toVec", toVec.toString());


        //     PlayerData.moveDirection = toVec;
        //     PlayerData.touchWorldPos = nowTouchPos;
        // }

        // this.plane.updatePlayerPos(dt);
    }


    draw(): void {
        if (!this.graphics) {
            return;
        }

        this.graphics.clear();

        let manager = this.collider2dManager;

        if (!manager) {
            return;
        }
        const tree = manager.getTree();

        let bounds = tree.bounds;

        let tempPos = cc.v2(bounds.x, bounds.y);
        tempPos = this.node.convertToNodeSpaceAR(tempPos);

        // Draw current node
        this.graphics.strokeColor = cc.Color.WHITE;
        this.graphics.fillColor = cc.Color.YELLOW;
        this.graphics.fillColor.setA(120);

        this.graphics.rect(tempPos.x - bounds.width / 2, tempPos.y - bounds.height / 2, bounds.width, bounds.height);
        this.graphics.fill();

        this.graphics.stroke();

        let allObject = tree.queryRange(bounds);

        // Draw objects
        this.graphics.fillColor = cc.Color.RED;
        for (let obj of allObject) {
            tempPos.x = obj.bounds.x;
            tempPos.y = obj.bounds.y;
            tempPos = this.node.convertToNodeSpaceAR(tempPos);

            this.graphics.rect(tempPos.x - obj.bounds.width / 2, tempPos.y - obj.bounds.height / 2, obj.bounds.width, obj.bounds.height);
            this.graphics.fill();
        }
    }

    protected onClickKeyBoard(evt: cc.Event.EventKeyboard) {

        if (evt.keyCode == cc.macro.KEY.j) {


        }

    }


}
