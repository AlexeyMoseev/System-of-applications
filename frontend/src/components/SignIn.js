import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { withRouter, Redirect } from 'react-router-dom';
import { dispatcher, net_signin, need_signin } from '../actions'

class SignIn extends Component {
  
  //Конструктор формы
  constructor(props) {
    super(props)

    this.state = {
      logged: false,
      data: {
        email: '',
        password: '',
      }
    }
  }

  componentWillMount() {
    this.setState({logged:!need_signin()});
  }

 componentDidMount() {
    this.dispatch_str = dispatcher.register( dispatch => {
      if ( dispatch.type === 'SIGNIN' ) {
        this.setState({ logged:true })
      }
      if ( dispatch.type === 'SIGNOUT' ) {
        this.setState({ logged:false })
      }
    });
  }

  componentWillUnmount() {
    dispatcher.unregister(this.dispatch_str)
  }

  //Обработка ввода в текстовые поля
  handleChange = (type) => (e) => {
    this.setState({
      data: {
        ...this.state.data,
        [type]: e.target.value
      }
    })
  }

  //По нажатию отправки
  handleSend(e) {
    if (e) { e.preventDefault(); }
    const { email, password } = this.state.data;
    net_signin(email, password);
  }

  render() {
    if(this.state.logged)
      return (<Redirect to="/"/>)

    const { data } = this.state;
    return (
      <div style={{
        display: 'flex',
        flex: 1,
        height: '100%'
      }}>
        <div style={{
          display: 'flex',
          flex: 1,
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>
          <Card style={{
            marginTop: 40,
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 20,
            paddingTop: 20,
            maxWidth: 500
          }}>
            <form onSubmit={(e) => this.handleSend(e)}>
              <CardContent style={{ minHeight: 92 }}>
                <Typography variant="headline" component="h2">
                  Вход
              </Typography>
                <TextField
                  fullWidth
                  required
                  id="email"
                  label="Адрес эл. почты"
                  type="email"
                  margin="normal"
                  value={data.email}
                  onChange={this.handleChange('email')}
                />
                <TextField
                  required
                  fullWidth
                  id="password"
                  label="Пароль"
                  type="password"
                  autoComplete="current-password"
                  margin="normal"
                  value={data.password}
                  onChange={this.handleChange('password')}
                />
              </CardContent>
              <CardActions>
                <Button fullWidth type='submit' variant='contained' size="small" color="primary">
                  Вход
                </Button>
              </CardActions>
            </form>
          </Card>
        </div>
      </div>
    );
  }
}

export default withRouter(SignIn);
