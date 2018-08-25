import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';

const styles = {
  root: {
    marginLeft: 10,
  }
};

class FloatingActionButton extends Component {

  render() {
    const { classes, onClick } = this.props;

    return (
      <div className={ classes.root }>
        <Tooltip title="Add Survey" placement="right-start">
          <Button 
            onClick={ onClick }
            variant="contained" 
            color="primary">
            <AddIcon />
          </Button>
        </Tooltip>  
      </div>
    );
  }

}

FloatingActionButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FloatingActionButton);