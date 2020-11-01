import { Dispatcher } from 'flux'
import axios from 'axios';
// import moment from 'moment'

export const address = 'http://127.0.0.1:3535/api';
export const dispatcher = new Dispatcher();

var _jwt_token = undefined;
const get_jwt = () => {
  if (!_jwt_token)
      _jwt_token = window.localStorage.getItem('jwt_token')
    return _jwt_token
}

const set_jwt = (token) => {
  if(token === undefined)
    return
  _jwt_token = token
  window.localStorage.setItem('jwt_token', token)
  dispatcher.dispatch({
    type: 'SIGNIN',
    token
  })
};

const set_profile = (data, email) => {
  dispatcher.dispatch({
    type: 'PROFILE_DATA_RECEIVED',
    data, email
  })
}

const set_av_offers_data = (data) => {
  dispatcher.dispatch({
    type: 'AV_OFFERS_DATA_RECEIVED',
    data
  })
}

const set_orders_data = (data) => {
  dispatcher.dispatch({
    type: 'ORDERS_DATA_RECEIVED',
    data
  })
}

export const show_error = (msg) => {
  dispatcher.dispatch({
    type: 'SHOW_ERROR',
    msg
  })
}

export const need_signin = () => {
  return !get_jwt();
}


export const signout = () => {
  window.localStorage.removeItem('jwt_token');
  _jwt_token = undefined;
  dispatcher.dispatch({
    type: 'SIGNOUT'
  })
};

let req_progress = false;
export const net_signup = (email, password, data) => {
  if(req_progress)
    return;

  req_progress = true;
  axios.post(`${address}/register.json`, {email, password, data}).then(res => {
    set_jwt(res.data['access_token'])
    req_progress = false;
  }).catch(err => {
    show_error(err)
    set_jwt(undefined)
    req_progress = false;
  });
}

export const net_signin = (email, password) => {
  if(req_progress)
    return;

  req_progress = true;
  axios.post(`${address}/login.json`, {email, password}).then(res => {
    set_jwt(res.data['access_token'])
    req_progress = false;
  }).catch(err => {
    show_error(err)
    set_jwt(undefined)
    req_progress = false;
  });
}

export const net_make_offer = (offer_id) => {
  const token = get_jwt();
  if(!token || req_progress) return;
  req_progress = true;

  var config = {
    headers: {'Authorization': `Bearer ${token}`}
  };

  axios.post(`${address}/orders.json`, {offer_id}, config).then(({data}) => {
    if(data.error)
      show_error(data.error)
    net_request_av_offers()
    req_progress = false;
  }).catch(err => {
    set_av_offers_data(undefined)
    show_error(err)
    req_progress = false;
  });
}

export const net_request_profile_data = () => {
  const token = get_jwt();
  if(!token) return;

  var config = {
    headers: {'Authorization': `Bearer ${token}`}
  };

  axios.get(`${address}/profile.json`, config).then(res => {
    const {data, email} = res.data;
    set_profile(data, email)
  }).catch(err => {
    show_error(err)
    set_profile(undefined, undefined)
  });
}

export const net_request_av_offers = () => {
  const token = get_jwt();

  var config = token ? {
    headers: {'Authorization': `Bearer ${token}`}
  } : undefined;

  axios.get(`${address}/offers.json`, config).then(res => {
    set_av_offers_data(res.data)
  }).catch(err => {
    show_error(err)
    set_av_offers_data(undefined)
  });
}

export const net_request_orders_data = () => {
  const token = get_jwt();

  var config = token ? {
    headers: {'Authorization': `Bearer ${token}`}
  } : undefined;

  axios.get(`${address}/orders.json`, config).then(res => {
    set_orders_data(res.data)
  }).catch(err => {
    show_error(err)
    set_orders_data(undefined)
  });
}

// export const net_request_orders_data = () => {setTimeout(set_orders_data, 1000)}
// var count = 0;
// const set_orders_data = () => { 
// const data = [
//   {
//     id: 12312,
//     number: 1,
//     date_start: moment("20180707", "YYYYMMDD").utc().format(),
//     date_end: moment("20181007", "YYYYMMDD").utc().format(),
//     name: "Кредит",
//     status: "processing",
//     active_step: count++,
//     action_required: count % 2 === 1,
//     steps: [{
//       name: "Проверка заявки",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     },
//     {
//       name: "Экспертиза",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     },
//     {
//       name: "Принятие документов",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: "Необходимо прикрепить документы. Обратитесь к знающему специалисту в нашей компании. На этом все."
//     },
//     {
//       name: "Использование код",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     },
//     {
//       name: "Выдача продукта",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     }]
//   },
//   {
//     id: 1231212,
//     number: 2,
//     date_start: moment("20191007", "YYYYMMDD").utc().format(),
//     date_end: moment("20181007", "YYYYMMDD").utc().format(),
//     name: "Гарантии",
//     status: "completed",
//     steps: [{
//       name: "Проверка заявки",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     },
//     {
//       name: "Экспертиза",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     },
//     {
//       name: "Принятие документов",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     },
//     {
//       name: "Использование код",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     },
//     {
//       name: "Выдача продукта",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     }]
//   },
//   {
//     id: 20042,
//     number: 3,
//     date_start: moment("20181009", "YYYYMMDD").utc().format(),
//     date_end: moment("20181009", "YYYYMMDD").utc().format(),
//     name: "Гарантии 2",
//     status: "rejected",
//     active_step: 1,
//     steps: [{
//       name: "Проверка заявки",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     },
//     {
//       name: "Экспертиза",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: 'Не пройдена'
//     },
//     {
//       name: "Принятие документов",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     },
//     {
//       name: "Использование код",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     },
//     {
//       name: "Выдача продукта",
//       date_start: moment("20180707", "YYYYMMDD").utc().format(),
//       description: null
//     }]
//   }
// ]
//   dispatcher.dispatch({
//     type: 'ORDERS_DATA_RECEIVED',
//     data
//   })
// }

// const set_av_offers_data = () => { 
// const data = need_signin() ? [{id:12321, duration: moment.duration({seconds:30}), name: "Проверки2" }] : [
//   {
//     id: 12312,
//     available: false,
//     ordered: true,
//     duration: moment.duration({
//       seconds: 2,
//       minutes: 2,
//       hours: 2,
//       days: 2,
//       weeks: 2,
//       months: 2,
//       years: 2
//     }),
//     name: "Проверки",
//     description_url: undefined
//   },
//   {
//     id: 53252,
//     available: false,
//     na_description: "Ваша кредитная история не позволяет получить эту услугу",
//     duration: moment.duration({
//       seconds: 2,
//       minutes: 2,
//       hours: 1,
//     }),
//     name: "Банковский кредит",
//     description_url: "https://ru.wikipedia.org/wiki/Банковский_кредит"
//   },
//   {
//     id: 23131,
//     available: true,
//     duration: moment.duration({
//       days: 4,
//     }),
//     name: "Гарантии",
//     description_url: undefined
//   }
// ]
//   dispatcher.dispatch({
//     type: 'AV_OFFERS_DATA_RECEIVED',
//     data
//   })
// }