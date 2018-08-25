import _ from 'lodash'
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import SimpleAppBar from '../components/simple_app_bar'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import Button from '@material-ui/core/Button'
import { Redirect } from 'react-router'
import Paper from '@material-ui/core/Paper'
import FormControl from '@material-ui/core/FormControl'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import AlertDialog from '../components/alert_dialog'
import { answerSurvey, getSurveySummary } from '../actions/index'

const styles = theme => ({
  root: {
    margin: 10,
  },
  tytle: {
    padding: 10,
  },
  question_wrap: {
    margin: 40,
  },
  button: {
    margin: 10,
  },
  submit_btn: {
    margin: 40,
  },
  form_wrap: {
    position: 'relative',
    marginTop: '10px',
    marginBottom: '10px',
  },
  label: {
    color: '#000',
    opacity: 0.54,
  },
  label_helper: {
    color: '#000',
    opacity: 0.54,
    'font-size': '0.75rem',
  },
  cell_inactive: {
    '-o-transition': 'all 0.1s ease-out',
    '-moz-transition': 'all 0.1s ease-out',
    '-webkit-transition': 'all 0.1s ease-out',
    'transition': 'all 0.1s ease-out'
  },
  cell_active: {
    position: 'relative',
    height: '100%',
    transform: 'scale(0.99)',
    overflow: 'hidden',
    '-o-transition': 'all 0.1s ease-out',
    '-moz-transition': 'all 0.1s ease-out',
    '-webkit-transition': 'all 0.1s ease-out',
    'transition': 'all 0.1s ease-out'
  },
  cell_label: {
    background: 'rgba(73, 100, 130, 0.05)',
    border: 'solid 1px rgba(73, 100, 130, 0.8)',
    'border-radius': '5px',
    '-o-transition': 'all 0.2s ease-out',
    '-moz-transition': 'all 0.2s ease-out',
    '-webkit-transition': 'all 0.2s ease-out',
    'transition': 'all 0.2s ease-out'
  },
  cell_label_active: {
    background: 'rgba(73, 100, 130, 0.2)',
    border: 'solid 1px rgba(73, 100, 130, 0.8)',
    'border-radius': '5px',
    '-o-transition': 'all 0.2s ease-out',
    '-moz-transition': 'all 0.2s ease-out',
    '-webkit-transition': 'all 0.2s ease-out',
    'transition': 'all 0.2s ease-out'
  },
  wrap: {
    'margin-left': '0',
    'margin-right': '0',
  },
  wrap_title: {
    'color': '#434e5b',
    'font-size': '0.85em',
    'text-align': 'left',
    'padding-left': '2.8em',
    'line-height': '1.3em',
    'white-space': 'inherit',
  },
  label_title: {
    color: 'rgba(0,0,0,0.6)',
    position: 'relative',
    'font-weight': 'bold',
    'font-size': '1.1em',
    'margin-bottom': '1.2em',
    'display': 'block',
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

class SurveyAnswer extends Component {

  constructor(props) {
    super(props)

    this.state = {
      alertOpen: false,
      alertBody: "",
      selected: {},
      redirect: false,
    };

    this.onSubmitFinished = this.onSubmitFinished.bind(this)
    this.onSubmitError = this.onSubmitError.bind(this)
    this.onClickSelect = this.onClickSelect.bind(this)
    this.renderQuestions = this.renderQuestions.bind(this)
  }

  onCancel() {
    this.setState({ redirect: true });
  }

  onSubmit(values) {
    for (var i=0; i < this.questions.length; i++) {
      const question = this.questions[i];
      if (question.type === "open_question") {
        continue;
      }
      if (this.state.selected[question.title] == null || this.state.selected[question.title].length === 0) {
        this.setState({
          alertOpen: true,
          alertBody: "Please select answer!",
        });
        return;
      }
    }

    let answers = this.state.selected
    for (var j=0; j < this.questions.length; j++) {
      const question = this.questions[j];
      if (question.type === "open_question") {
        answers[question.title] = values[parseInt(question.index, 10)]
      }
    }

    this.props.answerSurvey(
      this.props.web3, 
      this.props.accounts, 
      this.props.survey[0], 
      JSON.stringify(answers),
      this.onSubmitFinished, 
      this.onSubmitError
    )
  }

  onSubmitFinished() {
    this.props.getSurveySummary(this.props.web3, this.props.survey[0]);
    this.setState({ redirect: true });
  }

  onSubmitError(err) {
    this.setState({
      alertOpen: true,
      alertBody: "Failed to execute transaction!",
    });
  }

  onClickSelect(question, candidate, candidateIndex, type) {
    const questionTitle = question.title
    const answer = question.index + '-' + candidateIndex + ': ' + candidate

    let selected = this.state.selected;

    if (type === 'signle_selection') {
      for (var key in selected) {
        if (key === questionTitle) {
          selected[key] = [];
        }
      }
    }

    if (selected[questionTitle] == null) {
      selected[questionTitle] = [];
    }

    if (selected[questionTitle].indexOf(answer) >= 0) {
      selected[questionTitle].some((v, i) => {
        if (v === answer) selected[questionTitle].splice(i,1);    
      });
    } else {
      selected[questionTitle].push(answer);
    }

    this.setState({
      selected: selected,
    })

  }
  
  onAlertOk() {
    this.setState({ alertOpen: false });
  }

  renderQuestions() {

    const { classes, survey } = this.props;
    const q = JSON.parse(survey[2])

    this.questions = [
      {
        index: "1",
        title: q.title1,
        type: q.type1,
        selection: q.selection1,
      },
      {
        index: "2",
        title: q.title2,
        type: q.type2,
        selection: q.selection2,
      },
      {
        index: "3",
        title: q.title3,
        type: q.type3,
        selection: q.selection3,
      },
    ]

    return _.map(this.questions, question => {
      if (question.type === "open_question") {

        return (
          <div key={question.title + question.index} className={classes.question_wrap}>
            <Typography variant="headline" component="h2">
              {question.title}
            </Typography>
            <Field label={question.title} name={question.index} classes={classes} component={this.renderTextField}/>
          </div>  
        );
      } else {
        return (
          <div key={question.title + question.index} className={classes.question_wrap}>
            <Typography variant="headline" component="h2">
              {question.title}
            </Typography>

            { this.renderSelection(classes, question) }

          </div>
        );
      }
    });

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

  createKey(title, candidate, index, candidateIndex) {
    return title + candidate + index + candidateIndex
  }

  renderSelection(classes, question) {

    return (
      <div
        className={classes.form_wrap}>
        <GridList
          className={classes.gridList}
          spacing={12}
          cols={this.cellCols}>
          {question.selection.split(',').map((candidate, candidateIndex) => (
            <GridListTile
              key={this.createKey(question.title, candidate, question.index, candidateIndex)}
              cols={1}
              onClick={ () => this.onClickSelect(question, candidate, candidateIndex, question.type) }
              className={ this.state.selected[question.title] && this.state.selected[question.title].indexOf(question.index + '-' + candidateIndex + ': ' + candidate) >= 0 ? classes.cell_active : classes.cell_inactive}
              style={ {height: 70} } >
                <GridListTileBar
                  title={candidate}
                  className={ this.state.selected[question.title] && this.state.selected[question.title].indexOf(question.index + '-' + candidateIndex + ': ' + candidate) >= 0 ? classes.cell_label_active : classes.cell_label}
                  classes={{
                    titleWrap: classes.wrap,
                    title: classes.wrap_title,
                  }}
                />
            </GridListTile>
          ))}
        </GridList>
      </div>
    );
  }

  render() {
    if (this.props.survey == null || this.state.redirect) {
      return <Redirect push to="/" />;
    }

    const { classes, handleSubmit } = this.props;

    return (
      <div>
        <SimpleAppBar web3={this.props.web3} accounts={this.props.accounts} title={ "Answer Survey" }/>

        <Paper className={classes.root}>

          <Typography variant="headline" component="h2" className={classes.tytle}>
            Answer { this.props.survey[1] }
          </Typography>

          <form onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>

            { this.renderQuestions() }

            <Button
              type="submit"
              className={classes.submit_btn} 
              variant="contained" 
              color="primary">
              Submit
            </Button>
          </form>
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

function validate(values) {
  const errors = {};

  if (!values["1"]) {
    errors["1"] = "enter a open question";
  }

  return errors;
}

function mapStateToProps({ web3Obj, surveys }, survey) {
  return { 
    web3: web3Obj.web3, 
    accounts: web3Obj.accounts,
    survey: surveys[survey.match.params.id]
  }
}

export default reduxForm({
  validate,
  form: 'surveyAnswer',
})(
  connect(mapStateToProps, { answerSurvey, getSurveySummary })(withStyles(styles)(SurveyAnswer))
);
