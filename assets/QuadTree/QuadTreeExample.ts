// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import AirWall from "../Game/AirWall";
import { Bullet } from "../Game/Bullet";
import GameObjectBase from "../Game/GameObjectBase";
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

    protected objectList: GameObjectBase[] = [];
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
            maxObjects: 100,
            maxLevels: 10,
            level: 0,
            updateInterval: 0.1
        }
        manager.init(p);
        this.collider2dManager = manager;

        this.collider2dManager.onGameStart();

        let airWall = new AirWall();
        airWall.init(new cc.Node());
        airWall.node.setParent(this.node);

        this.collider2dManager.addColliderInf(airWall);

        this.objectList.push(airWall);
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
        for (const obj of this.objectList) {
            obj.onGameUpdate(dt);
        }

        this.collider2dManager.onGameUpdate(dt);

        this.draw();
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


    protected bulletCnt: number = 0;
    protected onClickKeyBoard(evt: cc.Event.EventKeyboard) {

        if (evt.keyCode == cc.macro.KEY.j) {
            for (let i = 0; i < 10; i++) {
                let bullet = new Bullet();
                let node = new cc.Node();
                bullet.init(node);
                node.setParent(this.node);
                bullet.setDestroyCall(this.removeBullet.bind(this));
                this.collider2dManager.addColliderInf(bullet);

                let dir = cc.v2(1, -1);
                dir.rotateSelf(Math.random() * 360 * (2 * Math.PI) / 360);

                bullet.setMoveDir(dir);
                this.objectList.push(bullet);

                this.bulletCnt++;
            }
        }

    }

    protected removeBullet(bullet: Bullet) {
        this.collider2dManager.markColliderValid(bullet, false);
        // this.collider2dManager.removeColliderInf(bullet);
        // bullet.node.destroy();

        // this.objectList = this.objectList.filter((v) => {
        //     return v != bullet;
        // })

        this.bulletCnt--;
    }

    protected logCollider() {
        // console.log(this.collider2dManager.getTree().insertTimes);

        console.log("bulletCnt", this.bulletCnt);

    }
}
