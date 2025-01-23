import { App } from './app';
import { AppConfig } from './configs/app.config';

const app = new App();

app.start(AppConfig.appPort);
