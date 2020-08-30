import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  wrapper: {
    display: 'flex',
    marginBottom: 20,
  },
  container: {
    padding: '10px 20px',
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    maxWidth: 360,
  },
  content: {
    fontSize: 14,
  },
  author: {
    backgroundColor: '#2171dc',
    color: '#ffffff',
  },
  alignAuthor: {
    justifyContent: 'flex-end',
  }
}));

interface ChatProps {
  author: boolean
}

const Chat: React.FC<ChatProps> = ({ author }) => {
  const classes = useStyles();

  return (
    <div className={[
      classes.wrapper,
      author && classes.alignAuthor
    ].join(' ')}>
      <div className={[
        classes.container,
        author && classes.author
      ].join(' ')}>
        <p className={classes.content}>
          Hello Sophie! I'm Jelly. Today's your teacher. Nice to meet you.
        </p>
      </div>
    </div>
  )
}

export default Chat
