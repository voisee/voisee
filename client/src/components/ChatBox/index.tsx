import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Header from './Header'
import Chat from './Chat'
import Footer from './Footer'

import { Segment } from 'model/type'

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
  },
}))

interface Props {
  segments: Segment[]
}

const ChatBox: React.FC<Props> = ({ segments }) => {
  const classes = useStyles()

  return (
    <div className={classes.wrapper}>
      <Header />
      <div className={classes.chatBox}>
        {segments && segments.map((segment) => {
          const { id, speaker, content } = segment
          const me = speaker === 'spk_0'
          return <Chat key={id} id={id} speaker={me} content={content} />
        })}
      </div>
      <Footer />
    </div>
  )
}

export default ChatBox
