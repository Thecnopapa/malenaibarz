
let CONTROL_PRESSED = false;
import {setupBuildBlocks} from "./editor-modules/editor-blocks.js";  
import {buildTree} from "./editor-modules/editor-tree.js";  
import {Session} from "./editor-modules/editor-session.js";  
import {editorFrame, editorRoot, selectClosestElement, currentlySelected, textEditPrev, escapeAll} from "./editor-modules/editor-frame.js";  





document.documentElement.addEventListener('keydown', (e) => {
    //console.log(e.key)
    if (e.key === 'Escape') {
        console.log("ESCAPE");
        escapeAll()
        return
    }
    if (e.key === 'Delete') {
        console.log("Delete");
        console.log(currentlySelected, textEditPrev);
        if (currentlySelected !== undefined && textEditPrev === undefined){
            if (currentlySelected !== editorRoot){
                session.addChange([session, "remove", currentlySelected.getAttribute("counter")]);
                escapeAll()
            } else{
                console.warn("Can't delete root element!")
            }
        }
        
        return
    }

    if (e.key === 'Control') {
        CONTROL_PRESSED = true;
        console.log("Control pressed:", CONTROL_PRESSED);
    }
    if (e.key === 'z' && CONTROL_PRESSED){
        e.preventDefault();
        console.log("CTRL-Z");
        session.revertLastChange();
    }
    if (e.key === 'y' && CONTROL_PRESSED){
        e.preventDefault();
        console.log("CTRL-Y");
        session.update_i();
        session.applyLastChange();

    }
});
document.documentElement.addEventListener('keyup', (e) => {
    if (e.key === 'Control') {
        CONTROL_PRESSED = false;
        console.log("Control pressed:", CONTROL_PRESSED);
    }

});


setupBuildBlocks();
buildTree();
export let session = new Session();

