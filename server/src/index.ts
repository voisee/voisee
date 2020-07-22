import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';

// Start the server
const port = Number(process.env.PORT || 3000);

// TODO: Remove Debugging Code
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});
