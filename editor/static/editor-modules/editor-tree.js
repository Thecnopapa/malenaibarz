


export function buildTree(treelement=undefined, tree=undefined, depth=0){
    console.log("Building tree")
    if (treelement === undefined){
        treelement= document.querySelector("#editor-tree");
    }
    if (tree === undefined){
        tree = layout;
    }

    console.log({tree, treelement})
    Object.entries(tree).forEach(k => {
        let t = k[1];
        k = k[0];
        let el = setTreeElement(k);
        el.setAttribute("depth", depth);
        treelement.appendChild(el);
        buildTree(el, t, depth=depth+1);
    })
}


export function modifyTree(movingId, targetId, position){
    
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

function setTreeElement(k){
    //console.log(k, t);
    console.log("Building tree element");
    let el = document.createElement("div");
    el.id = k;
    el.classList="editor-tree-item";
    let title = document.createElement("div");
    title.innerText = "-"+k;
    el.style.marginLeft = "1em";
    el.style.borderLeft = "solid black 1px"
    el.style.cursor = "pointer";
    el.appendChild(title);
    
    el.addEventListener("mouseover", (e) => {
        if (e.target.classList.contains("menu-selected") || e.target.parentElement.classList.contains("menu-selected")){return}; 
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
    el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();

        let t=undefined;if(e.target.id===undefined||e.target.id===""){t=e.target.parentElement}else{t=e.target};
        if (! t.classList.contains("editable")){
            t.classList.add("editable");
            t.firstElementChild.setAttribute("contenteditable", "true")
            t.firstElementChild.focus()
        }

    }, {passive:false});

    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur()
        }
    });

    el.addEventListener("focusout", (e) => {
        let t=undefined;if(e.target.id===undefined||e.target.id===""){t=e.target.parentElement}else{t=e.target};let tId=t.id; let tEl=document.documentElement.querySelector("."+String(tId));
        let newid = t.firstElementChild.innerText.trim()
        if ([...newid][0] === "-"){
            newid = newid.slice(1);
        }
        newid = newid.replace(" ", "_");
        let oldid = t.id;
        
        if (oldid !== newid){
            console.log(oldid, "-->", newid);
            t.id = newid;
            tEl.setAttribute("counter", newid);
            tEl.classList.remove(oldid);
            tEl.classList.add(newid);
            console.log(t);
            storeData("idchange", oldid+ "-->"+ newid )
        }
        t.classList.remove("editable");
        t.firstElementChild.removeAttribute("contenteditable");
        t.firstElementChild.blur();

    });
    return el

}




