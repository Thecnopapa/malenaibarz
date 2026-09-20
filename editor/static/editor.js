
let DRAGGING = false;
let dragSibling = undefined;
let dragParent = undefined;
let dragTarget = undefined;
let editorFrame = document.querySelector("#editor-frame");
console.log(editorFrame);


editorFrame.addEventListener('click', (e) => {
    if (DRAGGING){
        return
    }
    e.preventDefault();
    e.stopPropagation();
    selectClosestElement(e);
}, {"passive":false, "capture":true});

editorFrame.addEventListener('contextmenu', (e) => {
    console.log("Showing context menu...")
    e.preventDefault();
    e.stopPropagation();
    showContext(e);
}, {"passive":false, "capture":true});

function showContext(event){
  if (selectClosestElement(event)){
    console.log(target)
  }
}




editorFrame.addEventListener('dragstart', (e) => {
    console.log("Dragging:", e.target)
    e.stopPropagation();
    target = e.target;

    if (target.previousElementSibling) {
        dragSibling = target.previousElementSibling;
    } else {
        dragParent = target.parentElement;
    }


    let clone = target.cloneNode(deep=true)
    target.remove()

    clone.addEventListener("drop", (e) => {
    })
    console.log(clone)
    DRAGGING = clone
}, {"passive":false, "capture":true});


editorFrame.addEventListener('dragover', (e) => {
    console.log("Dragging over:", e.target);
    //console.log(e.target);

}, {"passive":false, "capture":true});



function selectClosestElement(event){

    target = event.target;
    prevTarget = document.querySelectorAll(".selected").forEach(e => {
        e.classList.remove("selected");
        e.setAttribute("draggable", "")
    });
    if (editorFrame == target){
        console.log("Unselecting all...")
        return false
    }
    console.log("Selecting element...")
    console.log(event.target)

    target.classList.add("selected");
    target.setAttribute("draggable", "true")
    let id = target.attributes.counter.value;

    let menuItem = document.querySelector("#editor-tree").querySelector("#"+id);
    menuItem.classList.add("selected");

    return target
}

async function buildTree(treelement=undefined, tree=undefined, depth=0){
    console.log("Building tree")
    if (treelement === undefined){
        treelement= document.querySelector("#editor-tree");
    }
    if (tree === undefined){
        tree = layout
    }

    console.log({tree, treelement})
    Object.entries(tree).forEach(k => {
        t = k[1];
        k = k[0];
        console.log(k, t);
        el = document.createElement("div");
        el.id = k;
        el.classList="editor-tree-item";
        title = document.createElement("p");
        title.innerText = k;
        el.style.paddingLeft = "1em";
        el.appendChild(title);
        treelement.appendChild(el);
        buildTree(el, t, depth=depth+1);
    })
}



buildTree()
