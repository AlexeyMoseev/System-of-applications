import React, { Component } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Router from './Router'
import {dispatcher, signout, address} from './actions'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      error_box:{msg:'', open:false}
    }
  }

 componentDidMount() {
    this.dispatch_str = dispatcher.register( dispatch => {
      if(dispatch.type === 'SHOW_ERROR') {
        const msgs = {
          401: 'Не удалось войти. Проверьте почтовый адрес и пароль.',
          409: 'Пользователь с таким почтовым адресом уже зарегистрирован',
          404: 'Данные недоступны'
        }
        const err = dispatch.msg;
        const err_msg = typeof(err) === 'string' ?
          err :
          (err.response ? (msgs[err.response.status] || JSON.stringify(err.response)) : `Не удалось отправить запрос. Проверьте, доступен ли ${address}`);
          this.setState( {error_box: {msg: err_msg, open:true}})
      }
    });
  }

  componentWillUnmount() {
    dispatcher.unregister(this.dispatch_str)
  }
  
  render() {
    return (
      <div>
        <Router signout={signout}/>
        <Snackbar
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            open={this.state.error_box.open}
            onClose={ () => { this.setState( {error_box: {msg:'', open:false}} ) } }
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{this.state.error_box.msg}</span>}
        />
      </div>
    );
  }
};

export default App;
