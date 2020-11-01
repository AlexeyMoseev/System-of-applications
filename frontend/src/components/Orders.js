import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import RefreshIcon from '@material-ui/icons/Refresh';
import WarningIcon from '@material-ui/icons/Warning';
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';
import CachedIcon from '@material-ui/icons/Cached';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepConnector from '@material-ui/core/StepConnector';
import LinearProgress from '@material-ui/core/LinearProgress';

import Tooltip from '@material-ui/core/Tooltip';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Redirect } from 'react-router-dom';
import { dispatcher, need_signin, net_request_orders_data, show_error } from '../actions'

import moment from 'moment' 
import 'moment/locale/ru';
moment.locale('ru')
moment.updateLocale(moment.locale(), { invalidDate: "" })

const status_msg = (order) => {
    const msgs = {
    'processing': `Прогноз: ${moment(order.date_end).format('L')}`,
    'completed': `Завершено ${moment(order.date_end).format('L')}`,
    'rejected': 'Отклонено'}
    return order.status ? msgs[order.status] : 'Неизвестно'
}

 const filter_data =
    [ {name:'В процессе', value: 'processing'},
      {name: 'Требуется действие', value: 'warning'},
      {name: 'Завершено', value: 'completed'},
      {name: 'Отклонено', value: 'rejected'}];

const styles = theme => ({
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
    alignItems: 'center',
  },
  fabProgress: {
    position: 'absolute',
     top: 5,
    left: 5,
    zIndex: 1,
  },
  linearBarColorYellow: {
    backgroundColor: '#FFD700',
  },
  linearColorPrimary: {
    backgroundColor: '#DCDCDC',
  },
  linearBarColorGreen: {
    backgroundColor: '#228B22',
  },
  root: {
    flexGrow: 1,
  },
  minibar: {
    maxWidth: 200,
    flexGrow: 1,
    marginTop: 5
  },
  fullWidth: {
    width: '100%',
  },
  panelHeading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
    flexBasis: '25%',
    flexShrink: 0,
  },
   backButton: {
    marginRight: theme.spacing.unit,
  },
  instructions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  preicon: {
    marginRight: 20
  },
  connectorActive: {
    '& $connectorLine': {
      borderColor: '#FFD700'
    },
  },
  connectorCompleted: {
    '& $connectorLine': {
      borderColor: '#228B22',
    },
  },
  connectorDisabled: {
    '& $connectorLine': {
      borderColor: theme.palette.grey[100],
    },
  },
  connectorLine: {
    transition: theme.transitions.create('border-color'),
  },
});

const renderOrders = (classes, orders, filter) => {
  const includeWarning = filter.includes('warning')
  const fdata = filter.length === 0 ? orders : orders.filter(o => ((!o.action_required || o.status !== 'processing') && filter.includes(o.status)) || (includeWarning && o.action_required))

  const connector = (<StepConnector classes={
    {active: classes.connectorActive, completed: classes.connectorCompleted, disabled: classes.connectorDisabled, line: classes.connectorLine}
  }/>);

    return (<div>
    {fdata.map(order =>
      {
        const stepCount = order.steps.length;
        const astep = order.active_step !== undefined ? order.active_step : stepCount;

        const error = order.status === 'rejected';
        const warning = order.action_required;

        const icons = {
          'processing': (<CachedIcon className={classes.preicon}/>),
          'completed': (<CheckIcon style={{color: 'green'}} className={classes.preicon}/>),
          'rejected': (<ClearIcon style={{color: 'red'}} className={classes.preicon}/>),
          'warning': (<WarningIcon style={{color: '#FFD700'}} className={classes.preicon}/>)
        }

        const stt = ((order.status === 'processing' && order.action_required) || !order.status) ? 'warning' : order.status;

        let prevStep = undefined;

        return (
        <ExpansionPanel key={order.id}>
          {/*Панель в свернутом состоянии*/}
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Tooltip title={filter_data.find(e => e.value === stt).name}>{icons[stt]}</Tooltip>
            <Typography className={classes.panelHeading}>{`Заявка ${order.number}`}</Typography>
            <Typography className={classes.panelHeading}>{moment(order.date_start).format('L')}</Typography>
            <Typography className={classes.panelHeading}>{order.name}</Typography>
            {order.status === 'processing' ?
            <div className={classes.panelHeading} style={{flexShrink:1}}>
              <Typography style={{ color: '#777'}}>{status_msg(order)}</Typography>
              <LinearProgress className={classes.minibar} classes={{
                colorPrimary: classes.linearColorPrimary,
                barColorPrimary: warning ? classes.linearBarColorYellow : classes.linearBarColorGreen,
              }} variant="determinate" value={Math.round(astep * 100 / stepCount)} />
            </div>
            : 
            <Typography className={classes.panelHeading}>{status_msg(order)}</Typography>
          }
          </ExpansionPanelSummary>
          {/*Панель в развернутом состоянии*/}
          <ExpansionPanelDetails>
            {/*Stepper*/}
              <Stepper className={classes.fullWidth} activeStep={astep} alternativeLabel connector={connector}>
                {order.steps.map((step, idx) => {
                  const labelProps = {};
                  if(warning && idx === astep)
                    labelProps.icon=(<WarningIcon style={{color: '#FFD700'}}/>)
                  if(error && idx === astep)
                    labelProps.icon=(<ClearIcon style={{color: 'red'}}/>)

                  const date = moment(step.date_start).format(`${idx <= astep ? 'Начато' : 'Начнется'} L в LT`) + (prevStep && prevStep.date_start && step.date_start ?
                    ` (+${ moment.duration(moment(step.date_start).diff(prevStep.date_start)).humanize() })` : '')
                  prevStep = step;

                  const lab = (<StepLabel {...labelProps}>
                    <Typography color="inherit" variant={idx === astep ? 'h6' : 'subtitle1'}>{step.name}</Typography>
                    <Typography color="inherit">{date}</Typography>
                    </StepLabel>)
                  return (
                  <Step key={idx}>
                    {step.description ? (<Tooltip title={step.description}>{lab}</Tooltip>) : lab}
                  </Step>
                )})}
              </Stepper>
          </ExpansionPanelDetails>
        </ExpansionPanel>)
      }
    )}
    </div>)
  }

let cachedData = undefined;

class Orders extends Component {

  constructor(props){
    super(props)

    this.state = {
      logged: false,
      refreshing: false,
      data: cachedData,
      shouldRefreshData: true,
      filter:[]
    }

  }

  componentWillMount() {
    this.setState({logged:!need_signin()});
  }

  refresh_data() {
    this.setState({refreshing:true})
    net_request_orders_data()
  }

  componentDidMount() {
    this.dispatch_str = dispatcher.register( dispatch => {
      if ( dispatch.type === 'SIGNIN' ) {
        this.setState({logged:true })
      }
      if ( dispatch.type === 'SIGNOUT' ) {
        this.setState({ logged:false })
      }
      if ( dispatch.type === 'ORDERS_DATA_RECEIVED' ) {
        cachedData = dispatch.data
        this.setState({ data:dispatch.data, refreshing:false, shouldRefreshData:false})
      }
    });

    if(this.state.logged) {
      if(this.state.shouldRefreshData)
        this.refresh_data()
    } else {
      show_error("Войдите, чтобы посмотреть свои заявки");
    }
  }

  componentWillUnmount() {
    dispatcher.unregister(this.dispatch_str)
  }

  render() {
    if(!this.state.logged)
      return (<Redirect to="/signin"/>)

    const { classes } = this.props;
    const { data, refreshing, filter } = this.state;

    return (
      <div>
        {/*Header*/}
        <div className={classes.root}>
          <AppBar position="static" color="default" style={{marginTop:20}}>
            <Toolbar>
              <Typography variant="h6" color="inherit">
                Мои заявки
              </Typography>
              <div className={classes.wrapper}>
                <IconButton color="inherit" aria-label="Menu" onClick={() => this.refresh_data()} disabled={refreshing}>
                  <RefreshIcon />
                </IconButton>
                {refreshing && <CircularProgress size={40} className={classes.fabProgress} />}
              </div>
              {/*input={<Input id="select-multiple-checkbox" />}*/}
                {/*MenuProps={MenuProps}*/}
             <FormControl style = {{ minWidth: 120}}>
              <InputLabel htmlFor="select-multiple-checkbox">Фильтр</InputLabel>
              <Select
                multiple
                value={this.state.filter}
                onChange={event => this.setState({filter: event.target.value })}
                renderValue={selected => filter_data.filter(el => selected.includes(el.value)).map(el => el.name).join(',')}
              >
                {filter_data.map(label => (
                  <MenuItem key={label.value} value={label.value}>
                    <Checkbox checked={this.state.filter.indexOf(label.value) > -1} />
                    <ListItemText primary={label.name} />
                  </MenuItem>
                ))}
              </Select>
              </FormControl>
            </Toolbar>
          </AppBar>
          <AppBar position="static" color="inherit" style={{marginTop:20}}>
            <Toolbar>
              <div style={{marginRight:40}}/>
              <Typography className={classes.panelHeading} style={{ color: '#777'}}>Номер заявки</Typography>
              <Typography className={classes.panelHeading} style={{ color: '#777'}}>Дата подачи</Typography>
              <Typography className={classes.panelHeading} style={{ color: '#777'}}>Тип заявки</Typography>
              <Typography className={classes.panelHeading} style={{ color: '#777'}}>Статус</Typography>
            </Toolbar>
          </AppBar>
        </div>
        {/*Panel*/}
        <div className={classes.fullWidth}>
          {data ?
            renderOrders(classes, data, filter)
            : 
            (<CircularProgress style={{position:"fixed", top: "50%", left: "50%"}} />)
          }
      </div>
    </div>
    );
  }
}

Orders.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Orders);