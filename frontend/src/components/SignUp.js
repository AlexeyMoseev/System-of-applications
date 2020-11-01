import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { withRouter, Redirect } from 'react-router-dom';
import { dispatcher, net_signup, need_signin, show_error } from '../actions'

class SignUp extends Component {
  
  //Конструктор формы
  constructor(props) {
    super(props)

    this.state = {
      logged: false,
      data: {
        email: '',
        password: '',
        //Подтверждение пароля
        password2: '',
        //Всякие другие данные пользователя
        first_name:'',
        last_name:'',
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
    const { email, password, password2, first_name, last_name } = this.state.data;

    if(password !== password2) {
      show_error('Пароли не совпадают');
      return;
    }
    net_signup(email, password, JSON.stringify({first_name, last_name}));
  }

  render() {
    if(this.state.logged)
      return (<Redirect to="/"/>)

    const { data } = this.state;
    const pass_eq = data.password === data.password2;    
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
                  Регистрация
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
                  label="Придумайте пароль"
                  type="password"
                  autoComplete="current-password"
                  margin="normal"
                  value={data.password}
                  onChange={this.handleChange('password')}
                />
                <TextField
                  required
                  error={!pass_eq}
                  fullWidth
                  id="password2"
                  label={"Подтверждение пароля" + (pass_eq ? '' : ' (пароли не совпадают)')}
                  type="password"
                  autoComplete="current-password"
                  margin="normal"
                  value={data.password2}
                  onChange={this.handleChange('password2')}
                />
                <TextField
                  required
                  id="first_name"
                  label="Имя"
                  margin="normal"
                  value={data.first_name}
                  onChange={this.handleChange('first_name')}
                />
                <TextField  style={{
                    marginLeft: 50,
                    
                  }}
                  required
                  id="last_name"
                  label="Фамилия"
                  margin="normal"
                  value={data.last_name}
                  onChange={this.handleChange('last_name')}
                />
              </CardContent>
              <CardActions>
                <Button fullWidth type='submit' variant='contained' size="small" color="primary">
                  Регистрация
                </Button>
              </CardActions>
            </form>
          </Card>
        </div>
      </div>
    );
  }
}

export default withRouter(SignUp);
