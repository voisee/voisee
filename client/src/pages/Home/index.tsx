import React from 'react'
import RefreshIcon from '@material-ui/icons/Refresh'
import { makeStyles } from '@material-ui/core/styles'
import Fab from '@material-ui/core/Fab'
import Sidebar from 'components/Sidebar'
import RecordCard from 'components/RecordCard'
import ChatBox from 'components/ChatBox'
import AddRecordFormDialog from './AddRecordFormDialog'
import {
  Container,
  DashboardContainer,
  DashboardItem,
  Row,
} from './style'

const useStyles = makeStyles((theme) => ({
  flex3: {
    flex: 3,
  },
  flex7: {
    flex: 7,
  },
  right: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttons: {
    '&>button': {
      marginRight: 12,
    },
  },
  recordList: {
    overflow: 'scroll',
  },
}))

const Home: React.FC = () => {
  const classes = useStyles()
  return (
    <Container>
      <Sidebar />
      <DashboardContainer>
        <DashboardItem className={classes.flex3}>
          <Row>
            <h3>녹음파일 목록</h3>
          </Row>
          <div className={classes.recordList}>
            <RecordCard />
            <RecordCard />
            <RecordCard />
            <RecordCard />
            <RecordCard />
            <RecordCard />
            <RecordCard />
            <RecordCard />
            <RecordCard />
            <RecordCard />
            <RecordCard />
            <RecordCard />
          </div>
        </DashboardItem>

        <DashboardItem className={classes.flex7}>
          <Row className={[classes.right, classes.buttons].join(' ')}>
            <AddRecordFormDialog />
            <Fab color="default" aria-label="refresh">
              <RefreshIcon />
            </Fab>
          </Row>
          <ChatBox />
        </DashboardItem>
      </DashboardContainer>
    </Container>
  )
}

export default Home
