import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ReactPlayer from 'react-player'

import Play from '@material-ui/icons/PlayArrow'
import Pause from '@material-ui/icons/Pause'

const useStyles = makeStyles(() => ({
  container: {
    padding: '12px 20px',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 0 rgba(143,143,143,0.5)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    fontSize: 12,
    color: '#aaaaaa',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  blue: {
    color: '#7a7aff',
    cursor: 'pointer',
    '&:hover': {
      color: '#3a3aff',
    },
  },
  player: {
    '&>div': {
      width: '50% !important',
      height: '100% !important',
    },
  },
}))

interface Props {
  recordUrl?: string
}

const Footer: React.FC<Props> = ({ recordUrl }) => {
  const classes = useStyles()
  const [playing, setPlaying] = useState<boolean>(false)

  const togglePlaying = () => {
    setPlaying((prev) => !prev)
  }

  return (
    <div className={classes.container}>
      <div className={classes.content}>녹음파일 재생</div>
      <div className={classes.player}>
        <ReactPlayer url={recordUrl} playing={playing} />
      </div>
      {playing ? (
        <Pause className={classes.blue} onClick={togglePlaying} />
      ) : (
        <Play className={classes.blue} onClick={togglePlaying} />
      )}
    </div>
  )
}

export default Footer
