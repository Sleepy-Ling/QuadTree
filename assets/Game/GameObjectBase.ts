// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

export default class GameObjectBase {
    public node: cc.Node;

    init(param: any) {

    }

    public onGameUpdate(info?): any { }
    public onGamePause(info?): void { }
    public onGameResume(info?): void { }
    public onGameEnd(endInfo?): void { }

    getNodeWorldPosition(): cc.Vec2 {
        let nowPosition: cc.Vec2 = cc.v2(this.node.position);
        if (this.node.parent) {
            return this.node.parent.convertToWorldSpaceAR(nowPosition);
        }

        return nowPosition;
    }

    isColliderValid: boolean = true;
    getIsColliderValid() {
        return this.isColliderValid;
    }

    setIsColliderValid(v: boolean) {
        this.isColliderValid = v;
    }
}
