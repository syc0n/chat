/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';
import React from 'react';
import Room from './Room.jsx';
import config from '../../config';
import ChatStore from '../stores/ChatStore';






var TabHeader = React.createClass({
    render: function() {
        return (
          <li className={"tabHeader " + this.props.className} 
                onClick={this.props.onClick}>
              {this.props.header}
          </li>
      );
    }
});

var TabContent = React.createClass({
    render: function() {
        return (
          <div className={"tabContent " + this.props.className}> 
              <Room roomName={this.props.content}/>
          </div>
      );
    }
});

var Tabs = React.createClass({
    
    getInitialState: function(){
        return {
            selectedTabNo : this.props.initialSelected ? this.props.initialSelected : 0
        }
    },
    
    getHeaderClass : function(i){
        return this.state.selectedTabNo == i ? "selected" : "";
    },
    
    getContentClass : function(i){
        return this.state.selectedTabNo == i ? "selected" : "hidden";
    },
    
    handleClick: function(i,e){
        this.setState({selectedTabNo:i});
        e.preventDefault();
    },

    render: function() {
    
      var headers = [];
      var i = 0;
      console.log(this.props);
      this.props.tabs.forEach(function(room){
          headers.push(<TabHeader header={ room } 
                             key={"tab"+i}
                             onClick = {this.handleClick.bind(this,i)}
                             className = {this.getHeaderClass(i)} />);
          i++;
      }.bind(this));
      
      var contents = [];
      i=0;
       this.props.tabs.forEach(function(room){
          contents.push(<TabContent content={ room } 
                                    key={"content"+i}
                                    className = {this.getContentClass(i)} />);
          i++;
      }.bind(this));
      
      
      return (
          <div className="tabsContainer">
              <ul className="tabHeadings">
                {headers}
              </ul>
              {contents}
          </div>    
      );
    }
});







const Chatbox = React.createClass({
  displayName: 'chatbox',
  rooms: [],

  getInitialState: function() {
  

    return {
      userId: ''
    };
  },

  render: function() {
  ChatStore.rooms.forEach((room) => {
        this.rooms.push(room.roomName);
      });
    return (
      <div className='row'>
        <div className='col s2'>
          <h4>Friends</h4>
        </div>
        <div className='col s10'>
        <Tabs initialSelected={1} 
        tabs = {this.rooms} />
        </div>
      </div>
    );
  }
});

export default Chatbox;
