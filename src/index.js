import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import reducers from './reducers';
import promise from 'redux-promise';
import App from './pages/app'
import SurveyNew from './pages/survey_new';
import SurveyDetail from './pages/survey_detail';
import SurveyRetrieve from './pages/survey_retrieve';
import SurveyAnswer from './pages/survey_answer';

const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>

    <BrowserRouter>
      <div>
        <Switch>
          <Route path="/survey/new" component={SurveyNew} />
          <Route path="/survey/detail/:id" component={SurveyDetail} />
          <Route path="/survey/retreive/:id" component={SurveyRetrieve} />
          <Route path="/survey/:id" component={SurveyAnswer} />
          <Route path="/" component={App} />
        </Switch>
      </div>
    </BrowserRouter>

  </Provider>
  , document.getElementById('root')
);
