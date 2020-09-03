import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  container: {
    borderBottom: '2px solid #eeeeee',
    padding: '16px 10px',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: '#aaaaaa',
  }
}));

interface Props {
  title: string
  desc: string
}

const Header: React.FC<Props> = ({ title, desc }) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        {title}
      </div>
      <div className={classes.desc}>
        {desc}
      </div>
    </div>
  )
}

export default Header
