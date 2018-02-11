import Rectangle from "./Rectangle";
/**
 * Created by Manuel on 18/08/2015.
 */

export default class QuadTreeNode {
    //
    // private static MAX_OBJECTS:number = 10;
    // private static MAX_LEVELS:number = 5;
    //
    // private _childs:[QuadTreeNode, QuadTreeNode, QuadTreeNode, QuadTreeNode];
    // private _objects:[any];
    // private _bounds:Rectangle;
    // private _level:number;
    //
    // constructor(level:number, bounds:Rectangle) {
    //     this._level = level;
    //     this._bounds = bounds;
    //
    //     this._childs = [];
    //     this._objects = [];
    // }
    //
    // /**
    //  * Creates child nodes splitting the space in four
    //  */
    // private split() {
    //     let subWidth:number = this._bounds.width / 2;
    //     let subHeight:number = this._bounds.height / 2;
    //     let x = this._bounds.x;
    //     let y = this._bounds.y;
    //
    //     this._childs[0] = new QuadTreeNode(this._level+1, new Rectangle(x + subWidth, y, subWidth, subHeight));
    //     this._childs[1] = new QuadTreeNode(this._level+1, new Rectangle(x, y, subWidth, subHeight));
    //     this._childs[2] = new QuadTreeNode(this._level+1, new Rectangle(x, y + subHeight, subWidth, subHeight));
    //     this._childs[3] = new QuadTreeNode(this._level+1, new Rectangle(x + subWidth, y + subHeight, subWidth, subHeight));
    // }
    //
    // /**
    //  * For some rect get in if it fits in any child quadrant, if not return -1 meaning
    //  * it fits in the parent node (this)
    //  * @param rect
    //  * @returns {number}
    //  */
    // private getNodeForRect(rect:Rectangle):number {
    //     let index:number = -1;
    //     let midX:number = this._bounds.x + (this._bounds.width / 2);
    //     let midY:number = this._bounds.y + (this._bounds.height / 2);
    //
    //     //Top quadrants
    //     let fitsTopQuadrants:boolean = (rect.y < midY && rect.y + rect.height < midY);
    //     let fitsBottomQuadrants:boolean  = (rect.y > midY);
    //     let fitsLeftQuadrants:boolean = rect.x < midX && rect.x + rect.width < midX
    //     let fitsRightQuadrants:boolean = rect.x > midX;
    //
    //     if(fitsLeftQuadrants) {
    //         if(fitsTopQuadrants) {
    //             index = 0;
    //         } else if(fitsBottomQuadrants) {
    //             index = 2;
    //         }
    //     } else if(fitsRightQuadrants) {
    //         if(fitsTopQuadrants) {
    //             index = 1;
    //         } else if(fitsBottomQuadrants) {
    //             index = 3;
    //         }
    //     }
    //
    //     return index;
    // }
    //
    // public insert(rect:Rectangle) {
    //
    //     if(this._childs[0] != null) {
    //         let index:number = this.getNodeForRect(rect);
    //
    //         if(index != -1) {
    //             this._childs[index].insert(rect);
    //
    //             return;
    //         }
    //     }
    //
    //     this._objects.add(rect);
    //
    //     if (this._objects.size() > QuadTreeNode.MAX_OBJECTS && this._level < QuadTreeNode.MAX_LEVELS) {
    //         if (this._childs[0] == null) {
    //             this.split();
    //         }
    //
    //         let i:number = 0;
    //         while (i < this._objects.size()) {
    //             let index:number = this.getNodeForRect(this._objects.get(i));
    //             if (index != -1) {
    //                 this._childs[index].insert(this._objects.remove(i));
    //             } else {
    //                 i++;
    //             }
    //         }
    //     }
    //
    // }
    //
    //
    // public retrieve(returnObjects:[any], rect:Rectangle):[any] {
    //     let index:number = this.getNodeForRect(rect);
    //     let objects:[any] = [];
    //     if (index != -1 && this._childs[0] != null) {
    //         objects = this._childs[index].retrieve(returnObjects, rect);
    //     }
    //
    //     returnObjects.concat(objects);
    //
    //     return returnObjects;
    // }
    //
    //
    // /**
    //  * Clears objects recursively
    //  */
    // public clear() {
    //     this._objects.clear();
    //
    //     for(let i=0; i<this._childs.length; i++) {
    //         if(this._childs[i] != null) {
    //             this._childs[i].clear();
    //             this._childs[i] = null;
    //         }
    //     }
    // }
}
