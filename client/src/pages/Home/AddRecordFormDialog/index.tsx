import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles(() => ({
  fileInput: {
    backgroundColor: '#f7f7f7',
    height: 100,
    borderRadius: 20,
    padding: 16,
    margin: '12px auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }
}))

const FormDialog: React.FC = () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  }

  const handleSubmit = () => {
    setOpen(false);
  }

  return (
    <>
      <Fab color="primary" onClick={handleClickOpen}>
        <AddIcon />
      </Fab>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">녹음파일 추가</DialogTitle>
          <form
            onSubmit={handleSubmit}
          >
            <DialogContent>
            <DialogContentText>
              녹음파일의 길이에 따라 녹음 파일을 변환하는 속도가 다소 소요될 수 있습니다.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="녹음 제목"
              type="text"
              required
              fullWidth
            />
            <TextField
              margin="dense"
              id="description"
              label="설명"
              type="text"
              required
              fullWidth
            />
            <div className={classes.fileInput}>
              <input
                type='file'
                name='file'
                required
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              닫기
            </Button>
            <Button type='submit' color="primary">
              추가
            </Button>
          </DialogActions>
          </form>
      </Dialog>
    </>
  );
}

export default FormDialog;