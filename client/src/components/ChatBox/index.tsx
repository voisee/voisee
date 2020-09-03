import React, { useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'

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
  alertContainer: {
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }
}))

interface Props {
  note: RootProps
}

const ChatBox: React.FC<Props> = ({ note }) => {
  const classes = useStyles()
  const isLoaded = !!note?.status && !!(note.status === 1)
  const renderPendingSpinner = useMemo(() => (
    <div className={classes.alertContainer}>
      <CircularProgress />
      <p>음성파일을 시각화하는중입니다.</p>
    </div>
  ), [])

  return (
    <div className={classes.wrapper}>
      <Header title={note?.name} desc={note?.description} />
      <div className={classes.chatBox}>
        {!isLoaded && renderPendingSpinner}
        {isLoaded && note?.contents &&
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
