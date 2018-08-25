import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import SimpleAppBar from '../components/simple_app_bar';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import { Redirect } from 'react-router';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { initializeWeb3, createSurvey } from '../actions/index'
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

class SurveyNew extends Component {

  constructor(props) {
    super(props)

    this.state = {
      alertOpen: false,
      alertBody: "",
      redirect: false,
      type1: "",
    }

    this.onSubmitError = this.onSubmitError.bind(this)
    this.onSubmitFinished = this.onSubmitFinished.bind(this)
  }

  componentDidMount() {
    if (this.props.web3 == null) {
      this.props.initializeWeb3()
    }
  }

  renderType(field) {
    const { meta: { touched, error } } = field;
    const className = `form-group ${ touched && error ? "has-danger" : ""}`

    return (
     <div className={className}>

      <FormControl className={field.classes.formControl} error={ touched && error != null }>  
        <InputLabel htmlFor="age-simple">{ field.label}</InputLabel>
        <Select
          { ...field.input }
          inputProps={{
            name: field.name,
            id: field.name,
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={"open_question"}>Open question</MenuItem>
          <MenuItem value={"signle_selection"}>Single selection</MenuItem>
          <MenuItem value={"multiple_selection"}>Multiple Selection</MenuItem>
        </Select>

        <div className={ field.classes.textHelp }>
          { touched ? error : "" }
        </div>

      </ FormControl>

     </div>   
    );
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

  renderSelection(type, name, classes, render) {
    if (type === "signle_selection" || type === "multiple_selection") {
      return <Field label="Selection" name={name} placeholder="Write as comma separated list" classes={classes} component={render}/>
    }
    return 
  }

  onSubmit(values) {
    if (this.props.web3 == null || this.props.accounts.length < 1) {
      this.setState({
        alertOpen: true,
        alertBody: "Please install and login to metamask!",
      });
      return;
    }

    //create questions from values
    const questions = JSON.stringify(values);

    this.props.createSurvey(this.props.web3, this.props.accounts, values.description, values.duration, questions, this.onSubmitFinished, this.onSubmitError)
  }

  onSubmitFinished() {
    this.setState({ redirect: true });
  }

  onSubmitError(err) {
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

  render() {

    if (this.state.redirect) {
      return <Redirect push to="/" />;
    }

    const { classes, handleSubmit } = this.props;

    return (
      <div>
        <SimpleAppBar web3={this.props.web3} accounts={this.props.accounts} title={ "Create survey" }/>

        <form onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
          
          <Paper className={classes.root}>

            <Typography variant="headline" component="h2">
              Create 3 questions survey
            </Typography>
            <Field label="Survey Description" name="description" classes={classes} component={this.renderTextField}/>
            <Field label="Duration in minutes" name="duration" classes={classes} component={this.renderTextField}/>

            <Paper className={classes.root}>
              <Typography variant="subheading">
                Question 1
              </Typography>
              <Field label="Type" name="type1" classes={classes} component={this.renderType}/>
              <Field label="Question" name="title1" classes={classes} component={this.renderTextField}/>
              { this.renderSelection(this.props.type1Value, "selection1", classes, this.renderTextField) }
            </ Paper>
            <Paper className={classes.root}>
              <Typography variant="subheading">
                Question 2
              </Typography>
              <Field label="Type" name="type2" classes={classes} component={this.renderType}/>
              <Field label="Question" name="title2" classes={classes} component={this.renderTextField}/>
              { this.renderSelection(this.props.type2Value, "selection2", classes, this.renderTextField) }
            </ Paper>
            <Paper className={classes.root}>
              <Typography variant="subheading">
                Question 3
              </Typography>
              <Field label="Type" name="type3" classes={classes} component={this.renderType}/>
              <Field label="Question" name="title3" classes={classes} component={this.renderTextField}/>
              { this.renderSelection(this.props.type3Value, "selection3", classes, this.renderTextField) }
            </ Paper>

          </ Paper>

          <Button
            type="submit"
            className={classes.button} 
            variant="contained" 
            color="primary">
            Submit
          </Button>
          <Button 
            className={classes.button} 
            onClick={ this.onCancel.bind(this) }
            variant="contained" 
            color="primary">
            Cancel
          </Button>
        </form>

        <AlertDialog open={this.state.alertOpen} body={this.state.alertBody} onOk={this.onAlertOk.bind(this)}/>

      </div>

    );
  }
}

function validate(values) {
  const errors = {};

  if (!values.description) {
    errors.description = "Enter a description";
  }

  if (!values.duration) {
    errors.duration = "Enter a duration in minutes";
  } else {
    if (isNaN(values.duration)) {
      errors.duration = "Please enter number";
    }
  }

  if (!values.type1) {
    errors.type1 = "Enter a type";
  }
  if (!values.title1) {
    errors.title1 = "Enter a title";
  }
  if (values.type1 && 
    (values.type1 === "signle_selection" || 
    values.type1 === "multiple_selection")) {
    if (!values.selection1) {
      errors.selection1 = "Enter a selection. Write as comma seperated list";
    }
  }

  if (!values.type2) {
    errors.type2 = "Enter a type";
  }
  if (!values.title2) {
    errors.title2 = "Enter a title";
  }
  if (values.type2 && 
    (values.type2 === "signle_selection" || 
    values.type2 === "multiple_selection")) {
    if (!values.selection2) {
      errors.selection2 = "Enter a selection. Write as comma seperated list";
    }
  }

  if (!values.type3) {
    errors.type3 = "Enter a type";
  }
  if (!values.title3) {
    errors.title3 = "Enter a title";
  }
  if (values.type3 && 
    (values.type3 === "signle_selection" || 
    values.type3 === "multiple_selection")) {
    if (!values.selection3) {
      errors.selection3 = "Enter a selection. Write as comma seperated list";
    }
  }

  if (!values.type4) {
    errors.type4 = "Enter a type";
  }
  if (!values.title4) {
    errors.title4 = "Enter a title";
  }
  if (values.type4 && 
    (values.type4 === "signle_selection" || 
    values.type4 === "multiple_selection")) {
    if (!values.selection4) {
      errors.selection4 = "Enter a selection. Write as comma seperated list";
    }
  }

  if (!values.type5) {
    errors.type5 = "Enter a type";
  }
  if (!values.title5) {
    errors.title5 = "Enter a title";
  }
  if (values.type5 && 
    (values.type5 === "signle_selection" || 
    values.type5 === "multiple_selection")) {
    if (!values.selection5) {
      errors.selection5 = "Enter a selection. Write as comma seperated list";
    }
  }

  return errors;
}

const selector = formValueSelector('SurveyNewForm');

function mapStateToProps({ web3Obj }) {
  return { 
    web3: web3Obj.web3, 
    accounts: web3Obj.accounts,
  }
}

export default reduxForm({
  validate,
  form: 'SurveyNewForm',
})(
  connect(
    state => ({
      type1Value: selector(state, 'type1'),
      type2Value: selector(state, 'type2'),
      type3Value: selector(state, 'type3'),
      type4Value: selector(state, 'type4'),
      type5Value: selector(state, 'type5'),
    })
  )(
    connect(mapStateToProps, { initializeWeb3, createSurvey })(withStyles(styles)(SurveyNew))
  )
);

