import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Segment } from 'model/type'

const useStyles = makeStyles(() => ({
  wrapper: {
    display: 'flex',
    marginBottom: 20,
  },
  container: {
    padding: '8px 20px',
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    maxWidth: 360,
  },
  content: {
    fontSize: 14,
  },
  speaker: {
    backgroundColor: '#2171dc',
    color: '#ffffff',
  },
  alignAuthor: {
    justifyContent: 'flex-end',
  }
}));

type Props = Partial<Omit<Segment, 'speaker'> & { speaker: boolean }>

const Chat: React.FC<Props> = ({ speaker, content }) => {
  const classes = useStyles();

  return (
    <div className={[
      classes.wrapper,
      speaker && classes.alignAuthor
    ].join(' ')}>
      <div className={[
        classes.container,
        speaker && classes.speaker
      ].join(' ')}>
        <p className={classes.content}>
          {content}
        </p>
      </div>
    </div>
  )
}

export default Chat
