import { Controller, Get, Render } from '@nestjs/common';
@Controller()
export class ViewController {
  @Get(['/', '*path'])
  @Render('index')
  render() { return {}; }
}
