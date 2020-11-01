import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { NavLink } from 'react-router-dom'

import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import {need_signin} from '../actions'

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 100,
    textAlign: "center"
  },
  control: {
    padding: theme.spacing.unit * 2,
  },
  icon: {
    width: 100,
    height: 100,
    display: "block",
    marginLeft: "auto",
    marginRight: "auto"
  }
});

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      logged: !need_signin()
    }
  }
  render() {
    const { classes } = this.props;
    const { logged } = this.state;
    return (
      <Grid container className={classes.root} spacing={16}>
        <Grid item xs={12}>
          <Grid container className={classes.demo} justify="center" spacing={16}>
             <Grid key={0} item xs={3}>
                <Card>
                  <CardContent>
                    <AddShoppingCartIcon className={classes.icon}/>
                    <Typography variant="headline" component="h2">
                      {logged ? 'Новая заявка' : 'Список услуг'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" fullWidth component={NavLink} to="/newOffer">
                      {logged ? 'Добавить' : 'Посмотреть'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              {logged && <Grid key={1} item xs={3}>
                <Card>
                  <CardContent>
                    <AccountBalanceIcon className={classes.icon}/>
                    <Typography variant="headline" component="h2">
                      Мои заявки
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" fullWidth component={NavLink} to="/orders">
                      Посмотреть
                    </Button>
                  </CardActions>
                </Card>
              </Grid>}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
