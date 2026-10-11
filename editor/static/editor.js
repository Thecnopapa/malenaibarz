
let CONTROL_PRESSED = false;




document.documentElement.addEventListener('keydown', (e) => {
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

//import {editorFrame} from "./editor-modules/editor-frame.js";  
import {setupBuildBlocks} from "./editor-modules/editor-blocks.js";  
import {buildTree} from "./editor-modules/editor-tree.js";  
import {Session} from "./editor-modules/editor-session.js";  

window.addEventListener("load", (e)=>{
    
    
})
setupBuildBlocks();
buildTree();
export let session = new Session();

