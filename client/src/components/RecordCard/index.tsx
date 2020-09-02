import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Container, Title, Desc, Date } from './style'

const useStyles = makeStyles(() => ({
  active: {
    backgroundColor: '#eeeeff !important',
  },
}));

interface Props {
  id: number
  title: string
  desc: string
  active: boolean
  onClick: (id: number) => void
}

const RecordCard: React.FC<Props> = ({ id, title, desc, active, onClick }) => {
  const classes = useStyles()

  return (
    <Container className={active ? classes.active : ''} onClick={() => onClick(id)}>
      <Title>
        {title}
        <Date>9월 2일</Date>
      </Title>
      <Desc>{desc}</Desc>
    </Container>
  )
}

export default RecordCard
