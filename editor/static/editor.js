
let dragPosition = undefined;
let dragInto = undefined;
let dragTarget = undefined;
let dragClone = undefined;
let dragOk = false;
let editorFrame = document.querySelector("#editor-frame");
let buildBlockContainer = document.querySelector("#editor-build-blocks");
let newIds = 1;
console.log(editorFrame);


editorFrame.addEventListener('click', (e) => {

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

    let clone = target.cloneNode(deep=true);
    dragClone = clone;
    dragTarget = target;

    clone.classList.add("drag-clone");
    target.classList.add("dragged");

    
}, {"passive":false, "capture":true});


document.documentElement.addEventListener('dragend', (e) => {
    console.log("Drag End OK=", dragOk)
    if (dragClone === undefined){return}
    if (dragOk){
        if (dragTarget !== undefined){
            dragTarget.remove();
        } else {
            console.log("Setting counter to:", "new"+ String(newIds))
            dragClone.setAttribute("counter", "new"+ String(newIds));
            newIds +=1
        }
        console.log({dragClone, dragInto, dragPosition})
        console.log(dragClone.getAttribute("counter"), dragInto.getAttribute("counter"))
        modifyTree(dragClone.getAttribute("counter"), dragInto.getAttribute("counter"), dragPosition)
    }
    document.documentElement.querySelectorAll(".dragged").forEach(el => {el.classList.remove("dragged")});
    document.documentElement.querySelectorAll(".drag-clone").forEach(el => {el.classList.remove("drag-clone")});
    document.documentElement.querySelectorAll(".drag-before").forEach(el => {el.classList.remove("drag-before")})
    document.documentElement.querySelectorAll(".drag-after").forEach(el => {el.classList.remove("drag-after")})
    document.documentElement.querySelectorAll(".drag-into").forEach(el => {el.classList.remove("drag-into")})
    

    dragPosition = undefined;
    dragInto = undefined;
    dragTarget = undefined;
    dragClone = undefined;
    dragOk = false;
    

}, {"passive":false, "capture":true});

editorFrame.addEventListener('dragover', (e) => {
    if (dragClone === undefined){return}
    console.log("Dragging over:", e.target, e);
    //console.log(e.target, e.toElement, e.offsetX, e.offsetY);
    console.log("size", e.target.offsetWidth, e.target.offsetWidth)
    console.log(e.offsetX, e.offsetY)

    let pos = undefined;

    let offset = e.target.getBoundingClientRect();
    //console.log(offset.x, offset.y)
    let offsetX = e.clientX - offset.x;
    let offsetY = e.clientY - offset.y;
    //console.log({offsetX, offsetY})

    if (e.offsetX < e.target.offsetWidth/8){
        pos = "before";
    } else if (e.offsetX > (e.target.offsetWidth*7)/8){
        pos = "after";
    } else {
        pos = "inside";
    }


    if (e.target == dragTarget|| e.target == undefined) {
        //console.log("removing clone...");
        dragClone.remove();
        dragOk = false;
        return 
    } else if (e.target == dragClone){
        dragOk = true;
        return
    } 
    document.documentElement.querySelectorAll(".drag-before").forEach(el => {el.classList.remove("drag-before")})
    document.documentElement.querySelectorAll(".drag-after").forEach(el => {el.classList.remove("drag-after")})
    document.documentElement.querySelectorAll(".drag-into").forEach(el => {el.classList.remove("drag-into")})
    if (e.target == editorFrame ){
        editorFrame.appendChild(dragClone)
        dragPosition = "inside";
        dragInto = e.target;
        dragOk = true;
    } else if (pos === "before"){
        //console.log("clone before");
        e.target.before(dragClone);
        dragOk = true;
        dragPosition = "before";
        dragInto = e.target;
        e.target.classList.add("drag-before");
    } else if (pos === "after") {
        //console.log("clone after");
        e.target.after(dragClone);
        dragOk = true;
        dragPosition = "after";
        dragInto = e.target;
        e.target.classList.add("drag-after");
    } else if (pos === "inside") {
        //console.log("clone inside");
        e.target.appendChild(dragClone);
        e.target.classList.classList
        dragOk = true;
        dragPosition = "inside";
        dragInto = e.target;
        e.target.classList.add("drag-into");
    } else {
        dragOk = false;
    }




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
    let id = target.getAttribute("counter");

    let menuItem = document.querySelector("#editor-tree").querySelector("#"+id);
    menuItem.classList.add("selected");
    menuItem.scrollIntoView()

    return target
}


function setTreeElement(k){
    //console.log(k, t);
    console.log("Building tree element")
    el = document.createElement("div");
    el.id = k;
    el.classList="editor-tree-item";
    title = document.createElement("div");
    title.innerText = "-"+k;
    el.style.marginLeft = "1em";
    el.style.borderLeft = "solid black 1px"
    el.style.cursor = "pointer";
    el.appendChild(title);
    
    el.addEventListener("mouseover", (e) => {
        if (e.target.classList.contains("selected") || e.target.parentElement.classList.contains("selected")){return}; 
        e.target.style.backgroundColor = 'antiquewhite';
        let t=undefined;if(e.target.id===undefined||e.target.id===""){t=e.target.parentElement}else{t=e.target};let tId=t.id; let tEl=document.documentElement.querySelector("."+String(tId));
        tEl.style.boxShadow = "inset 0px 0px 0px 1px orange"; // Maybe needs -webkit and -moz variants
    });
    el.addEventListener("mouseout", (e) => {
        e.target.style.backgroundColor = ''
        let t=undefined;if(e.target.id===undefined||e.target.id===""){t=e.target.parentElement}else{t=e.target};let tId=t.id; let tEl=document.documentElement.querySelector("."+String(tId));
        tEl.style.boxShadow = ""; // Maybe needs -webkit and -moz variants
    });
    
    el.addEventListener("click", (e) => {
        let t=undefined;if(e.target.id===undefined||e.target.id===""){t=e.target.parentElement}else{t=e.target};let tId=t.id; let tEl=document.documentElement.querySelector("."+String(tId));
        tEl.click()
    });
    return el

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
        let el = setTreeElement(k);
        el.setAttribute("depth", depth);
        treelement.appendChild(el);
        buildTree(el, t, depth=depth+1);
    })
}


function modifyTree(movingId, targetId, position){
    
    let treeElement = document.querySelector("#editor-tree");
    if (targetId === "frame"){
        targetId = treeElement.lastElementChild.id;
        position = "after";
    }
    console.log({movingId, targetId, position})
    let el = treeElement.querySelector("#"+movingId);
    if (el === undefined || el === null){
        el = setTreeElement(movingId);
    }

    let target = treeElement.querySelector("#"+targetId);
    if (position === "before"){
        target.before(el);
    } else if (position === "after"){
        target.after(el);
    } else if (position === "inside"){
        target.appendChild(el)
    }
}

async function setupBuildBlocks(){
    Object.entries(buildBlocks).forEach(b => {
        console.log(b);
        let el = document.createElement("div");
        el.classList.add("editor-build-block");
        el.innerText = b[0];
        el.style.cursor = "pointer";
        el.setAttribute("draggable", "true");
        el.addEventListener("dragstart", (e) => {
            dragClone = document.createElement(b[1].tag);
            dragClone.innerHTML = b[1].html;
            dragClone.classList.add("drag-clone");
            e.target.classList.add("dragged");
        });
        buildBlockContainer.appendChild(el);
    });
}

setupBuildBlocks()

buildTree()
