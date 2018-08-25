import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import SimpleAppBar from '../components/simple_app_bar';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { Redirect } from 'react-router';
import Paper from '@material-ui/core/Paper';
import { retreiveToken } from '../actions/index'
import AlertDialog from '../components/alert_dialog';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 4,
    marginTop: 10,
  },
  button: {
    margin: 10,
  },
  formControl: {
    marginTop: 10,
    width: "100%",
  },
  textHelp: {
    color: "red",
    marginTop: 5,
    fontSize: 10,
    fontFamily: '"Roboto", "Helvetica", "Arial", "sans-serif"',
  }
});

class SurveyRetrieve extends Component {

  constructor(props) {
    super(props)

    this.state = {
      redirect: false,
      alertOpen: false,
      alertBody: "",
    }

    this.onSubmitError = this.onSubmitError.bind(this)
    this.onSubmitFinished = this.onSubmitFinished.bind(this)
  }

  onSubmitError() {
    this.setState({
      alertOpen: true,
      alertBody: "Failed to execute transaction!",
    });
  }

  onCancel() {
    this.setState({ redirect: true });
  }

  onAlertOk() {
    this.setState({ alertOpen: false });
  }

  onClickRetrieveToken() {
    this.props.retreiveToken(this.props.web3, this.props.accounts, this.props.survey[0], this.onSubmitFinished, this.onSubmitError)
  }

  onSubmitFinished() {
    this.setState({ redirect: true });
  }

  render() {

    if (this.props.survey == null || this.state.redirect) {
      return <Redirect push to="/" />;
    }

    const { classes } = this.props;

    return (
      <div>
        <SimpleAppBar web3={this.props.web3} accounts={this.props.accounts} title={ "Create survey" }/>

        <Paper className={classes.root}>
            <Button
              onClick={this.onClickRetrieveToken.bind(this)}
              type="submit"
              className={classes.button} 
              variant="contained" 
              color="primary">
              Retrieve Token
            </Button>
        </Paper>
            
        <Button 
          className={classes.button} 
          onClick={ this.onCancel.bind(this) }
          variant="contained" 
          color="primary">
          Back
        </Button>

        <AlertDialog open={this.state.alertOpen} body={this.state.alertBody} onOk={this.onAlertOk.bind(this)}/>

      </div>
    );
  }
}

function mapStateToProps({ web3Obj, surveys }, survey) {
  return { 
    web3: web3Obj.web3, 
    accounts: web3Obj.accounts,
    survey: surveys[survey.match.params.id]
  }
}

export default connect(mapStateToProps, { retreiveToken })(withStyles(styles)(SurveyRetrieve))

