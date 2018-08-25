import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 4,
    marginTop: 10,
    marginBottom: 10,
  },
});

function SurveyTokenHoldings (props) {

  const { classes, balance } = props;

  return (
    <Paper className={classes.root}>

      <Typography variant="headline" component="h2">
        SurveyToken Holdngs: { balance }
      </Typography>

    </Paper>
  );

}

SurveyTokenHoldings.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SurveyTokenHoldings);