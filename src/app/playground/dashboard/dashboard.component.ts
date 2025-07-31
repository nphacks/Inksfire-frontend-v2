import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { ProjectDataService } from '../services/project-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AiService } from './services/ai.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  projects: any[] = [];
  isLoading = false;
  filteredProjects: any[] = [];
  selectedAction: string = 'plan';
  generatedIdeas: string[] = []
  showCreatePopup = false;
  currentStep = 1;
  newProject = {
    name: '',
    author: '',
    idea: '',
    genres: ['Any'],
    story_types: 'Any'
  };
  story_genres = [ 'Any', 'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Musical',
  'Mystery', 'Romance', 'Sci-Fi', 'Short', 'Sport', 'Thriller', 'War', 'Western' ];
  story_types = [ 'Any', 'Movie', 'Tv Show', 'Book']
  newProjectPrompt: string = ''
  generatedPrompts = []
  private subs = new Subscription();

  constructor(
    private projectService: ProjectService, 
    private projectDataService: ProjectDataService,
    private aiService: AiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadProjects()
  }

  loadProjects() {
    this.isLoading = true;
    this.fetchAllProject('', []);
  }

  fetchAllProject(search: string, tags: any[]) {
   this.isLoading = true;
   this.subs.add(
    this.projectService.fetchAllProjects({
      search: search,
      tags: tags
    }).subscribe({
      next: (res: any) => {
        console.log(res.projects);
        this.projects = res.projects || [];
        this.filteredProjects = this.projects
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.projects = [];
        console.error('Error:', err.error); //The response: {detail: 'Not found'}
        console.error('Error status code:', err.status); //The response is staus code: 404
      }
    })
   )
  }

  selectProject(projectId: string) {
    console.log('Selecting project', projectId)
    // Fetch project data and set it in the service
    this.subs.add(
      this.projectService.fetchProjectData(projectId).subscribe({
        next: (res: any) => {
          console.log('Selected project response', res)
          localStorage.setItem("project_id", projectId)
          this.projectDataService.setProject(res.project);
          this.router.navigate(['/playground/story-writing'], { 
            queryParams: { 
              project_id: projectId,
              is_new: false,
              is_plan: false
            } 
          });
        },
        error: (err) => {
          console.error('Error fetching project:', err);
        }
      })
    )
  }

  createProject() {
    console.log('Creating project', this.newProject, this.selectedAction)
    this.subs.add(
      this.projectService.createProject(this.newProject).subscribe({
        next: (res: any) => {
          let projectId = res.project.project_id
          localStorage.setItem("project_id", projectId)
          this.projectDataService.setProject(res.project);
          if (res.status_code === 200 && this.selectedAction === 'start') {
            this.closePopup();
            this.startWriting(projectId)
          } else if (res.status_code === 200 && this.selectedAction === 'plan') {
            this.closePopup();
            this.planWriting(projectId);
          }
        }
      })
    )
  }

  startWriting(projectId: string) {
    this.router.navigate(['/playground/story-writing'], {
      queryParams: {
        project_id: projectId,
        is_new: true,
        is_plan: false
      }
    });
  }

  planWriting(projectId: string) {
    this.router.navigate(['/playground/story-writing'], {
      queryParams: {
        project_id: projectId,
        is_new: true,
        is_plan: true
      }
    });
  }

  generateIdeas() {
    this.subs.add(
      this.aiService.generateThreeIdeas().subscribe({
        next: (res: any) => {
          this.generatedIdeas = res.ideas
        },
        error: (err) => {
          console.error('Error fetching project:', err);
        }
      })
    )
  }

  closePopup() {
    console.log('Closing popup');
    this.showCreatePopup = false;
    this.currentStep = 1;
    this.resetForm();
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  selectIdea(idea: string) {
    this.newProject.idea = idea;
  }

  selectPrompt(prompt: string) {
    this.newProjectPrompt = prompt;
  }

  resetForm() {
    this.newProject = {
      name: '',
      author: '',
      idea: '',
      genres: [],
      story_types: ''
    };
    this.newProjectPrompt = '';
    this.generatedIdeas = [];
    this.generatedPrompts = [];
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    
    // Clear any pending timeouts
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
  }
}


