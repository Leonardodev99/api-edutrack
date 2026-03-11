import app from './app';

const port = 3005;

app.listen(port, () => {
  console.log();
  console.log(`Escutando na porta ${port}`);
  console.log(`CRTL + Clique em http://localhost:${port}`);
});

