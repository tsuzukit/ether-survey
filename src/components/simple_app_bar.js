import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';

const styles = {
  root: {
    flexGrow: 1,
  },
  avatar: {
    marginLeft: 'auto',
  },
  avatar_hidden: {
    marginLeft: 'auto',
    height: 0,
  },
};

class SimpleAppBar extends Component {

  render() {

    const { classes, title } = this.props;

    return (
      <div className={classes.root}>

        <AppBar position="static" color="default">
          <Toolbar>

            <Typography variant="title">
              <strong>Ether Surevy</strong> { title }
            </Typography>

            <Tooltip title="Metamask Connected!">
              <Avatar src="/img/metamsk.jpg" className={ this.props.web3 && this.props.accounts.length >= 1 ? classes.avatar : classes.avatar_hidden}></Avatar>
            </Tooltip>

          </Toolbar>
        </AppBar>
      </div>
    );
  }

}

SimpleAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleAppBar);