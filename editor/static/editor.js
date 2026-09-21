
let dragSibling = undefined;
let dragParent = undefined;
let dragTarget = undefined;
let dragClone = undefined;
let dragOk = false;
let editorFrame = document.querySelector("#editor-frame");
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

    if (target.previousElementSibling) {
        dragSibling = target.previousElementSibling;
    } else {
        dragParent = target.parentElement;
    }

    let clone = target.cloneNode(deep=true);
    dragClone = clone;
    dragTarget = target

    clone.classList.add("drag-clone");
    target.classList.add("dragged");

    
}, {"passive":false, "capture":true});


editorFrame.addEventListener('dragend', (e) => {
    if (dragTarget === undefined){return}
    if (dragOk){
        dragTarget.remove();
        dragClone.classList.remove("drag-clone")
        
    }

    dragSibling = undefined;
    dragParent = undefined;
    dragTarget = undefined;
    dragClone = undefined;
    dragOk = false;
    

}, {"passive":false, "capture":true});

editorFrame.addEventListener('dragover', (e) => {
    if (dragTarget === undefined){return}
    //console.log("Dragging over:", e.target, e);
    //console.log(e.target, e.toElement, e.offsetX, e.offsetY);
    console.log("size", e.target.offsetWidth, e.target.offsetWidth)
    console.log(e.offsetX, e.offsetY)

    let pos = undefined;

    let offset = e.target.getBoundingClientRect();
    //console.log(offset.x, offset.y)
    let offsetX = e.clientX - offset.x;
    let offsetY = e.clientY - offset.y;
    //console.log({offsetX, offsetY})

    if (e.offsetX < e.target.offsetWidth/4){
        pos = "before";
    } else if (e.offsetX > (e.target.offsetWidth*3)/4){
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
    editorFrame.querySelectorAll(".drag-before").forEach(el => {el.classList.remove("drag-before")})
    editorFrame.querySelectorAll(".drag-after").forEach(el => {el.classList.remove("drag-after")})
    editorFrame.querySelectorAll(".drag-into").forEach(el => {el.classList.remove("drag-into")})

    if (e.target == editorFrame ){
        editorFrame.appendChild(dragClone)
        dragOk = true;
    } else if (pos === "before"){
        //console.log("clone before");
        e.target.before(dragClone);
        dragOk = true;
        e.target.classList.add("drag-before");
    } else if (pos === "after") {
        //console.log("clone after");
        e.target.after(dragClone);
        dragOk = true;
        e.target.classList.add("drag-after");
    } else if (pos === "inside") {
        //console.log("clone inside");
        e.target.appendChild(dragClone);
        e.target.classList.classList
        dragOk = true;
        e.target.classList.add("drag-into");
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
    let id = target.attributes.counter.value;

    let menuItem = document.querySelector("#editor-tree").querySelector("#"+id);
    menuItem.classList.add("selected");
    menuItem.scrollIntoView()

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
        //console.log(k, t);
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
        treelement.appendChild(el);
        buildTree(el, t, depth=depth+1);
    })
}



buildTree()
