import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Navigation from "./components/Navigation";
import Home from "./components/Home";
// import SignIn from "./components/SignIn"
// import SignUp from "./components/SignUp"
import SignUp from "./components/SignUp"
import SignIn from "./components/SignIn"
import NotFound from "./components/NotFound"
import Orders from "./components/Orders"
import AvailableOffers from "./components/AvailableOffers"

class Router extends Component{
  render(){    
    return(
      <BrowserRouter>
        <div style={{minWidth: '500px'}}>
          {/*Шапка сайта*/}
          <Navigation/>
          <Switch>
            <Route path="/" component={Home} exact />
            <Route path="/newOffer" component={AvailableOffers}/>
            <Route path="/orders" component={Orders}/>
            <Route path="/signup" component={SignUp}/>
            <Route path="/signin" component={SignIn}/>
            <Route path="/signout" component={() => {
              this.props.signout()
              return <Redirect to="/"/>
            }}/>
            {/*<Route path="/about" component={About} />*/}
            {/*<Route path="/contact" component={Contact} />*/}
            <Route component={NotFound}/>
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

export default Router;