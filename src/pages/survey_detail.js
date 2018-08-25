import _ from 'lodash'
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import SimpleAppBar from '../components/simple_app_bar';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import Button from '@material-ui/core/Button';
import { Redirect } from 'react-router';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { chargeToken, getSurveySummary, retreiveToken, getRespondent, getAnswer } from '../actions/index'
import { isFuture, convertTime } from '../utils/timeutil';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AlertDialog from '../components/alert_dialog';
import CircularProgress from '@material-ui/core/CircularProgress';

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
  },
  progress: {
    color: "white",
    marginLeft: 10,
  }
});

class SurveyDetail extends Component {

  constructor(props) {
    super(props)

    this.state = {
      redirect: false,
      alertOpen: false,
      alertBody: "",
      answers: {},
      loadingAnswer: false,
    }

    this.renderAnswers = this.renderAnswers.bind(this);
    this.renderCharge = this.renderCharge.bind(this);
    this.onSubmitError = this.onSubmitError.bind(this)
    this.onSubmitFinished = this.onSubmitFinished.bind(this)
  }

  renderTextField(field) {
    const { meta: { touched, error } } = field;
    const className = `form-group ${ touched && error ? "has-danger" : ""}`

    return (
     <div className={className}>

      <FormControl className={field.classes.formControl}>  
        <TextField
          placeholder={field.placeholder}
          error={ touched && error != null }
          { ...field.input }
          inputProps={{
            name: field.name,
            id: field.name,
          }}
          label={field.label}
          className={field.classes.textField}
        />
        <div className={ field.classes.textHelp }>
          { touched ? error : "" }
        </div>

      </ FormControl>

     </div>   
    );
  }

  onSubmit(values) {
    if (this.props.web3 == null || this.props.accounts.length < 1) {
      this.setState({
        alertOpen: true,
        alertBody: "Please install and login to metamask!",
      });
      return;
    }

    this.props.chargeToken(this.props.web3, this.props.accounts, this.props.survey[0], values["charge"], this.onSubmitFinished, this.onSubmitError)
  }

  onSubmitFinished() {
    this.props.getSurveySummary(this.props.web3, this.props.survey[0]);
    this.setState({ redirect: true });
  }

  onSubmitError() {
    this.setState({
      alertOpen: true,
      alertBody: "Failed to execute transaction!",
    });
  }

  onShowAnswer() {
    this.setState({ loadingAnswer: true });
    this.props.getRespondent(this.props.web3, this.props.survey[0], (respondent) => {
      for (var i = 0; i < respondent.length; i++) {
        let r = respondent[i]
        this.props.getAnswer(this.props.web3, this.props.survey[0], r, (a) => {
          let newAnswers = { ...this.state.answers }
          newAnswers[r] = a
          this.setState({
            answers: newAnswers,
          })
          this.setState({ loadingAnswer: false });
        }, (e) => {
          this.setState({
            alertOpen: true,
            alertBody: "Could not get answer",
          });
          this.setState({ loadingAnswer: false });
        })
      }
    }, (err) => {
      this.setState({
        alertOpen: true,
        alertBody: "Failed to get respondent",
      });
      this.setState({ loadingAnswer: false });
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

  renderCharge() {

    const { classes, handleSubmit, survey } = this.props;

    const closedAt = parseInt(survey[6], 10)
    if (!isFuture(closedAt)) {

      return (
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
      );

    } 

    return (
      <Paper className={classes.root}>
        <form onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
          <Typography variant="headline" component="h2">
            Charge ERC20 token for reward
          </Typography>

          <Field label="Charge ERC20 token for reward" name="charge" classes={classes} component={this.renderTextField}/>

          <Button
            type="submit"
            className={classes.button} 
            variant="contained" 
            color="primary">
            Submit
          </Button>
        </form>
      </Paper>
    );

  }

  renderAnswers() {

    if (Object.keys(this.state.answers).length === 0) {
      return
    }

    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Respondent</TableCell>
              <TableCell>Answer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {_.map(this.state.answers, (value, key) => {
            return(
              <TableRow key={key}>
                <TableCell>{ key }</TableCell>
                <TableCell>{ value }</TableCell>
              </TableRow>
            );
          })}
          </TableBody>
        </Table>
      </Paper>
    );

  }

  render() {

    if (this.props.survey == null || this.state.redirect) {
      return <Redirect push to="/" />;
    }

    const { classes, survey } = this.props;

    const contractAddress = survey[0]
    const description = survey[1]
    const questions = survey[2]
    const ownerAddress = survey[5]
    const tokensLeft = parseInt(survey[4], 10)
    const numberOfRespondent = parseInt(survey[3], 10)
    const closedAt = parseInt(survey[6], 10)

    return (
      <div>
        <SimpleAppBar web3={this.props.web3} accounts={this.props.accounts} title={ "Create survey" }/>

        { this.renderCharge() }

        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Content</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{"Contract address"}</TableCell>
                <TableCell>{ contractAddress }</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>{"Description"}</TableCell>
                <TableCell>{ description }</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>{"Questions"}</TableCell>
                <TableCell>{ questions }</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>{"Number of respondent"}</TableCell>
                <TableCell>{ numberOfRespondent }</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>{"Token reward"}</TableCell>
                <TableCell>{ tokensLeft }</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>{"Owner address"}</TableCell>
                <TableCell>{ ownerAddress }</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>{"Survey closed at"}</TableCell>
                <TableCell>{ convertTime(closedAt) }</TableCell>
              </TableRow>

            </TableBody>
          </Table>
        </Paper>

        { this.renderAnswers() }
            
        <Button 
          className={classes.button} 
          onClick={ this.onShowAnswer.bind(this) }
          variant="contained" 
          color="primary">
          Show Answers
          <CircularProgress className={classes.progress} size={20} style={ {display: this.state.loadingAnswer ? '' : 'none' } } />
        </Button>
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

function validate(values) {
  const errors = {};

  if (!values.charge) {
    errors.charge = "enter a charge";
  } else {
    if (isNaN(values.charge)) {
      errors.charge = "enter a number";
    }
  }

  return errors;
}

function mapStateToProps({ web3Obj, surveys, answers }, survey) {
  return { 
    web3: web3Obj.web3, 
    accounts: web3Obj.accounts,
    survey: surveys[survey.match.params.id],
    answers: answers
  }
}

export default reduxForm({
  validate,
  form: 'surveyCharge',
})(
  connect(mapStateToProps, { chargeToken, getSurveySummary, retreiveToken, getRespondent, getAnswer })(withStyles(styles)(SurveyDetail))
);

