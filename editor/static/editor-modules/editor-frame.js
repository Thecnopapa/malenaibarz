export let editorFrame = document.querySelector("#editor-frame");
export let editorRoot = document.querySelector("#editor-root");
let newIds = 1;

import {renderBuildBlock} from "./editor-blocks.js";
import {modifyTree} from "./editor-tree.js";
import {Change} from "./editor-session.js";
import {session} from "../editor.js";

export let currentlySelected = undefined;
let contextMenu = undefined;

let dragPosition = undefined;
let dragInto = undefined;
let dragTarget = undefined;
let dragClone = undefined;
let dragPrevEl = undefined;
let dragPrevPos = undefined;
let dragOk = false;

export let textEditPrev = undefined;


export function escapeAll(){
    editorFrame.click();
}

export function selectClosestElement(event){

    let target = event.target;
    if (target.classList.contains("context-menu") || (contextMenu && contextMenu.contains(target))){
        console.log("Clicked context menu");
        return false
    }
    if (contextMenu && ! contextMenu.contains(target)){
        console.log("Clicked outside context menu");
        document.querySelectorAll(".context-menu").forEach(el => {el.remove()});
        contextMenu = undefined;
        return false
    }
    if (target !== currentlySelected){
        document.querySelectorAll(".selected").forEach(e => {
            e.classList.remove("selected");
            e.removeAttribute("draggable");
            e.removeAttribute("contenteditable");
            e.removeEventListener("focusout", editText);
            
        });
        document.querySelectorAll(".menu-selected").forEach(e => {
            e.classList.remove("menu-selected");
        });
    }
    
    if (editorFrame == target){
        console.log("Unselecting all...");
        currentlySelected = undefined
        return false
    }

    console.log("Selecting element...");
    console.log(event.target);

    target.classList.add("selected");
    if (target !== editorRoot){
        target.setAttribute("draggable", "true");
    }
    let id = target.getAttribute("counter");

    let menuItem = document.querySelector("#editor-tree").querySelector("#"+id);
    menuItem.classList.add("menu-selected");
    menuItem.scrollIntoView();
    //console.log(target.tagName.toLowerCase());
    if (target.tagName.toLowerCase() === "p" && target === currentlySelected){
        target.setAttribute("contenteditable", "true");
        target.focus();
        if (textEditPrev === undefined) {
            textEditPrev = target.innerText;
        }
        console.log("adding event listener");
        target.addEventListener("focusout", editText);
    }
    currentlySelected = target
    return target
}

function editText(e){
    console.log(e.target);
    console.log(e.target.innerText !== textEditPrev, e.target.innerText, textEditPrev);
    if (e.target.innerText !== textEditPrev){
        session.addChange(new Change(session, "text", e.target.getAttribute("counter"), textEditPrev, e.target.innerText))
        textEditPrev = undefined;
    }
    
}

editorFrame.addEventListener("mouseleave", () => {
    return
    document.querySelectorAll(".context-menu").forEach(el => {el.remove()});
    contextMenu = undefined;
}, {"passive": false});


editorFrame.addEventListener('click', (e) => {
    if (selectClosestElement(e)){
        e.preventDefault();
        e.stopPropagation();
    }
}, {"passive":false, "capture":true});

editorFrame.addEventListener('contextmenu', (e) => {
    console.log("Showing context menu...")
    e.preventDefault();
    e.stopPropagation();
    showEditorContext(e);
}, {"passive":false, "capture":true});

function showEditorContext(event){
    if (selectClosestElement(event)){
        console.log(event.target);
        console.log("Opening editor menu");
        let menu = new ContextMenu(event, editorFrame);
        menu.render();
    }
}


class ContextButton {
    constructor(menu, actionName="action", actionText="actionName", icon=undefined){
        this.menu = menu;
        this.target = this.menu.target;
        this.actionName = actionName;
        this.actionText = actionText;
        this.icon = icon;
        this.setDefaults()
    }
    setDefaults(){

    }

    build(){
        let el = document.createElement("div");
        el.classList.add("context-menu-button")
        el.classList.add(this.actionName);
        el.addEventListener("click", this.runAction);
        if (this.icon === undefined){
            el.innerText = this.actionText;
        } else {
            el.style.backround = `url(${icon})`
        }
        return el
    }
    runAction(){
        console.log("Button action not configured!")
    }
}

class BoldButton extends ContextButton {
    setDefaults(){
        this.actionName = "bold";
        this.actionText = "Bold"
    }
    runAction(){
        console.log(currentlySelected)
        if (currentlySelected.style.fontWeight === "bold"){
            currentlySelected.style.fontWeight = "";
        } else {
            currentlySelected.style.fontWeight = "bold";
        }
    }
}
class DeleteButton extends ContextButton {
    setDefaults(){
        this.actionName = "delete";
        this.actionText = "Delete"
    }
    runAction(){
        console.log(currentlySelected)
        removeElement(currentlySelected)
    }
}

function removeElement(element){
    session.addChange(new Change(session, "remove", element.getAttribute("counter")))
}
class ContextMenu {
    constructor(event, parent){
        if (parent === undefined){
            parent = document.documentElement;
        }
        this.parent = parent
        console.log(event);
        this.target = event.target;
        this.tag = this.target.tagName.toLowerCase();
        this.el = document.createElement("div");
        this.el.id = "context-menu";
        this.el.classList.add("context-menu");
        this.el.classList.add("editor-context-menu");
        this.el.style.top = event.layerY;
        this.el.style.left = event.layerX;
        
    }

    addButton(button){
        console.log("Adding button");
        this.el.appendChild(button.build()) ;
    }

    addButtons(){
        if (this.target !== editorRoot){
            this.addButton(new DeleteButton(this));
        }
        
        if (this.tag === "p"){
            this.addButton(new BoldButton(this));
            this.addButton(new ContextButton(this, "test", "Test Action"));
        }
    }

    render(){
        document.querySelectorAll(".context-menu").forEach(el => {el.remove()});
        this.addButtons()
        this.parent.appendChild(this.el);
        this.target.blur();
        this.el.focus();
        contextMenu = this.el
        
    }

}

function buildEditorContext(event, parent=undefined){
    

    



    parent.appendChild(menuEl);
    return menuEl

}





export function buildBlockDragStart(e){
    console.log(e);
    //let wrapper = document.createElement("div");
    //wrapper.innerHTML = b[1].html;
    //dragClone = wrapper.firstElementChild;
    dragClone = renderBuildBlock(e.target.getAttribute("blockid"), undefined);
    dragPrevPos = "outside";
    dragPrevEl = e.target;
    //wrapper.before(dragClone);
    //wrapper.remove();
    dragClone.classList.add("drag-clone");
    e.target.classList.add("dragged");
}

editorFrame.addEventListener('dragstart', (e) => {
    console.log("Dragging:", e.target)
    e.stopPropagation();
    let target = e.target;

    let clone = target.cloneNode(true);
    dragClone = clone;
    dragTarget = target;
    //console.log("prev el", target.nextElementSibling);
    if (target.nextElementSibling === null){
        dragPrevEl = target.parentElement;
        dragPrevPos = "inside";
    } else {
        dragPrevEl = target.nextElementSibling;
        dragPrevPos = "before";
    }
    //console.log({dragPrevEl, dragPrevPos})
    

    clone.classList.add("drag-clone");
    target.classList.add("dragged");

    
}, {"passive":false, "capture":true});


document.documentElement.addEventListener('dragend', (e) => {
    console.log("Drag End OK=", dragOk);
    let dry = true;
    if (dragClone === undefined){return}
    if (dragOk){
        if (dragTarget !== undefined && dragPrevPos !== "outside"){
            dragTarget.remove();
        } else {
            let prefix = "new"
            if (dragPrevPos === "outside"){
                prefix = dragPrevEl.getAttribute("blockid");
            }
            let counter = prefix + String(newIds);
            console.log("Setting counter to:", counter);
            dragClone.setAttribute("counter", counter);
            dragClone.classList.add(counter);
            newIds +=1;
        }
        console.log({dragClone, dragInto, dragPosition});
        console.log(dragClone.getAttribute("counter"), dragInto.getAttribute("counter"));
        let dragPrevCounter = undefined;
        if (dragPrevEl !== undefined){
            dragPrevCounter = dragPrevEl.getAttribute("counter");
        } 
        if (dragPrevPos === "outside"){
            dragPrevCounter = dragPrevEl.getAttribute("blockid");
        }
        console.log({dragPrevCounter})

        session.addChange([session, "move", dragClone.getAttribute("counter"), dragPrevCounter, dragInto.getAttribute("counter"), {"new_pos":dragPosition, "prev_pos":dragPrevPos}], dry)
        modifyTree(dragClone.getAttribute("counter"), dragInto.getAttribute("counter"), dragPosition);
    } else{
        dragClone.remove()
    }
    document.documentElement.querySelectorAll(".dragged").forEach(el => {el.classList.remove("dragged")});
    document.documentElement.querySelectorAll(".drag-clone").forEach(el => {el.classList.remove("drag-clone")});
    document.documentElement.querySelectorAll(".drag-before").forEach(el => {el.classList.remove("drag-before")});
    document.documentElement.querySelectorAll(".drag-after").forEach(el => {el.classList.remove("drag-after")});
    document.documentElement.querySelectorAll(".drag-into").forEach(el => {el.classList.remove("drag-into")});
    

    dragPosition = undefined;
    dragInto = undefined;
    dragTarget = undefined;
    dragClone = undefined;
    dragPrevEl = undefined;
    dragPrevPos = undefined;
    dragOk = false;
    

}, {"passive":false, "capture":true});

editorFrame.addEventListener('dragover', (e) => {
    if (dragClone === undefined){return}
    console.log("dragging...")
    //console.log("Dragging over:", e.target, e);
    //console.log(e.target, e.toElement, e.offsetX, e.offsetY);
    //console.log("size", e.target.offsetWidth, e.target.offsetWidth)
    //console.log(e.offsetX, e.offsetY)

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


    if (e.target == dragTarget || e.target == undefined) {
        dragClone.remove();
        dragOk = false;
        return 
    } else if (dragTarget!== undefined && dragTarget.contains(e.target)){
        dragClone.remove();
        dragOk = false;
        return 
    } else if (e.target == dragClone){
        dragOk = true;
        return
    } 

    let target = e.target;

    while ([null, undefined, ""].includes(target.getAttribute("counter"))){
        if (target == editorFrame){break}
        target = target.parentElement
    }
    document.documentElement.querySelectorAll(".drag-before").forEach(el => {el.classList.remove("drag-before")})
    document.documentElement.querySelectorAll(".drag-after").forEach(el => {el.classList.remove("drag-after")})
    document.documentElement.querySelectorAll(".drag-into").forEach(el => {el.classList.remove("drag-into")})
    try{
        if (e.target == editorFrame ){
            editorFrame.appendChild(dragClone)
            dragPosition = "inside";
            dragInto = editorRoot;
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
    } catch {
        dragOk = false
    }



}, {"passive":false, "capture":true});



