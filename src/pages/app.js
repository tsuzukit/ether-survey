import _ from 'lodash';
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import SimpleAppBar from '../components/simple_app_bar';
import SurveyTokenHoldings from '../components/survey_token_holding';
import FloatingActionButton from '../components/floating_action_button';
import AlertDialog from '../components/alert_dialog';
import SurveyCard from '../components/survey_card';
import { connect } from 'react-redux';
import { initializeWeb3, getTokenBalance, getSurveyAddresses, getSurveySummary } from '../actions/index';
import { Redirect } from 'react-router';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  grid: {
    marginTop: 20,
  },
  paper: {
    minHeight: 150,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    marginBottom: 16,
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  progress: {
    position: "relative",
    top: 0,
    right: 0,
    margin: "auto",
    left: 0,
  },
});

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      balance: 0,
      account: "",
      alertOpen: false,
      alertBody: "",
      redirect: false,
    }

    this.renderSurveys = this.renderSurveys.bind(this);
  }

  onFloatingActionButtonClick(event) {
    this.setState({redirect: true});
  }

  componentWillMount() {
    if (this.props.web3 == null) {
      this.props.initializeWeb3()
    } else {
      this.props.getTokenBalance(this.props.web3, this.props.accounts);
      this.props.getSurveyAddresses(this.props.web3, (addresses) => {
        this.getSurveySummaries(addresses);
      });
    }
  }

  getSurveySummaries(addresses) {
    for (var i = 0; i < addresses.length; i ++) {
      this.props.getSurveySummary(this.props.web3, addresses[i]);
    }
  }

  renderSurveys(classes) {
    return _.map(this.props.surveys, survey => {
      return (
        <Grid item xs={6} key={survey[0]}>
          <SurveyCard survey={survey} accounts={this.props.accounts} />
        </Grid>
      );
    });
  }

  componentDidUpdate() {

    // state is not changed
    if (this.state.account === this.props.accounts[0]) {
      return
    }

    // if metamask is not logged in
    if (this.props.web3 && this.props.accounts.length <= 0) {
      // show alert
      this.setState({
        alertOpen: true,
        alertBody: "Please install and login to metamask!",
      });
    }

    if (this.props.web3 != null && this.props.accounts.length >= 1) {
      this.props.getTokenBalance(this.props.web3, this.props.accounts);
      this.props.getSurveyAddresses(this.props.web3, (addresses) => {
        this.getSurveySummaries(addresses);
      });
      this.setState({ account: this.props.accounts[0] });
    }

    // update state
    this.setState({ account: this.props.accounts[0] });
  }

  onAlertOk() {
    this.setState({ alertOpen: false });
  }

  render() {

    const { classes } = this.props;

    if (this.state.redirect) {
      return <Redirect push to="/survey/new" />;
    }

    return (
      <div>
        <SimpleAppBar web3={this.props.web3} accounts={this.props.accounts}/>
        <SurveyTokenHoldings balance={this.props.tokenBalance}/>
        <FloatingActionButton onClick={ this.onFloatingActionButtonClick.bind(this) }/>
        <AlertDialog open={this.state.alertOpen} body={this.state.alertBody} onOk={this.onAlertOk.bind(this)}/>

        <Grid container spacing={24} className={classes.grid}>
          {this.renderSurveys(classes) }
        </ Grid>

      </div>

    );
  }
}

function mapStateToProps({ web3Obj, token, factory, surveys }) {
  return { 
    web3: web3Obj.web3, 
    accounts: web3Obj.accounts,
    tokenBalance: token.balance,
    surveyAddresses: factory.surveyAddresses,
    surveys: surveys,
  }
}

export default  connect(mapStateToProps, { 
  initializeWeb3, 
  getTokenBalance, 
  getSurveyAddresses, 
  getSurveySummary 
})(
  withStyles(styles)(App)
);