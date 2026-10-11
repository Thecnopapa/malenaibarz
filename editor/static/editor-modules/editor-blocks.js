let buildBlockContainer = document.querySelector("#editor-build-blocks");

import {buildBlockDragStart} from "./editor-frame.js"

export function setupBuildBlocks(){
    console.log("Build blocks:")
    Object.entries(buildBlocks).forEach(b => {
        console.log(b);
        let el = document.createElement("div");
        el.classList.add("editor-build-block");
        el.innerText = b[0];
        el.setAttribute("blockid", b[0]);
        el.style.cursor = "pointer";
        el.setAttribute("draggable", "true");
        el.addEventListener("dragstart", buildBlockDragStart);
        buildBlockContainer.appendChild(el);
    });
}



export function renderBuildBlock(blockId, counter){
    console.log("Rendering build block")
    console.log({blockId});
    let blockData = buildBlocks[blockId];
    console.log({blockData});
    let wrapper = document.createElement("div");
    wrapper.innerHTML = blockData["html"];
    let element = wrapper.firstElementChild;
    element.setAttribute("counter", counter)
    element.classList.add(counter)
    wrapper.before(element);
    wrapper.remove()
    return element
}   