import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import SendIcon from '@material-ui/icons/Send'

const useStyles = makeStyles(() => ({
  container: {
    padding: '12px 20px',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 0 rgba(143,143,143,0.5)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  content: {
    fontSize: 12,
    color: '#aaaaaa',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  blue: {
    color: '#7a7aff',
    cursor: 'pointer',
    '&:hover': {
      color: '#3a3aff',
    },
  }
}));

const Footer: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        메모 추가하기
      </div>
      <SendIcon className={classes.blue} />
    </div>
  )
}

export default Footer;
