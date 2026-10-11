 
import {editorFrame} from "./editor-frame.js"
import {renderBuildBlock} from "./editor-blocks.js"
import {modifyTree} from "./editor-tree.js"

export class Change {
    constructor(type, target, from, to, data={}){
        this.type = type;
        this.target = target;
        this.from = from;
        this.to = to;
        this.data = data;
    }
    json(){
        return JSON.stringify({
            "type": this.type,
            "target": this.target,
            "from": this.from,
            "to": this.to,
            "data": this.data
        });
    }
    repr(){
        return `<Change (${this.type}): ${this.target}>`;
    }

    _selectElement(counter){
        if (counter === "frame"){
            return editorFrame
        }
        let candidates = editorFrame.querySelectorAll(`.${counter}`);
        let selected = null
        candidates.forEach((el) => {
            //console.log(el);
            if (el.getAttribute("counter") === counter){
                console.log(el);
                selected = el;
            }
        })
        return selected

    }

    apply(revert=false, dry=false){
        if (dry){
            return
        }
        console.log("Applying change: "+this.repr()+`(revert=${revert} dry=${dry})`);
        if (dry){
            return
        }
        if (this.type === "move"){
            this._applyMove(revert);
        } else if (this.type === "text"){
            this._applyText(revert);
        } else {
            console.warn(`Change type (${this.type}) not implemented`);
        }

    }

    _applyMove(revert=false){
        console.log(`Applying move... (revert=${revert})`);
        
        let target = this.target;
        let to = undefined;
        let from = undefined;
        let pos = undefined;
        let origin = undefined;
        console.log(this.data)

        if (revert){
            to = this.from;
            from = this.to;
            pos = this.data["prev_pos"];
            origin = this.data["new_pos"]
        } else {
            to = this.to;
            from = this.from;
            pos = this.data["new_pos"];
            origin = this.data["prev_pos"];
        }

        console.log({target, to, from, pos});

        let targetEl = undefined;
        let toEl = this._selectElement(to);

        if (origin === "outside" ){
            targetEl = renderBuildBlock(from, target);
        } else {
            targetEl = this._selectElement(target);
        }

        console.log({targetEl, toEl})



        if (pos === "before"){
            toEl.before(targetEl);
        } else if (pos === "after"){
            toEl.after(targetEl);
        } else if (pos === "inside"){
            toEl.appendChild(targetEl);
        } else if (pos === "outside"){
            targetEl.remove();
        }
        modifyTree(target, to, pos);

    }

    _applyText(revert=false){
        let targetEl = this._selectElement(this.target);
        let newText = undefined;
        if (revert){
            newText = this.from;
        } else{
            newText = this.to;
        }
        targetEl.innerText = newText;
    }
}



 export class Session {
    constructor(){
        this.i = 0;
        this.n = 0;
        this.storage = localStorage;
        this.changes = {};
        this.loadChanges();
        this.applyChanges();
    }
    storageAvailable() {
        try {
            const x = "__storage_test__";
            this.storage.setItem(x, x);
            this.storage.removeItem(x);
            return true;
        } catch (e) {
            console.error("Storage Failed:", e);
            return false
        }
    }
    update_i(i=undefined){
        if (i === undefined){
            i = this.i +1;
        }
        this.i = i
        this.storage.setItem("i", this.i);
        this.storage.setItem("n", this.n);
        console.log(`Current i=${this.i} (n=${this.n})`)
    }

    loadChanges(){
        console.log("Loading stored changes...");
        
        while (this.n < 1000){
            try{
                let k = "change_"+String(this.n+1)
                let v = this.storage.getItem(k)
                if (v === null){
                    console.log("End of stored changes");
                    break
                }
                let data = JSON.parse(v)
                this.changes[this.n] = new Change(data.type, data.target, data.from, data.to, data.data)
                this.n += 1
            } catch (e) {
                console.error(e);
                break
            }
        }
        console.log(`Loaded ${this.n} changes`)
        console.log(this.changes)
        this.i = 0;
        
    }

    applyChanges(){
        console.log("Applying loaded changes...");
        let i = this.storage.getItem("i");
        if (i === null){
            i = 0;
        }
        i = Number(i)
        console.log("Saved i", i)
        while (this.i < i){
            this.update_i()
            console.log(this.i , i);
            this.applyLastChange();

        }
        
    }

    applyLastChange(dry=false){
        if (this.i > this.n){
            console.warn("No more changes to apply");
            this.update_i(this.n)
        } else {
            this.changes[this.i-1].apply(false, dry)
        }
        
        
    }
    revertLastChange(dry=false){
        if (this.i > 0){
            console.log(this.changes[this.i-1], this.i)
            this.changes[this.i-1].apply(true, dry)
            this.update_i(this.i - 1)
        } else {
            console.warn("Can't undo any more!")
        }
        
    }




    addChange(change, dry=false){
        console.log(`Adding change... (dry=${dry})`);
        if (! (change instanceof Change)){
            change = new Change(...change);
        }
        console.log(change);
        if (this.storageAvailable()){
            this.n = this.i+1;
            this.update_i();
            let key = "change_"+String(this.i);
            console.log("Storing change:", key, this.i);
            this.storage.setItem(key, change.json());
            this.changes[this.i-1] = change;
            this.applyLastChange(dry);
        } else {
            throw new Error("Session storage not available");
        }
        
    }
}


function storeData(key, value){
    sessionStorage.setItem(key, value);
}


