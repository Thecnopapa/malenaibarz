

let editorFrame = document.querySelector("#editor-frame")
console.log(editorFrame)


editorFrame.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log('Right-click detected!');
  showContext(e);
}, {"passive":false, "capture":true});

function showContext(event){
  selectClosestElement(event);

}


function selectClosestElement(event){
  console.log(event.target)
  target = event.target;
  prevTarget = document.querySelectorAll(".selected").forEach(e => {
    e.classList.remove("selected");
  });
  target.classList.add("selected");
  let id = target.attributes.counter.value;

  let menuItem = document.querySelector("#editor-tree").querySelector("#"+id);
  menuItem.classList.add("selected");


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
     t = k[1]
     k = k[0]
     console.log(k, t);
     el = document.createElement("div")
     el.id = k
     el.classList="editor-tree-item"
     title = document.createElement("p")
     title.innerText = k
     el.style.paddingLeft = "1em"
     el.appendChild(title)
     treelement.appendChild(el)
     buildTree(el, t, depth=depth+1)
   })
}


buildTree()