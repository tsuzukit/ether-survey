import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { isFuture, convertTime } from '../utils/timeutil';

const styles = theme => ({
  card: {
    minWidth: 275,
  },
  inactive: {
    height: 0,
  },
  link: {
    textDecoration: "none",
  },
});

function SurveyCard (props) {

  const { classes, survey, accounts } = props

  const description = survey[1]
  const owner = survey[5]
  const tokensCharged = parseInt(survey[4], 10)
  const numberOfRespondent = parseInt(survey[3], 10)
  const closedAt = parseInt(survey[6], 10)

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="headline" component="h2">
          Description: { description }
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          Owner: { owner }
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          Number of respondent: { numberOfRespondent }
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          Tokens charged: { tokensCharged }
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          Close at: { convertTime(closedAt) }
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" variant="outlined" style={ {display: isFuture(closedAt) && tokensCharged >= 1 ? "" : "none"} }>
          <Link to={`survey/${survey[0]}`} className={ classes.link }>
            Answer
          </Link>  
        </Button>
        <Button size="small" variant="outlined" style={ {display: owner === accounts[0] ? "" : "none"} }>
          <Link to={`survey/detail/${survey[0]}`} className={ classes.link }>
            Detail
          </Link>  
        </Button>
        <Button size="small" variant="outlined" style={ {display: !isFuture(closedAt) && owner !== accounts[0] ? "" : "none"} }>
          <Link to={`survey/retreive/${survey[0]}`} className={ classes.link }>
            Retrieve
          </Link>  
        </Button>
      </CardActions>
    </Card>
  );

}

SurveyCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SurveyCard);