import React, { Component } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import './App.css';
import { List, AutoSizer } from "react-virtualized"
import 'semantic-ui-css/semantic.min.css';
import { Header } from 'semantic-ui-react'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      username: '',
      chats: [],
      users: [],
    };
  }

  componentDidMount() {
    const username = window.prompt('Enter username: ', 'newUser');
    this.setState({ username });
    const pusher = new Pusher('854ddae294ca2e053cf6', {
      cluster: 'ap2',
      authEndpoint: 'http://localhost:5000/pusher/auth',
      encrypted: true,
      auth: {
            params: {
              username: username
            }
        }
    });

    const channel = pusher.subscribe('chat');
    const pchannel = pusher.subscribe('presence-info');
    const uChannel = pusher.subscribe('onlineUsers');

    uChannel.bind('change', data => {
        var allUsers = [];
        for(var i=0;i<data.length;i++){
            var onlineUser = pchannel.members.get(data[i].id).info.name;
            if(onlineUser === this.state.username) onlineUser += ' (you)';
            allUsers.push(onlineUser)
        }            
        this.setState({ users: allUsers });
        console.log("webhook");
        console.log(this.state.users);
    });

    channel.bind('message', data => {
      this.setState({ chats: [...this.state.chats, data], test: '' });
      console.log("message sent");
    });
    this.handleTextChange = this.handleTextChange.bind(this);
  }

  handleTextChange(e) {
    if (e.keyCode === 13) {
      const payload = {
        username: this.state.username,
        message: this.state.text
      };
      console.log("post by axios");
      axios.post( 'http://localhost:5000/message', payload);
    } else {
      this.setState({ text: e.target.value });
    }
  }

  renderRow =  ({ index, isScrolling, key, style} ) => {
    return (
      <div key={key} style={style} >
            <div className="ui message" style= {{width:"70%", float: this.state.chats[index].username === this.state.username ? "right" : "left"}}>
              <div className="ui top right attached label">
                {this.state.chats[index].username}
               </div>
              <p>
              {this.state.chats[index].message}
              </p>
            </div>
      </div>
    )
  }

  renderRowUser = ({ index, isScrolling, key, style} ) => {
    return (
      <div key={key} style={style} >
        <i className="user icon"></i>  <div>{this.state.users[index]}</div>
      </div>
    )
  }
  
  renderChatBox = ({ index, isScrolling, key, style} ) => {
    return (
      <div key={key} style={{marginTop:"20px"}} >
        <input
            type="text"
            value={this.text}
            placeholder="Type a message"
            className="form-control"
            onChange={this.handleTextChange}
            onKeyDown={this.handleTextChange}
          />
          <h4 style={{marginTop:"10px"}}>Hello, {this.state.username}</h4>
      </div>
    )
  }


  render() {
    return (
      <div className="App" >
        <div className="cont">
          <div className="Online column">
            <Header style={{color:'#095899'}}>Online Users</Header>
                <AutoSizer style={{marginTop:'20px'}}>
                  {
                    ({ width, height }) =>{
                      return (
                      < List
                        rowCount = {this.state.users.length}
                        scrollToIndex= {500}
                        width = {width}
                        height = {500}
                        rowHeight = {50}
                        rowRenderer = {this.renderRowUser}
                        />
                      )
                    }
                  }
                </AutoSizer>
          </div>

          <div className="Chat column">
           <Header style={{color:'#323e49', fontFamily:'verdana'}}> <i className="comment icon"></i> Chat </Header>
           <AutoSizer style={{marginTop:'20px'}}>
                  {
                    ({ width, height }) =>{
                      return (
                        <div>
                          < List
                          rowCount = {this.state.chats.length}
                          scrollToIndex= {500}
                          width = {width}
                          height = {500}
                          rowHeight = {100}
                          rowRenderer = {this.renderRow}
                          />
                          <List
                            rowCount = {1}
                            width = {width}
                            height = {100}
                            rowHeight = {100}
                            rowRenderer = {this.renderChatBox}
                          />
                        </div>
                      )
                    }
                  }
            </AutoSizer>
              
          </div>
        </div>
      </div>
    );
  }
}

export default App;
