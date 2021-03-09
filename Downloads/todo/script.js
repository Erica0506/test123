const classNames = {
  TODO_ITEM: 'todo-container',
  TODO_CHECKBOX: 'todo-checkbox',
  TODO_TEXT: 'todo-text',
  TODO_DELETE: 'todo-delete',
}

const list = document.getElementById('todo-list')
const itemCountSpan = document.getElementById('item-count')
const uncheckedCountSpan = document.getElementById('unchecked-count')

function newTodo() {

  let userInput = prompt('Please add your to-do item', '')
  // console.log(userInput);

  if (userInput === "") {
    alert("You must write something!");
  } else if (userInput == null){
    alert("You cancelled the new input");
  }else{
    // Create li
    var li = document.createElement("LI");
    li.className = classNames.TODO_ITEM;
    //Create check box and append it to li
    var checkbox = document.createElement("INPUT");
    checkbox.setAttribute("type", "checkbox");
    checkbox.className = classNames.TODO_CHECKBOX;
    li.appendChild(checkbox);
    // Creat the text part and append it to li 
    var span1 = document.createElement("SPAN")
    span1.className = classNames.TODO_TEXT;
    toDoItem = document.createTextNode(userInput);
    span1.appendChild(toDoItem);
    li.appendChild(span1);
    // Create close button and append it to li
    var closebtn = document.createElement("INPUT");
    closebtn.setAttribute("type", "button");
    closebtn.setAttribute("value", "\u00D7");
    closebtn.className = classNames.TODO_DELETE;
    li.appendChild(closebtn);
    // Append li to list
    list.appendChild(li);
    //increase the item count and unchecked count
    itemCountSpan.innerHTML++;
    uncheckedCountSpan.innerHTML++;
  }

  // document.getElementById('item-count').innerHTML = document.getElementById('todo-list').children.length
}

// add event listener on checkbox and close button
list.addEventListener('click', function(ev) {
  //when click in the checkbox
  if (ev.target.className === 'todo-checkbox') {
    uncheckedItemCount()
  }
  //when click on the close button
  if (ev.target.className === 'todo-delete'){
    list.removeChild(ev.target.parentNode)
    itemCountSpan.innerHTML--;
    uncheckedItemCount()
  }

});

// unchecked item count function
function uncheckedItemCount(){
  uncheckedCountSpan.innerHTML = 0;
  var checkBoxList = document.getElementsByClassName('todo-checkbox')
  for (let j=0; j<checkBoxList.length; j++) {
    if (checkBoxList[j].checked == false) {uncheckedCountSpan.innerHTML++; };
  }
}





