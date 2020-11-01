import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import CircularProgress from '@material-ui/core/CircularProgress';

import { dispatcher, need_signin, net_request_av_offers, net_make_offer, show_error } from '../actions'

import moment from 'moment' 
import 'moment/locale/ru';
moment.locale('ru')

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 100,
    textAlign: "center"
  },
  control: {
    padding: theme.spacing.unit * 2,
  },
  card: {
    width: 300,
  }
});

let cachedData = undefined;
let cachedLogged = false;

class AvailableOffers extends React.Component {

  constructor(props){
    super(props)

    const logged = !need_signin();

    this.state = {
      logged,
      refreshing: false,
      sending: false,
      data: logged === cachedLogged ? cachedData : undefined,
      shouldRefreshData: true,
    }
  }

  refresh_data() {
    this.setState({refreshing:true})
    net_request_av_offers()
  }

  componentDidMount() {
    this.dispatch_str = dispatcher.register( dispatch => {
      if ( dispatch.type === 'SIGNIN' ) {
        this.setState({logged:true })
      }
      if ( dispatch.type === 'SIGNOUT' ) {
        this.setState({ logged:false })
      }
      if ( dispatch.type === 'AV_OFFERS_DATA_RECEIVED' ) {
        cachedData = dispatch.data;
        this.setState({ data:dispatch.data, refreshing:false, sending:false, shouldRefreshData:false })
      }
    });

    if(!this.state.logged)
      show_error('Вы должны войти в систему, чтобы получить услуги');

    if(this.state.shouldRefreshData)
      this.refresh_data()
  }

  componentWillUnmount() {
    dispatcher.unregister(this.dispatch_str)
    cachedLogged = this.state.logged;
  }

  handleSubmit(e) {
    if (e)
      e.preventDefault();

    this.setState({sending:true});
    const { id } = e.target;
    net_make_offer(id);
  }

  render() {
    const { logged, data, refreshing, sending } = this.state;
    const { classes } = this.props;

    if(!data)
      return refreshing ? <CircularProgress style={{position:"fixed", top: "50%", left: "50%"}}/> : <div/>

    return (
      <Grid container className={classes.root} spacing={16}>
        <Grid item xs={12}>
          <Grid container className={classes.demo} justify="center" spacing={16}>
            {data.map(offer =>
              <Grid key={offer.id} item>
                <form id={offer.id} onSubmit={(e) => this.handleSubmit(e)}>
                  <Card className={classes.card}>
                    <CardContent>
                      <Typography variant="headline" component="h2">
                        {offer.name}
                      </Typography>
                      <Typography component="p">
                        {`Среднее время получения услуги: ${offer.duration ? moment.duration(offer.duration, "seconds").humanize() : 'неизвестно'}`}
                      </Typography>
                      {logged && offer.available === false && offer.na_description && <Typography style={{color: "red"}}>
                        {`Недоступно: ${offer.na_description}`}
                      </Typography>}
                      {logged && offer.ordered && <Typography style={{color: "green"}}>Заказано</Typography>}
                    </CardContent>
                    <CardActions>
                      {logged && offer.available !== false && <Button type='submit' size="small" color="primary" disabled={sending} fullWidth>
                        Заказать
                      </Button>}
                      {offer.description_url && <Button size="small" color="primary" fullWidth href={offer.description_url} target="_blank">
                        Об услуге
                      </Button>}
                    </CardActions>
                  </Card>
                </form>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

AvailableOffers.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AvailableOffers);
