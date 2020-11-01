import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';

import { NavLink } from 'react-router-dom'
import { dispatcher, net_request_profile_data, need_signin} from '../actions'

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  userdata: {
    marginLeft: -12,
    paddingRight: 20,
  }
};

class Navigation extends Component {
  constructor(props){
    super(props)
    this.state = {
      logged: false
    }
  }

  componentWillMount() {
    this.setState({logged:!need_signin()});
  }

  componentDidMount() {
    this.dispatch_str = dispatcher.register( dispatch => {
      if (dispatch.type === 'SIGNIN' ) {
        this.setState({ logged:true })
        net_request_profile_data();
      }
      if (dispatch.type === 'SIGNOUT' ) {
        this.setState({ logged:false })
      }
      if (dispatch.type === 'PROFILE_DATA_RECEIVED') {
        const {data, email} = dispatch;
        this.setState({data, email})
      }
    });
    const logged = !need_signin();
    if(!this.state.data && logged){
      net_request_profile_data();
    }
  }

  componentWillUnmount() {
    dispatcher.unregister(this.dispatch_str)
  }

  render() {
    const { logged, /*email,*/ data } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Menu" component={NavLink} to="/">
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              АСОИУ
            </Typography>
                { logged && data &&
                <Typography variant="h6" color="inherit" className={classes.userdata}>
                  {data.first_name + " " + data.last_name}
                </Typography>
                }
                {logged && <Button color="inherit" component={NavLink} to="/signout">Выход</Button>}
                {!logged &&
                  <div>
                  <Button color="inherit" component={NavLink} to="/signin">Вход</Button>
                  <Button color="inherit" component={NavLink} to="/signup">Регистрация</Button>
                  </div>
                }
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

Navigation.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Navigation);