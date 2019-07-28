import React, { Component } from "react";
import Modal from "./components/Modal";
import axios from "axios";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import {
  DragDropContext,
  Droppable,
  Draggable
} from "react-beautiful-dnd";


class App extends Component {
  constructor(props) {
    super(props);
    this.tag_toggle = this.tag_toggle.bind(this);
    this.unique = this.unique.bind(this);
    this.state = {
      viewCompleted: false,
      activeItem: {
        title: "",
        description: "",
        completed: false,
        queryFilter: ""
      },
      todoList: [],
      dropdownOpen: false,
      titles: [],
    };
  }
  componentDidMount() {
    {this.refreshList();}
  }
  setOrder = (data) => {
    const _todoList = data;
    for (let index = 0; index < _todoList.length; index++) {
      _todoList[index]['order'] = index+1;
    }
    this.setState({todoList: _todoList})
  }
  refreshList = () => {
    axios
      .get("http://localhost:8000/api/todos/")
      .then(res => {
          this.setOrder(res.data)
          this.setState({titles: res.data})
       })
      .catch(err => console.log(err));
  };
  displayCompleted = status => {
    if (status) {
      return this.setState({ viewCompleted: true });
    }
    return this.setState({ viewCompleted: false });
  };
  renderTabList = () => {
    return (
      <div className="mt-5 mb-4 tab-list">
        <span
          onClick={() => this.displayCompleted(true)}
          className={this.state.viewCompleted ? "active" : ""}
        >
          complete
        </span>
        <span
          onClick={() => this.displayCompleted(false)}
          className={this.state.viewCompleted ? "" : "active"}
        >
          Incomplete
        </span>
      </div>
    );
  };
  renderItems = () => {
    const { viewCompleted } = this.state;
    const newItems = this.state.todoList.filter(
      item => item.completed === viewCompleted
    );
    return (<DragDropContext
        onDragEnd={result => {
          const { source, destination, draggableId } = result;
          if (!destination) {
            return;
          }
          let arr = Array.from(this.state.todoList);
          const [remove] = arr.splice(source.index+1, 1);
          arr.splice(destination.index+1, 0, remove);
          this.setState({
            todoList: arr
          });
        }}
      >
        <Droppable droppableId="d">
          {provided => (
            <ul className="list-group list-group-flush todoContent" ref={provided.innerRef} {...provided.droppableProps}>
              {newItems.map((t, i) => (
                <Draggable draggableId={t.id} index={i}>
                  {p => (
                    <li
                       ref={p.innerRef}
                       {...p.draggableProps}
                       {...p.dragHandleProps}
                       key={t.id}
                       className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span
                        className={`todo-title mr-2 ${
                          this.state.viewCompleted ? "completed-todo" : ""
                        }`}
                        title={t.description}
                      >
                        {t.title}: {t.description}
                      </span>
                      <span>
                        <button
                          onClick={() => this.editItem(t)}
                          className="btn btn-secondary mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => this.handleDelete(t)}
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </span>
                    </li>
                  )}
                </Draggable>
              ))}
            </ul>
          )}
        </Droppable>
      </DragDropContext>)
    return newItems.map(item => (
      <li
        key={item.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <span
          className={`todo-title mr-2 ${
            this.state.viewCompleted ? "completed-todo" : ""
          }`}
          title={item.description}
        >
          {item.title}: {item.description}
        </span>
        <span>
          <button
            onClick={() => this.editItem(item)}
            className="btn btn-secondary mr-2"
          >
            Edit
          </button>
          <button
            onClick={() => this.handleDelete(item)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </span>
      </li>
    ));
  };

  tag_toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  unique = (arr) => {
    let _arr = []
    if(!arr){
      return _arr
    } else {
      for(var i=0; i<arr.length; i++){
        var title = arr[i].title
        _arr.push(title)
      }
      return Array.from(new Set(_arr))
    }
  };

  renderTags = () => {
    const { viewCompleted } = this.state;
    const newItems = this.state.titles.filter(
      item => item.completed === viewCompleted
    );
    const unique_title = this.unique(newItems)
    return unique_title.map((item, index) => (
      <DropdownItem key={index} onClick={() => this.filterTags(item)}>{item}</DropdownItem>
    ));
  }

  filterTags = item => {
    if(!item){
        this.refreshList();
    } else {
      axios
        .get(`http://localhost:8000/api/todos/filter_todo/?todo=${item}`)
        .then(res => this.setOrder( res.data ))
        .catch(err => console.log(err));
    }
  };

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  };
  handleSubmit = item => {
    this.toggle();
    if (item.id) {
      axios
        .put(`http://localhost:8000/api/todos/${item.id}/`, item)
        .then(res => this.refreshList());
      return;
    }
    axios
      .post("http://localhost:8000/api/todos/", item)
      .then(res => this.refreshList());
  };
  handleDelete = item => {
    axios
      .delete(`http://localhost:8000/api/todos/${item.id}`)
      .then(res => this.refreshList());
  };
  createItem = () => {
    const item = { title: "", description: "", completed: false };
    this.setState({ activeItem: item, modal: !this.state.modal });
  };
  editItem = item => {
    this.setState({ activeItem: item, modal: !this.state.modal });
  };
  render() {
    return (
      <main className="content">
        <h1 className="text-white text-uppercase text-center my-4">Chester's Todo List</h1>
        <div className="row ">
          <div className="col-md-6 col-sm-10 mx-auto p-0">
            <div className="card p-3">
              <div className="row">
                <button onClick={this.createItem} className="btn btn-primary ml-3">
                  Add task
                </button>
                <Dropdown isOpen={this.state.dropdownOpen} toggle={this.tag_toggle} className="ml-2">
                  <DropdownToggle caret style={{backgroundColor: "#65d400"}}>
                    TitleFilter
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => this.filterTags()}>All works</DropdownItem>
                    {this.renderTags()}
                  </DropdownMenu>
                </Dropdown>
              </div>
              {this.renderTabList()}
              <div style={{height: "15em", overflow: "scroll"}}>
              {this.renderItems()}
              </div>
            </div>
          </div>
        </div>
        {this.state.modal ? (
          <Modal
            activeItem={this.state.activeItem}
            toggle={this.toggle}
            onSave={this.handleSubmit}
          />
        ) : null}
      </main>
    );
  }
}
export default App;
