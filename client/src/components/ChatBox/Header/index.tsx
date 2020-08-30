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

const Header: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        Jelly
      </div>
      <div className={classes.desc}>
        민병철유폰 영어회화
      </div>
    </div>
  )
}

export default Header
