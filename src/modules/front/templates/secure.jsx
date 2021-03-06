// @flow

import React, { Component } from 'react';
import { Route, NavLink } from 'react-router-dom';
{{# material-ui }}
import Button from '@material-ui/core/Button';
{{/ material-ui }}

import HomeComponent from 'components/home';
import ProfileComponent from 'components/profile';
import AboutComponent from 'components/about';

type Props = {
  history: Object
};

type State = {};

export default class SecureComponent extends Component<Props, State> {

  logout () {
    Reflect.deleteProperty(localStorage, 'token');
    this.props.history.push('/login');
  }

  render () {
    return (
      <div>
        <nav>
          <NavLink to="/secure/home" activeClassName="active">Home</NavLink>
          <NavLink to="/secure/profile" activeClassName="active">Profile</NavLink>
          <NavLink to="/secure/about" activeClassName="active">About</NavLink>
        </nav>
        {{# material-ui }}
        <Button
          variant="contained"
          onClick={this.logout.bind(this)}
          className="home-button"
        >
          Logout
        </Button>
        {{/ material-ui }}
        {{^ material-ui }}
        <button onClick={ this.logout.bind(this) }>Logout</button>
        {{/ material-ui }}
        <Route path="/secure/home" component={ HomeComponent } />
        <Route path="/secure/profile" component={ ProfileComponent } />
        <Route path="/secure/about" component={ AboutComponent } />
      </div>
    );
  }
}
