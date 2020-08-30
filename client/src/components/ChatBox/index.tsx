import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Header from './Header'
import Chat from './Chat'
import Footer from './Footer'

const useStyles = makeStyles(() => ({
  wrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  chatBox: {
    overflow: 'scroll',
  }
}));

const ChatBox: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <Header />
      <div className={classes.chatBox}>
        <Chat author={false} />
        <Chat author={true} />
        <Chat author={false} />
        <Chat author={true} />
        <Chat author={false} />
        <Chat author={false} />
        <Chat author={false} />
        <Chat author={false} />
        <Chat author={false} />
        <Chat author={false} />
      </div>
      <Footer />
    </div>
  )
}

export default ChatBox
