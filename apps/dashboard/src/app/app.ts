import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'dashboard';

  constructor() {
    inject(ThemeService);
  }
}
