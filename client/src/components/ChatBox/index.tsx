import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Header from './Header'
import Chat from './Chat'
import Footer from './Footer'

import { RootProps } from 'model/type'

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
  note: RootProps
}

const ChatBox: React.FC<Props> = ({ note }) => {
  const classes = useStyles()
  console.log(note)

  return (
    <div className={classes.wrapper}>
      <Header title={note?.name} desc={note?.description} />
      <div className={classes.chatBox}>
        {note?.contents &&
          note.contents.map((segment) => {
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
