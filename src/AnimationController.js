
import TWEEN from '@tweenjs/tween.js';

export class AnimationController {
    constructor() {
  
        this.runnningIds = [];
        this.animating = false;
    }

    animate(tt) {

        this.aniId = requestAnimationFrame((tt) => this.animate(tt));

        if(tt !== undefined){
            TWEEN.update(tt);
        }        
    }

    addAnimation(id) {

        if (this.runnningIds.length == 0) {
            
            this.animate();
            this.animating = true;
        }

        this.runnningIds.push(id);
    }

    removeAnimation(id) {

        for (let i = 0; i < this.runnningIds.length; i++) {
            if (this.runnningIds[i] === id) {
                this.runnningIds.splice(i, 1);
                break;
            }
        }
        
        if(this.runnningIds.length === 0){
            // console.log("removed " + id + " len " + this.runnningIds.length);
        }

        if (this.runnningIds.length == 0) {

            cancelAnimationFrame(this.aniId);

            this.animating = false;
        }
    }
}