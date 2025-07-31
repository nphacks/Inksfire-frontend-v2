import { Component } from '@angular/core';
import { ProjectDataService } from '../../services/project-data.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  currentTheme = 'theme_1';
  isDarkMode = false;
  showThemeSelector = false;
  themes = ['theme_1', 'theme_2', 'theme_3', 'theme_4', 'theme_5'];
  selectedProject: any = null;

  constructor(private projectDataService: ProjectDataService) {}

  ngOnInit() {
    this.projectDataService.project$.subscribe(project => {
      this.selectedProject = project;
    });
  }

  toggleDarkLight() {
    this.isDarkMode = !this.isDarkMode;
    const container = document.querySelector('.playground-container');
    if (container) {
      if (this.isDarkMode) {
        // Swap color1 and color2 for dark mode
        container.classList.add('dark-mode');
      } else {
        container.classList.remove('dark-mode');
      }
    }
  }

  toggleThemeSelector() {
    this.showThemeSelector = !this.showThemeSelector;
  }

  selectTheme(theme: string) {
    this.currentTheme = theme;
    const container = document.querySelector('.playground-container');
    if (container) {
      // Remove all theme classes
      this.themes.forEach(t => container.classList.remove(t));
      // Add selected theme
      container.classList.add(theme);
    }
    this.showThemeSelector = false;
  }

  getThemePreview(themeNumber: number): string {
    const themeColors: {[key: string]: string} = {
      '1': 'linear-gradient(45deg, #303130, #f9ffff, #330099, #daa5c5)',
      '2': 'linear-gradient(45deg, #311007, #fdf6f2, #330099, #0072b6)',
      '3': 'linear-gradient(45deg, #2f3138, #f5faf7, #330099, #f63437)',
      '4': 'linear-gradient(45deg, #0a2343, #ffffff, #330099, #30ab77)',
      '5': 'linear-gradient(45deg, #020414, #eceae5, #330099, #b46b12)'
    };
    
    return themeColors[themeNumber.toString()] || '';
  }
}
